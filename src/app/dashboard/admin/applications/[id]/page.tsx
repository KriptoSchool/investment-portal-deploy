'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, CreditCard, FileText, Users, Shield, Mail, Phone, MapPin, Calendar, Building } from 'lucide-react';
import Link from 'next/link';

interface ApplicationDetail {
  id: string;
  // Section A - Details of Applicant
  full_name: string;
  nric: string;
  date_of_birth?: string;
  address?: string;
  status: string;
  postcode?: string;
  gender: string;
  city_country?: string;
  contact_number: string;
  email: string;
  introducer_name?: string;
  introducer_id?: string;
  
  // Section B - Applicant's Bank Details
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  
  // Section C - Additional Information
  previous_experience?: string;
  currently_promoting?: string;
  working_style: string;
  
  // Section D - Beneficiary Details
  beneficiary_full_name?: string;
  beneficiary_nric?: string;
  beneficiary_date_of_birth?: string;
  beneficiary_postcode?: string;
  beneficiary_city_country?: string;
  beneficiary_relation?: string;
  beneficiary_contact_number?: string;
  beneficiary_email_address?: string;
  beneficiary_account_holder_name?: string;
  beneficiary_bank_name?: string;
  beneficiary_account_number?: string;
  
  // Section E - Consultant Authorization
  declaration: boolean;
  applicant_signature?: string;
  signature_date?: string;
  signature_name?: string;
  
  // Application Management
  application_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin } = useUser();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadApplication();
  }, [isAdmin, params.id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      
      // Try to load from database first
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error && error.code !== 'PGRST106' && error.code !== 'PGRST116') {
        console.error('Error loading application:', error);
        if (!error.message.includes('relation "applications" does not exist')) {
          throw error;
        }
      }

      if (data) {
        setApplication(data);
      } else {
        // Generate mock data for demonstration
        const mockApplication: ApplicationDetail = {
          id: params.id as string,
          // Section A - Details of Applicant
          full_name: 'John Smith',
          nric: '123456-78-9012',
          date_of_birth: '1990-05-15',
          address: '123 Jalan Bukit Bintang, Kuala Lumpur',
          status: 'Single',
          postcode: '55100',
          gender: 'Male',
          city_country: 'Kuala Lumpur, Malaysia',
          contact_number: '+60123456789',
          email: 'john.smith@email.com',
          introducer_name: 'Sarah Chen',
          introducer_id: 'AGT001234',
          
          // Section B - Applicant's Bank Details
          account_holder_name: 'John Smith',
          bank_name: 'Maybank',
          account_number: '1234567890123456',
          
          // Section C - Additional Information
          previous_experience: 'I have 5 years of experience in sales and marketing, working with various financial products and services. I have consistently exceeded my sales targets and built strong relationships with clients.',
          currently_promoting: 'No, I am not currently promoting any other company or product.',
          working_style: 'Full-time',
          
          // Section D - Beneficiary Details
          beneficiary_full_name: 'Jane Smith',
          beneficiary_nric: '234567-89-0123',
          beneficiary_date_of_birth: '1992-08-20',
          beneficiary_postcode: '55100',
          beneficiary_city_country: 'Kuala Lumpur, Malaysia',
          beneficiary_relation: 'Spouse',
          beneficiary_contact_number: '+60123456788',
          beneficiary_email_address: 'jane.smith@email.com',
          beneficiary_account_holder_name: 'Jane Smith',
          beneficiary_bank_name: 'CIMB Bank',
          beneficiary_account_number: '9876543210987654',
          
          // Section E - Consultant Authorization
          declaration: true,
          applicant_signature: 'John Smith',
          signature_date: '2024-01-15',
          signature_name: 'John Smith',
          
          // Application Management
          application_status: 'PENDING',
          created_at: '2024-01-15T10:30:00Z'
        };
        setApplication(mockApplication);
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action: 'APPROVED' | 'REJECTED') => {
    if (!application || !user) return;
    
    setProcessing(true);
    try {
      if (action === 'APPROVED') {
        // Step 1: Create Supabase Auth User
        const temporaryPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: application.email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            full_name: application.full_name,
            role: 'AGENT'
          }
        });

        if (authError) {
          console.error('Error creating auth user:', authError);
          throw new Error('Failed to create user account: ' + authError.message);
        }

        if (!authData.user) {
          throw new Error('Failed to create user account');
        }

        // Step 2: Create User Profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: application.email,
            full_name: application.full_name,
            role: 'AGENT'
          });

        if (userError && !userError.message.includes('relation "users" does not exist')) {
          console.error('Error creating user profile:', userError);
          // Continue anyway - user account was created
        }

        // Step 3: Create Agent Record
        const agentId = `AGT${Date.now().toString().slice(-6)}`;
        
        const { error: agentError } = await supabase
          .from('agents')
          .insert({
            user_id: authData.user.id,
            agent_id: agentId,
            level: 'VC_CONSULTANT',
            nric: application.nric,
            date_of_birth: application.date_of_birth,
            address: application.address,
            postcode: application.postcode,
            city: application.city_country?.split(',')[0]?.trim(),
            country: application.city_country?.split(',')[1]?.trim() || 'Malaysia',
            contact_number: application.contact_number,
            introducer_name: application.introducer_name,
            introducer_id: application.introducer_id,
            bank_name: application.bank_name,
            account_number: application.account_number
          });

        if (agentError && !agentError.message.includes('relation "agents" does not exist')) {
          console.error('Error creating agent record:', agentError);
          // Continue anyway - user account was created
        }

        // Step 4: Update Application Status
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            application_status: action,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            invite_sent: true
          })
          .eq('id', application.id);

        if (updateError && !updateError.message.includes('relation "applications" does not exist')) {
          console.error('Error updating application:', updateError);
        }

        // Step 5: Send Welcome Email
         const emailSent = await sendApprovalEmail({
           applicantName: application.full_name,
           email: application.email,
           temporaryPassword: temporaryPassword,
           agentId: agentId,
           loginUrl: `${window.location.origin}/login`
         });

         // Step 6: Show Success with Login Details
         const emailStatus = emailSent ? '✅ Welcome email sent successfully!' : '⚠️ Email sending failed (check console)';
         
         alert(`✅ Application APPROVED Successfully!\n\n🎉 User Account Created:\n📧 Email: ${application.email}\n🔑 Temporary Password: ${temporaryPassword}\n🆔 Agent ID: ${agentId}\n\n📨 ${emailStatus}\n⚠️ User should change password on first login.`);
         
         console.log('Account created successfully:', {
           email: application.email,
           password: temporaryPassword,
           agentId: agentId,
           userId: authData.user.id,
           emailSent: emailSent
         });
        
      } else {
        // Handle Rejection
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            application_status: action,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
          })
          .eq('id', application.id);

        if (updateError && !updateError.message.includes('relation "applications" does not exist')) {
           throw updateError;
         }

         // Send rejection email
         const emailSent = await sendRejectionEmail({
           applicantName: application.full_name,
           email: application.email
         });

         const emailStatus = emailSent ? '✅ Rejection email sent successfully!' : '⚠️ Email sending failed (check console)';
         alert(`Application ${action.toLowerCase()} successfully!\n\n📨 ${emailStatus}`);
      }

      // Update local state
      setApplication(prev => prev ? {
        ...prev,
        application_status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        invite_sent: action === 'APPROVED'
      } : null);
      
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
      default: return 'bg-[#A8B3C2] text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#2EE6A6] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-[#A8B3C2] mx-auto mb-4" />
          <h2 className="text-[24px] font-bold text-[#E6ECF2] mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Application Not Found</h2>
          <p className="text-[#A8B3C2] mb-6" style={{fontFamily: 'Inter, sans-serif'}}>The requested application could not be found.</p>
          <Link href="/dashboard/admin/applications">
            <Button className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] hover:from-[#26D0A4] hover:to-[#3B9EFF] text-white font-medium rounded-[8px] h-12 px-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6ECF2] p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/admin/applications">
              <Button variant="outline" className="border-[rgba(230,236,242,0.12)] text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] hover:text-[#E6ECF2] rounded-[8px] h-10 px-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Application Review</h1>
              <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Review complete application details and make approval decision
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`${getStatusColor(application.application_status)} text-[12px] font-medium flex items-center gap-2 px-3 py-1`} style={{fontFamily: 'Inter, sans-serif'}}>
              {getStatusIcon(application.application_status)}
              {application.application_status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section A: Personal Details */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px]">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Personal Details</CardTitle>
                  <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Section A - Applicant Information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Full Name</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.full_name}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>NRIC</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.nric}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Date of Birth</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                    {application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Gender</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.gender}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Marital Status</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.status}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Contact Number</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.contact_number}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Email</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.email}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>City/Country</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.city_country || 'Not provided'}</p>
                </div>
              </div>
              
              {application.address && (
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Address</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.address}</p>
                  {application.postcode && (
                    <p className="text-[13px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Postcode: {application.postcode}</p>
                  )}
                </div>
              )}
              
              {(application.introducer_name || application.introducer_id) && (
                <div className="pt-4 border-t border-[rgba(230,236,242,0.08)]">
                  <h4 className="text-[14px] font-medium text-[#E6ECF2] mb-3" style={{fontFamily: 'Inter, sans-serif'}}>Referral Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.introducer_name && (
                      <div>
                        <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Introducer Name</label>
                        <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.introducer_name}</p>
                      </div>
                    )}
                    {application.introducer_id && (
                      <div>
                        <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Introducer ID</label>
                        <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.introducer_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section B: Bank Details */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px]">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Bank Details</CardTitle>
                  <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Section B - Commission Payment Information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Account Holder Name</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.account_holder_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Bank Name</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.bank_name || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Account Number</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.account_number || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section C: Additional Information */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px]">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Additional Information</CardTitle>
                  <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Section C - Experience and Background</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Working Style</label>
                <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.working_style}</p>
              </div>
              
              {application.previous_experience && (
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Previous Experience</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>{application.previous_experience}</p>
                </div>
              )}
              
              {application.currently_promoting && (
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Currently Promoting Other Companies</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>{application.currently_promoting}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section D: Beneficiary Details */}
          {(application.beneficiary_full_name || application.beneficiary_nric) && (
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px]">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Beneficiary Details</CardTitle>
                    <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Section D - Emergency Contact Information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.beneficiary_full_name && (
                    <div>
                      <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Full Name</label>
                      <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.beneficiary_full_name}</p>
                    </div>
                  )}
                  {application.beneficiary_nric && (
                    <div>
                      <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>NRIC</label>
                      <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.beneficiary_nric}</p>
                    </div>
                  )}
                  {application.beneficiary_relation && (
                    <div>
                      <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Relationship</label>
                      <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.beneficiary_relation}</p>
                    </div>
                  )}
                  {application.beneficiary_contact_number && (
                    <div>
                      <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Contact Number</label>
                      <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.beneficiary_contact_number}</p>
                    </div>
                  )}
                  {application.beneficiary_email_address && (
                    <div>
                      <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Email</label>
                      <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.beneficiary_email_address}</p>
                    </div>
                  )}
                  {application.beneficiary_city_country && (
                    <div>
                      <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>City/Country</label>
                      <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.beneficiary_city_country}</p>
                    </div>
                  )}
                </div>
                
                {(application.beneficiary_bank_name || application.beneficiary_account_number) && (
                  <div className="pt-4 border-t border-[rgba(230,236,242,0.08)]">
                    <h4 className="text-[14px] font-medium text-[#E6ECF2] mb-3" style={{fontFamily: 'Inter, sans-serif'}}>Beneficiary Bank Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.beneficiary_account_holder_name && (
                        <div>
                          <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Account Holder</label>
                          <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.beneficiary_account_holder_name}</p>
                        </div>
                      )}
                      {application.beneficiary_bank_name && (
                        <div>
                          <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Bank Name</label>
                          <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.beneficiary_bank_name}</p>
                        </div>
                      )}
                      {application.beneficiary_account_number && (
                        <div className="md:col-span-2">
                          <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Account Number</label>
                          <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.beneficiary_account_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section E: Authorization */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px]">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Consultant Authorization</CardTitle>
                  <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>Section E - Legal Declaration and Signature</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Declaration Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  {application.declaration ? (
                    <CheckCircle className="h-5 w-5 text-[#21D07A]" />
                  ) : (
                    <XCircle className="h-5 w-5 text-[#F04444]" />
                  )}
                  <p className="text-[15px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>
                    {application.declaration ? 'Accepted' : 'Not Accepted'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.applicant_signature && (
                  <div>
                    <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Digital Signature</label>
                    <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.applicant_signature}</p>
                  </div>
                )}
                {application.signature_date && (
                  <div>
                    <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Signature Date</label>
                    <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                      {new Date(application.signature_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {application.signature_name && (
                  <div>
                    <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Signature Name</label>
                    <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>{application.signature_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Summary */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Application Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Application ID</label>
                <p className="text-[15px] text-[#E6ECF2] mt-1 font-mono">{application.id}</p>
              </div>
              
              <div>
                <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Submitted</label>
                <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                  {new Date(application.created_at).toLocaleDateString()}
                </p>
                <p className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>
                  {new Date(application.created_at).toLocaleTimeString()}
                </p>
              </div>
              
              <div>
                <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Current Status</label>
                <Badge className={`${getStatusColor(application.application_status)} text-[11px] font-medium flex items-center gap-1 w-fit mt-1`} style={{fontFamily: 'Inter, sans-serif'}}>
                  {getStatusIcon(application.application_status)}
                  {application.application_status}
                </Badge>
              </div>
              
              {application.reviewed_at && (
                <div>
                  <label className="text-[12px] font-medium text-[#A8B3C2] uppercase tracking-wide" style={{fontFamily: 'Inter, sans-serif'}}>Reviewed</label>
                  <p className="text-[15px] text-[#E6ECF2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                    {new Date(application.reviewed_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {application.application_status === 'PENDING' && (
            <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
              <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
                <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Review Actions</CardTitle>
                <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
                  Make your approval decision
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={() => handleApproval('APPROVED')}
                  disabled={processing}
                  className="w-full bg-[#21D07A] hover:bg-[#1EBB6B] text-white font-medium rounded-[8px] h-12 transition-all duration-[200ms]"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Approve Application'}
                </Button>
                
                <Button
                  onClick={() => handleApproval('REJECTED')}
                  disabled={processing}
                  variant="outline"
                  className="w-full border-[#F04444] text-[#F04444] hover:bg-[#F04444] hover:text-white font-medium rounded-[8px] h-12 transition-all duration-[200ms]"
                  style={{fontFamily: 'Inter, sans-serif'}}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Reject Application'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
            <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
              <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-[#A8B3C2]" />
                <div>
                  <p className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Email</p>
                  <p className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>{application.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-[#A8B3C2]" />
                <div>
                  <p className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Phone</p>
                  <p className="text-[14px] text-[#E6ECF2] font-mono" style={{fontFamily: 'Inter, sans-serif'}}>{application.contact_number}</p>
                </div>
              </div>
              
              {application.city_country && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-[#A8B3C2]" />
                  <div>
                    <p className="text-[13px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Location</p>
                    <p className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>{application.city_country}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}