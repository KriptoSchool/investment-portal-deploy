'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase, INVESTMENT_TIERS } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Calendar, Award } from 'lucide-react';

interface InvestorData {
  id: string;
  full_name: string;
  nric: string;
}

interface Investment {
  id: string;
  investment_type: string;
  investment_tier: string;
  investment_amount: number;
  quarterly_rate: number;
  yearly_rate: number;
  start_date: string;
  status: string;
  agent: {
    agent_id: string;
    full_name: string;
  };
}

interface Dividend {
  id: string;
  quarter: number;
  year: number;
  amount: number;
  paid: boolean;
  paid_date: string | null;
  created_at: string;
}

export default function InvestorDashboard() {
  const router = useRouter();
  const [investorData, setInvestorData] = useState<InvestorData | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvestment: 0,
    expectedQuarterlyDividend: 0,
    expectedYearlyDividend: 0,
    totalDividendsReceived: 0,
    pendingDividends: 0,
  });

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

      // Get investor data
      const { data: investor, error: investorError } = await supabase
        .from('investors')
        .select(`
          id,
          nric,
          users!inner(full_name)
        `)
        .eq('user_id', user.id)
        .single();

      if (investorError || !investor) {
        alert('Investor data not found. Please contact support.');
        router.push('/login');
        return;
      }

      setInvestorData({
        id: investor.id,
        full_name: (investor as any).users?.full_name || 'Unknown Investor',
        nric: investor.nric,
      });

      // Load investments
      await loadInvestments(investor.id);
      
      // Load dividends
      await loadDividends(investor.id);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert('Error loading dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadInvestments = async (investorId: string) => {
    const { data, error } = await supabase
      .from('investments')
      .select(`
        id,
        investment_type,
        investment_tier,
        investment_amount,
        quarterly_rate,
        yearly_rate,
        start_date,
        status,
        agents!inner(
          agent_id,
          users!inner(full_name)
        )
      `)
      .eq('investor_id', investorId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error loading investments:', error);
      return;
    }

    const formattedInvestments = data.map((investment: any) => ({
      ...investment,
      agent: {
        agent_id: investment.agents?.agent_id,
        full_name: investment.agents?.users?.full_name || 'Unknown Agent',
      },
    }));

    setInvestments(formattedInvestments);
    
    // Calculate investment stats
    const totalInvestment = data.reduce((sum, inv) => sum + inv.investment_amount, 0);
    const expectedQuarterlyDividend = data.reduce((sum, inv) => 
      sum + (inv.investment_amount * inv.quarterly_rate / 100), 0
    );
    const expectedYearlyDividend = data.reduce((sum, inv) => 
      sum + (inv.investment_amount * inv.yearly_rate / 100), 0
    );
    
    setStats(prev => ({
      ...prev,
      totalInvestment,
      expectedQuarterlyDividend,
      expectedYearlyDividend,
    }));
  };

  const loadDividends = async (investorId: string) => {
    const { data, error } = await supabase
      .from('dividends')
      .select('*')
      .eq('investor_id', investorId)
      .order('year', { ascending: false })
      .order('quarter', { ascending: false });

    if (error) {
      console.error('Error loading dividends:', error);
      return;
    }

    setDividends(data);
    
    const totalDividendsReceived = data.filter(d => d.paid).reduce((sum, d) => sum + d.amount, 0);
    const pendingDividends = data.filter(d => !d.paid).reduce((sum, d) => sum + d.amount, 0);
    
    setStats(prev => ({
      ...prev,
      totalDividendsReceived,
      pendingDividends,
    }));
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

  const getTierInfo = (tier: string, type: string) => {
    return INVESTMENT_TIERS.find(t => t.tier === tier && t.type === type.toUpperCase());
  };

  const getTierBadgeColor = (tier: string) => {
    if (tier.startsWith('EX')) return 'bg-purple-100 text-purple-800';
    switch (tier) {
      case 'A1': return 'bg-blue-100 text-blue-800';
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      case 'D': return 'bg-red-100 text-red-800';
      case 'E': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuarterName = (quarter: number) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters[quarter - 1] || `Q${quarter}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Investor Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {investorData?.full_name}
              </p>
              <p className="text-sm text-gray-500">
                NRIC: {investorData?.nric}
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</div>
              <p className="text-xs text-muted-foreground">
                Active investments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quarterly Dividend</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.expectedQuarterlyDividend)}</div>
              <p className="text-xs text-muted-foreground">
                Expected per quarter
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yearly Dividend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.expectedYearlyDividend)}</div>
              <p className="text-xs text-muted-foreground">
                Expected annually
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dividends Received</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalDividendsReceived)}</div>
              <p className="text-xs text-muted-foreground">
                Pending: {formatCurrency(stats.pendingDividends)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Investments Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Investments</CardTitle>
            <CardDescription>Overview of your investment portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment Type</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Quarterly Rate</TableHead>
                  <TableHead>Yearly Rate</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Consultant</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <span className="capitalize">
                        {investment.investment_type.toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierBadgeColor(investment.investment_tier)}`}>
                        Tier {investment.investment_tier}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(investment.investment_amount)}</TableCell>
                    <TableCell>{investment.quarterly_rate}%</TableCell>
                    <TableCell>{investment.yearly_rate}%</TableCell>
                    <TableCell>{formatDate(investment.start_date)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{investment.agent.full_name}</div>
                        <div className="text-sm text-gray-500">{investment.agent.agent_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        investment.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {investment.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dividend Calculation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Dividend Calculation</CardTitle>
              <CardDescription>How your dividends are calculated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {investments.map((investment) => {
                const quarterlyDividend = (investment.investment_amount * investment.quarterly_rate) / 100;
                const yearlyDividend = (investment.investment_amount * investment.yearly_rate) / 100;
                
                return (
                  <div key={investment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Tier {investment.investment_tier}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTierBadgeColor(investment.investment_tier)}`}>
                        {investment.investment_type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Investment: {formatCurrency(investment.investment_amount)}</div>
                      <div>Quarterly ({investment.quarterly_rate}%): {formatCurrency(quarterlyDividend)}</div>
                      <div>Yearly ({investment.yearly_rate}%): {formatCurrency(yearlyDividend)}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Tiers</CardTitle>
              <CardDescription>Available investment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {INVESTMENT_TIERS.filter(tier => tier.type === 'STANDARD').map((tier) => (
                  <div key={tier.id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">Tier {tier.tier}</span>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(tier.min_amount)}
                        {tier.max_amount && ` - ${formatCurrency(tier.max_amount)}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{tier.quarterly_rate}% quarterly</div>
                      <div className="text-sm text-gray-600">{tier.yearly_rate}% yearly</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dividends History */}
        <Card>
          <CardHeader>
            <CardTitle>Dividend History</CardTitle>
            <CardDescription>Your dividend payment history</CardDescription>
          </CardHeader>
          <CardContent>
            {dividends.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.map((dividend) => (
                    <TableRow key={dividend.id}>
                      <TableCell>
                        {getQuarterName(dividend.quarter)} {dividend.year}
                      </TableCell>
                      <TableCell>{formatCurrency(dividend.amount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          dividend.paid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dividend.paid ? 'Paid' : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {dividend.paid_date ? formatDate(dividend.paid_date) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No dividend history yet</p>
                <p className="text-sm">Dividends will appear here once they are processed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}