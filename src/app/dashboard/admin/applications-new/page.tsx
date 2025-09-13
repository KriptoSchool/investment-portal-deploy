'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  Filter,
  MoreHorizontal,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  Shield,
  AlertTriangle,
  X,
  Send
} from 'lucide-react';

interface Application {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  nric: string;
  address: string;
  city_country: string;
  bank_name: string;
  account_number: string;
  application_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  kyc_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  kyc_identity_verified: boolean;
  kyc_address_verified: boolean;
  kyc_bank_verified: boolean;
  kyc_agreement_verified: boolean;
  kyc_notes: string;
  jotform_submission_id: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

interface ApplicationDocument {
  id: string;
  field_name: string;
  file_url: string;
  document_type: string;
  verified: boolean;
  created_at: string;
}

export default function ApplicationsNewPage() {
  const router = useRouter();
  const { user, isAdmin } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [kycFilter, setKycFilter] = useState<string>('ALL');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    kycPending: 0
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
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST106') {
        console.error('Error loading applications:', error);
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
            contact_number: '+60123456789',
            nric: '123456-78-9012',
            address: '123 Jalan Bukit Bintang',
            city_country: 'Kuala Lumpur, Malaysia',
            bank_name: 'Maybank',
            account_number: '1234567890',
            application_status: 'PENDING',
            kyc_status: 'PENDING',
            kyc_identity_verified: false,
            kyc_address_verified: false,
            kyc_bank_verified: false,
            kyc_agreement_verified: false,
            kyc_notes: '',
            jotform_submission_id: 'JF_001',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            full_name: 'Sarah Chen',
            email: 'sarah.chen@email.com',
            contact_number: '+60123456790',
            nric: '234567-89-0123',
            address: '456 Orchard Road',
            city_country: 'Singapore',
            bank_name: 'DBS Bank',
            account_number: '9876543210',
            application_status: 'PENDING',
            kyc_status: 'IN_PROGRESS',
            kyc_identity_verified: true,
            kyc_address_verified: true,
            kyc_bank_verified: false,
            kyc_agreement_verified: false,
            kyc_notes: 'Identity and address documents verified. Waiting for bank statement.',
            jotform_submission_id: 'JF_002',
            created_at: '2024-01-14T14:20:00Z'
          },
          {
            id: '3',
            full_name: 'Mike Wilson',
            email: 'mike.wilson@email.com',
            contact_number: '+60123456791',
            nric: '345678-90-1234',
            address: '789 Penang Road',
            city_country: 'Penang, Malaysia',
            bank_name: 'CIMB Bank',
            account_number: '5555666677',
            application_status: 'APPROVED',
            kyc_status: 'COMPLETED',
            kyc_identity_verified: true,
            kyc_address_verified: true,
            kyc_bank_verified: true,
            kyc_agreement_verified: true,
            kyc_notes: 'All documents verified. Application approved.',
            jotform_submission_id: 'JF_003',
            created_at: '2024-01-13T09:15:00Z',
            reviewed_at: '2024-01-13T16:30:00Z',
            reviewed_by: user?.id
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

  const loadDocuments = async (applicationId: string) => {
    try {
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error && !error.message.includes('relation "application_documents" does not exist')) {
        console.error('Error loading documents:', error);
        return;
      }

      if (data) {
        setDocuments(data);
      } else {
        // Mock documents for demonstration
        const mockDocs: ApplicationDocument[] = [
          {
            id: '1',
            field_name: 'Identity Card',
            file_url: 'https://example.com/doc1.pdf',
            document_type: 'identity',
            verified: true,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            field_name: 'Address Proof',
            file_url: 'https://example.com/doc2.pdf',
            document_type: 'address',
            verified: false,
            created_at: '2024-01-15T10:31:00Z'
          }
        ];
        setDocuments(mockDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const calculateStats = (apps: Application[]) => {
    const stats = {
      total: apps.length,
      pending: apps.filter(app => app.application_status === 'PENDING').length,
      approved: apps.filter(app => app.application_status === 'APPROVED').length,
      rejected: apps.filter(app => app.application_status === 'REJECTED').length,
      kycPending: apps.filter(app => app.kyc_status === 'PENDING').length
    };
    setStats(stats);
  };

  const handleViewDetails = async (application: Application) => {
    setSelectedApplication(application);
    await loadDocuments(application.id);
    
    // Simple alert for now - can be replaced with proper modal later
    alert(`Application Details:\n\nName: ${application.full_name}\nEmail: ${application.email}\nPhone: ${application.contact_number}\nNRIC: ${application.nric}\nStatus: ${application.application_status}\nKYC Status: ${application.kyc_status}\nBank: ${application.bank_name || 'Not provided'}\nNotes: ${application.kyc_notes || 'No notes'}`);
  };

  const handleKycUpdate = async (field: string, value: boolean) => {
    if (!selectedApplication || !user) return;
    
    setProcessing(true);
    try {
      const updates: any = {
        [field]: value,
        updated_at: new Date().toISOString()
      };
      
      // Update KYC status based on verification progress
      const allVerified = 
        (field === 'kyc_identity_verified' ? value : selectedApplication.kyc_identity_verified) &&
        (field === 'kyc_address_verified' ? value : selectedApplication.kyc_address_verified) &&
        (field === 'kyc_bank_verified' ? value : selectedApplication.kyc_bank_verified) &&
        (field === 'kyc_agreement_verified' ? value : selectedApplication.kyc_agreement_verified);
      
      if (allVerified) {
        updates.kyc_status = 'COMPLETED';
        updates.kyc_verified_by = user.id;
        updates.kyc_verified_at = new Date().toISOString();
      } else if (value && selectedApplication.kyc_status === 'PENDING') {
        updates.kyc_status = 'IN_PROGRESS';
      }

      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', selectedApplication.id);

      if (error && !error.message.includes('relation "applications" does not exist')) {
        throw error;
      }

      // Update local state
      setSelectedApplication(prev => prev ? { ...prev, ...updates } : null);
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id ? { ...app, ...updates } : app
      ));
      
    } catch (error: any) {
      console.error('Error updating KYC status:', error);
      alert('Failed to update verification status: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleNotesUpdate = async (notes: string) => {
    if (!selectedApplication) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          kyc_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error && !error.message.includes('relation "applications" does not exist')) {
        throw error;
      }

      setSelectedApplication(prev => prev ? { ...prev, kyc_notes: notes } : null);
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id ? { ...app, kyc_notes: notes } : app
      ));
      
    } catch (error: any) {
      console.error('Error updating notes:', error);
    }
  };

  const handleApplicationAction = async (action: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_INFO') => {
    if (!selectedApplication || !user) return;
    
    setProcessing(true);
    try {
      if (action === 'REQUEST_MORE_INFO') {
        // TODO: Implement request more info functionality
        alert('Request more info functionality will be implemented');
        return;
      }
      
      const updates: any = {
        application_status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (action === 'APPROVED') {
        // Generate invite token
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
        
        updates.invite_token = token;
        updates.invite_token_expires_at = expiresAt.toISOString();
        updates.invite_sent = true;
        
        // TODO: Send invite email
        console.log('Invite token generated:', token);
        console.log('Invite link:', `${window.location.origin}/invites/${token}`);
      }

      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', selectedApplication.id);

      if (error && !error.message.includes('relation "applications" does not exist')) {
        throw error;
      }

      // Update local state
      setSelectedApplication(prev => prev ? { ...prev, ...updates } : null);
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id ? { ...app, ...updates } : app
      ));
      
      const message = action === 'APPROVED' 
        ? `Application approved! Invite token: ${updates.invite_token}\nInvite link: ${window.location.origin}/invites/${updates.invite_token}`
        : 'Application rejected successfully.';
      
      alert(message);
      
    } catch (error: any) {
      console.error(`Error ${action.toLowerCase()} application:`, error);
      alert(`Failed to ${action.toLowerCase()} application: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-[#FFB020] text-white';
      case 'APPROVED': return 'bg-[#21D07A] text-white';
      case 'REJECTED': return 'bg-[#F04444] text-white';
      case 'IN_PROGRESS': return 'bg-[#3EA8FF] text-white';
      case 'COMPLETED': return 'bg-[#21D07A] text-white';
      default: return 'bg-[#A8B3C2] text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'APPROVED': return <CheckCircle className="h-3 w-3" />;
      case 'REJECTED': return <XCircle className="h-3 w-3" />;
      case 'IN_PROGRESS': return <AlertTriangle className="h-3 w-3" />;
      case 'COMPLETED': return <CheckCircle className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.contact_number.includes(searchTerm) ||
                         app.nric.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.application_status === statusFilter;
    const matchesKyc = kycFilter === 'ALL' || app.kyc_status === kycFilter;
    return matchesSearch && matchesStatus && matchesKyc;
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
            <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Applications</h1>
            <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
              Manage consultant applications from Jotform submissions
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Total Applications */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Total</CardTitle>
            <div className="p-2 bg-[rgba(62,168,255,0.1)] rounded-[12px] group-hover:bg-[rgba(62,168,255,0.15)] transition-colors duration-[200ms]">
              <FileText className="h-4 w-4 text-[#3EA8FF]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.total}
            </div>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Pending</CardTitle>
            <div className="p-2 bg-[rgba(255,176,32,0.1)] rounded-[12px] group-hover:bg-[rgba(255,176,32,0.15)] transition-colors duration-[200ms]">
              <Clock className="h-4 w-4 text-[#FFB020]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.pending}
            </div>
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
          </CardContent>
        </Card>

        {/* KYC Pending */}
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg hover:shadow-xl transition-all duration-[200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:translate-y-[-2px] group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-4">
            <CardTitle className="text-[15px] font-medium text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>KYC Pending</CardTitle>
            <div className="p-2 bg-[rgba(255,176,32,0.1)] rounded-[12px] group-hover:bg-[rgba(255,176,32,0.15)] transition-colors duration-[200ms]">
              <Shield className="h-4 w-4 text-[#FFB020]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-[24px] font-bold text-[#E6ECF2] tabular-nums" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              {stats.kycPending}
            </div>
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
                  placeholder="Search by name, email, phone, or NRIC..."
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
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="h-12 px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms]"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                <option value="ALL">All KYC</option>
                <option value="PENDING">KYC Pending</option>
                <option value="IN_PROGRESS">KYC In Progress</option>
                <option value="COMPLETED">KYC Completed</option>
                <option value="REJECTED">KYC Rejected</option>
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
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Name</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Email</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Phone</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Submitted</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>KYC Status</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Bank</TableHead>
                  <TableHead className="text-[#A8B3C2] font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Notes</TableHead>
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
                    <TableCell className="text-[#E6ECF2] text-[13px] py-4" style={{fontFamily: 'Inter, sans-serif'}}>
                      {application.email}
                    </TableCell>
                    <TableCell className="text-[#A8B3C2] text-[13px] font-mono py-4">
                      {application.contact_number}
                    </TableCell>
                    <TableCell className="text-[#A8B3C2] font-mono text-[12px] py-4">
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={`${getStatusColor(application.kyc_status)} text-[11px] font-medium flex items-center gap-1 w-fit`} style={{fontFamily: 'Inter, sans-serif'}}>
                        {getStatusIcon(application.kyc_status)}
                        {application.kyc_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#A8B3C2] text-[13px] py-4" style={{fontFamily: 'Inter, sans-serif'}}>
                      {application.bank_name || 'Not provided'}
                    </TableCell>
                    <TableCell className="text-[#A8B3C2] text-[13px] py-4 max-w-[200px]" style={{fontFamily: 'Inter, sans-serif'}}>
                      <div className="truncate">
                        {application.kyc_notes || 'No notes'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                          className="bg-[rgba(46,230,166,0.1)] text-[#2EE6A6] border border-[rgba(46,230,166,0.2)] hover:bg-[rgba(46,230,166,0.15)] hover:text-[#2EE6A6] rounded-[6px] h-8 px-3 text-[12px] font-medium transition-all duration-[200ms]"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
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
                {searchTerm || statusFilter !== 'ALL' || kycFilter !== 'ALL' ? 'Try adjusting your search or filters' : 'No applications have been submitted yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note: Detail view temporarily simplified to alert - can be enhanced with proper modal later */}
    </div>
  );
}