 
export const PERMISSIONS = {
  ATTENDANCE: {
    READ: 'attendance.read',
    CREATE: 'attendance.create',
    UPDATE: 'attendance.update',
    DELETE: 'attendance.delete',
    FETCH: 'attendance.fetch',
  },
  SYNC: {
    READ: 'sync.read',
    MANUAL: 'sync.manual',
    EMERGENCY: 'sync.emergency',
    RETRY: 'sync.retry',
  },
  EMPLOYEES: {
    READ: 'employees.read',
    CREATE: 'employees.create',
    UPDATE: 'employees.update',
    DELETE: 'employees.delete',
  },
  USERS: {
    READ: 'users.read',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
  },
  ROLES: {
    READ: 'roles.read',
    CREATE: 'roles.create',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
    ASSIGN: 'roles.assign',
  },
  PERMISSIONS: {
    READ: 'permissions.read',
    ASSIGN: 'permissions.assign',
  },
  REPORTS: {
    READ: 'reports.read',
    GENERATE: 'reports.generate',
    EXPORT: 'reports.export',
  },
  SETTINGS: {
    READ: 'settings.read',
    UPDATE: 'settings.update',
  },
  BAYZAT: {
    CONFIG_READ: 'bayzat.config.read',
    CONFIG_UPDATE: 'bayzat.config.update',
  },
  HIKCONNECT: {
    CONFIG_READ: 'hikconnect.config.read',
    CONFIG_UPDATE: 'hikconnect.config.update',
  },
} as const;

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;