'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user from localStorage
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const reports = [
    {
      id: 1,
      title: 'Commission Report',
      description: 'Monthly commission earnings and breakdown',
      type: 'Commission',
      date: '2024-01-15',
      status: 'Ready'
    },
    {
      id: 2,
      title: 'Investor Summary',
      description: 'Complete list of investors and their investments',
      type: 'Investors',
      date: '2024-01-15',
      status: 'Ready'
    },
    {
      id: 3,
      title: 'Performance Analytics',
      description: 'Investment performance and growth metrics',
      type: 'Analytics',
      date: '2024-01-15',
      status: 'Ready'
    },
    {
      id: 4,
      title: 'Team Hierarchy',
      description: 'Agent hierarchy and subordinate structure',
      type: 'Team',
      date: '2024-01-15',
      status: 'Ready'
    }
  ];

  const stats = [
    {
      title: 'Total Reports',
      value: '12',
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      change: '+2 this month'
    },
    {
      title: 'Commission Reports',
      value: '4',
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      change: '+1 this month'
    },
    {
      title: 'Investor Reports',
      value: '5',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      change: '+1 this month'
    },
    {
      title: 'Performance Reports',
      value: '3',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      change: 'No change'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and download reports for your investment activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>
              View your investment reports overview
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {report.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                  </TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      Available for download
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
          <CardDescription>
            Overview of available report categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <DollarSign className="h-6 w-6 mb-2 text-green-600" />
              <h3 className="font-medium">Commission Report</h3>
              <p className="text-sm text-muted-foreground">Monthly earnings breakdown</p>
            </div>
            <div className="p-4 border rounded-lg">
              <Users className="h-6 w-6 mb-2 text-blue-600" />
              <h3 className="font-medium">Investor Summary</h3>
              <p className="text-sm text-muted-foreground">Complete investor overview</p>
            </div>
            <div className="p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 mb-2 text-purple-600" />
              <h3 className="font-medium">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">Growth metrics and insights</p>
            </div>
            <div className="p-4 border rounded-lg">
              <FileText className="h-6 w-6 mb-2 text-orange-600" />
              <h3 className="font-medium">Custom Report</h3>
              <p className="text-sm text-muted-foreground">Tailored reporting options</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}