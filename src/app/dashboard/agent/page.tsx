'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { DollarSign, Users, TrendingUp, Award, Eye, Search, Filter, Download, UserCheck, Building2, Target } from 'lucide-react';
import { useRoleAccess } from '@/contexts/UserContext';

interface AgentData {
  id: string;
  agent_id: string;
  level: string;
  full_name: string;
  email: string;
  parent_agent_id?: string;
  subordinate_count: number;
  investor_count: number;
}

interface Commission {
  id: string;
  commission_type: 'PASSIVE' | 'ONE_OFF' | 'HIERARCHICAL';
  percentage: number;
  amount: number;
  paid: boolean;
  created_at: string;
  investment: {
    id: string;
    investment_amount: number;
    investment_tier: string;
    investor: {
      full_name: string;
      email: string;
    };
  };
  source_agent?: {
    full_name: string;
    agent_id: string;
    level: string;
  };
}

interface Investor {
  id: string;
  full_name: string;
  email: string;
  investment_amount: number;
  investment_tier: string;
  status: string;
  created_at: string;
}

interface SubordinateAgent {
  id: string;
  agent_id: string;
  full_name: string;
  email: string;
  level: string;
  investor_count: number;
  total_commissions: number;
  created_at: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const { user, isConsultant } = useRoleAccess();
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [subordinates, setSubordinates] = useState<SubordinateAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCommissions: 0,
    paidCommissions: 0,
    pendingCommissions: 0,
    passiveCommissions: 0,
    oneOffCommissions: 0,
    hierarchicalCommissions: 0,
    totalInvestors: 0,
    totalSubordinates: 0,
    totalInvestmentVolume: 0,
    thisMonthCommissions: 0,
  });

  useEffect(() => {
    if (!isConsultant) {
      router.push('/dashboard');
      return;
    }
    loadAgentData();
  }, [isConsultant, user]);

  const loadAgentData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Create mock agent data based on user info
      const mockAgentData: AgentData = {
        id: user.id,
        agent_id: `AGT${user.id.slice(-6).toUpperCase()}`,
        level: user.level || 'VC Consultant',
        full_name: user.name,
        email: user.email,
        subordinate_count: 0,
        investor_count: 0,
      };
      setAgentData(mockAgentData);

      // Generate mock commission data
      const mockCommissions: Commission[] = [
        {
          id: '1',
          commission_type: 'PASSIVE',
          percentage: 2.0,
          amount: 5000,
          paid: true,
          created_at: '2024-01-15T10:30:00Z',
          investment: {
            id: 'inv1',
            investment_amount: 250000,
            investment_tier: 'A1',
            investor: {
              full_name: 'John Smith',
              email: 'john.smith@email.com'
            }
          }
        },
        {
          id: '2',
          commission_type: 'ONE_OFF',
          percentage: 10.0,
          amount: 25000,
          paid: false,
          created_at: '2024-01-20T14:15:00Z',
          investment: {
            id: 'inv2',
            investment_amount: 250000,
            investment_tier: 'A1',
            investor: {
              full_name: 'John Smith',
              email: 'john.smith@email.com'
            }
          }
        },
        {
          id: '3',
          commission_type: 'HIERARCHICAL',
          percentage: 1.5,
          amount: 3750,
          paid: true,
          created_at: '2024-01-18T09:45:00Z',
          investment: {
            id: 'inv3',
            investment_amount: 250000,
            investment_tier: 'A1',
            investor: {
              full_name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com'
            }
          },
          source_agent: {
            full_name: 'Mike Chen',
            agent_id: 'AGT789012',
            level: 'VC Consultant'
          }
        },
        {
          id: '4',
          commission_type: 'PASSIVE',
          percentage: 2.0,
          amount: 10000,
          paid: true,
          created_at: '2024-01-25T16:20:00Z',
          investment: {
            id: 'inv4',
            investment_amount: 500000,
            investment_tier: 'B',
            investor: {
              full_name: 'David Wilson',
              email: 'david.wilson@email.com'
            }
          }
        }
      ];
      setCommissions(mockCommissions);

      // Generate mock investor data
      const mockInvestors: Investor[] = [
        {
          id: '1',
          full_name: 'John Smith',
          email: 'john.smith@email.com',
          investment_amount: 250000,
          investment_tier: 'A1',
          status: 'ACTIVE',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          full_name: 'David Wilson',
          email: 'david.wilson@email.com',
          investment_amount: 500000,
          investment_tier: 'B',
          status: 'ACTIVE',
          created_at: '2024-01-25T16:20:00Z'
        },
        {
          id: '3',
          full_name: 'Lisa Chen',
          email: 'lisa.chen@email.com',
          investment_amount: 100000,
          investment_tier: 'A',
          status: 'PENDING',
          created_at: '2024-01-28T11:45:00Z'
        }
      ];
      setInvestors(mockInvestors);

      // Generate mock subordinate data (only if user is Business Dev or higher)
      const mockSubordinates: SubordinateAgent[] = [];
      if (user.level && ['Business Dev', 'Strategy Partner', 'General Manager'].includes(user.level)) {
        mockSubordinates.push(
          {
            id: '1',
            agent_id: 'AGT789012',
            full_name: 'Mike Chen',
            email: 'mike.chen@email.com',
            level: 'VC Consultant',
            investor_count: 2,
            total_commissions: 8750,
            created_at: '2024-01-10T08:00:00Z'
          },
          {
            id: '2',
            agent_id: 'AGT345678',
            full_name: 'Anna Rodriguez',
            email: 'anna.rodriguez@email.com',
            level: 'VC Consultant',
            investor_count: 1,
            total_commissions: 4200,
            created_at: '2024-01-12T14:30:00Z'
          }
        );
      }
      setSubordinates(mockSubordinates);

      // Calculate statistics
      const totalCommissions = mockCommissions.reduce((sum, c) => sum + c.amount, 0);
      const paidCommissions = mockCommissions.filter(c => c.paid).reduce((sum, c) => sum + c.amount, 0);
      const pendingCommissions = mockCommissions.filter(c => !c.paid).reduce((sum, c) => sum + c.amount, 0);
      const passiveCommissions = mockCommissions.filter(c => c.commission_type === 'PASSIVE').reduce((sum, c) => sum + c.amount, 0);
      const oneOffCommissions = mockCommissions.filter(c => c.commission_type === 'ONE_OFF').reduce((sum, c) => sum + c.amount, 0);
      const hierarchicalCommissions = mockCommissions.filter(c => c.commission_type === 'HIERARCHICAL').reduce((sum, c) => sum + c.amount, 0);
      const totalInvestmentVolume = mockInvestors.reduce((sum, i) => sum + i.investment_amount, 0);
      
      // Calculate this month's commissions
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthCommissions = mockCommissions
        .filter(c => {
          const commissionDate = new Date(c.created_at);
          return commissionDate.getMonth() === currentMonth && commissionDate.getFullYear() === currentYear;
        })
        .reduce((sum, c) => sum + c.amount, 0);

      setStats({
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        passiveCommissions,
        oneOffCommissions,
        hierarchicalCommissions,
        totalInvestors: mockInvestors.length,
        totalSubordinates: mockSubordinates.length,
        totalInvestmentVolume,
        thisMonthCommissions,
      });

    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCommissionTypeColor = (type: string) => {
    switch (type) {
      case 'PASSIVE': return 'bg-[#2EE6A6] text-white';
      case 'ONE_OFF': return 'bg-[#3EA8FF] text-white';
      case 'HIERARCHICAL': return 'bg-[#D4AF37] text-white';
      default: return 'bg-[#A8B3C2] text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-[#21D07A] text-white';
      case 'PENDING': return 'bg-[#FFB020] text-white';
      case 'INACTIVE': return 'bg-[#F04444] text-white';
      default: return 'bg-[#A8B3C2] text-white';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'General Manager': return 'bg-[#D4AF37] text-white';
      case 'Strategy Partner': return 'bg-[#3EA8FF] text-white';
      case 'Business Dev': return 'bg-[#2EE6A6] text-white';
      case 'VC Consultant': return 'bg-[#A8B3C2] text-white';
      default: return 'bg-[#A8B3C2] text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#2EE6A6] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Loading agent dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6ECF2] p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Agent Dashboard</h1>
            <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
              Welcome back, {agentData?.full_name} • {agentData?.agent_id} • {agentData?.level}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`${getLevelColor(agentData?.level || '')} px-3 py-1 text-[12px] font-medium`} style={{fontFamily: 'Inter, sans-serif'}}>
              {agentData?.level}
            </Badge>
            <Badge className="bg-[rgba(46,230,166,0.1)] text-[#2EE6A6] border border-[rgba(46,230,166,0.2)] px-3 py-1 text-[12px] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>
              {agentData?.agent_id}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Commissions */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Total Commissions</CardTitle>
            <div className="p-2 bg-[rgba(46,230,166,0.1)] rounded-[12px] group-hover:bg-[rgba(46,230,166,0.15)] transition-colors duration-[200ms]">
              <DollarSign className="h-4 w-4 text-[#2EE6A6]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              ${stats.totalCommissions.toLocaleString()}
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+12.5%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Commissions */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Pending Commissions</CardTitle>
            <div className="p-2 bg-[rgba(255,176,32,0.1)] rounded-[12px] group-hover:bg-[rgba(255,176,32,0.15)] transition-colors duration-[200ms]">
              <Award className="h-4 w-4 text-[#FFB020]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              ${stats.pendingCommissions.toLocaleString()}
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <span className="text-[#FFB020] bg-[rgba(255,176,32,0.1)] px-2 py-1 rounded-[8px] font-mono tabular-nums">
                {Math.round((stats.pendingCommissions / stats.totalCommissions) * 100)}% pending
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Investors */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>My Investors</CardTitle>
            <div className="p-2 bg-[rgba(62,168,255,0.1)] rounded-[12px] group-hover:bg-[rgba(62,168,255,0.15)] transition-colors duration-[200ms]">
              <Users className="h-4 w-4 text-[#3EA8FF]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.totalInvestors}
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <span className="text-[#3EA8FF] bg-[rgba(62,168,255,0.1)] px-2 py-1 rounded-[8px] font-mono tabular-nums">
                ${(stats.totalInvestmentVolume / 1000000).toFixed(1)}M volume
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Subordinates */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Team Members</CardTitle>
            <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-[12px] group-hover:bg-[rgba(212,175,55,0.15)] transition-colors duration-[200ms]">
              <Building2 className="h-4 w-4 text-[#D4AF37]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.totalSubordinates}
            </div>
            <div className="flex items-center mt-2 text-[13px]">
              <span className="text-[#D4AF37] bg-[rgba(212,175,55,0.1)] px-2 py-1 rounded-[8px] font-mono tabular-nums">
                {stats.hierarchicalCommissions > 0 ? `$${stats.hierarchicalCommissions.toLocaleString()} earned` : 'No hierarchy earnings'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[12px] p-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            Commission Overview
          </TabsTrigger>
          <TabsTrigger 
            value="commissions" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            All Commissions
          </TabsTrigger>
          <TabsTrigger 
            value="investors" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
            style={{fontFamily: 'Inter, sans-serif'}}
          >
            My Investors
          </TabsTrigger>
          {stats.totalSubordinates > 0 && (
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2EE6A6] data-[state=active]:to-[#3EA8FF] data-[state=active]:text-white text-[#A8B3C2] hover:text-[#E6ECF2] transition-all duration-[200ms] rounded-[8px] px-4 py-2"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              My Team
            </TabsTrigger>
          )}
        </TabsList>

        {/* Commission Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Passive Commissions */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[16px] font-semibold text-[#E6ECF2] flex items-center" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <div className="p-2 bg-[rgba(46,230,166,0.1)] rounded-[8px] mr-3">
                    <Target className="h-4 w-4 text-[#2EE6A6]" />
                  </div>
                  Passive Commissions (2%)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-[20px] font-bold text-[#2EE6A6] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  ${stats.passiveCommissions.toLocaleString()}
                </div>
                <p className="text-[13px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                  Recurring quarterly payments from your direct investors
                </p>
              </CardContent>
            </Card>

            {/* One-Off Commissions */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[16px] font-semibold text-[#E6ECF2] flex items-center" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <div className="p-2 bg-[rgba(62,168,255,0.1)] rounded-[8px] mr-3">
                    <Award className="h-4 w-4 text-[#3EA8FF]" />
                  </div>
                  One-Off Commissions (10%)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-[20px] font-bold text-[#3EA8FF] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  ${stats.oneOffCommissions.toLocaleString()}
                </div>
                <p className="text-[13px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                  Initial commission from new investor registrations
                </p>
              </CardContent>
            </Card>

            {/* Hierarchical Commissions */}
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[16px] font-semibold text-[#E6ECF2] flex items-center" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-[8px] mr-3">
                    <Building2 className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  Team Commissions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-[20px] font-bold text-[#D4AF37] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
                  ${stats.hierarchicalCommissions.toLocaleString()}
                </div>
                <p className="text-[13px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                  Earnings from your team's performance (1.5%, 0.8%, 0.5%)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Commission Structure Info */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Commission Structure</CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                Understanding your earning potential in the Aaron M LLP hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-[15px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Personal Earnings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[rgba(46,230,166,0.05)] rounded-[8px] border border-[rgba(46,230,166,0.1)]">
                      <span className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Passive Commission</span>
                      <Badge className="bg-[#2EE6A6] text-white text-[12px]" style={{fontFamily: 'Inter, sans-serif'}}>2%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[rgba(62,168,255,0.05)] rounded-[8px] border border-[rgba(62,168,255,0.1)]">
                      <span className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>One-Off Commission</span>
                      <Badge className="bg-[#3EA8FF] text-white text-[12px]" style={{fontFamily: 'Inter, sans-serif'}}>10%</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[15px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Hierarchical Earnings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[rgba(212,175,55,0.05)] rounded-[8px] border border-[rgba(212,175,55,0.1)]">
                      <span className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>From VC Consultants</span>
                      <Badge className="bg-[#D4AF37] text-white text-[12px]" style={{fontFamily: 'Inter, sans-serif'}}>1.5%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[rgba(255,176,32,0.05)] rounded-[8px] border border-[rgba(255,176,32,0.1)]">
                      <span className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>From Business Devs</span>
                      <Badge className="bg-[#FFB020] text-white text-[12px]" style={{fontFamily: 'Inter, sans-serif'}}>0.8%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[rgba(240,68,68,0.05)] rounded-[8px] border border-[rgba(240,68,68,0.1)]">
                      <span className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>From Strategy Partners</span>
                      <Badge className="bg-[#F04444] text-white text-[12px]" style={{fontFamily: 'Inter, sans-serif'}}>0.5%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Commission History</CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                Complete record of all your commission earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)]">
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Date</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Type</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Investor</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Investment</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Rate</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Amount</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id} className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)] transition-colors duration-[200ms]">
                        <TableCell className="text-[#E6ECF2] font-mono text-[13px]">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getCommissionTypeColor(commission.commission_type)} text-[11px] font-medium`} style={{fontFamily: 'Inter, sans-serif'}}>
                            {commission.commission_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#E6ECF2] text-[13px]" style={{fontFamily: 'Inter, sans-serif'}}>
                          {commission.investment.investor.full_name}
                        </TableCell>
                        <TableCell className="text-[#A8B3C2] font-mono text-[13px]">
                          ${commission.investment.investment_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[#A8B3C2] font-mono text-[13px]">
                          {commission.percentage}%
                        </TableCell>
                        <TableCell className="text-[#E6ECF2] font-mono text-[13px] font-semibold">
                          ${commission.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${commission.paid ? 'bg-[#21D07A]' : 'bg-[#FFB020]'} text-white text-[11px] font-medium`} style={{fontFamily: 'Inter, sans-serif'}}>
                            {commission.paid ? 'Paid' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Investors Tab */}
        <TabsContent value="investors" className="space-y-6">
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>My Investors</CardTitle>
              <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                Investors you have directly recruited
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)]">
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Investor</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Email</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Investment</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Tier</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Status</TableHead>
                      <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investors.map((investor) => (
                      <TableRow key={investor.id} className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)] transition-colors duration-[200ms]">
                        <TableCell className="text-[#E6ECF2] text-[13px] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>
                          {investor.full_name}
                        </TableCell>
                        <TableCell className="text-[#A8B3C2] text-[13px]" style={{fontFamily: 'Inter, sans-serif'}}>
                          {investor.email}
                        </TableCell>
                        <TableCell className="text-[#E6ECF2] font-mono text-[13px] font-semibold">
                          ${investor.investment_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-[rgba(62,168,255,0.1)] text-[#3EA8FF] border border-[rgba(62,168,255,0.2)] text-[11px] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>
                            {investor.investment_tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(investor.status)} text-[11px] font-medium`} style={{fontFamily: 'Inter, sans-serif'}}>
                            {investor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#A8B3C2] font-mono text-[13px]">
                          {new Date(investor.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Team Tab */}
        {stats.totalSubordinates > 0 && (
          <TabsContent value="team" className="space-y-6">
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>My Team</CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                  Agents reporting to you in the hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)]">
                        <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Agent</TableHead>
                        <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Agent ID</TableHead>
                        <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Level</TableHead>
                        <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Investors</TableHead>
                        <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Commissions</TableHead>
                        <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subordinates.map((subordinate) => (
                        <TableRow key={subordinate.id} className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)] transition-colors duration-[200ms]">
                          <TableCell className="text-[#E6ECF2] text-[13px] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>
                            {subordinate.full_name}
                          </TableCell>
                          <TableCell className="text-[#A8B3C2] font-mono text-[13px]">
                            {subordinate.agent_id}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getLevelColor(subordinate.level)} text-[11px] font-medium`} style={{fontFamily: 'Inter, sans-serif'}}>
                              {subordinate.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#E6ECF2] font-mono text-[13px]">
                            {subordinate.investor_count}
                          </TableCell>
                          <TableCell className="text-[#E6ECF2] font-mono text-[13px] font-semibold">
                            ${subordinate.total_commissions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-[#A8B3C2] font-mono text-[13px]">
                            {new Date(subordinate.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}