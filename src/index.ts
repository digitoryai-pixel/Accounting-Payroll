import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './common/middleware/error-handler';
import { logger } from './common/utils/logger';

// Import routes
import employeeRoutes from './modules/employee/employee.routes';
import salaryStructureRoutes from './modules/salary-structure/salary-structure.routes';
import payrollRoutes from './modules/payroll/payroll.routes';
import accountingRoutes from './modules/accounting/accounting.routes';
import reportingRoutes from './modules/reporting/reporting.routes';
import authRoutes from './modules/auth/auth.routes';

// Initialize auto-posting event handlers
import './modules/accounting/auto-posting.service';

const app = express();

// ---- Middleware ----
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ---- Health Check ----
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'digitory-financial-os',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ---- API Routes ----
const api = config.apiPrefix;

app.use(`${api}/auth`, authRoutes);
app.use(`${api}/employees`, employeeRoutes);
app.use(`${api}/salary`, salaryStructureRoutes);
app.use(`${api}/payroll`, payrollRoutes);
app.use(`${api}/accounting`, accountingRoutes);
app.use(`${api}/reports`, reportingRoutes);

// ---- Digitory Webhook Endpoint ----
app.post(`${api}/webhooks/digitory`, async (req, res) => {
  try {
    const { digitoryIntegrationService } = await import('./modules/integration/digitory.service');
    const eventType = req.headers['x-digitory-event'] as string;
    const signature = req.headers['x-digitory-signature'] as string;
    await digitoryIntegrationService.handleWebhook(eventType, req.body, signature);
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', { error });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ---- Error Handler (must be last) ----
app.use(errorHandler);

// ---- Start Server ----
app.listen(config.port, () => {
  logger.info(`Digitory Financial OS started`, {
    port: config.port,
    env: config.env,
    apiPrefix: config.apiPrefix,
  });
  logger.info('Modules loaded: Employee, Salary, Payroll, Accounting, Reporting, Integration');
  logger.info('Event-driven auto-posting: ACTIVE');
});

export default app;
