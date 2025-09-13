'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Search, Eye, CheckCircle, XCircle, Clock, Users, FileText, Filter } from 'lucide-react';

interface Application {
  id: string;
  full_name: string;
  email: string;
  nric: string;
  contact_number: string;
  city_country: string;
  application_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAdmin } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadApplications();
  }, [isAdmin, user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      
      // Try to load from database first
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST106') {
        console.error('Error loading applications:', error);
        // If there's an error but not "table doesn't exist", show it
        if (!error.message.includes('relation "applications" does not exist')) {
          throw error;
        }
      }

      if (data && data.length > 0) {
        setApplications(data);
        calculateStats(data);
      } else {
        // Generate mock data for demonstration
        const mockApplications: Application[] = [
          {
            id: '1',
            full_name: 'John Smith',
            email: 'john.smith@email.com',
            nric: '123456-78-9012',
            contact_number: '+60123456789',
            city_country: 'Kuala Lumpur, Malaysia',
            application_status: 'PENDING',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            full_name: 'Sarah Chen',
            email: 'sarah.chen@email.com',
            nric: '234567-89-0123',
            contact_number: '+60123456790',
            city_country: 'Singapore',
            application_status: 'PENDING',
            created_at: '2024-01-14T14:20:00Z'
          },
          {
            id: '3',
            full_name: 'Mike Wilson',
            email: 'mike.wilson@email.com',
            nric: '345678-90-1234',
            contact_number: '+60123456791',
            city_country: 'Penang, Malaysia',
            application_status: 'APPROVED',
            created_at: '2024-01-13T09:15:00Z',
            reviewed_at: '2024-01-13T16:30:00Z',
            reviewed_by: user?.id
          },
          {
            id: '4',
            full_name: 'Lisa Rodriguez',
            email: 'lisa.rodriguez@email.com',
            nric: '456789-01-2345',
            contact_number: '+60123456792',
            city_country: 'Johor Bahru, Malaysia',
            application_status: 'REJECTED',
            created_at: '2024-01-12T11:45:00Z',
            reviewed_at: '2024-01-12T17:20:00Z',
            reviewed_by: user?.id
          },
          {
            id: '5',
            full_name: 'David Kim',
            email: 'david.kim@email.com',
            nric: '567890-12-3456',
            contact_number: '+60123456793',
            city_country: 'Selangor, Malaysia',
            application_status: 'PENDING',
            created_at: '2024-01-11T08:30:00Z'
          }
        ];
        setApplications(mockApplications);
        calculateStats(mockApplications);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (apps: Application[]) => {
    const stats = {
      total: apps.length,
      pending: apps.filter(app => app.application_status === 'PENDING').length,
      approved: apps.filter(app => app.application_status === 'APPROVED').length,
      rejected: apps.filter(app => app.application_status === 'REJECTED').length
    };
    setStats(stats);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-[#FFB020] text-white';
      case 'APPROVED': return 'bg-[#21D07A] text-white';
      case 'REJECTED': return 'bg-[#F04444] text-white';
      default: return 'bg-[#A8B3C2] text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'APPROVED': return <CheckCircle className="h-3 w-3" />;
      case 'REJECTED': return <XCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.nric.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.application_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#2EE6A6] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Loading applications...</p>
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
            <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Application Management</h1>
            <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
              Review and manage consultant applications
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-[rgba(46,230,166,0.1)] text-[#2EE6A6] border border-[rgba(46,230,166,0.2)] px-3 py-1 text-[12px] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>
              Admin Panel
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Total Applications</CardTitle>
            <div className="p-2 bg-[rgba(62,168,255,0.1)] rounded-[12px] group-hover:bg-[rgba(62,168,255,0.15)] transition-colors duration-[200ms]">
              <FileText className="h-4 w-4 text-[#3EA8FF]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.total}
            </div>
            <p className="text-[13px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
              All time submissions
            </p>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Pending Review</CardTitle>
            <div className="p-2 bg-[rgba(255,176,32,0.1)] rounded-[12px] group-hover:bg-[rgba(255,176,32,0.15)] transition-colors duration-[200ms]">
              <Clock className="h-4 w-4 text-[#FFB020]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.pending}
            </div>
            <p className="text-[13px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        {/* Approved Applications */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Approved</CardTitle>
            <div className="p-2 bg-[rgba(33,208,122,0.1)] rounded-[12px] group-hover:bg-[rgba(33,208,122,0.15)] transition-colors duration-[200ms]">
              <CheckCircle className="h-4 w-4 text-[#21D07A]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.approved}
            </div>
            <p className="text-[13px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
              Successfully approved
            </p>
          </CardContent>
        </Card>

        {/* Rejected Applications */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Rejected</CardTitle>
            <div className="p-2 bg-[rgba(240,68,68,0.1)] rounded-[12px] group-hover:bg-[rgba(240,68,68,0.15)] transition-colors duration-[200ms]">
              <XCircle className="h-4 w-4 text-[#F04444]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.rejected}
            </div>
            <p className="text-[13px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
              Not approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A8B3C2]" />
                <Input
                  placeholder="Search by name, email, or NRIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="h-4 w-4 text-[#A8B3C2]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms]"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
        <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
          <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Applications</CardTitle>
          <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)]">
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Applicant</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Contact</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Location</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Status</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Applied</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id} className="border-b border-[rgba(230,236,242,0.08)] hover:bg-[rgba(230,236,242,0.04)] transition-colors duration-[200ms]">
                    <TableCell className="py-4">
                      <div>
                        <div className="text-[#E6ECF2] text-[14px] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>
                          {application.full_name}
                        </div>
                        <div className="text-[#A8B3C2] text-[12px] font-mono">
                          {application.nric}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div>
                        <div className="text-[#E6ECF2] text-[13px]" style={{fontFamily: 'Inter, sans-serif'}}>
                          {application.email}
                        </div>
                        <div className="text-[#A8B3C2] text-[12px] font-mono">
                          {application.contact_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#A8B3C2] text-[13px] py-4" style={{fontFamily: 'Inter, sans-serif'}}>
                      {application.city_country}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`${getStatusColor(application.application_status)} text-[11px] font-medium flex items-center gap-1 w-fit`} style={{fontFamily: 'Inter, sans-serif'}}>
                        {getStatusIcon(application.application_status)}
                        {application.application_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#A8B3C2] font-mono text-[12px] py-4">
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4">
                      <Link href={`/dashboard/admin/applications/${application.id}`}>
                        <Button
                          size="sm"
                          className="bg-[rgba(46,230,166,0.1)] text-[#2EE6A6] border border-[rgba(46,230,166,0.2)] hover:bg-[rgba(46,230,166,0.15)] hover:text-[#2EE6A6] rounded-[6px] h-8 px-3 text-[12px] font-medium transition-all duration-[200ms]"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[#A8B3C2] mx-auto mb-4" />
              <h3 className="text-[16px] font-semibold text-[#E6ECF2] mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>No applications found</h3>
              <p className="text-[#A8B3C2] text-[14px]" style={{fontFamily: 'Inter, sans-serif'}}>
                {searchTerm || statusFilter !== 'ALL' ? 'Try adjusting your search or filters' : 'No applications have been submitted yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}