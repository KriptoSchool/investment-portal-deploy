'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle, Shield } from 'lucide-react';
import { useRoleAccess } from '@/contexts/UserContext';

interface InvestorFormData {
  // Basic Information
  salutation: string;
  nameOfIndividual: string;
  companyName: string;
  occupation: string;
  nricPassportNo: string;
  noOfUnitSubscribed: string;
  tier1: boolean;
  tier2: boolean;
  typeOfDividend: string;
  typeOfFunding: string;
  correspondenceAddress: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  
  // Source of Income
  employment: boolean;
  business: boolean;
  savingsInheritance: boolean;
  estimatedAnnualIncome: string;
  yearsOfInvestmentExperience: string;
  politicallyExposedPerson: string;
  
  // Contact Information
  homeContact: string;
  officeContact: string;
  mobileContact: string;
  email: string;
  
  // Emergency Contact
  emergencyContactFullName: string;
  emergencyContactRelationship: string;
  emergencyContactMobile: string;
  emergencyContactEmail: string;
  
  // Nationality/Status
  malaysianBumiputera: boolean;
  malaysianNonBumiputera: boolean;
  nonMalaysian: boolean;
  
  // Race
  malay: boolean;
  indian: boolean;
  chinese: boolean;
  otherRace: boolean;
  otherRaceSpecify: string;
  
  // Gender
  male: boolean;
  female: boolean;
  
  // Bank Details
  bankAccountBeneficiaryName: string;
  bankName: string;
  bankBranch: string;
  country2: string;
  accountNo: string;
  swiftCode: string;
  
  // Declaration
  personalDataProtectionConsent: boolean;
  riskDisclosureConsent: boolean;
  signatureDate: string;
}

export default function InvestorRegistrationPage() {
  const { user, canRegisterInvestors } = useRoleAccess();
  const [formData, setFormData] = useState<InvestorFormData>({
    salutation: '',
    nameOfIndividual: '',
    companyName: '',
    occupation: '',
    nricPassportNo: '',
    noOfUnitSubscribed: '',
    tier1: false,
    tier2: false,
    typeOfDividend: '',
    typeOfFunding: '',
    correspondenceAddress: '',
    postcode: '',
    city: '',
    state: '',
    country: '',
    employment: false,
    business: false,
    savingsInheritance: false,
    estimatedAnnualIncome: '',
    yearsOfInvestmentExperience: '',
    politicallyExposedPerson: '',
    homeContact: '',
    officeContact: '',
    mobileContact: '',
    email: '',
    emergencyContactFullName: '',
    emergencyContactRelationship: '',
    emergencyContactMobile: '',
    emergencyContactEmail: '',
    malaysianBumiputera: false,
    malaysianNonBumiputera: false,
    nonMalaysian: false,
    malay: false,
    indian: false,
    chinese: false,
    otherRace: false,
    otherRaceSpecify: '',
    male: false,
    female: false,
    bankAccountBeneficiaryName: '',
    bankName: '',
    bankBranch: '',
    country2: '',
    accountNo: '',
    swiftCode: '',
    personalDataProtectionConsent: false,
    riskDisclosureConsent: false,
    signatureDate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof InvestorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Investor Registration Submitted:', formData);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const isFormValid = () => {
    return formData.nameOfIndividual && 
           formData.nricPassportNo && 
           formData.email && 
           formData.mobileContact && 
           formData.bankAccountBeneficiaryName &&
           formData.bankName &&
           formData.accountNo &&
           formData.personalDataProtectionConsent &&
           formData.riskDisclosureConsent;
  };

  // Access control check - Admins and authorized consultants can register investors
  if (!canRegisterInvestors) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-red-300 shadow-lg rounded-lg">
          <div className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-black font-medium mb-6">
              You don't have permission to access the investor registration system.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-700">
                <strong>Current Role:</strong> {user?.role || 'Unknown'} {user?.level && `(${user.level})`}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                <strong>Required:</strong> Administrator or authorized consultant access
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white border border-gray-300 shadow-lg">
          <div className="p-12 text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-black mb-4">
                Investor Registration Successful!
              </h1>
              <p className="text-black font-medium text-lg leading-relaxed">
                The investor has been successfully registered in the Aaron M LLP system. 
                All documentation and compliance requirements have been recorded.
              </p>
            </div>
            
            <div className="bg-cyan-50 border border-cyan-200 p-6 mb-8">
              <h3 className="font-semibold text-black mb-3">Next Steps:</h3>
              <div className="space-y-2 text-sm text-black font-medium">
                <p>• Investor profile has been created and activated</p>
                <p>• Investment tier and allocation have been assigned</p>
                <p>• Bank details have been verified and stored</p>
                <p>• Compliance documentation is complete</p>
              </div>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3"
              >
                Register Another Investor
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Access Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-blue-800">
                {user?.role === 'admin' ? 'Administrator Access' : 'Consultant Access'}
              </h2>
              <p className="text-sm text-blue-600">
                You are registering a new investor on behalf of Aaron M LLP • Role: {user?.role} {user?.level && `(${user.level})`}
              </p>
            </div>
          </div>
        </div>

        {/* Form Header */}
        <div className="bg-white border border-gray-300 shadow-sm mb-6">
          <div className="bg-gray-800 text-white p-4">
            <h1 className="text-xl font-bold">
              SUBSCRIPTION FORM
            </h1>
            <h2 className="text-lg">
              INDIVIDUAL
            </h2>
          </div>
          
          <div className="p-4 bg-gray-50 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-black">AARON M PLT</p>
                <p className="text-xs text-black font-medium">PLT 201-234-5678 | 2021-2024-6513</p>
                <p className="text-xs text-black font-medium">aaron.capital</p>
              </div>
              <div className="text-right">
                <div className="flex space-x-4">
                  <label className="text-xs flex items-center">
                    <input type="checkbox" className="mr-1" /> <span className="font-bold text-black">Sukuk Members 1.0</span>
                  </label>
                  <label className="text-xs flex items-center">
                    <input type="checkbox" className="mr-1" /> <span className="font-bold text-black">Sukuk Members 2.0</span>
                  </label>
                </div>
                <p className="text-xs mt-2 font-bold text-black">Form No.: AAMLP-IS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="p-6">
            {/* Basic Information */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-lg font-bold text-black">Salutation</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="DATO" 
                        checked={formData.salutation === 'DATO'}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> DATO
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="DATIN" 
                        checked={formData.salutation === 'DATIN'}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> DATIN
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="MR" 
                        checked={formData.salutation === 'MR'}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> MR
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="MS" 
                        checked={formData.salutation === 'MS'}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> MS
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="salutation" 
                        value="Others" 
                        checked={formData.salutation === 'Others'}
                        onChange={(e) => handleInputChange('salutation', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> Others
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-lg font-normal text-black">Name of Individual *</Label>
                  <Input
                    value={formData.nameOfIndividual}
                    onChange={(e) => handleInputChange('nameOfIndividual', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Company Name</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-lg font-normal text-black">Occupation</Label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">NRIC/Passport No *</Label>
                  <Input
                    value={formData.nricPassportNo}
                    onChange={(e) => handleInputChange('nricPassportNo', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-lg font-normal text-black">No. of Unit Subscribed</Label>
                  <Input
                    value={formData.noOfUnitSubscribed}
                    onChange={(e) => handleInputChange('noOfUnitSubscribed', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-bold text-black">Tier</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.tier1}
                        onCheckedChange={(checked) => handleInputChange('tier1', checked)}
                        className="mr-2 w-5 h-5"
                      /> Tier 1 (5 Years)
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.tier2}
                        onCheckedChange={(checked) => handleInputChange('tier2', checked)}
                        className="mr-2 w-5 h-5"
                      /> Tier 2 (5 Years)
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-lg font-bold text-black">Type of Dividend</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="typeOfDividend" 
                        value="Standard" 
                        checked={formData.typeOfDividend === 'Standard'}
                        onChange={(e) => handleInputChange('typeOfDividend', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> Standard
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="typeOfDividend" 
                        value="Exclusive" 
                        checked={formData.typeOfDividend === 'Exclusive'}
                        onChange={(e) => handleInputChange('typeOfDividend', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> Exclusive
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-lg font-normal text-black">Type of Funding</Label>
                  <Input
                    value={formData.typeOfFunding}
                    onChange={(e) => handleInputChange('typeOfFunding', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="text-lg font-normal text-black">Correspondence Address</Label>
                <Input
                  value={formData.correspondenceAddress}
                  onChange={(e) => handleInputChange('correspondenceAddress', e.target.value)}
                  className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-lg font-normal text-black">Postcode</Label>
                  <Input
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
              </div>
            </div>

            {/* Source of Income */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                 <h3 className="font-bold text-lg text-white">SOURCE OF INCOME</h3>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.employment}
                        onCheckedChange={(checked) => handleInputChange('employment', checked)}
                        className="mr-2"
                      /> Employment
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.business}
                        onCheckedChange={(checked) => handleInputChange('business', checked)}
                        className="mr-2"
                      /> Business
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.savingsInheritance}
                        onCheckedChange={(checked) => handleInputChange('savingsInheritance', checked)}
                        className="mr-2"
                      /> Savings/Inheritance
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Estimated Annual Income</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="estimatedAnnualIncome" 
                        value="<RM300,000" 
                        checked={formData.estimatedAnnualIncome === '<RM300,000'}
                        onChange={(e) => handleInputChange('estimatedAnnualIncome', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> &lt;RM300,000
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="estimatedAnnualIncome" 
                        value="RM300,001-RM500,000" 
                        checked={formData.estimatedAnnualIncome === 'RM300,001-RM500,000'}
                        onChange={(e) => handleInputChange('estimatedAnnualIncome', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> RM300,001-RM500,000
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="estimatedAnnualIncome" 
                        value="RM500,001-RM800,000" 
                        checked={formData.estimatedAnnualIncome === 'RM500,001-RM800,000'}
                        onChange={(e) => handleInputChange('estimatedAnnualIncome', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> RM500,001-RM800,000
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="estimatedAnnualIncome" 
                        value="RM800,001-RM1,000,000" 
                        checked={formData.estimatedAnnualIncome === 'RM800,001-RM1,000,000'}
                        onChange={(e) => handleInputChange('estimatedAnnualIncome', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> RM800,001-RM1,000,000
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="estimatedAnnualIncome" 
                        value=">RM1,000,000" 
                        checked={formData.estimatedAnnualIncome === '>RM1,000,000'}
                        onChange={(e) => handleInputChange('estimatedAnnualIncome', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> &gt;RM1,000,000
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Years of Investment Experience</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="yearsOfInvestmentExperience" 
                        value="<1 Year" 
                        checked={formData.yearsOfInvestmentExperience === '<1 Year'}
                        onChange={(e) => handleInputChange('yearsOfInvestmentExperience', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> &lt;1 Year
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="yearsOfInvestmentExperience" 
                        value="3-5 Years" 
                        checked={formData.yearsOfInvestmentExperience === '3-5 Years'}
                        onChange={(e) => handleInputChange('yearsOfInvestmentExperience', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> 3-5 Years
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="yearsOfInvestmentExperience" 
                        value="1-3 Years" 
                        checked={formData.yearsOfInvestmentExperience === '1-3 Years'}
                        onChange={(e) => handleInputChange('yearsOfInvestmentExperience', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> 1-3 Years
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <input 
                        type="radio" 
                        name="yearsOfInvestmentExperience" 
                        value=">5 Years" 
                        checked={formData.yearsOfInvestmentExperience === '>5 Years'}
                        onChange={(e) => handleInputChange('yearsOfInvestmentExperience', e.target.value)}
                        className="mr-2 w-4 h-4" 
                      /> &gt;5 Years
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <Label className="text-lg font-normal text-black">Politically Exposed Person</Label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center text-base font-normal text-black">
                        <input 
                          type="radio" 
                          name="politicallyExposedPerson" 
                          value="Yes" 
                          checked={formData.politicallyExposedPerson === 'Yes'}
                          onChange={(e) => handleInputChange('politicallyExposedPerson', e.target.value)}
                          className="mr-2 w-4 h-4" 
                        /> Yes
                      </label>
                      <label className="flex items-center text-base font-normal text-black">
                        <input 
                          type="radio" 
                          name="politicallyExposedPerson" 
                          value="No" 
                          checked={formData.politicallyExposedPerson === 'No'}
                          onChange={(e) => handleInputChange('politicallyExposedPerson', e.target.value)}
                          className="mr-2 w-4 h-4" 
                        /> No
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                 <h3 className="font-bold text-lg text-white">CONTACT NO.</h3>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-normal text-black">Home</Label>
                  <Input
                    value={formData.homeContact}
                    onChange={(e) => handleInputChange('homeContact', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Office</Label>
                  <Input
                    value={formData.officeContact}
                    onChange={(e) => handleInputChange('officeContact', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Mobile *</Label>
                  <Input
                    value={formData.mobileContact}
                    onChange={(e) => handleInputChange('mobileContact', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                 <h3 className="font-bold text-lg text-white">EMERGENCY CONTACT</h3>
                </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-lg font-normal text-black">Full Name</Label>
                  <Input
                    value={formData.emergencyContactFullName}
                    onChange={(e) => handleInputChange('emergencyContactFullName', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Relationship</Label>
                  <Input
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Mobile No.</Label>
                  <Input
                    value={formData.emergencyContactMobile}
                    onChange={(e) => handleInputChange('emergencyContactMobile', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div>
                  <Label className="text-lg font-normal text-black">Email</Label>
                  <Input
                    type="email"
                    value={formData.emergencyContactEmail}
                    onChange={(e) => handleInputChange('emergencyContactEmail', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
              </div>
            </div>

            {/* Nationality/Status, Race, Gender */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="bg-cyan-500 text-white p-2 mb-4">
                     <h3 className="font-bold text-lg text-white">NATIONALITY/STATUS</h3>
                   </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.malaysianBumiputera}
                        onCheckedChange={(checked) => handleInputChange('malaysianBumiputera', checked)}
                        className="mr-2"
                      /> Malaysian Bumiputera
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.malaysianNonBumiputera}
                        onCheckedChange={(checked) => handleInputChange('malaysianNonBumiputera', checked)}
                        className="mr-2"
                      /> Malaysian Non-Bumiputera
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.nonMalaysian}
                        onCheckedChange={(checked) => handleInputChange('nonMalaysian', checked)}
                        className="mr-2"
                      /> Non-Malaysian
                    </label>
                  </div>
                </div>
                
                <div>
                  <div className="bg-cyan-500 text-white p-2 mb-4">
                     <h3 className="font-bold text-lg text-white">RACE</h3>
                   </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.malay}
                        onCheckedChange={(checked) => handleInputChange('malay', checked)}
                        className="mr-2"
                      /> Malay
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.indian}
                        onCheckedChange={(checked) => handleInputChange('indian', checked)}
                        className="mr-2"
                      /> Indian
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.chinese}
                        onCheckedChange={(checked) => handleInputChange('chinese', checked)}
                        className="mr-2"
                      /> Chinese
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.otherRace}
                        onCheckedChange={(checked) => handleInputChange('otherRace', checked)}
                        className="mr-2"
                      /> Other (Please Specify)
                    </label>
                    {formData.otherRace && (
                      <Input
                        value={formData.otherRaceSpecify}
                        onChange={(e) => handleInputChange('otherRaceSpecify', e.target.value)}
                        className="mt-1 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                        placeholder="Specify race"
                      />
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="bg-cyan-500 text-white p-2 mb-4">
                     <h3 className="font-bold text-lg text-white">GENDER</h3>
                   </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.male}
                        onCheckedChange={(checked) => handleInputChange('male', checked)}
                        className="mr-2"
                      /> Male
                    </label>
                    <label className="flex items-center text-base font-normal text-black">
                      <Checkbox
                        checked={formData.female}
                        onCheckedChange={(checked) => handleInputChange('female', checked)}
                        className="mr-2"
                      /> Female
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                <h3 className="font-bold text-lg text-white">STANDING PAYMENT INSTRUCTION AND INCOME DISTRIBUTION</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-normal text-black">Bank Account Beneficiary Name *</Label>
                  <Input
                    value={formData.bankAccountBeneficiaryName}
                    onChange={(e) => handleInputChange('bankAccountBeneficiaryName', e.target.value)}
                    className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-lg font-normal text-black">Bank Name *</Label>
                    <Input
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-lg font-normal text-black">Bank Branch</Label>
                    <Input
                      value={formData.bankBranch}
                      onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                      className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-lg font-normal text-black">Country</Label>
                    <Input
                      value={formData.country2}
                      onChange={(e) => handleInputChange('country2', e.target.value)}
                      className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-lg font-normal text-black">Account No *</Label>
                    <Input
                      value={formData.accountNo}
                      onChange={(e) => handleInputChange('accountNo', e.target.value)}
                      className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-lg font-normal text-black">Swift Code</Label>
                    <Input
                      value={formData.swiftCode}
                      onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                      className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                <h3 className="font-bold text-lg text-white">DECLARATION AND SIGNATURE(S)</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 border border-gray-300">
                  <h4 className="font-bold mb-2 text-black">Personal Data Protection Act 2010</h4>
                  <p className="text-sm text-black font-normal mb-4">
                    I hereby confirm receipt of your Individual notice that Personal Data Protection Act 2010 and consent to the processing of my personal data in accordance with your Individual notice and/or privacy policy.
                  </p>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="personalDataProtectionConsent"
                      checked={formData.personalDataProtectionConsent}
                      onCheckedChange={(checked) => handleInputChange('personalDataProtectionConsent', checked)}
                    />
                    <Label htmlFor="personalDataProtectionConsent" className="text-base font-bold text-black">
                      I consent to the Personal Data Protection Act 2010 *
                    </Label>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 border border-gray-300">
                  <p className="text-sm text-black font-normal mb-4">
                    By signing the above YES I AGREE AND UNDERSTAND the risks. I herein confirm that I have read and understood the risk disclosure statement. I acknowledge and understand the risks associated with this Program carries significant risk, including the risk of loss of the entire investment. I understand that I should not invest in mine alone and I absolve the AARON M PLT and its authorized Agent/Representative from any liability.
                  </p>
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="riskDisclosureConsent"
                      checked={formData.riskDisclosureConsent}
                      onCheckedChange={(checked) => handleInputChange('riskDisclosureConsent', checked)}
                    />
                    <Label htmlFor="riskDisclosureConsent" className="text-base font-bold text-black">
                      I acknowledge and understand the risk disclosure statement *
                    </Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-lg font-normal text-black">Signature of the Subscriber</Label>
                    <Input
                      placeholder="Type full name as signature"
                      className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-lg font-normal text-black">Date</Label>
                    <Input
                      type="date"
                      value={formData.signatureDate}
                      onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                      className="mt-2 border-2 border-[#2EE6A6] bg-white text-black font-medium h-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6 border-t border-gray-300">
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="px-12 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering Investor...
                  </>
                ) : (
                  'Register Investor'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}