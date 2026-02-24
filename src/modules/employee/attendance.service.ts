import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../../infrastructure/database/connection';
import { eventBus } from '../../common/events/event-bus';
import { NotFoundError, ValidationError } from '../../common/errors';
import { logger } from '../../common/utils/logger';
import { AttendanceRecord, UUID, ISODate, AttendanceSource } from '../../common/types';

export interface RecordAttendanceDto {
  employeeId: UUID;
  outletId: UUID;
  date: ISODate;
  source: AttendanceSource;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEK_OFF';
  shiftType?: string;
  remarks?: string;
}

export interface BulkAttendanceDto {
  outletId: UUID;
  date: ISODate;
  records: {
    employeeId: UUID;
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEK_OFF';
    checkIn?: string;
    checkOut?: string;
    shiftType?: string;
  }[];
}

export interface AttendanceSummary {
  employeeId: UUID;
  month: number;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  holidays: number;
  weekOffs: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  paidDays: number;
}

export class AttendanceService {
  async recordAttendance(dto: RecordAttendanceDto, userId: UUID): Promise<AttendanceRecord> {
    const db = getDb();

    // Calculate hours worked
    let hoursWorked = 0;
    let overtimeHours = 0;
    if (dto.checkIn && dto.checkOut) {
      const checkIn = new Date(dto.checkIn);
      const checkOut = new Date(dto.checkOut);
      hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      // Standard shift = 8 hours; anything above = overtime
      if (hoursWorked > 8) {
        overtimeHours = hoursWorked - 8;
        hoursWorked = 8;
      }
    } else if (dto.status === 'PRESENT') {
      hoursWorked = 8;
    } else if (dto.status === 'HALF_DAY') {
      hoursWorked = 4;
    }

    const id = uuidv4();

    // Upsert: if record exists for this employee+date, update it
    const existing = await db('attendance_records')
      .where({ employee_id: dto.employeeId, date: dto.date })
      .first();

    if (existing) {
      await db('attendance_records')
        .where({ id: existing.id })
        .update({
          source: dto.source,
          check_in: dto.checkIn,
          check_out: dto.checkOut,
          hours_worked: hoursWorked,
          overtime_hours: overtimeHours,
          status: dto.status,
          shift_type: dto.shiftType,
          remarks: dto.remarks,
          updated_by: userId,
          updated_at: new Date(),
        });

      return this.getById(existing.id);
    }

    await db('attendance_records').insert({
      id,
      employee_id: dto.employeeId,
      outlet_id: dto.outletId,
      date: dto.date,
      source: dto.source,
      check_in: dto.checkIn,
      check_out: dto.checkOut,
      hours_worked: hoursWorked,
      overtime_hours: overtimeHours,
      status: dto.status,
      shift_type: dto.shiftType,
      remarks: dto.remarks,
      is_active: true,
      created_by: userId,
      updated_by: userId,
    });

    await eventBus.publish(
      'ATTENDANCE_RECORDED',
      'Attendance',
      id,
      { employeeId: dto.employeeId, date: dto.date, status: dto.status },
      { userId, organizationId: '', outletId: dto.outletId }
    );

    return this.getById(id);
  }

  async bulkRecord(dto: BulkAttendanceDto, userId: UUID): Promise<number> {
    let count = 0;
    for (const record of dto.records) {
      await this.recordAttendance({
        employeeId: record.employeeId,
        outletId: dto.outletId,
        date: dto.date,
        source: 'MANUAL',
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status: record.status,
        shiftType: record.shiftType,
      }, userId);
      count++;
    }
    return count;
  }

  async getById(id: UUID): Promise<AttendanceRecord> {
    const db = getDb();
    const record = await db('attendance_records').where({ id }).first();
    if (!record) throw new NotFoundError('AttendanceRecord', id);
    return this.mapToAttendanceRecord(record);
  }

  async getForEmployee(
    employeeId: UUID,
    startDate: ISODate,
    endDate: ISODate
  ): Promise<AttendanceRecord[]> {
    const db = getDb();
    const records = await db('attendance_records')
      .where({ employee_id: employeeId })
      .whereBetween('date', [startDate, endDate])
      .orderBy('date', 'asc');

    return records.map((r: any) => this.mapToAttendanceRecord(r));
  }

  async getForOutlet(
    outletId: UUID,
    date: ISODate
  ): Promise<AttendanceRecord[]> {
    const db = getDb();
    const records = await db('attendance_records')
      .where({ outlet_id: outletId, date })
      .orderBy('employee_id');

    return records.map((r: any) => this.mapToAttendanceRecord(r));
  }

  async getMonthlySummary(
    employeeId: UUID,
    month: number,
    year: number
  ): Promise<AttendanceSummary> {
    const db = getDb();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const records = await db('attendance_records')
      .where({ employee_id: employeeId })
      .whereBetween('date', [startDate, endDate]);

    const totalDays = new Date(year, month, 0).getDate();
    let presentDays = 0;
    let absentDays = 0;
    let halfDays = 0;
    let leaveDays = 0;
    let holidays = 0;
    let weekOffs = 0;
    let totalHoursWorked = 0;
    let totalOvertimeHours = 0;

    for (const r of records) {
      switch (r.status) {
        case 'PRESENT': presentDays++; break;
        case 'ABSENT': absentDays++; break;
        case 'HALF_DAY': halfDays++; break;
        case 'ON_LEAVE': leaveDays++; break;
        case 'HOLIDAY': holidays++; break;
        case 'WEEK_OFF': weekOffs++; break;
      }
      totalHoursWorked += parseFloat(r.hours_worked || '0');
      totalOvertimeHours += parseFloat(r.overtime_hours || '0');
    }

    // Paid days = present + holidays + weekOffs + halfDays*0.5
    const paidDays = presentDays + holidays + weekOffs + halfDays * 0.5;

    return {
      employeeId,
      month,
      year,
      totalDays,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      holidays,
      weekOffs,
      totalHoursWorked,
      totalOvertimeHours,
      paidDays,
    };
  }

  private mapToAttendanceRecord(row: any): AttendanceRecord {
    return {
      id: row.id,
      employeeId: row.employee_id,
      outletId: row.outlet_id,
      date: row.date,
      source: row.source,
      checkIn: row.check_in,
      checkOut: row.check_out,
      hoursWorked: parseFloat(row.hours_worked || '0'),
      overtimeHours: parseFloat(row.overtime_hours || '0'),
      status: row.status,
      shiftType: row.shift_type,
      remarks: row.remarks,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }
}

export const attendanceService = new AttendanceService();
