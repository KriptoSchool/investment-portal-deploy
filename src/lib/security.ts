// Security utilities and middleware
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Environment variables for security
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = 12;

// Simple rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Simple token utilities (using crypto instead of JWT)
export const generateToken = (payload: any): string => {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    iat: Date.now()
  });
  
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(JWT_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

export const verifyToken = (token: string): any => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(JWT_SECRET, 'salt', 32);
    
    const parts = token.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const payload = JSON.parse(decrypted);
    
    if (payload.exp < Date.now()) {
      throw new Error('Token expired');
    }
    
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Simple password hashing utilities (using crypto instead of bcrypt)
export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (error) {
    return false;
  }
};

// Input validation and sanitization
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_.,?":{}|<>\-+=\[\]]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_.,?":{}|<>-+=[])');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match];
    })
    .trim();
};

// CSRF Token utilities
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const verifyCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};

// Security headers middleware
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ctmufouoventqlgbrkkf.supabase.co;"
};

// Apply security headers to response
export const applySecurityHeaders = (response: NextResponse): NextResponse => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

// Authentication middleware
export const authenticateRequest = async (request: NextRequest): Promise<{ isValid: boolean; user?: any; error?: string }> => {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return { isValid: false, error: 'No authentication token provided' };
    }
    
    const decoded = verifyToken(token);
    return { isValid: true, user: decoded };
  } catch (error) {
    return { isValid: false, error: 'Invalid authentication token' };
  }
};

// Role-based access control
export const hasPermission = (userRole: string, requiredPermissions: string[]): boolean => {
  const rolePermissions: { [key: string]: string[] } = {
    admin: [
      'manage_users',
      'manage_consultants', 
      'manage_investors',
      'view_all_data',
      'manage_dividends',
      'register_investors',
      'view_all_investors',
      'view_reports',
      'view_analytics',
      'manage_applications',
      'approve_applications'
    ],
    consultant: [
      'register_investors',
      'view_own_investors',
      'view_commissions',
      'view_reports'
    ],
    investor: [
      'view_own_data',
      'view_dividends'
    ]
  };
  
  const userPermissions = rolePermissions[userRole] || [];
  return requiredPermissions.every(permission => userPermissions.includes(permission));
};

// Session management
export const createSession = (user: any): string => {
  const sessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    level: user.level,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return generateToken(sessionData);
};

// Audit logging
export const logSecurityEvent = (event: string, details: any, userId?: string): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userId,
    ip: details.ip || 'unknown'
  };
  
  // In production, send to secure logging service
  console.log('SECURITY EVENT:', JSON.stringify(logEntry));
};

// IP whitelist for admin operations
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST?.split(',') || [];

export const isAdminIPAllowed = (ip: string): boolean => {
  if (ADMIN_IP_WHITELIST.length === 0) return true; // No whitelist configured
  return ADMIN_IP_WHITELIST.includes(ip);
};

// Secure random string generation
export const generateSecureRandom = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Data encryption utilities
export const encrypt = (text: string): string => {
  const algorithm = 'aes-256-cbc';
  const secretKey = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const algorithm = 'aes-256-cbc';
  const secretKey = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};