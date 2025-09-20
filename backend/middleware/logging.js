import Log from '../models/Log.js';
import { LOG_ACTIONS, LOG_MODULES } from '../utils/constants.js';

// Middleware to log HTTP requests
const requestLogger = async (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      const duration = Date.now() - start;
      
      // Skip logging for these paths
      const excludedPaths = ['/api/auth/login', '/api/auth/register', '/health'];
      if (excludedPaths.includes(req.path)) {
        return;
      }

      // Determine module based on route path
      let module = LOG_MODULES.AUTH; // default to auth
      if (req.path.startsWith('/api/students')) module = LOG_MODULES.STUDENT;
      else if (req.path.startsWith('/api/fees')) module = LOG_MODULES.FEE;
      else if (req.path.startsWith('/api/exams')) module = LOG_MODULES.EXAM;
      else if (req.path.startsWith('/api/hostels')) module = LOG_MODULES.HOSTEL;
      else if (req.path.startsWith('/api/auth')) module = LOG_MODULES.AUTH;
      else if (req.path.startsWith('/api/users')) module = LOG_MODULES.USER;

      // Determine action based on HTTP method
      let action = 'request';
      if (req.method === 'POST') action = LOG_ACTIONS.CREATE;
      else if (req.method === 'PUT' || req.method === 'PATCH') action = LOG_ACTIONS.UPDATE;
      else if (req.method === 'DELETE') action = LOG_ACTIONS.DELETE;
      else if (req.method === 'GET') action = 'read';

      // Only log if we have a user (after authentication)
      if (req.user && req.user._id) {
        await Log.createLog({
          action,
          module,
          description: `${req.method} ${req.path} - ${res.statusCode}`,
          performedBy: req.user._id,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          changes: {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            method: req.method,
            path: req.path
          }
        });
      }
    } catch (error) {
      console.error('Error logging request:', error);
    }
  });

  next();
};

// Helper function to create custom log entries
const createLogEntry = async (logData) => {
  try {
    // Ensure module is valid
    if (!Object.values(LOG_MODULES).includes(logData.module)) {
      logData.module = LOG_MODULES.AUTH; // default to auth
    }
    
    // Ensure performedBy is provided
    if (!logData.performedBy) {
      console.warn('Skipping log entry: performedBy is required');
      return;
    }
    
    await Log.createLog(logData);
  } catch (error) {
    console.error('Error creating log entry:', error);
  }
};

// Middleware to log specific actions
const actionLogger = (action, module, description) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user._id) {
        await Log.createLog({
          action,
          module,
          description,
          performedBy: req.user._id,
          targetId: req.params.id || null,
          targetModel: module,
          changes: req.body,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
    } catch (error) {
      console.error('Error in action logger:', error);
    }
    next();
  };
};

export { requestLogger, createLogEntry, actionLogger };