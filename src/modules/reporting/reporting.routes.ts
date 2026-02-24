import { Router, Request, Response, NextFunction } from 'express';
import { reportingService } from './reporting.service';
import { pnlService } from '../consolidation/pnl.service';
import { cogsService } from '../cogs/cogs.service';
import { tipPoolService } from '../restaurant/tip-pool.service';
import { serviceChargeService } from '../restaurant/service-charge.service';
import { incentiveService } from '../restaurant/incentive.service';
import { authenticate, authorize } from '../../common/middleware/auth';

const router = Router();

// ---- P&L Reports ----
router.get('/pnl', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pnl = await pnlService.generatePnL(
      req.user!.organizationId,
      req.query.from as string,
      req.query.to as string,
      req.query.outletId as string
    );
    res.json({ success: true, data: pnl });
  } catch (error) { next(error); }
});

router.get('/pnl/consolidated', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pnlService.generateConsolidatedPnL(
      req.user!.organizationId,
      req.query.from as string,
      req.query.to as string
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// ---- COGS Reports ----
router.post('/cogs/calculate', authenticate, authorize('reports:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cogsService.calculateCOGS(
      req.user!.organizationId,
      req.body.outletId,
      req.body.periodStart,
      req.body.periodEnd,
      req.body.entries,
      req.user!.id
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/cogs/history', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await cogsService.getCOGSHistory(
      req.user!.organizationId,
      req.query.outletId as string,
      parseInt(req.query.months as string) || 12
    );
    res.json({ success: true, data: history });
  } catch (error) { next(error); }
});

router.post('/cogs/recipe-costing', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cogsService.calculateRecipeCost(req.body);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// ---- Payroll Reports ----
router.get('/payroll/by-outlet', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reportingService.getPayrollSummaryByOutlet(
      req.user!.organizationId,
      parseInt(req.query.month as string),
      parseInt(req.query.year as string)
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/payroll/to-revenue', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reportingService.getPayrollToRevenueReport(
      req.user!.organizationId,
      req.query.from as string,
      req.query.to as string
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/payroll/productivity', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reportingService.getStaffProductivityReport(
      req.user!.organizationId,
      parseInt(req.query.month as string),
      parseInt(req.query.year as string)
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/payroll/variance', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reportingService.getPayrollVarianceReport(
      req.user!.organizationId,
      parseInt(req.query.month as string),
      parseInt(req.query.year as string)
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/payroll/overtime', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reportingService.getOvertimeAnalytics(
      req.user!.organizationId,
      parseInt(req.query.month as string),
      parseInt(req.query.year as string)
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/payroll/salary-register', authenticate, authorize('reports:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reportingService.getSalaryRegister(
      req.user!.organizationId,
      parseInt(req.query.month as string),
      parseInt(req.query.year as string)
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// ---- Restaurant-Specific ----
router.post('/tips/distribute', authenticate, authorize('restaurant:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tipPoolService.distributeTips(
      req.body.outletId,
      req.body.periodStart,
      req.body.periodEnd,
      req.body.totalTipsCollected,
      req.user!.id,
      req.user!.organizationId
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/service-charge/distribute', authenticate, authorize('restaurant:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await serviceChargeService.distributeServiceCharge(
      req.body.outletId,
      req.body.periodStart,
      req.body.periodEnd,
      req.body.totalServiceCharge,
      req.user!.id,
      req.user!.organizationId
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.post('/incentives/calculate', authenticate, authorize('restaurant:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incentiveService.calculateIncentives(
      req.body.outletId,
      req.user!.organizationId,
      req.body.periodStart,
      req.body.periodEnd,
      req.body.actualMetrics
    );
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// ---- Config Routes ----
router.post('/tips/config', authenticate, authorize('restaurant:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await tipPoolService.createConfig(req.body.outletId, req.body, req.user!.id);
    res.status(201).json({ success: true, data: config });
  } catch (error) { next(error); }
});

router.post('/service-charge/config', authenticate, authorize('restaurant:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await serviceChargeService.createConfig(req.body.outletId, req.body, req.user!.id);
    res.status(201).json({ success: true, data: config });
  } catch (error) { next(error); }
});

router.post('/incentives/rules', authenticate, authorize('restaurant:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rule = await incentiveService.createRule(req.body, req.user!.id);
    res.status(201).json({ success: true, data: rule });
  } catch (error) { next(error); }
});

export default router;
