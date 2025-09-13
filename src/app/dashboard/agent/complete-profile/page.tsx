'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Personal Details
    nric: '',
    dateOfBirth: '',
    address: '',
    status: 'Single',
    postcode: '',
    gender: 'Male',
    city: '',
    country: 'Malaysia',
    contactNumber: '',
    introducerName: '',
    introducerId: '',
    
    // Bank Details
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    
    // Additional Information
    previousExperience: '',
    currentlyPromoting: '',
    workingStyle: 'Full-time',
  });

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Check if user is an agent
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || userData?.role !== 'AGENT') {
        alert('Access denied. This page is for consultants only.');
        router.push('/login');
        return;
      }

      // Check if agent profile already exists
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!agentError && agentData) {
        // Profile already exists, redirect to dashboard
        router.push('/dashboard/agent');
        return;
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      alert('Error loading profile: ' + error.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userId) {
        alert('User not authenticated');
        return;
      }

      // Validate required fields
      if (!formData.nric || !formData.contactNumber) {
        alert('Please fill in all required fields (NRIC and Contact Number).');
        return;
      }

      // Generate agent ID
      const agentId = `AG${Date.now().toString().slice(-6)}`;

      // Create agent record
      const { error: agentError } = await supabase
        .from('agents')
        .insert({
          user_id: userId,
          agent_id: agentId,
          level: 'VC_CONSULTANT',
          nric: formData.nric,
          date_of_birth: formData.dateOfBirth || null,
          address: formData.address,
          postcode: formData.postcode,
          city: formData.city,
          country: formData.country,
          contact_number: formData.contactNumber,
          introducer_name: formData.introducerName,
          introducer_id: formData.introducerId,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
        });

      if (agentError) throw agentError;

      alert(`Profile completed successfully!\n\nYour Agent ID: ${agentId}\n\nYou can now access your consultant dashboard.`);
      router.push('/dashboard/agent');
    } catch (error: any) {
      console.error('Error completing profile:', error);
      alert('Failed to complete profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complete Your Consultant Profile</h1>
              <p className="text-gray-600">Fill in your details to activate your consultant account</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consultant Information</CardTitle>
            <CardDescription>
              Please provide your complete information to set up your consultant profile and start earning commissions.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section A: Personal Details */}
              <div className="bg-teal-500 text-white p-3 rounded">
                <h3 className="font-bold">PERSONAL DETAILS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NRIC *</label>
                  <Input
                    name="nric"
                    value={formData.nric}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456-78-9012"
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
                  <label className="block text-sm font-medium mb-1">Contact Number *</label>
                  <Input
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., +60123456789"
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
                
                <div>
                  <label className="block text-sm font-medium mb-1">Marital Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Postcode</label>
                  <Input
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    placeholder="Postcode"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Section B: Bank Details */}
              <div className="bg-teal-500 text-white p-3 rounded">
                <h3 className="font-bold">BANK DETAILS (For Commission Payments)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                  <Input
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="Name as per bank account"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name</label>
                  <Input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="e.g., Maybank, CIMB, Public Bank"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <Input
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Bank account number"
                  />
                </div>
              </div>

              {/* Section C: Referral Information */}
              <div className="bg-teal-500 text-white p-3 rounded">
                <h3 className="font-bold">REFERRAL INFORMATION (Optional)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Introducer Name</label>
                  <Input
                    name="introducerName"
                    value={formData.introducerName}
                    onChange={handleInputChange}
                    placeholder="Who referred you?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Introducer ID</label>
                  <Input
                    name="introducerId"
                    value={formData.introducerId}
                    onChange={handleInputChange}
                    placeholder="Referrer's agent ID"
                  />
                </div>
              </div>

              {/* Section D: Additional Information */}
              <div className="bg-teal-500 text-white p-3 rounded">
                <h3 className="font-bold">ADDITIONAL INFORMATION</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Do you have prior experience in sales or marketing?</label>
                  <textarea
                    name="previousExperience"
                    value={formData.previousExperience}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Describe your relevant experience..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Are you currently promoting any other company or product?</label>
                  <textarea
                    name="currentlyPromoting"
                    value={formData.currentlyPromoting}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Please provide details if applicable..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred working style:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="workingStyle"
                        value="Full-time"
                        checked={formData.workingStyle === 'Full-time'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Full-time
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="workingStyle"
                        value="Part-time"
                        checked={formData.workingStyle === 'Part-time'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      Part-time
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Link href="/dashboard/agent">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Skip for Now
              </Button>
            </Link>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}