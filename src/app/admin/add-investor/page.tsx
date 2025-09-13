'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, INVESTMENT_TIERS } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';

interface Agent {
  id: string;
  agent_id: string;
  full_name: string;
}

export default function AddInvestor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: '',
    companyName: '',
    occupation: '',
    nricPassport: '',
    dateOfBirth: '',
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
    
    // Investment Details
    agentId: '',
    investmentAmount: '',
    investmentTier: '',
    investmentType: 'STANDARD',
  });

  useEffect(() => {
    checkAuthAndLoadAgents();
  }, []);

  const checkAuthAndLoadAgents = async () => {
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
        router.push('/dashboard/admin');
        return;
      }

      // Load agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          id,
          agent_id,
          users!inner(full_name)
        `);

      if (!agentsError && agentsData) {
        const formattedAgents = agentsData.map((agent: any) => ({
          id: agent.id,
          agent_id: agent.agent_id,
          full_name: agent.users?.full_name || 'Unknown Agent',
        }));
        setAgents(formattedAgents);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      alert('Error loading page: ' + error.message);
    }
  };

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

  const calculateInvestmentTier = (amount: number, type: string) => {
    if (type === 'EXCLUSIVE') {
      return 'EX1'; // Default to first exclusive tier
    }
    
    const tier = INVESTMENT_TIERS.find(t => 
      t.type === 'STANDARD' && 
      amount >= t.min_amount && 
      (t.max_amount ? amount <= t.max_amount : true)
    );
    
    return tier?.tier || 'A1';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.nricPassport || !formData.email || !formData.agentId || !formData.investmentAmount) {
        alert('Please fill in all required fields.');
        return;
      }

      // Find selected agent
      const selectedAgent = agents.find(agent => agent.id === formData.agentId);
      if (!selectedAgent) {
        alert('Please select a valid consultant.');
        return;
      }

      const investmentAmount = parseFloat(formData.investmentAmount);
      if (isNaN(investmentAmount) || investmentAmount <= 0) {
        alert('Please enter a valid investment amount.');
        return;
      }

      // Calculate investment tier and rates
      const tier = calculateInvestmentTier(investmentAmount, formData.investmentType);
      const tierInfo = INVESTMENT_TIERS.find(t => t.tier === tier && t.type === formData.investmentType.toUpperCase());
      
      if (!tierInfo) {
        alert('Unable to determine investment tier. Please check the investment amount.');
        return;
      }

      // Create a temporary user account for the investor (they won't use it to log in)
      const tempPassword = Math.random().toString(36).slice(-8);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'INVESTOR'
          }
        }
      });

      if (authError) {
        // If email already exists, try to find the user
        const { data: existingUser, error: findError } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email)
          .single();

        if (findError || !existingUser) {
          throw new Error('Email already exists or unable to create user account.');
        }
        
        // Use existing user
        authData.user = { id: existingUser.id } as any;
      }

      if (authData.user) {
        // Create user record if it doesn't exist
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: 'INVESTOR'
          });

        if (userError && !userError.message.includes('duplicate')) {
          throw userError;
        }

        // Create investor record
        const { data: investorData, error: investorError } = await supabase
          .from('investors')
          .insert({
            user_id: authData.user.id,
            agent_id: formData.agentId,
            nric: formData.nricPassport,
            date_of_birth: formData.dateOfBirth || null,
            address: formData.correspondenceAddress,
            postcode: formData.postcode,
            city: formData.city,
            country: formData.country,
            contact_number: formData.mobileContact,
            gender: formData.gender,
            occupation: formData.occupation,
            company_name: formData.companyName,
            tier_subscription: parseInt(formData.tierSubscription) || null,
            no_of_unit_subscribed: parseInt(formData.noOfUnitSubscribed) || null,
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
          })
          .select()
          .single();

        if (investorError) throw investorError;

        // Create investment record
        const { error: investmentError } = await supabase
          .from('investments')
          .insert({
            investor_id: investorData.id,
            agent_id: formData.agentId,
            investment_type: formData.investmentType.toUpperCase(),
            investment_tier: tier,
            investment_amount: investmentAmount,
            quarterly_rate: tierInfo.quarterly_rate,
            yearly_rate: tierInfo.yearly_rate,
            start_date: new Date().toISOString().split('T')[0],
            status: 'ACTIVE'
          });

        if (investmentError) throw investmentError;

        alert(`Investor added successfully!\n\nInvestor: ${formData.fullName}\nTier: ${tier}\nAmount: RM${investmentAmount.toLocaleString()}\nConsultant: ${selectedAgent.full_name} (${selectedAgent.agent_id})`);
        router.push('/dashboard/admin');
      }
    } catch (error: any) {
      console.error('Error adding investor:', error);
      alert('Failed to add investor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/admin">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Investor</h1>
          <p className="text-gray-600">Enter investor details and investment information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Investor Information</CardTitle>
            <CardDescription>Complete the form below to add a new investor to the system</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Investment Details */}
              <div className="bg-purple-500 text-white p-3 rounded">
                <h3 className="font-bold">INVESTMENT DETAILS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Consultant/Agent *</label>
                  <select
                    name="agentId"
                    value={formData.agentId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Consultant</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name} ({agent.agent_id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Investment Amount (RM) *</label>
                  <Input
                    type="number"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleInputChange}
                    placeholder="e.g., 50000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Investment Type</label>
                  <select
                    name="investmentType"
                    value={formData.investmentType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXCLUSIVE">Exclusive</option>
                  </select>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-teal-500 text-white p-3 rounded">
                <h3 className="font-bold">PERSONAL INFORMATION</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
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
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
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
                  <label className="block text-sm font-medium mb-1">Mobile Contact *</label>
                  <Input
                    name="mobileContact"
                    value={formData.mobileContact}
                    onChange={handleInputChange}
                    required
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
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <Input
                    name="correspondenceAddress"
                    value={formData.correspondenceAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Postcode</label>
                  <Input
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-teal-500 text-white p-3 rounded">
                <h3 className="font-bold">BANK DETAILS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Account Beneficiary Name</label>
                  <Input
                    name="bankAccountBeneficiaryName"
                    value={formData.bankAccountBeneficiaryName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name</label>
                  <Input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <Input
                    name="accountNo"
                    value={formData.accountNo}
                    onChange={handleInputChange}
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
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/admin">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Adding Investor...' : 'Add Investor'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}