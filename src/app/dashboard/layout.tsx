'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRoleAccess } from '@/contexts/UserContext';

// Icons
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  ChevronDown,
  Sun,
  Moon,
  DollarSign,
  Shield,
  UserCheck,
  LogOut,
  TrendingUp,
  Activity
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { title: string; href: string }[];
  requiredRole?: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    requiredRole: ['admin', 'consultant']
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: <Users className="h-5 w-5" />,
    requiredRole: ['admin']
  },


  {
    title: 'Applications',
    href: '/dashboard/admin/applications-new',
    icon: <FileText className="h-5 w-5" />,
    requiredRole: ['admin']
  },
  {
    title: 'Dividend Management',
    href: '/dashboard/dividend-management',
    icon: <DollarSign className="h-5 w-5" />,
    requiredRole: ['admin', 'consultant']
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: <FileText className="h-5 w-5" />,
    requiredRole: ['admin', 'consultant']
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode for crypto theme
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isConsultant, logout } = useRoleAccess();

  // Function to check if user has access to navigation item
  const hasNavAccess = (requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    
    // Simulate a brief delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Use logout function from context
    logout();
    
    // Close modal
    setShowLogoutModal(false);
    setIsLoggingOut(false);
    
    // Redirect to sign-in page
    router.push('/login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex h-screen bg-[#0B0F14] text-[#E6ECF2] transition-colors duration-[200ms]">
      {/* Premium Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-[#101826] backdrop-blur-xl border-r border-[rgba(230,236,242,0.12)] shadow-2xl transform transition-transform duration-[300ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:translate-x-0'
      )}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(46,230,166,0.02)] via-transparent to-[rgba(62,168,255,0.02)] pointer-events-none" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between h-16 px-6 border-b border-[rgba(230,236,242,0.08)]">
          <Link href="/dashboard" className="flex items-center group">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px] mr-3 shadow-lg group-hover:shadow-[#2EE6A6]/25 transition-all duration-[200ms]">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-[18px] font-bold tracking-tight" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                <span className="text-[#2EE6A6]">Aaron M</span>
                <span className="text-[#E6ECF2] ml-2">LLP</span>
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#A8B3C2] hover:text-[#E6ECF2] focus:outline-none transition-colors duration-[180ms] p-2 rounded-[8px] hover:bg-[rgba(230,236,242,0.08)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="relative z-10 mt-6 px-4 space-y-2">
          {navItems.filter(item => hasNavAccess(item.requiredRole)).map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      'group flex items-center justify-between w-full px-4 py-3 text-[14px] font-medium rounded-[12px] transition-all duration-[200ms]',
                      'text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] hover:text-[#E6ECF2]'
                    )}
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    <div className="flex items-center">
                      <div className="text-[#A8B3C2] group-hover:text-[#2EE6A6] transition-colors duration-[200ms]">
                        {item.icon}
                      </div>
                      <span className="ml-3">{item.title}</span>
                    </div>
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform duration-[200ms]',
                      openSubmenu === item.title ? 'rotate-180' : ''
                    )} />
                  </button>
                  {openSubmenu === item.title && (
                    <div className="mt-2 ml-6 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.title}
                          href={subitem.href}
                          className="block px-4 py-2 text-[13px] text-[#A8B3C2] hover:text-[#E6ECF2] hover:bg-[rgba(230,236,242,0.06)] rounded-[8px] transition-all duration-[180ms] font-medium"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          {subitem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-[14px] font-medium rounded-[12px] transition-all duration-[200ms]',
                    pathname === item.href
                      ? 'bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white shadow-lg shadow-[#2EE6A6]/25'
                      : 'text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] hover:text-[#E6ECF2]'
                  )}
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  <div className={cn(
                    'transition-colors duration-[200ms]',
                    pathname === item.href ? 'text-white' : 'text-[#A8B3C2] group-hover:text-[#2EE6A6]'
                  )}>
                    {item.icon}
                  </div>
                  <span className="ml-3">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-[rgba(46,230,166,0.05)] border border-[rgba(46,230,166,0.1)] rounded-[12px] p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-[#2EE6A6] mr-2" />
              <span className="text-[12px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Market Status</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Active</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[#21D07A] rounded-full mr-2 animate-pulse" />
                <span className="text-[11px] font-mono text-[#21D07A]">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Premium Header */}
        <header className="bg-[#101826] backdrop-blur-xl border-b border-[rgba(230,236,242,0.12)] shadow-lg z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-[#A8B3C2] hover:text-[#E6ECF2] focus:outline-none transition-colors duration-[180ms] p-2 rounded-[8px] hover:bg-[rgba(230,236,242,0.08)] md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden md:block ml-2">
                <h2 className="text-[16px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  Aaron M LLP Investment Portal
                </h2>
              </div>
              <div className="relative ml-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#A8B3C2]" />
                </div>
                <input
                  className="block w-full pl-10 pr-4 py-2 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[12px] text-[#E6ECF2] placeholder-[#A8B3C2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] text-[14px] transition-all duration-[200ms] backdrop-blur-sm"
                  placeholder="Search investments, clients..."
                  type="search"
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleDarkMode}
                className="text-[#A8B3C2] hover:text-[#E6ECF2] focus:outline-none transition-colors duration-[180ms] p-2 rounded-[8px] hover:bg-[rgba(230,236,242,0.08)]"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              
              <button className="text-[#A8B3C2] hover:text-[#E6ECF2] focus:outline-none relative p-2 rounded-[8px] hover:bg-[rgba(230,236,242,0.08)] transition-colors duration-[180ms]">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-[#F04444] animate-pulse" />
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-3 border-l border-[rgba(230,236,242,0.12)]">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-[8px] bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] text-white flex items-center justify-center shadow-lg">
                    <span className="text-[12px] font-bold" style={{fontFamily: 'Inter, sans-serif'}}>
                      {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AM'}
                    </span>
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>
                      {user?.name || 'Aaron M LLP User'}
                    </p>
                    <p className="text-[12px] text-[#A8B3C2] capitalize" style={{fontFamily: 'Inter, sans-serif'}}>
                      {user?.role || 'User'} {user?.level && `(${user.level})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[13px] text-[#A8B3C2] hover:text-[#E6ECF2] focus:outline-none px-3 py-2 rounded-[8px] hover:bg-[rgba(230,236,242,0.08)] transition-all duration-[180ms] font-medium"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#0B0F14]">
          {children}
        </main>
      </div>

      {/* Enhanced Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#F04444] to-[#FF6B6B] rounded-t-2xl p-6">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <LogOut className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Sign Out</h3>
                  <p className="text-red-100 text-sm" style={{fontFamily: 'Inter, sans-serif'}}>End your current session</p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-[rgba(240,68,68,0.1)] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-[#F04444]" />
                </div>
                <h4 className="text-lg font-semibold text-[#E6ECF2] mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Confirm Sign Out</h4>
                <p className="text-[#A8B3C2] leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
                  Are you sure you want to sign out of your Aaron M LLP account? You'll need to sign in again to access your dashboard.
                </p>
              </div>
              
              {/* User Info */}
              <div className="bg-[rgba(230,236,242,0.05)] border border-[rgba(230,236,242,0.08)] rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-[8px] bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] text-white flex items-center justify-center mr-3">
                    <span className="text-sm font-bold" style={{fontFamily: 'Inter, sans-serif'}}>
                      {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AM'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>{user?.name || 'User'}</p>
                    <p className="text-sm text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>{user?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 border border-[rgba(230,236,242,0.12)] rounded-xl text-[#A8B3C2] font-medium hover:bg-[rgba(230,236,242,0.08)] hover:text-[#E6ECF2] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#A8B3C2] focus:ring-offset-2 focus:ring-offset-[#101826]"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  disabled={isLoggingOut}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F04444] to-[#FF6B6B] text-white font-medium rounded-xl hover:from-[#E03E3E] hover:to-[#FF5757] transition-all duration-200 shadow-lg hover:shadow-[#F04444]/25 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#F04444] focus:ring-offset-2 focus:ring-offset-[#101826]"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  {isLoggingOut ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing Out...
                    </div>
                  ) : (
                    'Sign Out'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}