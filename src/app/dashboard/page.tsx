'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, ArrowUp, ArrowDown, Users, DollarSign, Activity, TrendingUp, 
  FileText, CheckCircle, XCircle, Clock, Search, Filter, Download, 
  Calendar, PieChart, TreePine, AlertTriangle, Eye, MoreHorizontal,
  Banknote, UserCheck, Building, Target, Zap, RefreshCw
} from 'lucide-react';
import { useRoleAccess } from '@/contexts/UserContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin, isConsultant, hasPermission } = useRoleAccess();
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [dashboardData, setDashboardData] = useState({
    totalAUM: 0,
    activeInvestors: 0,
    activeConsultants: 0,
    pendingApprovals: 0,
    dividendsPaid: 0,
    commissionsDue: 0,
    myInvestors: [] as any[],
    myCommissions: [] as any[],
    mySubordinates: [] as any[]
  });

  useEffect(() => {
    console.log('🔍 Dashboard useEffect - User state:', { user: !!user, isAdmin, isConsultant, loading });
    
    // Temporary bypass for debugging - remove this later
    if (typeof window !== 'undefined' && window.location.search.includes('bypass=true')) {
      console.log('🚨 BYPASS MODE: Skipping auth check');
      setLoading(false);
      return;
    }
    
    if (!user && !loading) {
      console.log('❌ No user found, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user) {
      console.log('✅ User found, loading dashboard data');
      loadDashboardData();
    }
  }, [user, isAdmin, isConsultant, loading]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load data based on user role
      if (isAdmin) {
        // Admin sees all data
        setDashboardData({
          totalAUM: 45200000, // RM 45.2M
          activeInvestors: 1247,
          activeConsultants: 89,
          pendingApprovals: 23,
          dividendsPaid: 892000, // RM 892K
          commissionsDue: 156000, // RM 156K
          myInvestors: [],
          myCommissions: [],
          mySubordinates: []
        });
      } else if (isConsultant) {
        // Consultant sees only their own data
        const consultantData = await loadConsultantData(user.id);
        setDashboardData(consultantData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConsultantData = async (userId: string) => {
    // In a real implementation, this would fetch from your backend/Supabase
    // For now, returning mock data filtered for the specific consultant
    return {
      totalAUM: 2500000, // RM 2.5M (consultant's portfolio)
      activeInvestors: 15, // Only their investors
      activeConsultants: 3, // Only their subordinates
      pendingApprovals: 0, // Consultants don't approve
      dividendsPaid: 45000, // RM 45K (their investors' dividends)
      commissionsDue: 12500, // RM 12.5K (their pending commissions)
      myInvestors: [
        { name: 'Tan Ah Kow', invested: 250000, dividend: 5200, status: 'ACTIVE' },
        { name: 'Sarah Lim', invested: 180000, dividend: 3800, status: 'ACTIVE' },
        { name: 'Kumar Raj', invested: 95000, dividend: 2100, status: 'PENDING' }
      ],
      myCommissions: [
        { period: 'Q4 2024', amount: 4500, status: 'pending' },
        { period: 'Q1 2025', amount: 8000, status: 'due' }
      ],
      mySubordinates: [
        { name: 'Junior Consultant A', level: 'VC Consultant', investors: 5, commissions: 2500 },
        { name: 'Junior Consultant B', level: 'VC Consultant', investors: 3, commissions: 1800 }
      ]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-[#E6ECF2] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EE6A6] mx-auto mb-4"></div>
          <p className="text-[#A8B3C2]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6ECF2] p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          {isAdmin ? 'Investment Operations Dashboard' : `${user?.name}'s Dashboard`}
        </h1>
        <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
          {isAdmin ? 'Investor-Consultant Management & Performance Overview' : 'Your Commission, Investors & Team Performance'}
        </p>
      </div>

      {/* KPI Row - 6 Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total AUM (MYR) */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Total AUM (MYR)</CardTitle>
            <div className="p-2 bg-[rgba(46,230,166,0.1)] rounded-[12px] group-hover:bg-[rgba(46,230,166,0.15)] transition-colors duration-[200ms]">
              <Building className="h-4 w-4 text-[#2EE6A6]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              RM {(dashboardData.totalAUM / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+12.5%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Investors */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Active Investors</CardTitle>
            <div className="p-2 bg-[rgba(62,168,255,0.1)] rounded-[12px] group-hover:bg-[rgba(62,168,255,0.15)] transition-colors duration-[200ms]">
              <Users className="h-4 w-4 text-[#3EA8FF]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {dashboardData.activeInvestors.toLocaleString()}
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+8.2%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Consultants */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Active Consultants</CardTitle>
            <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-[12px] group-hover:bg-[rgba(212,175,55,0.15)] transition-colors duration-[200ms]">
              <UserCheck className="h-4 w-4 text-[#D4AF37]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {dashboardData.activeConsultants}
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+5</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">{isConsultant ? 'subordinates' : 'new this month'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Pending Approvals</CardTitle>
            <div className="p-2 bg-[rgba(255,176,32,0.1)] rounded-[12px] group-hover:bg-[rgba(255,176,32,0.15)] transition-colors duration-[200ms]">
              <Clock className="h-4 w-4 text-[#FFB020]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {isConsultant ? 'N/A' : dashboardData.pendingApprovals}
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              {isConsultant ? (
                <span className="text-[#A8B3C2] text-[12px]">Admin only feature</span>
              ) : (
                <>
                  <div className="flex items-center text-[#FFB020] bg-[rgba(255,176,32,0.1)] px-2 py-1 rounded-[8px]">
                    <Clock className="mr-1 h-3 w-3" />
                    <span className="font-mono tabular-nums">12</span>
                  </div>
                  <span className="ml-2 text-[#A8B3C2]">urgent (&gt;7 days)</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dividends Paid (MTD) */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Dividends Paid (MTD)</CardTitle>
            <div className="p-2 bg-[rgba(139,69,255,0.1)] rounded-[12px] group-hover:bg-[rgba(139,69,255,0.15)] transition-colors duration-[200ms]">
              <Banknote className="h-4 w-4 text-[#8B45FF]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              RM {(dashboardData.dividendsPaid / 1000).toFixed(0)}K
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowUp className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+15.3%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">{isConsultant ? 'to your investors' : 'vs last MTD'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Commissions Due (Current Period) */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Commissions Due</CardTitle>
            <div className="p-2 bg-[rgba(240,68,68,0.1)] rounded-[12px] group-hover:bg-[rgba(240,68,68,0.15)] transition-colors duration-[200ms]">
              <Target className="h-4 w-4 text-[#F04444]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              RM {(dashboardData.commissionsDue / 1000).toFixed(1)}K
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#F04444] bg-[rgba(240,68,68,0.1)] px-2 py-1 rounded-[8px]">
                <AlertTriangle className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">{isConsultant ? '2' : '47'}</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">{isConsultant ? 'pending periods' : 'overdue payouts'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Content Area - Charts & Panels */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AUM Over Time Chart */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>AUM Over Time</CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Assets Under Management Growth</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[280px] w-full relative bg-[rgba(230,236,242,0.02)] border border-[rgba(230,236,242,0.08)] rounded-[12px] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <TrendingUp className="h-12 w-12 text-[#2EE6A6] opacity-60" />
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>AUM Growth Chart</h3>
                        <p className="text-[14px] text-[#A8B3C2] max-w-[280px]" style={{fontFamily: 'Inter, sans-serif'}}>Line chart showing AUM progression over time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Dividends vs Commissions */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Dividends vs Commissions</CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Monthly comparison (stacked bars)</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[280px] w-full relative bg-[rgba(230,236,242,0.02)] border border-[rgba(230,236,242,0.08)] rounded-[12px] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <BarChart3 className="h-12 w-12 text-[#8B45FF] opacity-60" />
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Stacked Bar Chart</h3>
                        <p className="text-[14px] text-[#A8B3C2] max-w-[280px]" style={{fontFamily: 'Inter, sans-serif'}}>Monthly dividends and commissions comparison</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consultant Tree Growth Chart */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Consultant Tree Growth</CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>New consultants & investors acquisition</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[200px] w-full relative bg-[rgba(230,236,242,0.02)] border border-[rgba(230,236,242,0.08)] rounded-[12px] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <TreePine className="h-12 w-12 text-[#D4AF37] opacity-60" />
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Growth Tree Chart</h3>
                      <p className="text-[14px] text-[#A8B3C2] max-w-[280px]" style={{fontFamily: 'Inter, sans-serif'}}>Hierarchical growth visualization</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Panels Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Approval Queue */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Approval Queue</CardTitle>
                    <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Pending applications requiring review</CardDescription>
                  </div>
                  <Badge className="bg-[#FFB020] text-white text-[11px] px-2 py-1">23 Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { name: 'Ahmad Rahman', submitted: '2 days ago', kyc: 'PENDING', urgent: true },
                    { name: 'Siti Nurhaliza', submitted: '5 days ago', kyc: 'IN_PROGRESS', urgent: false },
                    { name: 'Lim Wei Ming', submitted: '1 week ago', kyc: 'PENDING', urgent: true },
                    { name: 'Priya Sharma', submitted: '3 days ago', kyc: 'DOCUMENTS_REQUIRED', urgent: false },
                  ].map((item, index) => (
                    <div key={index} className="group hover:bg-[rgba(230,236,242,0.04)] rounded-[8px] p-3 transition-all duration-[180ms] border border-[rgba(230,236,242,0.08)]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-[14px] font-medium text-[#E6ECF2] truncate" style={{fontFamily: 'Inter, sans-serif'}}>{item.name}</p>
                            {item.urgent && <div className="w-2 h-2 bg-[#F04444] rounded-full animate-pulse"></div>}
                          </div>
                          <p className="text-[12px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Submitted {item.submitted}</p>
                          <Badge className={`mt-2 text-[10px] px-2 py-1 ${
                            item.kyc === 'PENDING' ? 'bg-[#FFB020] text-white' :
                            item.kyc === 'IN_PROGRESS' ? 'bg-[#3EA8FF] text-white' :
                            'bg-[#F04444] text-white'
                          }`}>{item.kyc}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="bg-[#21D07A] hover:bg-[#1EBB6B] text-white h-8 px-3 text-[12px]">
                            <CheckCircle className="h-3 w-3 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-[#F04444] text-[#F04444] hover:bg-[#F04444] hover:text-white h-8 px-3 text-[12px]">
                            <XCircle className="h-3 w-3 mr-1" />Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Consultant Payouts */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Consultant Payouts</CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Due / Pending / Settled by period</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-[rgba(240,68,68,0.1)] rounded-[8px] border border-[rgba(240,68,68,0.2)]">
                      <div className="text-[20px] font-bold text-[#F04444] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>47</div>
                      <div className="text-[12px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Due</div>
                    </div>
                    <div className="text-center p-3 bg-[rgba(255,176,32,0.1)] rounded-[8px] border border-[rgba(255,176,32,0.2)]">
                      <div className="text-[20px] font-bold text-[#FFB020] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>12</div>
                      <div className="text-[12px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Pending</div>
                    </div>
                    <div className="text-center p-3 bg-[rgba(33,208,122,0.1)] rounded-[8px] border border-[rgba(33,208,122,0.2)]">
                      <div className="text-[20px] font-bold text-[#21D07A] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>156</div>
                      <div className="text-[12px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Settled</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { period: 'Q4 2024', due: 'RM 45K', status: 'overdue' },
                      { period: 'Q1 2025', due: 'RM 89K', status: 'pending' },
                      { period: 'Q2 2025', due: 'RM 22K', status: 'scheduled' },
                    ].map((payout, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-[rgba(230,236,242,0.04)] rounded-[6px] transition-all duration-[180ms]">
                        <div>
                          <p className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>{payout.period}</p>
                          <p className="text-[12px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>{payout.due}</p>
                        </div>
                        <Badge className={`text-[10px] px-2 py-1 ${
                          payout.status === 'overdue' ? 'bg-[#F04444] text-white' :
                          payout.status === 'pending' ? 'bg-[#FFB020] text-white' :
                          'bg-[#3EA8FF] text-white'
                        }`}>{payout.status.toUpperCase()}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investor Table */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Investor Overview</CardTitle>
                  <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Name, consultant, invested total, last dividend, status</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A8B3C2]" />
                    <Input placeholder="Search investors..." className="pl-10 bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] h-9 w-[200px]" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[rgba(230,236,242,0.08)]">
                    <tr>
                      <th className="text-left p-4 text-[13px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Investor</th>
                      <th className="text-left p-4 text-[13px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Consultant</th>
                      <th className="text-left p-4 text-[13px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Invested Total</th>
                      <th className="text-left p-4 text-[13px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Last Dividend</th>
                      <th className="text-left p-4 text-[13px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Status</th>
                      <th className="text-left p-4 text-[13px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isConsultant ? dashboardData.myInvestors.map(inv => ({
                      name: inv.name,
                      consultant: user?.name || 'You',
                      invested: `RM ${(inv.invested / 1000).toFixed(0)}K`,
                      dividend: `RM ${(inv.dividend / 1000).toFixed(1)}K`,
                      status: inv.status
                    })) : [
                      { name: 'Tan Ah Kow', consultant: 'Ahmad Rahman', invested: 'RM 250K', dividend: 'RM 5.2K', status: 'ACTIVE' },
                      { name: 'Sarah Lim', consultant: 'Siti Nurhaliza', invested: 'RM 180K', dividend: 'RM 3.8K', status: 'ACTIVE' },
                      { name: 'Kumar Raj', consultant: 'Lim Wei Ming', invested: 'RM 95K', dividend: 'RM 2.1K', status: 'PENDING' },
                      { name: 'Wong Li Hua', consultant: 'Ahmad Rahman', invested: 'RM 320K', dividend: 'RM 6.7K', status: 'ACTIVE' },
                    ]).map((investor, index) => (
                      <tr key={index} className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)] transition-colors duration-[180ms]">
                        <td className="p-4">
                          <p className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>{investor.name}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-[14px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>{investor.consultant}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-[14px] font-bold text-[#E6ECF2] font-mono tabular-nums">{investor.invested}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-[14px] font-bold text-[#21D07A] font-mono tabular-nums">{investor.dividend}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={`text-[10px] px-2 py-1 ${
                            investor.status === 'ACTIVE' ? 'bg-[#21D07A] text-white' : 'bg-[#FFB020] text-white'
                          }`}>{investor.status}</Badge>
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="outline" className="border-[rgba(230,236,242,0.12)] text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] h-8 px-3 text-[12px]">
                            <Eye className="h-3 w-3 mr-1" />View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Hierarchy Explorer & Activity Alerts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hierarchy Explorer */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  {isConsultant ? 'My Team' : 'Hierarchy Explorer'}
                </CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                  {isConsultant ? 'Your subordinate consultants' : 'Upline → downline counts, quick drill'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {(isConsultant ? dashboardData.mySubordinates.map(sub => ({
                    level: sub.level,
                    name: sub.name,
                    downlines: 0,
                    investors: sub.investors
                  })) : [
                    { level: 'General Manager', name: 'Ahmad Rahman', downlines: 12, investors: 45 },
                    { level: 'Strategy Partner', name: 'Siti Nurhaliza', downlines: 8, investors: 32 },
                    { level: 'Business Dev', name: 'Lim Wei Ming', downlines: 5, investors: 18 },
                    { level: 'VC Consultant', name: 'Priya Sharma', downlines: 0, investors: 7 },
                  ]).map((item, index) => (
                    <div key={index} className="group hover:bg-[rgba(230,236,242,0.04)] rounded-[8px] p-3 transition-all duration-[180ms] border border-[rgba(230,236,242,0.08)] cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-[14px] font-medium text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>{item.name}</p>
                            <Badge className="bg-[rgba(212,175,55,0.1)] text-[#D4AF37] text-[10px] px-2 py-1">{item.level}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <TreePine className="h-3 w-3 text-[#3EA8FF]" />
                              <span className="text-[12px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>{item.downlines} downlines</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3 text-[#2EE6A6]" />
                              <span className="text-[12px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>{item.investors} investors</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-[rgba(230,236,242,0.12)] text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] h-8 px-3 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-3 w-3 mr-1" />Drill
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity & Alerts */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Activity & Alerts</CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>KYC/AML flags, payout errors</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { type: 'KYC_FLAG', message: 'Ahmad Rahman - Document verification required', severity: 'high', time: '2 min ago' },
                    { type: 'PAYOUT_ERROR', message: 'Failed payout to Siti Nurhaliza - Bank details invalid', severity: 'high', time: '15 min ago' },
                    { type: 'AML_ALERT', message: 'Large transaction flagged - Tan Ah Kow (RM 500K)', severity: 'medium', time: '1 hour ago' },
                    { type: 'SYSTEM', message: 'Monthly dividend calculation completed', severity: 'info', time: '2 hours ago' },
                  ].map((alert, index) => (
                    <div key={index} className="group hover:bg-[rgba(230,236,242,0.04)] rounded-[8px] p-3 transition-all duration-[180ms] border-l-2 border-transparent hover:border-l-[#F04444]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'high' ? 'text-[#F04444]' :
                              alert.severity === 'medium' ? 'text-[#FFB020]' :
                              'text-[#3EA8FF]'
                            }`} />
                            <Badge className={`text-[10px] px-2 py-1 ${
                              alert.severity === 'high' ? 'bg-[#F04444] text-white' :
                              alert.severity === 'medium' ? 'bg-[#FFB020] text-white' :
                              'bg-[#3EA8FF] text-white'
                            }`}>{alert.type}</Badge>
                          </div>
                          <p className="text-[13px] text-[#E6ECF2] mt-1 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>{alert.message}</p>
                          <p className="text-[11px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{alert.time}</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-[rgba(230,236,242,0.12)] text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] h-8 px-3 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Rail - Quick Actions & Filters */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Actions */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full bg-[#2EE6A6] hover:bg-[#26CC95] text-[#0B0F14] font-medium h-12 rounded-[8px] transition-all duration-[200ms]" style={{fontFamily: 'Inter, sans-serif'}}>
                <Calendar className="h-4 w-4 mr-2" />
                Close Period
              </Button>
              <Button className="w-full bg-[#3EA8FF] hover:bg-[#2E8FE6] text-white font-medium h-12 rounded-[8px] transition-all duration-[200ms]" style={{fontFamily: 'Inter, sans-serif'}}>
                <Banknote className="h-4 w-4 mr-2" />
                Create Payout Run
              </Button>
              <Button className="w-full bg-[#8B45FF] hover:bg-[#7A3DE6] text-white font-medium h-12 rounded-[8px] transition-all duration-[200ms]" style={{fontFamily: 'Inter, sans-serif'}}>
                <Download className="h-4 w-4 mr-2" />
                Export Statements
              </Button>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Filters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Timeframe */}
              <div>
                <label className="text-[13px] font-medium text-[#A8B3C2] mb-2 block" style={{fontFamily: 'Inter, sans-serif'}}>Timeframe</label>
                <div className="flex bg-[rgba(230,236,242,0.08)] rounded-[8px] p-1">
                  <button 
                    onClick={() => setSelectedTimeframe('1D')}
                    className={`flex-1 px-3 py-2 text-[12px] font-medium transition-all duration-[180ms] rounded-[6px] ${
                      selectedTimeframe === '1D' 
                        ? 'text-[#2EE6A6] bg-[rgba(46,230,166,0.1)]' 
                        : 'text-[#A8B3C2] hover:text-[#E6ECF2]'
                    }`}
                  >
                    1D
                  </button>
                  <button 
                    onClick={() => setSelectedTimeframe('1W')}
                    className={`flex-1 px-3 py-2 text-[12px] font-medium transition-all duration-[180ms] rounded-[6px] ${
                      selectedTimeframe === '1W' 
                        ? 'text-[#2EE6A6] bg-[rgba(46,230,166,0.1)]' 
                        : 'text-[#A8B3C2] hover:text-[#E6ECF2]'
                    }`}
                  >
                    1W
                  </button>
                  <button 
                    onClick={() => setSelectedTimeframe('1M')}
                    className={`flex-1 px-3 py-2 text-[12px] font-medium transition-all duration-[180ms] rounded-[6px] ${
                      selectedTimeframe === '1M' 
                        ? 'text-[#2EE6A6] bg-[rgba(46,230,166,0.1)]' 
                        : 'text-[#A8B3C2] hover:text-[#E6ECF2]'
                    }`}
                  >
                    1M
                  </button>
                  <button 
                    onClick={() => setSelectedTimeframe('YTD')}
                    className={`flex-1 px-3 py-2 text-[12px] font-medium transition-all duration-[180ms] rounded-[6px] ${
                      selectedTimeframe === 'YTD' 
                        ? 'text-[#2EE6A6] bg-[rgba(46,230,166,0.1)]' 
                        : 'text-[#A8B3C2] hover:text-[#E6ECF2]'
                    }`}
                  >
                    YTD
                  </button>
                </div>
              </div>

              {/* Consultant Selector */}
              <div>
                <label className="text-[13px] font-medium text-[#A8B3C2] mb-2 block" style={{fontFamily: 'Inter, sans-serif'}}>Consultant</label>
                <select className="w-full h-10 px-3 py-2 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms]" style={{fontFamily: 'Inter, sans-serif'}}>
                  <option value="all">All Consultants</option>
                  <option value="ahmad">Ahmad Rahman</option>
                  <option value="siti">Siti Nurhaliza</option>
                  <option value="lim">Lim Wei Ming</option>
                  <option value="priya">Priya Sharma</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="text-[13px] font-medium text-[#A8B3C2] mb-2 block" style={{fontFamily: 'Inter, sans-serif'}}>Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A8B3C2]" />
                  <Input placeholder="Search anything..." className="pl-10 bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] h-10" style={{fontFamily: 'Inter, sans-serif'}} />
                </div>
              </div>

              {/* Apply Filters Button */}
              <Button className="w-full bg-[rgba(46,230,166,0.1)] border border-[rgba(46,230,166,0.2)] text-[#2EE6A6] hover:bg-[rgba(46,230,166,0.15)] font-medium h-10 rounded-[8px] transition-all duration-[200ms]" style={{fontFamily: 'Inter, sans-serif'}}>
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>System Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#21D07A] rounded-full"></div>
                  <span className="text-[12px] text-[#21D07A]" style={{fontFamily: 'Inter, sans-serif'}}>Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Payment Gateway</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#21D07A] rounded-full"></div>
                  <span className="text-[12px] text-[#21D07A]" style={{fontFamily: 'Inter, sans-serif'}}>Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>KYC Service</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#FFB020] rounded-full animate-pulse"></div>
                  <span className="text-[12px] text-[#FFB020]" style={{fontFamily: 'Inter, sans-serif'}}>Degraded</span>
                </div>
              </div>
              <Button size="sm" className="w-full bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.12)] hover:text-[#E6ECF2] h-8 rounded-[6px] transition-all duration-[200ms]" style={{fontFamily: 'Inter, sans-serif'}}>
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}