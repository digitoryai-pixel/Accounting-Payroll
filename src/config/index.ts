import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'digitory_financial',
    user: process.env.DB_USER || 'digitory',
    password: process.env.DB_PASSWORD || '',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    expiry: process.env.JWT_EXPIRY || '24h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3: {
      payslipsBucket: process.env.S3_BUCKET_PAYSLIPS || 'digitory-payslips',
      reportsBucket: process.env.S3_BUCKET_REPORTS || 'digitory-reports',
    },
  },

  digitory: {
    apiBaseUrl: process.env.DIGITORY_API_BASE_URL || 'https://api.digitory.com/v1',
    apiKey: process.env.DIGITORY_API_KEY || '',
    webhookSecret: process.env.DIGITORY_WEBHOOK_SECRET || '',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'payroll@digitory.com',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
    salaryKey: process.env.SALARY_ENCRYPTION_KEY || '',
  },
} as const;
