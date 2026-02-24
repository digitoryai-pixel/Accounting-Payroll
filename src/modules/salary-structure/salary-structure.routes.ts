import { Router, Request, Response, NextFunction } from 'express';
import { salaryStructureService } from './salary-structure.service';
import { authenticate, authorize } from '../../common/middleware/auth';

const router = Router();

// ---- Salary Components ----
router.post('/components', authenticate, authorize('salary:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const component = await salaryStructureService.createComponent(req.body, req.user!.id);
    res.status(201).json({ success: true, data: component });
  } catch (error) { next(error); }
});

router.get('/components', authenticate, authorize('salary:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const components = await salaryStructureService.listComponents(req.user!.organizationId);
    res.json({ success: true, data: components });
  } catch (error) { next(error); }
});

// ---- Salary Templates ----
router.post('/templates', authenticate, authorize('salary:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await salaryStructureService.createTemplate(req.body, req.user!.id);
    res.status(201).json({ success: true, data: template });
  } catch (error) { next(error); }
});

router.get('/templates', authenticate, authorize('salary:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await salaryStructureService.listTemplates(req.user!.organizationId);
    res.json({ success: true, data: templates });
  } catch (error) { next(error); }
});

router.get('/templates/:id', authenticate, authorize('salary:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await salaryStructureService.getTemplate(req.params.id);
    res.json({ success: true, data: template });
  } catch (error) { next(error); }
});

// ---- Employee Salary Structure ----
router.post('/assign', authenticate, authorize('salary:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const structure = await salaryStructureService.assignStructure(req.body, req.user!.id);
    res.status(201).json({ success: true, data: structure });
  } catch (error) { next(error); }
});

router.get('/employee/:employeeId', authenticate, authorize('salary:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const structure = await salaryStructureService.getActiveStructure(req.params.employeeId);
    res.json({ success: true, data: structure });
  } catch (error) { next(error); }
});

export default router;
