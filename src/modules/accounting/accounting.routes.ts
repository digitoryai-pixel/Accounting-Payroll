import { Router, Request, Response, NextFunction } from 'express';
import { chartOfAccountsService } from './chart-of-accounts.service';
import { journalEntryService } from './journal-entry.service';
import { ledgerService } from './ledger.service';
import { authenticate, authorize } from '../../common/middleware/auth';

const router = Router();

// ---- Chart of Accounts ----
router.get('/accounts', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await chartOfAccountsService.list(
      req.user!.organizationId,
      req.query.type as any
    );
    res.json({ success: true, data: accounts });
  } catch (error) { next(error); }
});

router.get('/accounts/tree', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tree = await chartOfAccountsService.getTree(req.user!.organizationId);
    res.json({ success: true, data: tree });
  } catch (error) { next(error); }
});

router.post('/accounts', authenticate, authorize('accounting:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await chartOfAccountsService.create({
      ...req.body,
      organizationId: req.user!.organizationId,
    }, req.user!.id);
    res.status(201).json({ success: true, data: account });
  } catch (error) { next(error); }
});

router.post('/accounts/seed', authenticate, authorize('accounting:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await chartOfAccountsService.seedDefaultAccounts(req.user!.organizationId, req.user!.id);
    res.json({ success: true, message: 'Default chart of accounts created' });
  } catch (error) { next(error); }
});

// ---- Journal Entries ----
router.post('/journal-entries', authenticate, authorize('accounting:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await journalEntryService.create({
      ...req.body,
      organizationId: req.user!.organizationId,
    }, req.user!.id);
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
});

router.get('/journal-entries', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await journalEntryService.list(
      req.user!.organizationId,
      {
        source: req.query.source as any,
        status: req.query.status as any,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        fiscalYear: req.query.fiscalYear as string,
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

router.get('/journal-entries/:id', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await journalEntryService.getById(req.params.id);
    res.json({ success: true, data: entry });
  } catch (error) { next(error); }
});

router.post('/journal-entries/:id/post', authenticate, authorize('accounting:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await journalEntryService.post(req.params.id, req.user!.id);
    res.json({ success: true, data: entry });
  } catch (error) { next(error); }
});

router.post('/journal-entries/:id/reverse', authenticate, authorize('accounting:manage'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await journalEntryService.reverse(req.params.id, req.user!.id, req.body.reason);
    res.json({ success: true, data: entry });
  } catch (error) { next(error); }
});

// ---- Ledger & Books (Tally-equivalent) ----
router.get('/ledger/:accountCode', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ledger = await ledgerService.getAccountLedger(
      req.user!.organizationId,
      req.params.accountCode,
      req.query.from as string,
      req.query.to as string
    );
    res.json({ success: true, data: ledger });
  } catch (error) { next(error); }
});

router.get('/day-book', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dayBook = await ledgerService.getDayBook(
      req.user!.organizationId,
      req.query.date as string
    );
    res.json({ success: true, data: dayBook });
  } catch (error) { next(error); }
});

router.get('/cash-book', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cashBook = await ledgerService.getCashBook(
      req.user!.organizationId,
      req.query.from as string,
      req.query.to as string
    );
    res.json({ success: true, data: cashBook });
  } catch (error) { next(error); }
});

router.get('/bank-book', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bankBook = await ledgerService.getBankBook(
      req.user!.organizationId,
      (req.query.accountCode as string) || '1120',
      req.query.from as string,
      req.query.to as string
    );
    res.json({ success: true, data: bankBook });
  } catch (error) { next(error); }
});

router.get('/trial-balance', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tb = await journalEntryService.getTrialBalance(
      req.user!.organizationId,
      req.query.asOfDate as string
    );
    res.json({ success: true, data: tb });
  } catch (error) { next(error); }
});

router.get('/balance-sheet', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bs = await ledgerService.getBalanceSheet(
      req.user!.organizationId,
      req.query.asOfDate as string
    );
    res.json({ success: true, data: bs });
  } catch (error) { next(error); }
});

router.get('/receivables-aging', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await ledgerService.getReceivablesAging(
      req.user!.organizationId,
      req.query.asOfDate as string || new Date().toISOString().split('T')[0]
    );
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});

router.get('/payables-aging', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await ledgerService.getPayablesAging(
      req.user!.organizationId,
      req.query.asOfDate as string || new Date().toISOString().split('T')[0]
    );
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});

router.get('/group-summary', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await ledgerService.getGroupSummary(
      req.user!.organizationId,
      req.query.from as string,
      req.query.to as string
    );
    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
});

router.get('/gst-report', authenticate, authorize('accounting:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await ledgerService.getGSTReport(
      req.user!.organizationId,
      req.query.from as string,
      req.query.to as string
    );
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});

export default router;
