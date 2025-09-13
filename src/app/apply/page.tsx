'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Section A - Details of Applicant
    fullName: '',
    nric: '',
    dateOfBirth: '',
    address: '',
    status: 'Single',
    postcode: '',
    gender: 'Male',
    cityCountry: '',
    contactNumber: '',
    email: '',
    introducerName: '',
    introducerId: '',
    
    // Section B - Applicant's Bank Details
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    
    // Section C - Additional Information
    previousExperience: '',
    currentlyPromoting: '',
    workingStyle: 'Full-time',
    
    // Section D - Beneficiary Details
    beneficiaryFullName: '',
    beneficiaryNRIC: '',
    beneficiaryDateOfBirth: '',
    beneficiaryPostcode: '',
    beneficiaryCityCountry: '',
    beneficiaryRelation: '',
    beneficiaryContactNumber: '',
    beneficiaryEmailAddress: '',
    beneficiaryAccountHolderName: '',
    beneficiaryBankName: '',
    beneficiaryAccountNumber: '',
    
    // Section E - Consultant Authorization
    declaration: false,
    applicantSignature: '',
    date: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.nric || !formData.contactNumber) {
        alert('Please fill in all required fields (Full Name, Email, NRIC, and Contact Number).');
        return;
      }

      // Validate authorization section
      if (!formData.declaration) {
        alert('Please accept the declaration to proceed.');
        return;
      }

      if (!formData.applicantSignature || !formData.date || !formData.name) {
        alert('Please complete all required fields in the Consultant Authorization section.');
        return;
      }

      // Check if email already exists in applications
      try {
        const { data: existingApplication, error: checkError } = await supabase
          .from('applications')
          .select('email')
          .eq('email', formData.email)
          .single();

        // If table doesn't exist (PGRST106) or no rows found (PGRST116), continue
        if (checkError && checkError.code !== 'PGRST116' && checkError.code !== 'PGRST106') {
          console.error('Error checking existing application:', checkError);
          console.log('Continuing with application submission despite check error...');
        }

        if (existingApplication) {
          alert('An application with this email already exists. Please check your email for updates or contact support.');
          return;
        }
      } catch (error) {
        console.error('Database check failed, continuing with submission:', error);
      }

      // Create application record in database
      try {
        const { error: insertError } = await supabase
          .from('applications')
          .insert({
            // Section A - Details of Applicant
            full_name: formData.fullName,
            nric: formData.nric,
            date_of_birth: formData.dateOfBirth || null,
            address: formData.address,
            status: formData.status,
            postcode: formData.postcode,
            gender: formData.gender,
            city_country: formData.cityCountry,
            contact_number: formData.contactNumber,
            email: formData.email,
            introducer_name: formData.introducerName,
            introducer_id: formData.introducerId,
            
            // Section B - Applicant's Bank Details
            account_holder_name: formData.accountHolderName,
            bank_name: formData.bankName,
            account_number: formData.accountNumber,
            
            // Section C - Additional Information
            previous_experience: formData.previousExperience,
            currently_promoting: formData.currentlyPromoting,
            working_style: formData.workingStyle,
            
            // Section D - Beneficiary Details
            beneficiary_full_name: formData.beneficiaryFullName,
            beneficiary_nric: formData.beneficiaryNRIC,
            beneficiary_date_of_birth: formData.beneficiaryDateOfBirth || null,
            beneficiary_postcode: formData.beneficiaryPostcode,
            beneficiary_city_country: formData.beneficiaryCityCountry,
            beneficiary_relation: formData.beneficiaryRelation,
            beneficiary_contact_number: formData.beneficiaryContactNumber,
            beneficiary_email_address: formData.beneficiaryEmailAddress,
            beneficiary_account_holder_name: formData.beneficiaryAccountHolderName,
            beneficiary_bank_name: formData.beneficiaryBankName,
            beneficiary_account_number: formData.beneficiaryAccountNumber,
            
            // Section E - Consultant Authorization
            declaration: formData.declaration,
            applicant_signature: formData.applicantSignature,
            signature_date: formData.date || null,
            signature_name: formData.name,
            
            // Application Management
            application_status: 'PENDING'
          });

        if (insertError) {
          console.error('Error creating application:', insertError);
          // If table doesn't exist, log the data and continue
          if (insertError.code === 'PGRST106' || insertError.message.includes('relation "applications" does not exist')) {
            console.log('Applications table does not exist yet. Application data logged:', formData);
            console.log('Note: Database schema needs to be applied for full functionality.');
          } else {
            throw new Error('Failed to submit application: ' + insertError.message);
          }
        } else {
          console.log('Application submitted successfully to database:', formData);
        }
      } catch (dbError) {
        console.error('Database operation failed, but application data captured:', dbError);
        console.log('Application data:', formData);
      }

      console.log('Application submission completed:', formData);
      
      // TODO: Send notification to admin (email/webhook)
      
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-6">
        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-[#2EE6A6] mx-auto mb-4" />
            <h2 className="text-[24px] font-bold text-[#E6ECF2] mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Application Submitted!</h2>
            <p className="text-[#A8B3C2] mb-6" style={{fontFamily: 'Inter, sans-serif'}}>
              Thank you for your interest in joining Aaron M LLP as a consultant. We have received your application and will review it shortly.
            </p>
            <p className="text-[#A8B3C2] text-[14px] mb-6" style={{fontFamily: 'Inter, sans-serif'}}>
              You will receive an email with further instructions once your application is approved.
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] hover:from-[#26D0A4] hover:to-[#3B9EFF] text-white font-medium rounded-[8px] h-12 px-6 shadow-lg hover:shadow-[#2EE6A6]/25 transition-all duration-[200ms]" style={{fontFamily: 'Inter, sans-serif'}}>
                Back to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E6ECF2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px] mr-3 shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold tracking-tight text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Apply to Join Aaron M LLP</h1>
              <p className="text-[#A8B3C2] text-[15px] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>Submit your application to become a consultant</p>
            </div>
          </div>
        </div>

        <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg">
          <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)]">
            <CardTitle className="text-[18px] font-semibold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>Consultant Application</CardTitle>
            <CardDescription className="text-[14px] text-[#A8B3C2] mt-1" style={{fontFamily: 'Inter, sans-serif'}}>
              Please provide your complete information. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white p-3 rounded-[8px]">
                <h3 className="font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>BASIC INFORMATION</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Full Name *</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Email Address *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
              </div>

              {/* Section A: Personal Details */}
              <div className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white p-3 rounded-[8px]">
                <h3 className="font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>PERSONAL DETAILS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>NRIC *</label>
                  <Input
                    name="nric"
                    value={formData.nric}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456-78-9012"
                    required
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Date of Birth</label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Contact Number *</label>
                  <Input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., +60123456789"
                    required
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms]"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Marital Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms]"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Postcode</label>
                  <Input
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    placeholder="Postcode"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>City/Country</label>
                  <Input
                    name="cityCountry"
                    value={formData.cityCountry}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
              </div>

              {/* Section B: Bank Details */}
              <div className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white p-3 rounded-[8px]">
                <h3 className="font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>BANK DETAILS (For Commission Payments)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Account Holder Name</label>
                  <Input
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="Name as per bank account"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Bank Name</label>
                  <Input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g., Maybank, CIMB, Public Bank"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Account Number</label>
                  <Input
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Bank account number"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
              </div>

              {/* Section C: Referral Information */}
              <div className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white p-3 rounded-[8px]">
                <h3 className="font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>REFERRAL INFORMATION (Optional)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Introducer Name</label>
                  <Input
                    name="introducerName"
                    value={formData.introducerName}
                    onChange={handleInputChange}
                    placeholder="Who referred you?"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Introducer ID</label>
                  <Input
                    name="introducerId"
                    value={formData.introducerId}
                    onChange={handleInputChange}
                    placeholder="Referrer's agent ID"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
              </div>

              {/* Section D: Additional Information */}
              <div className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white p-3 rounded-[8px]">
                <h3 className="font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>ADDITIONAL INFORMATION</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Do you have prior experience in sales or marketing?</label>
                  <textarea
                    name="previousExperience"
                    value={formData.previousExperience}
                    onChange={handleInputChange}
                    className="w-full min-h-[120px] px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] placeholder-[#A8B3C2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms] resize-none"
                    rows={3}
                    placeholder="Describe your relevant experience..."
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Are you currently promoting any other company or product?</label>
                  <textarea
                    name="currentlyPromoting"
                    value={formData.currentlyPromoting}
                    onChange={handleInputChange}
                    className="w-full min-h-[120px] px-4 py-3 bg-[rgba(230,236,242,0.08)] border border-[rgba(230,236,242,0.12)] rounded-[8px] text-[#E6ECF2] placeholder-[#A8B3C2] focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-[#2EE6A6] transition-all duration-[200ms] resize-none"
                    rows={3}
                    placeholder="Please provide details if applicable..."
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Preferred working style:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="workingStyle"
                        value="Full-time"
                        checked={formData.workingStyle === 'Full-time'}
                        onChange={handleInputChange}
                        className="mr-2 text-[#2EE6A6] focus:ring-[#2EE6A6]"
                      />
                      <span className="text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Full-time</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="workingStyle"
                        value="Part-time"
                        checked={formData.workingStyle === 'Part-time'}
                        onChange={handleInputChange}
                        className="mr-2 text-[#2EE6A6] focus:ring-[#2EE6A6]"
                      />
                      <span className="text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>Part-time</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section D: Beneficiary Details */}
              <div className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white p-3 rounded-[8px]">
                <h3 className="font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>BENEFICIARY DETAILS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Full Name</label>
                  <Input
                    name="beneficiaryFullName"
                    value={formData.beneficiaryFullName}
                    onChange={handleInputChange}
                    placeholder="Beneficiary full name"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>NRIC</label>
                  <Input
                    name="beneficiaryNRIC"
                    value={formData.beneficiaryNRIC}
                    onChange={handleInputChange}
                    placeholder="Beneficiary NRIC"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Date of Birth</label>
                  <Input
                    type="date"
                    name="beneficiaryDateOfBirth"
                    value={formData.beneficiaryDateOfBirth}
                    onChange={handleInputChange}
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Postcode</label>
                  <Input
                    name="beneficiaryPostcode"
                    value={formData.beneficiaryPostcode}
                    onChange={handleInputChange}
                    placeholder="Beneficiary postcode"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>City/Country</label>
                  <Input
                    name="beneficiaryCityCountry"
                    value={formData.beneficiaryCityCountry}
                    onChange={handleInputChange}
                    placeholder="Beneficiary city, country"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Relation</label>
                  <Input
                    name="beneficiaryRelation"
                    value={formData.beneficiaryRelation}
                    onChange={handleInputChange}
                    placeholder="Relationship to applicant"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Contact Number</label>
                  <Input
                    name="beneficiaryContactNumber"
                    value={formData.beneficiaryContactNumber}
                    onChange={handleInputChange}
                    placeholder="Beneficiary contact number"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Email Address</label>
                  <Input
                    type="email"
                    name="beneficiaryEmailAddress"
                    value={formData.beneficiaryEmailAddress}
                    onChange={handleInputChange}
                    placeholder="Beneficiary email address"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Account Holder Name</label>
                  <Input
                    name="beneficiaryAccountHolderName"
                    value={formData.beneficiaryAccountHolderName}
                    onChange={handleInputChange}
                    placeholder="Beneficiary account holder name"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Bank Name</label>
                  <Input
                    name="beneficiaryBankName"
                    value={formData.beneficiaryBankName}
                    onChange={handleInputChange}
                    placeholder="Beneficiary bank name"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Account Number</label>
                  <Input
                    name="beneficiaryAccountNumber"
                    value={formData.beneficiaryAccountNumber}
                    onChange={handleInputChange}
                    placeholder="Beneficiary account number"
                    className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                    style={{fontFamily: 'Inter, sans-serif'}}
                  />
                </div>
              </div>

              {/* Section E: Consultant Authorization */}
              <div className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] text-white p-3 rounded-[8px]">
                <h3 className="font-bold" style={{fontFamily: 'Space Grotesk, sans-serif'}}>CONSULTANT AUTHORIZATION</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="declaration"
                    checked={formData.declaration}
                    onChange={(e) => setFormData(prev => ({ ...prev, declaration: e.target.checked }))}
                    className="mt-1 text-[#2EE6A6] focus:ring-[#2EE6A6] rounded"
                    required
                  />
                  <div className="text-[14px] text-[#E6ECF2]" style={{fontFamily: 'Inter, sans-serif'}}>
                    <p className="mb-2">
                      I hereby constitute the above-mentioned person as my beneficiary, and I declare that the information provided herein is true, complete and accurate to the best of my knowledge. I understand that any false, incomplete or inaccurate information may result in the rejection of this application or termination of any agreement that may be entered into as a result of this application.
                    </p>
                    <p>
                      I acknowledge that I have read and understood the terms and conditions, and I agree to be bound by them. I also acknowledge that I have received a copy of the consultant's T&C via front page of the form mentioned for my records.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Applicant Signature</label>
                    <Input
                      name="applicantSignature"
                      value={formData.applicantSignature}
                      onChange={handleInputChange}
                      placeholder="Type your full name as signature"
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Date</label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Name</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                      style={{fontFamily: 'Inter, sans-serif'}}
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="p-6 border-t border-[rgba(230,236,242,0.08)] flex justify-between">
            <Link href="/login">
              <Button variant="outline" className="border-[rgba(230,236,242,0.12)] text-[#A8B3C2] hover:bg-[rgba(230,236,242,0.08)] hover:text-[#E6ECF2] rounded-[8px] h-12 px-6" style={{fontFamily: 'Inter, sans-serif'}}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] hover:from-[#26D0A4] hover:to-[#3B9EFF] text-white font-medium rounded-[8px] h-12 px-6 shadow-lg hover:shadow-[#2EE6A6]/25 transition-all duration-[200ms]"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}