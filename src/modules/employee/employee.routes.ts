import { Router, Request, Response, NextFunction } from 'express';
import { employeeService } from './employee.service';
import { attendanceService } from './attendance.service';
import { authenticate, authorize, outletAccess } from '../../common/middleware/auth';

const router = Router();

// ---- Employee CRUD ----
router.post('/', authenticate, authorize('employee:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, data: employee });
  } catch (error) { next(error); }
});

router.get('/', authenticate, authorize('employee:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await employeeService.list(
      {
        organizationId: req.user!.organizationId,
        outletId: req.query.outletId as string,
        department: req.query.department as any,
        employmentType: req.query.employmentType as any,
        isActive: req.query.isActive === 'true',
        search: req.query.search as string,
      },
      {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      }
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, authorize('employee:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.getById(req.params.id, req.user!.organizationId);
    res.json({ success: true, data: employee });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('employee:update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.update(req.params.id, req.user!.organizationId, req.body, req.user!.id);
    res.json({ success: true, data: employee });
  } catch (error) { next(error); }
});

router.post('/:id/exit', authenticate, authorize('employee:update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await employeeService.exitEmployee(
      req.params.id, req.user!.organizationId,
      req.body.exitDate, req.body.exitReason, req.user!.id
    );
    res.json({ success: true, data: employee });
  } catch (error) { next(error); }
});

router.put('/:id/outlet-mappings', authenticate, authorize('employee:update'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mappings = await employeeService.updateOutletMappings(
      req.params.id, req.user!.organizationId, req.body.mappings, req.user!.id
    );
    res.json({ success: true, data: mappings });
  } catch (error) { next(error); }
});

// ---- Attendance ----
router.post('/attendance', authenticate, authorize('attendance:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await attendanceService.recordAttendance(req.body, req.user!.id);
    res.status(201).json({ success: true, data: record });
  } catch (error) { next(error); }
});

router.post('/attendance/bulk', authenticate, authorize('attendance:create'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await attendanceService.bulkRecord(req.body, req.user!.id);
    res.json({ success: true, data: { recordsProcessed: count } });
  } catch (error) { next(error); }
});

router.get('/:id/attendance', authenticate, authorize('attendance:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await attendanceService.getForEmployee(
      req.params.id,
      req.query.startDate as string,
      req.query.endDate as string
    );
    res.json({ success: true, data: records });
  } catch (error) { next(error); }
});

router.get('/:id/attendance/summary', authenticate, authorize('attendance:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await attendanceService.getMonthlySummary(
      req.params.id,
      parseInt(req.query.month as string),
      parseInt(req.query.year as string)
    );
    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
});

export default router;
