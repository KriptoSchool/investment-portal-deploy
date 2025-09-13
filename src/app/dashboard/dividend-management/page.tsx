'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoleAccess } from '@/contexts/UserContext';
// Badge component implementation
const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'secondary' | 'outline'; className?: string }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-200 text-gray-700'
  };
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
import { Calendar, DollarSign, TrendingUp, Users, Shield, Calculator } from 'lucide-react';

// Investment tier configuration based on the provided image
const INVESTMENT_TIERS = {
  A1: {
    fundRange: 'RM25K',
    standardQuarterly: 2.0,
    standardYearly: 8.0,
    exclusiveQuarterly: 2.5,
    exclusiveYearly: 11.0
  },
  A: {
    fundRange: 'RM50K',
    standardQuarterly: 3.0,
    standardYearly: 12.0,
    exclusiveQuarterly: 3.5,
    exclusiveYearly: 14.2
  },
  B: {
    fundRange: 'RM100K - RM150K',
    standardQuarterly: 3.5,
    standardYearly: 14.0,
    exclusiveQuarterly: 4.0,
    exclusiveYearly: 15.5
  },
  C: {
    fundRange: 'RM200K - RM450K',
    standardQuarterly: 3.6,
    standardYearly: 14.5,
    exclusiveQuarterly: 4.3,
    exclusiveYearly: 17.0
  },
  D: {
    fundRange: 'RM500K - RM950K',
    standardQuarterly: 3.9,
    standardYearly: 15.5,
    exclusiveQuarterly: 5.0,
    exclusiveYearly: 19.5
  },
  E: {
    fundRange: 'RM1.0M above',
    standardQuarterly: 4.1,
    standardYearly: 16.5,
    exclusiveQuarterly: 5.5,
    exclusiveYearly: 22.0
  }
};

interface Investor {
  id: string;
  name: string;
  tier: keyof typeof INVESTMENT_TIERS;
  investmentAmount: number;
  dividendType: 'Standard' | 'Exclusive';
  registrationDate: string;
  investmentPeriod: number; // in years
  status: 'Active' | 'Completed' | 'Suspended';
}

interface DividendCalculation {
  investorId: string;
  investorName: string;
  tier: string;
  investmentAmount: number;
  dividendType: string;
  registrationDate: string;
  currentQuarter: number;
  currentYear: number;
  dailyRate: number;
  daysInCurrentQuarter: number;
  quarterlyDividend: number;
  yearlyDividend: number;
  totalDividendsPaid: number;
  nextPaymentDate: string;
  remainingPeriod: string;
  status: string;
}

export default function DividendManagementPage() {
  const { user, isAdmin, canViewDividends } = useRoleAccess();
  const [investors, setInvestors] = useState<Investor[]>([
    {
      id: '1',
      name: 'Ahmad bin Abdullah',
      tier: 'A1',
      investmentAmount: 25000,
      dividendType: 'Standard',
      registrationDate: '2024-08-15',
      investmentPeriod: 5,
      status: 'Active'
    },
    {
      id: '2',
      name: 'Siti Nurhaliza',
      tier: 'B',
      investmentAmount: 120000,
      dividendType: 'Exclusive',
      registrationDate: '2024-06-01',
      investmentPeriod: 5,
      status: 'Active'
    },
    {
      id: '3',
      name: 'Tan Wei Ming',
      tier: 'D',
      investmentAmount: 750000,
      dividendType: 'Standard',
      registrationDate: '2024-01-10',
      investmentPeriod: 5,
      status: 'Active'
    },
    {
      id: '4',
      name: 'Fatimah binti Hassan',
      tier: 'E',
      investmentAmount: 1200000,
      dividendType: 'Exclusive',
      registrationDate: '2023-12-01',
      investmentPeriod: 5,
      status: 'Active'
    }
  ]);

  const [dividendCalculations, setDividendCalculations] = useState<DividendCalculation[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Calculate dividend details for each investor
  const calculateDividends = () => {
    const calculations: DividendCalculation[] = investors.map(investor => {
      const tierConfig = INVESTMENT_TIERS[investor.tier];
      const registrationDate = new Date(investor.registrationDate);
      const currentDate = new Date();
      
      // Determine quarterly and yearly rates based on dividend type
      const quarterlyRate = investor.dividendType === 'Exclusive' 
        ? tierConfig.exclusiveQuarterly 
        : tierConfig.standardQuarterly;
      const yearlyRate = investor.dividendType === 'Exclusive' 
        ? tierConfig.exclusiveYearly 
        : tierConfig.standardYearly;
      
      // Calculate daily rate (quarterly rate / 90 days)
      const dailyRate = quarterlyRate / 90;
      
      // Calculate current quarter and year since registration
      const monthsSinceRegistration = (currentDate.getFullYear() - registrationDate.getFullYear()) * 12 + 
                                     (currentDate.getMonth() - registrationDate.getMonth());
      const currentQuarter = Math.floor(monthsSinceRegistration / 3) + 1;
      const currentYear = Math.floor(monthsSinceRegistration / 12) + 1;
      
      // Calculate days in current quarter
      const quarterStartMonth = registrationDate.getMonth() + ((currentQuarter - 1) * 3);
      const quarterStartDate = new Date(registrationDate.getFullYear(), quarterStartMonth, registrationDate.getDate());
      const quarterEndDate = new Date(quarterStartDate);
      quarterEndDate.setMonth(quarterEndDate.getMonth() + 3);
      
      const daysInCurrentQuarter = Math.min(
        90,
        Math.max(0, Math.floor((currentDate.getTime() - quarterStartDate.getTime()) / (1000 * 60 * 60 * 24)))
      );
      
      // Calculate dividend amounts
      const quarterlyDividend = (investor.investmentAmount * quarterlyRate) / 100;
      const yearlyDividend = (investor.investmentAmount * yearlyRate) / 100;
      const proRatedQuarterlyDividend = (investor.investmentAmount * dailyRate * daysInCurrentQuarter) / 100;
      
      // Calculate total dividends paid (simplified calculation)
      const completedQuarters = Math.max(0, currentQuarter - 1);
      const totalDividendsPaid = (completedQuarters * quarterlyDividend) + proRatedQuarterlyDividend;
      
      // Calculate next payment date
      const nextPaymentDate = new Date(quarterEndDate);
      
      // Calculate remaining investment period
      const totalInvestmentMonths = investor.investmentPeriod * 12;
      const remainingMonths = Math.max(0, totalInvestmentMonths - monthsSinceRegistration);
      const remainingYears = Math.floor(remainingMonths / 12);
      const remainingMonthsOnly = remainingMonths % 12;
      
      return {
        investorId: investor.id,
        investorName: investor.name,
        tier: investor.tier,
        investmentAmount: investor.investmentAmount,
        dividendType: investor.dividendType,
        registrationDate: investor.registrationDate,
        currentQuarter,
        currentYear,
        dailyRate: Number(dailyRate.toFixed(6)),
        daysInCurrentQuarter,
        quarterlyDividend: Number(quarterlyDividend.toFixed(2)),
        yearlyDividend: Number(yearlyDividend.toFixed(2)),
        totalDividendsPaid: Number(totalDividendsPaid.toFixed(2)),
        nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
        remainingPeriod: `${remainingYears}y ${remainingMonthsOnly}m`,
        status: investor.status
      };
    });
    
    setDividendCalculations(calculations);
  };

  useEffect(() => {
    calculateDividends();
  }, [investors]);

  // Admin access check - Only admins can view dividend management
  if (!isAdmin || !canViewDividends) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-red-300 shadow-lg rounded-lg">
          <div className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              Only administrators can access the dividend management system.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-700">
                <strong>Current Role:</strong> {user?.role || 'Unknown'} {user?.level && `(${user.level})`}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                <strong>Required:</strong> Administrator access
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalInvestors = investors.length;
  const totalInvestmentAmount = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const totalDividendsPaid = dividendCalculations.reduce((sum, calc) => sum + calc.totalDividendsPaid, 0);
  const activeInvestors = investors.filter(inv => inv.status === 'Active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calculator className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dividend Management System
              </h1>
              <p className="text-slate-600 text-lg">
                Automated dividend calculation and tracking for Aaron M LLP investors
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Administrator Access</span>
              <span className="text-sm text-blue-600 ml-2">• Real-time dividend calculations • Automated quarterly tracking</span>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Investors</p>
                  <p className="text-3xl font-bold">{totalInvestors}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Investment</p>
                  <p className="text-3xl font-bold">RM{(totalInvestmentAmount / 1000000).toFixed(1)}M</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Dividends Paid</p>
                  <p className="text-3xl font-bold">RM{(totalDividendsPaid / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm font-medium">Active Investors</p>
                  <p className="text-3xl font-bold">{activeInvestors}</p>
                </div>
                <Calendar className="h-8 w-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Dividend Overview</TabsTrigger>
            <TabsTrigger value="calculations">Detailed Calculations</TabsTrigger>
            <TabsTrigger value="tiers">Investment Tiers</TabsTrigger>
          </TabsList>

          {/* Dividend Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Investor Dividend Summary</CardTitle>
                <CardDescription>
                  Real-time dividend calculations based on registration dates and investment tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4 font-semibold">Investor</th>
                        <th className="text-left p-4 font-semibold">Tier</th>
                        <th className="text-left p-4 font-semibold">Investment</th>
                        <th className="text-left p-4 font-semibold">Type</th>
                        <th className="text-left p-4 font-semibold">Registration</th>
                        <th className="text-left p-4 font-semibold">Current Quarter</th>
                        <th className="text-left p-4 font-semibold">Quarterly Dividend</th>
                        <th className="text-left p-4 font-semibold">Total Paid</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dividendCalculations.map((calc) => (
                        <tr key={calc.investorId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-medium">{calc.investorName}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {calc.tier}
                            </Badge>
                          </td>
                          <td className="p-4">RM{calc.investmentAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge 
                              variant={calc.dividendType === 'Exclusive' ? 'default' : 'secondary'}
                              className={calc.dividendType === 'Exclusive' ? 'bg-orange-500' : ''}
                            >
                              {calc.dividendType}
                            </Badge>
                          </td>
                          <td className="p-4">{new Date(calc.registrationDate).toLocaleDateString()}</td>
                          <td className="p-4">Q{calc.currentQuarter} ({calc.daysInCurrentQuarter} days)</td>
                          <td className="p-4 font-semibold text-green-600">RM{calc.quarterlyDividend.toLocaleString()}</td>
                          <td className="p-4 font-semibold text-blue-600">RM{calc.totalDividendsPaid.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge 
                              variant={calc.status === 'Active' ? 'default' : 'secondary'}
                              className={calc.status === 'Active' ? 'bg-green-500' : ''}
                            >
                              {calc.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Calculations Tab */}
          <TabsContent value="calculations">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Dividend Calculations</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of daily rates, pro-rated calculations, and payment schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {dividendCalculations.map((calc) => (
                    <div key={calc.investorId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{calc.investorName}</h3>
                          <p className="text-gray-600">Tier {calc.tier} • {calc.dividendType} Allocation</p>
                        </div>
                        <Badge 
                          variant={calc.status === 'Active' ? 'default' : 'secondary'}
                          className={calc.status === 'Active' ? 'bg-green-500' : ''}
                        >
                          {calc.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800">Investment Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Investment Amount:</span>
                              <span className="font-medium">RM{calc.investmentAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Registration Date:</span>
                              <span className="font-medium">{new Date(calc.registrationDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remaining Period:</span>
                              <span className="font-medium">{calc.remainingPeriod}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800">Rate Calculations</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Daily Rate:</span>
                              <span className="font-medium">{calc.dailyRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Quarterly Dividend:</span>
                              <span className="font-medium text-green-600">RM{calc.quarterlyDividend.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Yearly Dividend:</span>
                              <span className="font-medium text-blue-600">RM{calc.yearlyDividend.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800">Current Status</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Quarter:</span>
                              <span className="font-medium">Q{calc.currentQuarter}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Days in Quarter:</span>
                              <span className="font-medium">{calc.daysInCurrentQuarter}/90</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Paid:</span>
                              <span className="font-medium text-purple-600">RM{calc.totalDividendsPaid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Next Payment:</span>
                              <span className="font-medium">{new Date(calc.nextPaymentDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Tiers Tab */}
          <TabsContent value="tiers">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Standard Rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Standard - Average Rates</CardTitle>
                  <CardDescription>
                    Standard dividend allocation rates for all investment tiers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="border border-blue-200 p-3 text-left font-semibold">Type</th>
                          <th className="border border-blue-200 p-3 text-left font-semibold">Fund</th>
                          <th className="border border-blue-200 p-3 text-left font-semibold">Quarterly</th>
                          <th className="border border-blue-200 p-3 text-left font-semibold">Yearly</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(INVESTMENT_TIERS).map(([tier, config]) => (
                          <tr key={tier} className="hover:bg-blue-25">
                            <td className="border border-blue-200 p-3 font-medium">{tier}</td>
                            <td className="border border-blue-200 p-3">{config.fundRange}</td>
                            <td className="border border-blue-200 p-3 font-semibold text-green-600">{config.standardQuarterly}%</td>
                            <td className="border border-blue-200 p-3 font-semibold text-blue-600">{config.standardYearly}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Exclusive Rates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">Exclusive Special Allocation</CardTitle>
                  <CardDescription>
                    Premium dividend rates for exclusive allocation investors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-orange-50">
                          <th className="border border-orange-200 p-3 text-left font-semibold">Type</th>
                          <th className="border border-orange-200 p-3 text-left font-semibold">Fund</th>
                          <th className="border border-orange-200 p-3 text-left font-semibold">Quarterly</th>
                          <th className="border border-orange-200 p-3 text-left font-semibold">Yearly</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(INVESTMENT_TIERS).map(([tier, config]) => (
                          <tr key={tier} className="hover:bg-orange-25">
                            <td className="border border-orange-200 p-3 font-medium">{tier}</td>
                            <td className="border border-orange-200 p-3">{config.fundRange}</td>
                            <td className="border border-orange-200 p-3 font-semibold text-green-600">{config.exclusiveQuarterly}%</td>
                            <td className="border border-orange-200 p-3 font-semibold text-orange-600">{config.exclusiveYearly}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Calculation Formula */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Dividend Calculation Formula</CardTitle>
                <CardDescription>
                  How the system automatically calculates pro-rated dividends based on registration dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-4">Automatic Calculation Process:</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                      <div>
                        <strong>Daily Rate Calculation:</strong> Quarterly Rate ÷ 90 days = Daily Rate
                        <br />
                        <span className="text-gray-600">Example: 2.0% ÷ 90 = 0.022222% per day</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                      <div>
                        <strong>Pro-rated Calculation:</strong> Daily Rate × Days in Current Quarter × Investment Amount
                        <br />
                        <span className="text-gray-600">Example: 0.022222% × 45 days × RM25,000 = RM250</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                      <div>
                        <strong>Quarterly Tracking:</strong> System tracks from registration date through investment period
                        <br />
                        <span className="text-gray-600">Automatically calculates quarters and years since registration</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                      <div>
                        <strong>Payment Scheduling:</strong> Next payment date calculated based on quarter end
                        <br />
                        <span className="text-gray-600">Automatic scheduling for quarterly and yearly dividend distributions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}