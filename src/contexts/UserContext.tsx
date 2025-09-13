'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { validateEmail, validatePassword, sanitizeInput, generateCSRFToken, logSecurityEvent } from '@/lib/security';

export type UserRole = 'admin' | 'consultant' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level?: string;
  permissions: string[];
  lastLogin?: string;
  mfaEnabled?: boolean;
  sessionId?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
  isConsultant: boolean;
  isInvestor: boolean;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresMFA?: boolean }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  csrfToken: string;
  refreshSession: () => Promise<boolean>;
  forceSessionCheck: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Secure role determination based on database records
const determineUserRole = async (userId: string): Promise<{ role: UserRole; level?: string }> => {
  try {
    // First check user_profiles table for OAuth users
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (profileData?.role) {
      return { role: profileData.role as UserRole };
    }
    
    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (adminData) {
      return { role: 'admin' };
    }
    
    // Check if user is consultant
    const { data: consultantData } = await supabase
      .from('consultants')
      .select('level')
      .eq('user_id', userId)
      .single();
    
    if (consultantData) {
      return { role: 'consultant', level: consultantData.level };
    }
    
    // Check if user is investor
    const { data: investorData } = await supabase
      .from('investors')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (investorData) {
      return { role: 'investor' };
    }
    
    // Default to consultant if no specific role found
    return { role: 'consultant' };
  } catch (error) {
    console.error('Error determining user role:', error);
    return { role: 'consultant' };
  }
};

// Generate secure permissions based on role
const getUserPermissions = (role: UserRole): string[] => {
  switch (role) {
    case 'admin':
      return [
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
        'approve_applications',
        'manage_system_settings'
      ];
    case 'consultant':
      return [
        'register_investors',
        'view_own_investors',
        'view_commissions',
        'view_reports',
        'manage_own_profile'
      ];
    case 'investor':
      return [
        'view_own_data',
        'view_dividends',
        'manage_own_profile'
      ];
    default:
      return [];
  }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCSRFToken] = useState('');

  // Generate CSRF token on mount
  useEffect(() => {
    setCSRFToken(generateCSRFToken());
  }, []);

  // Check for existing session on mount and handle OAuth callback
  useEffect(() => {
    // Handle OAuth callback if we're on the callback page
    if (typeof window !== 'undefined' && window.location.pathname === '/auth/callback') {
      console.log('🔄 Detected OAuth callback, processing...');
      // Still check session but don't redirect
      checkSession();
      return;
    }
    
    checkSession();
    
    // Listen for auth state changes (handles OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth State Change:', { event, userId: session?.user?.id, email: session?.user?.email, pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown' });
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          console.log('✅ Starting OAuth sign-in process for:', session.user.email);
          setIsLoading(true);
          
          // For OAuth users, create profile if it doesn't exist
          console.log('📝 Ensuring user profile exists...');
          await ensureUserProfile(session.user);
          
          // Wait a bit to ensure profile is created
          console.log('⏳ Waiting for database consistency...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('📊 Loading user data...');
          await loadUserData(session.user.id);
          
          console.log('🎉 OAuth sign-in completed successfully!');
          
          // If we're on the callback page, don't redirect here - let the callback page handle it
          if (typeof window !== 'undefined' && window.location.pathname !== '/auth/callback') {
            console.log('🔄 Not on callback page, could redirect to dashboard here if needed');
          }
        } catch (error) {
          console.error('❌ OAuth sign-in error:', error);
          console.error('Error details:', { message: (error as any)?.message, code: (error as any)?.code, details: (error as any)?.details });
          // Don't logout on error, let user try again
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
      } else {
        console.log('🔄 Other auth event:', event);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Add manual session refresh function for OAuth
  const forceSessionCheck = async () => {
    console.log('🔄 Force checking session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('🔍 Manual session check result:', { 
        hasSession: !!session, 
        userId: session?.user?.id, 
        email: session?.user?.email,
        error: error?.message 
      });
      
      if (session?.user && !user) {
        console.log('📝 Found session but no user in context, loading user data...');
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('❌ Force session check error:', error);
    }
  };
  
  // Expose forceSessionCheck globally for callback page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).forceSessionCheck = forceSessionCheck;
    }
  }, [user]);
  
  // Ensure user profile exists (for OAuth users)
  const ensureUserProfile = async (authUser: any) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      // If profile doesn't exist (not found error is expected)
      if (!existingProfile && selectError?.code === 'PGRST116') {
        // Create profile for OAuth user
        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            role: 'consultant', // Default role for OAuth users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          throw profileError;
        }
        
        console.log('Created new user profile:', newProfile);
      } else if (existingProfile) {
        console.log('User profile already exists:', existingProfile);
      } else if (selectError) {
        console.error('Error checking user profile:', selectError);
        throw selectError;
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      throw error;
    }
  };

  const checkSession = async () => {
    try {
      setIsLoading(true);
      
      // Check for temporary admin session first
      const tempSession = localStorage.getItem('temp_admin_session');
      if (tempSession) {
        try {
          const tempUser = JSON.parse(tempSession);
          setUser(tempUser);
          setIsLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('temp_admin_session');
        }
      }
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        await logout();
        return;
      }
      
      if (session?.user) {
        await loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      console.log('🔍 Loading user data for ID:', userId);
      
      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('❌ Error loading user profile:', profileError);
        console.error('Profile error details:', { code: profileError.code, message: profileError.message });
        // Don't logout, just return - the auth state change listener will handle profile creation
        return;
      }
      
      if (!profile) {
        console.log('⚠️ User profile not found, will be created by auth state change listener');
        return;
      }
      
      console.log('✅ User profile loaded:', { id: profile.id, email: profile.email, role: profile.role });
      
      // Determine role and permissions
      console.log('🎭 Determining user role...');
      const { role, level } = await determineUserRole(userId);
      console.log('✅ Role determined:', { role, level });
      
      const permissions = getUserPermissions(role);
      console.log('🔑 Permissions assigned:', permissions);
      
      const userData: User = {
        id: userId,
        name: sanitizeInput(profile.full_name || profile.email?.split('@')[0] || 'User'),
        email: profile.email,
        role,
        level,
        permissions,
        lastLogin: new Date().toISOString(),
        mfaEnabled: profile.mfa_enabled || false,
        sessionId: generateCSRFToken()
      };
      
      console.log('👤 Setting user data:', { id: userData.id, name: userData.name, email: userData.email, role: userData.role });
      setUser(userData);
      console.log('✅ User successfully set in context!');
      
      // Log successful session restoration
      logSecurityEvent('session_restored', {
        userId,
        role,
        timestamp: new Date().toISOString()
      });
      
      console.log('📝 Security event logged: session_restored');
      
    } catch (error) {
      console.error('Error loading user data:', error);
      await logout();
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; requiresMFA?: boolean }> => {
    try {
      // Input validation
      if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }
      
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      
      // All users now authenticate through Supabase database
      // Admin user is stored in the database for security
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: 'Password does not meet security requirements' };
      }
      
      // Attempt authentication with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password
      });
      
      if (error) {
        // Log failed login attempt
        logSecurityEvent('login_failed', {
          email: sanitizedEmail,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        return { success: false, error: 'Invalid email or password' };
      }
      
      if (!data.user) {
        return { success: false, error: 'Authentication failed' };
      }
      
      // Load user data
      await loadUserData(data.user.id);
      
      // Log successful login
      logSecurityEvent('login_success', {
        userId: data.user.id,
        email: sanitizedEmail,
        timestamp: new Date().toISOString()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Input validation
      if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }
      
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      const sanitizedName = sanitizeInput(fullName);
      
      // Register user with Supabase (all new users are consultants)
         const { data, error } = await supabase.auth.signUp({
           email: sanitizedEmail,
           password: password,
           options: {
             data: {
               full_name: sanitizedName,
               role: 'consultant'
             }
           }
         });
      
      if (error) {
        // Log failed registration attempt
        logSecurityEvent('registration_failed', {
          email: sanitizedEmail,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'Registration failed' };
      }
      
      // Log successful registration
         logSecurityEvent('registration_success', {
           userId: data.user.id,
           email: sanitizedEmail,
           role: 'consultant',
           timestamp: new Date().toISOString()
         });
      
      // Sign out immediately after registration (don't auto-login)
      await supabase.auth.signOut();
      
      return { success: true };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration' };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logout initiated for user:', user?.email || 'unknown');
      
      // Log logout event
      if (user) {
        logSecurityEvent('logout', {
          userId: user.id,
          timestamp: new Date().toISOString()
        });
        console.log('📝 Logout security event logged for:', user.email);
      }
      
      // Sign out from Supabase
      console.log('🔐 Signing out from Supabase...');
      await supabase.auth.signOut();
      
      // Clear user state
      console.log('🧹 Clearing user state...');
      setUser(null);
      
      // Clear any cached data
      console.log('🗑️ Clearing cached data...');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('temp_admin_session');
      sessionStorage.clear();
      
      console.log('✅ Logout completed successfully');
      
      // Generate new CSRF token
      setCSRFToken(generateCSRFToken());
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear state even if logout fails
      setUser(null);
      localStorage.removeItem('currentUser');
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        await logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      await logout();
      return false;
    }
  };

  // Auto-refresh session every 30 minutes
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshSession, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const isConsultant = user?.role === 'consultant';
  const isInvestor = user?.role === 'investor';

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const value: UserContextType = {
    user,
    setUser,
    isAdmin,
    isConsultant,
    isInvestor,
    hasPermission,
    login,
    register,
    logout,
    isLoading,
    csrfToken,
    refreshSession,
    forceSessionCheck
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Enhanced role-based access control hook
export function useRoleAccess() {
  const { user, isAdmin, isConsultant, isInvestor, hasPermission, logout } = useUser();
  
  return {
    user,
    isAdmin,
    isConsultant,
    isInvestor,
    hasPermission,
    logout,
    canViewDividends: hasPermission('manage_dividends') || hasPermission('view_dividends'),
    canRegisterInvestors: hasPermission('register_investors'),
    canViewAllInvestors: hasPermission('view_all_investors'),
    canManageConsultants: hasPermission('manage_consultants'),
    canViewReports: hasPermission('view_reports'),
    canViewAnalytics: hasPermission('view_analytics'),
    canManageApplications: hasPermission('manage_applications'),
    canApproveApplications: hasPermission('approve_applications'),
    canManageSystemSettings: hasPermission('manage_system_settings')
  };
}

// Security hook for sensitive operations
export function useSecurityCheck() {
  const { user, csrfToken, refreshSession } = useUser();
  
  const requireAuth = (): boolean => {
    if (!user) {
      throw new Error('Authentication required');
    }
    return true;
  };
  
  const requireRole = (requiredRole: UserRole): boolean => {
    requireAuth();
    if (user!.role !== requiredRole) {
      throw new Error(`${requiredRole} role required`);
    }
    return true;
  };
  
  const requirePermission = (permission: string): boolean => {
    requireAuth();
    if (!user!.permissions.includes(permission)) {
      throw new Error(`Permission '${permission}' required`);
    }
    return true;
  };
  
  return {
    requireAuth,
    requireRole,
    requirePermission,
    csrfToken,
    refreshSession
  };
}