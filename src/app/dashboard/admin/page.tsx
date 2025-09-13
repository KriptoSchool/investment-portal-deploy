'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Users, TrendingUp, DollarSign, Plus, Search, Settings } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalInvestors: number;
  totalConsultants: number;
  totalInvestmentVolume: number;
  totalCommissionsPaid: number;
  pendingCommissions: number;
}

interface Investor {
  id: string;
  full_name: string;
  nric: string;
  investment_amount: number;
  investment_tier: string;
  agent_name: string;
  agent_id: string;
  created_at: string;
}

interface Consultant {
  id: string;
  agent_id: string;
  full_name: string;
  level: string;
  total_investors: number;
  total_commissions: number;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalInvestors: 0,
    totalConsultants: 0,
    totalInvestmentVolume: 0,
    totalCommissionsPaid: 0,
    pendingCommissions: 0,
  });
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'consultants'>('overview');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || userData?.role !== 'ADMIN') {
        alert('Access denied. Admin privileges required.');
        router.push('/login');
        return;
      }

      await loadDashboardData();
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert('Error loading dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    // Load investors
    const { data: investorsData, error: investorsError } = await supabase
      .from('investments')
      .select(`
        id,
        investment_amount,
        investment_tier,
        created_at,
        investors!inner(
          id,
          full_name,
          nric
        ),
        agents!inner(
          agent_id,
          users!inner(full_name)
        )
      `);

    if (!investorsError && investorsData) {
      const formattedInvestors = investorsData.map((inv: any) => ({
        id: inv.investors?.id,
        full_name: inv.investors?.full_name,
        nric: inv.investors?.nric,
        investment_amount: inv.investment_amount,
        investment_tier: inv.investment_tier,
        agent_name: inv.agents?.users?.full_name,
        agent_id: inv.agents?.agent_id,
        created_at: inv.created_at,
      }));
      setInvestors(formattedInvestors);

      // Calculate stats
      const totalInvestmentVolume = investorsData.reduce((sum, inv) => sum + inv.investment_amount, 0);
      setStats(prev => ({
        ...prev,
        totalInvestors: investorsData.length,
        totalInvestmentVolume,
      }));
    }

    // Load consultants
    const { data: consultantsData, error: consultantsError } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        level,
        created_at,
        users!inner(full_name)
      `);

    if (!consultantsError && consultantsData) {
      const formattedConsultants = consultantsData.map((agent: any) => ({
        id: agent.id,
        agent_id: agent.agent_id,
        full_name: agent.users?.full_name || 'Unknown Agent',
        level: agent.level,
        total_investors: 0, // Will be calculated
        total_commissions: 0, // Will be calculated
        created_at: agent.created_at,
      }));
      setConsultants(formattedConsultants);

      setStats(prev => ({
        ...prev,
        totalConsultants: consultantsData.length,
      }));
    }

    // Load commission stats
    const { data: commissionsData, error: commissionsError } = await supabase
      .from('commissions')
      .select('amount, paid');

    if (!commissionsError && commissionsData) {
      const totalCommissionsPaid = commissionsData
        .filter(c => c.paid)
        .reduce((sum, c) => sum + c.amount, 0);
      const pendingCommissions = commissionsData
        .filter(c => !c.paid)
        .reduce((sum, c) => sum + c.amount, 0);

      setStats(prev => ({
        ...prev,
        totalCommissionsPaid,
        pendingCommissions,
      }));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY');
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'VC_CONSULTANT': return 'bg-blue-100 text-blue-800';
      case 'BUSINESS_DEV': return 'bg-green-100 text-green-800';
      case 'STRATEGY_PARTNER': return 'bg-purple-100 text-purple-800';
      case 'GENERAL_MANAGER': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvestors = investors.filter(investor =>
    investor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.nric.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConsultants = consultants.filter(consultant =>
    consultant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.agent_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Investment Management System Administration</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'bg-purple-600' : ''}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'investors' ? 'default' : 'outline'}
            onClick={() => setActiveTab('investors')}
            className={activeTab === 'investors' ? 'bg-purple-600' : ''}
          >
            Investors ({stats.totalInvestors})
          </Button>
          <Button
            variant={activeTab === 'consultants' ? 'default' : 'outline'}
            onClick={() => setActiveTab('consultants')}
            className={activeTab === 'consultants' ? 'bg-purple-600' : ''}
          >
            Consultants ({stats.totalConsultants})
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInvestors}</div>
                  <p className="text-xs text-muted-foreground">
                    Active investment accounts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalConsultants}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered consultants
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Investment Volume</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestmentVolume)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total investments managed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commissions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalCommissionsPaid)}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending: {formatCurrency(stats.pendingCommissions)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="w-full h-20 flex flex-col items-center justify-center" 
                    variant="outline"
                    onClick={() => {
                      alert('System Settings feature coming soon! This will allow you to configure system parameters, user permissions, and application settings.');
                    }}
                  >
                    <Settings className="h-6 w-6 mb-2" />
                    System Settings
                  </Button>
                  <Button 
                    className="w-full h-20 flex flex-col items-center justify-center" 
                    variant="outline"
                    onClick={() => {
                      alert('Generate Reports feature coming soon! This will create comprehensive reports on investments, commissions, and system performance.');
                    }}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    Generate Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Investors Tab */}
        {activeTab === 'investors' && (
          <>
            {/* Search and Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search investors by name, NRIC, or consultant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Investors Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Investors</CardTitle>
                <CardDescription>Complete list of investors in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>NRIC</TableHead>
                      <TableHead>Investment Tier</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Consultant</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestors.map((investor) => (
                      <TableRow key={investor.id}>
                        <TableCell className="font-medium">{investor.full_name}</TableCell>
                        <TableCell>{investor.nric}</TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Tier {investor.investment_tier}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(investor.investment_amount)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{investor.agent_name}</div>
                            <div className="text-sm text-gray-500">{investor.agent_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(investor.created_at)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Consultants Tab */}
        {activeTab === 'consultants' && (
          <>
            {/* Search */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search consultants by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Consultants Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Consultants</CardTitle>
                <CardDescription>Complete list of registered consultants</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Agent ID</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Investors</TableHead>
                      <TableHead>Total Commissions</TableHead>
                      <TableHead>Date Registered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsultants.map((consultant) => (
                      <TableRow key={consultant.id}>
                        <TableCell className="font-medium">{consultant.full_name}</TableCell>
                        <TableCell>{consultant.agent_id}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadgeColor(consultant.level)}`}>
                            {consultant.level.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>{consultant.total_investors}</TableCell>
                        <TableCell>{formatCurrency(consultant.total_commissions)}</TableCell>
                        <TableCell>{formatDate(consultant.created_at)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}