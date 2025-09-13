'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, LineChart, PieChart, ArrowUpRight, ArrowDownRight, Users, ShoppingCart, DollarSign, TrendingUp, Activity, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6ECF2] p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Analytics</h1>
        <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>Detailed insights and statistics about your business performance.</p>
      </div>

      {/* Premium Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Total Revenue</CardTitle>
            <div className="p-2 bg-[rgba(46,230,166,0.1)] rounded-[12px] group-hover:bg-[rgba(46,230,166,0.15)] transition-colors duration-[200ms]">
              <DollarSign className="h-4 w-4 text-[#2EE6A6]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>$45,231.89</div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+20.1%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* New Customers Card */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>New Customers</CardTitle>
            <div className="p-2 bg-[rgba(62,168,255,0.1)] rounded-[12px] group-hover:bg-[rgba(62,168,255,0.15)] transition-colors duration-[200ms]">
              <Users className="h-4 w-4 text-[#3EA8FF]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>+1,234</div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+10.3%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Card */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Conversion Rate</CardTitle>
            <div className="p-2 bg-[rgba(255,176,32,0.1)] rounded-[12px] group-hover:bg-[rgba(255,176,32,0.15)] transition-colors duration-[200ms]">
              <LineChart className="h-4 w-4 text-[#FFB020]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>3.24%</div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#F04444] bg-[rgba(240,68,68,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">-0.4%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value Card */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Average Order Value</CardTitle>
            <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-[12px] group-hover:bg-[rgba(212,175,55,0.15)] transition-colors duration-[200ms]">
              <ShoppingCart className="h-4 w-4 text-[#D4AF37]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>$89.34</div>
            <div className="flex items-center mt-2 text-[13px]">
              <div className="flex items-center text-[#21D07A] bg-[rgba(33,208,122,0.1)] px-2 py-1 rounded-[8px]">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                <span className="font-mono tabular-nums">+5.2%</span>
              </div>
              <span className="ml-2 text-[#A8B3C2]">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Charts Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-8 bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
          <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Revenue Over Time</CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Monthly revenue for the current year</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex bg-[rgba(230,236,242,0.08)] rounded-[12px] p-1">
                  <button 
                    onClick={() => setSelectedPeriod('1M')}
                    className={`px-3 py-1 text-[13px] font-medium transition-all duration-[180ms] rounded-[8px] ${
                      selectedPeriod === '1M' 
                        ? 'text-[#2EE6A6] bg-[rgba(46,230,166,0.1)]' 
                        : 'text-[#A8B3C2] hover:text-[#E6ECF2]'
                    }`}
                  >
                    1M
                  </button>
                  <button 
                    onClick={() => setSelectedPeriod('3M')}
                    className={`px-3 py-1 text-[13px] font-medium transition-all duration-[180ms] rounded-[8px] ${
                      selectedPeriod === '3M' 
                        ? 'text-[#2EE6A6] bg-[rgba(46,230,166,0.1)]' 
                        : 'text-[#A8B3C2] hover:text-[#E6ECF2]'
                    }`}
                  >
                    3M
                  </button>
                  <button 
                    onClick={() => setSelectedPeriod('1Y')}
                    className={`px-3 py-1 text-[13px] font-medium transition-all duration-[180ms] rounded-[8px] ${
                      selectedPeriod === '1Y' 
                        ? 'text-[#2EE6A6] bg-[rgba(46,230,166,0.1)]' 
                        : 'text-[#A8B3C2] hover:text-[#E6ECF2]'
                    }`}
                  >
                    1Y
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[350px] w-full relative bg-[rgba(230,236,242,0.02)] border border-[rgba(230,236,242,0.08)] rounded-[12px] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <BarChart3 className="h-12 w-12 text-[#2EE6A6] opacity-60" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#21D07A] rounded-full flex items-center justify-center">
                      <TrendingUp className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Revenue Chart</h3>
                    <p className="text-[14px] text-[#A8B3C2] max-w-[280px]" style={{fontFamily: 'Inter, sans-serif'}}>
                      Bar chart would be rendered here with actual chart library
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="lg:col-span-4 bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
          <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
            <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Traffic Sources</CardTitle>
            <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Where your visitors are coming from</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[350px] w-full relative bg-[rgba(230,236,242,0.02)] border border-[rgba(230,236,242,0.08)] rounded-[12px] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <PieChart className="h-12 w-12 text-[#3EA8FF] opacity-60" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#3EA8FF] rounded-full flex items-center justify-center">
                      <Target className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Traffic Sources</h3>
                    <p className="text-[14px] text-[#A8B3C2] max-w-[200px]" style={{fontFamily: 'Inter, sans-serif'}}>
                      Pie chart would be rendered here with actual chart library
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Premium Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Engagement */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
          <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
            <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>User Engagement</CardTitle>
            <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Daily active users and session duration</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full relative bg-[rgba(230,236,242,0.02)] border border-[rgba(230,236,242,0.08)] rounded-[12px] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <LineChart className="h-12 w-12 text-[#FFB020] opacity-60" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFB020] rounded-full flex items-center justify-center">
                      <Activity className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>User Engagement</h3>
                    <p className="text-[14px] text-[#A8B3C2] max-w-[240px]" style={{fontFamily: 'Inter, sans-serif'}}>
                      Line chart would be rendered here with actual chart library
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
          <CardHeader className="p-4 border-b border-[rgba(230,236,242,0.08)]">
            <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Conversion Funnel</CardTitle>
            <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Visitor to customer conversion stages</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[280px] w-full relative bg-[rgba(230,236,242,0.02)] border border-[rgba(230,236,242,0.08)] rounded-[12px] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <BarChart3 className="h-12 w-12 text-[#D4AF37] opacity-60" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] rounded-full flex items-center justify-center">
                      <Target className="h-2 w-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Conversion Funnel</h3>
                    <p className="text-[14px] text-[#A8B3C2] max-w-[240px]" style={{fontFamily: 'Inter, sans-serif'}}>
                      Funnel chart would be rendered here with actual chart library
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}