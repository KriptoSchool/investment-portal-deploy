import { NextRequest, NextResponse } from 'next/server';
import { applySecurityHeaders, authenticateRequest, isAdminIPAllowed, logSecurityEvent } from '@/lib/security';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/auth': { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  '/api/admin': { requests: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  '/api': { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute for general API
  default: { requests: 200, windowMs: 60 * 1000 } // 200 requests per minute for other routes
};

// Apply rate limiting
function applyRateLimit(request: NextRequest, path: string): NextResponse | null {
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const key = `${clientIP}:${path}`;
  
  // Determine rate limit for this path
  let rateLimit = RATE_LIMITS.default;
  for (const [pattern, limit] of Object.entries(RATE_LIMITS)) {
    if (pattern !== 'default' && path.startsWith(pattern)) {
      rateLimit = limit;
      break;
    }
  }
  
  const now = Date.now();
  const windowStart = now - rateLimit.windowMs;
  
  // Clean up old entries
  for (const [key, data] of Array.from(rateLimitStore.entries())) {
    if (data.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }
  
  // Check current rate limit
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + rateLimit.windowMs };
  
  if (current.count >= rateLimit.requests && current.resetTime > now) {
    // Rate limit exceeded
    logSecurityEvent('rate_limit_exceeded', {
      ip: clientIP,
      path,
      limit: rateLimit.requests,
      window: rateLimit.windowMs
    });
    
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
    
    response.headers.set('Retry-After', Math.ceil((current.resetTime - now) / 1000).toString());
    return applySecurityHeaders(response);
  }
  
  // Update rate limit counter
  current.count++;
  rateLimitStore.set(key, current);
  
  return null; // No rate limit violation
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/api/admin',
  '/api/users',
  '/api/consultants',
  '/api/investors',
  '/api/applications',
  '/api/commissions'
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/dashboard/admin',
  '/api/admin',
  '/dashboard/users',
  '/dashboard/settings'
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth',
  '/apply',
  '/invites',
  '/change-password',
  '/api/webhooks',
  '/api/health'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request, pathname);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Check if route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    
    if (isPublicRoute) {
      // Apply security headers to public routes
      const response = NextResponse.next();
      return applySecurityHeaders(response);
    }
    
    // Check if route requires authentication
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
      // Authenticate the request
      const authResult = await authenticateRequest(request);
      
      if (!authResult.isValid) {
        logSecurityEvent('unauthorized_access_attempt', {
          ip: clientIP,
          path: pathname,
          error: authResult.error
        });
        
        // Redirect to login for dashboard routes
        if (pathname.startsWith('/dashboard')) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(loginUrl);
        }
        
        // Return 401 for API routes
        const response = NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
        return applySecurityHeaders(response);
      }
      
      // Check admin-only routes
      const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
      
      if (isAdminRoute) {
        // Check if user has admin role
        if (authResult.user?.role !== 'admin') {
          logSecurityEvent('admin_access_denied', {
            ip: clientIP,
            path: pathname,
            userId: authResult.user?.id,
            userRole: authResult.user?.role
          });
          
          if (pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
          
          const response = NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
          return applySecurityHeaders(response);
        }
        
        // Check IP whitelist for admin operations
        if (!isAdminIPAllowed(clientIP)) {
          logSecurityEvent('admin_ip_blocked', {
            ip: clientIP,
            path: pathname,
            userId: authResult.user?.id
          });
          
          const response = NextResponse.json(
            { error: 'Access denied from this IP address' },
            { status: 403 }
          );
          return applySecurityHeaders(response);
        }
      }
      
      // Add user info to request headers for API routes
      if (pathname.startsWith('/api/')) {
        const response = NextResponse.next();
        response.headers.set('x-user-id', authResult.user?.id || '');
        response.headers.set('x-user-role', authResult.user?.role || '');
        return applySecurityHeaders(response);
      }
    }
    
    // Apply security headers to all responses
    const response = NextResponse.next();
    return applySecurityHeaders(response);
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    logSecurityEvent('middleware_error', {
      ip: clientIP,
      path: pathname,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Return a generic error response
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return applySecurityHeaders(response);
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};