import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../../infrastructure/database/connection';
import { config } from '../../config';
import { UnauthorizedError } from '../../common/errors';

const router = Router();
const ADMIN_USER_UUID = '00000000-0000-4000-a000-000000000001';

// Demo credentials
const DEMO_USERS: Record<string, { password: string; role: string }> = {
  'admin@digitory.com': { password: 'admin123', role: 'SUPER_ADMIN' },
  'manager@digitory.com': { password: 'manager123', role: 'OUTLET_MANAGER' },
};

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const demoUser = DEMO_USERS[email];
    if (!demoUser || demoUser.password !== password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const db = getDb();
    const org = await db('organizations').first();
    if (!org) throw new UnauthorizedError('No organization configured');

    const outlets = await db('outlets').where({ organization_id: org.id });

    const payload = {
      id: ADMIN_USER_UUID,
      organizationId: org.id,
      outletIds: outlets.map((o: any) => o.id),
      role: demoUser.role,
      permissions: [
        'employee:create', 'employee:read', 'employee:update', 'employee:delete',
        'attendance:create', 'attendance:read',
        'salary:manage', 'salary:read',
        'payroll:process', 'payroll:approve', 'payroll:read',
        'accounting:manage', 'accounting:read',
        'reports:read', 'reports:manage',
        'restaurant:manage', 'restaurant:read',
        'compliance:manage', 'compliance:read',
      ],
    };

    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: ADMIN_USER_UUID,
          email,
          role: demoUser.role,
          organizationName: org.name,
          outlets: outlets.map((o: any) => ({ id: o.id, name: o.name, type: o.type })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/demo-token (quick login for development)
router.get('/demo-token', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const db = getDb();
    const org = await db('organizations').first();
    if (!org) throw new UnauthorizedError('No organization configured');

    const outlets = await db('outlets').where({ organization_id: org.id });

    const payload = {
      id: ADMIN_USER_UUID,
      organizationId: org.id,
      outletIds: outlets.map((o: any) => o.id),
      role: 'SUPER_ADMIN',
      permissions: [
        'employee:create', 'employee:read', 'employee:update', 'employee:delete',
        'attendance:create', 'attendance:read',
        'salary:manage', 'salary:read',
        'payroll:process', 'payroll:approve', 'payroll:read',
        'accounting:manage', 'accounting:read',
        'reports:read', 'reports:manage',
        'restaurant:manage', 'restaurant:read',
        'compliance:manage', 'compliance:read',
      ],
    };

    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: ADMIN_USER_UUID,
          email: 'admin@digitory.com',
          role: 'SUPER_ADMIN',
          organizationName: org.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
