import { Router, Request, Response, NextFunction } from 'express';
import { payrollEngineService } from './payroll-engine.service';
import { authenticate, authorize } from '../../common/middleware/auth';

const router = Router();

// ---- Payroll Runs ----
router.post('/calculate', authenticate, authorize('payroll:process'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await payrollEngineService.calculatePayroll({
      ...req.body,
      organizationId: req.user!.organizationId,
    }, req.user!.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/:id/approve', authenticate, authorize('payroll:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await payrollEngineService.approvePayroll(req.params.id, req.user!.id);
    res.json({ success: true, data: run });
  } catch (error) { next(error); }
});

router.post('/:id/process', authenticate, authorize('payroll:process'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await payrollEngineService.processPayroll(req.params.id, req.user!.id);
    res.json({ success: true, data: run });
  } catch (error) { next(error); }
});

router.get('/:id', authenticate, authorize('payroll:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await payrollEngineService.getPayrollRun(req.params.id);
    res.json({ success: true, data: run });
  } catch (error) { next(error); }
});

router.get('/:id/slips', authenticate, authorize('payroll:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slips = await payrollEngineService.getPayrollSlips(req.params.id);
    res.json({ success: true, data: slips });
  } catch (error) { next(error); }
});

router.get('/:id/bank-file', authenticate, authorize('payroll:process'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const csv = await payrollEngineService.generateBankFile(req.params.id);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payroll-bank-${req.params.id}.csv`);
    res.send(csv);
  } catch (error) { next(error); }
});

// ---- Employee Payslips ----
router.get('/employee/:employeeId/payslip', authenticate, authorize('payroll:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slip = await payrollEngineService.getEmployeePayslip(
      req.params.employeeId,
      parseInt(req.query.month as string),
      parseInt(req.query.year as string)
    );
    res.json({ success: true, data: slip });
  } catch (error) { next(error); }
});

export default router;
