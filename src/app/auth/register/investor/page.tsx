'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, INVESTMENT_TIERS } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function InvestorRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    companyName: '',
    occupation: '',
    nricPassport: '',
    tierSubscription: '',
    noOfUnitSubscribed: '',
    typeOfDividend: 'Standard',
    typeOfFunding: 'Exclusive',
    correspondenceAddress: '',
    postcode: '',
    city: '',
    country: 'Malaysia',
    
    // Source of Income
    sourceOfIncome: [] as string[],
    estimatedAnnualIncome: '',
    yearsOfInvestmentExperience: '',
    politicallyExposed: 'No',
    
    // Contact Information
    homeContact: '',
    officeContact: '',
    mobileContact: '',
    email: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactMobile: '',
    emergencyContactEmail: '',
    
    // Personal Information
    nationality: '',
    race: '',
    gender: 'Male',
    
    // Bank Details
    bankAccountBeneficiaryName: '',
    bankName: '',
    bankBranch: '',
    accountNo: '',
    swiftCode: '',
    
    // Authentication
    password: '',
    confirmPassword: '',
    
    // Agent Information
    agentId: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        sourceOfIncome: checkbox.checked 
          ? [...prev.sourceOfIncome, value]
          : prev.sourceOfIncome.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      // Validate agent ID exists
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id')
        .eq('agent_id', formData.agentId)
        .single();

      if (agentError || !agentData) {
        alert('Invalid agent ID. Please check with your consultant.');
        return;
      }

      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'INVESTOR'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: 'INVESTOR'
          });

        if (userError) throw userError;

        // Create investor record
        const { error: investorError } = await supabase
          .from('investors')
          .insert({
            user_id: authData.user.id,
            agent_id: agentData.id,
            nric: formData.nricPassport,
            address: formData.correspondenceAddress,
            postcode: formData.postcode,
            city: formData.city,
            country: formData.country,
            contact_number: formData.mobileContact,
            gender: formData.gender,
            occupation: formData.occupation,
            company_name: formData.companyName,
            tier_subscription: parseInt(formData.tierSubscription),
            no_of_unit_subscribed: parseInt(formData.noOfUnitSubscribed),
            type_of_dividend: formData.typeOfDividend,
            type_of_funding: formData.typeOfFunding,
            source_of_income: formData.sourceOfIncome.join(', '),
            estimated_annual_income: formData.estimatedAnnualIncome,
            years_of_investment_experience: formData.yearsOfInvestmentExperience,
            politically_exposed: formData.politicallyExposed === 'Yes',
            bank_account_beneficiary_name: formData.bankAccountBeneficiaryName,
            bank_name: formData.bankName,
            bank_branch: formData.bankBranch,
            account_no: formData.accountNo,
            swift_code: formData.swiftCode,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_relationship: formData.emergencyContactRelationship,
            emergency_contact_mobile: formData.emergencyContactMobile,
            emergency_contact_email: formData.emergencyContactEmail,
            nationality: formData.nationality,
            race: formData.race,
          });

        if (investorError) throw investorError;

        alert('Registration successful! Please check your email to verify your account.');
        router.push('/login');
      }
    } catch (error: any) {
      alert('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-6xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">INVESTOR REGISTRATION</CardTitle>
          <CardDescription>Join our investment platform</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Agent Information */}
            <div className="bg-blue-500 text-white p-3 rounded">
              <h3 className="font-bold">CONSULTANT INFORMATION</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Consultant/Agent ID *</label>
                <Input
                  name="agentId"
                  value={formData.agentId}
                  onChange={handleInputChange}
                  placeholder="Enter your consultant's ID"
                  required
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-teal-500 text-white p-3 rounded">
              <h3 className="font-bold">PERSONAL INFORMATION</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name of Individual *</label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <Input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Occupation</label>
                <Input
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">NRIC/Passport No *</label>
                <Input
                  name="nricPassport"
                  value={formData.nricPassport}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">No. of Unit Subscribed</label>
                <Input
                  type="number"
                  name="noOfUnitSubscribed"
                  value={formData.noOfUnitSubscribed}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tier 1 (3 Years)</label>
                <Input
                  name="tierSubscription"
                  value={formData.tierSubscription}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type of Dividend</label>
                <select
                  name="typeOfDividend"
                  value={formData.typeOfDividend}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Standard">Standard</option>
                  <option value="Exclusive">Exclusive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type of Funding</label>
                <select
                  name="typeOfFunding"
                  value={formData.typeOfFunding}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Exclusive">Exclusive</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Correspondence Address *</label>
                <Input
                  name="correspondenceAddress"
                  value={formData.correspondenceAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Postcode *</label>
                <Input
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Source of Income */}
            <div className="bg-teal-500 text-white p-3 rounded">
              <h3 className="font-bold">SOURCE OF INCOME</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Source of Income</label>
                <div className="space-y-2">
                  {['Employment', 'Business', 'Savings/Inheritance'].map((source) => (
                    <label key={source} className="flex items-center">
                      <input
                        type="checkbox"
                        name="sourceOfIncome"
                        value={source}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      {source}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Annual Income</label>
                <div className="space-y-2">
                  {['<RM300,000', 'RM300,001-RM500,000', 'RM500,001-RM800,000', 'RM800,001-RM1,000,000', '>RM1,000,000'].map((income) => (
                    <label key={income} className="flex items-center">
                      <input
                        type="radio"
                        name="estimatedAnnualIncome"
                        value={income}
                        checked={formData.estimatedAnnualIncome === income}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      {income}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Years of Investment Experience</label>
                <div className="space-y-2">
                  {['<1 Year', '1-5 Years', '>5 Years'].map((years) => (
                    <label key={years} className="flex items-center">
                      <input
                        type="radio"
                        name="yearsOfInvestmentExperience"
                        value={years}
                        checked={formData.yearsOfInvestmentExperience === years}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      {years}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Politically Exposed Person</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="politicallyExposed"
                    value="Yes"
                    checked={formData.politicallyExposed === 'Yes'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="politicallyExposed"
                    value="No"
                    checked={formData.politicallyExposed === 'No'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-teal-500 text-white p-3 rounded">
              <h3 className="font-bold">CONTACT INFORMATION</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Home Contact</label>
                <Input
                  name="homeContact"
                  value={formData.homeContact}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Office Contact</label>
                <Input
                  name="officeContact"
                  value={formData.officeContact}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mobile *</label>
                <Input
                  name="mobileContact"
                  value={formData.mobileContact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-teal-500 text-white p-3 rounded">
              <h3 className="font-bold">EMERGENCY CONTACT</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Relationship</label>
                <Input
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mobile No.</label>
                <Input
                  name="emergencyContactMobile"
                  value={formData.emergencyContactMobile}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  name="emergencyContactEmail"
                  value={formData.emergencyContactEmail}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-teal-500 text-white p-3 rounded">
              <h3 className="font-bold">PERSONAL DETAILS</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nationality/Status</label>
                <Input
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Race</label>
                <Input
                  name="race"
                  value={formData.race}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-teal-500 text-white p-3 rounded">
              <h3 className="font-bold">STANDING PAYMENT INSTRUCTION AND INCOME DISTRIBUTION</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Account Beneficiary Name *</label>
                <Input
                  name="bankAccountBeneficiaryName"
                  value={formData.bankAccountBeneficiaryName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name *</label>
                <Input
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bank Branch</label>
                <Input
                  name="bankBranch"
                  value={formData.bankBranch}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Account No *</label>
                <Input
                  name="accountNo"
                  value={formData.accountNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Swift Code</label>
                <Input
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Authentication Section */}
            <div className="bg-blue-500 text-white p-3 rounded">
              <h3 className="font-bold">ACCOUNT CREDENTIALS</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Link href="/login">
            <Button variant="outline">Back to Sign In</Button>
          </Link>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-600"
          >
            {loading ? 'Registering...' : 'Register as Investor'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}