'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

interface FormData {
  // Section A - Details of Applicant
  fullName: string;
  nric: string;
  dateOfBirth: string;
  address: string;
  status: string;
  postcode: string;
  gender: string;
  cityCountry: string;
  contactNumber: string;
  email: string;
  introducerName: string;
  introducerID: string;
  
  // Section B - Applicant's Bank Details
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  
  // Section C - Additional Information
  previousExperience: string;
  currentlyPromoting: string;
  workingStyle: string;
  
  // Section D - Beneficiary Details
  beneficiaryFullName: string;
  beneficiaryNRIC: string;
  beneficiaryDateOfBirth: string;
  beneficiaryPostcode: string;
  beneficiaryCityCountry: string;
  beneficiaryRelation: string;
  beneficiaryContactNumber: string;
  beneficiaryEmailAddress: string;
  beneficiaryAccountHolderName: string;
  beneficiaryBankName: string;
  beneficiaryAccountNumber: string;
  
  // Section E - Consultant Authorization
  declaration: boolean;
  applicantSignature: string;
  date: string;
  name: string;
}

export default function ConsultantApplicationPage() {
  const [formData, setFormData] = useState<FormData>({
    // Section A - Details of Applicant
    fullName: '',
    nric: '',
    dateOfBirth: '',
    address: '',
    status: '',
    postcode: '',
    gender: '',
    cityCountry: '',
    contactNumber: '',
    email: '',
    introducerName: '',
    introducerID: '',
    
    // Section B - Applicant's Bank Details
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    
    // Section C - Additional Information
    previousExperience: '',
    currentlyPromoting: '',
    workingStyle: '',
    
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Consultant Application Submitted:', formData);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const isFormValid = () => {
    return formData.fullName && 
           formData.nric && 
           formData.email && 
           formData.contactNumber && 
           formData.accountHolderName &&
           formData.bankName &&
           formData.accountNumber &&
           formData.declaration;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white border border-gray-300 shadow-lg">
          <div className="p-12 text-center">
            <div className="mb-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Application Submitted Successfully!
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Thank you for your interest in joining Aaron M LLP as a Consultant. 
                Your application has been received and is under review.
              </p>
            </div>
            
            <div className="bg-cyan-50 border border-cyan-200 p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Our team will review your application within 3-5 business days</p>
                <p>• Background verification process will be initiated</p>
                <p>• Qualified candidates will be contacted for screening</p>
                <p>• Final interviews will be scheduled</p>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 font-semibold"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-300 shadow-sm mb-6">
          <div className="bg-gray-800 text-white p-4">
            <h1 className="text-xl font-bold">
              APPLICATION FORM
            </h1>
            <h2 className="text-lg">
              CONSULTANT
            </h2>
          </div>
          
          <div className="p-4 bg-gray-50 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">AARON M PLT</p>
                <p className="text-xs text-gray-600">PLT 201-234-5678 | 2021-2024-6513</p>
                <p className="text-xs text-gray-600">aaron.capital</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">FOR OFFICE USE</p>
                <div className="mt-2 space-y-1">
                  <div className="flex space-x-4">
                    <span className="text-xs">Application Status:</span>
                  </div>
                  <div className="flex space-x-4">
                    <label className="text-xs flex items-center">
                      <input type="checkbox" className="mr-1" /> Accepted
                    </label>
                    <label className="text-xs flex items-center">
                      <input type="checkbox" className="mr-1" /> Rejected
                    </label>
                  </div>
                  <div className="text-xs mt-2">
                    <span>HR Department: ___________</span>
                    <span className="ml-4">CEO/COO: ___________</span>
                  </div>
                  <div className="text-xs">
                    <span>Date: ___________</span>
                    <span className="ml-4">Date: ___________</span>
                  </div>
                  <div className="text-xs mt-1">
                    <span>Pending/Additional Information/</span>
                    <span>Document required:</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="p-6">
            {/* Section A - Details of Applicant */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                <h3 className="font-bold text-sm">A. DETAILS OF APPLICANT</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Full Name *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">NRIC *</Label>
                  <Input
                    value={formData.nric}
                    onChange={(e) => handleInputChange('nric', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <div className="flex space-x-1 mt-1">
                    <Input placeholder="D" className="w-8 border border-gray-300" />
                    <Input placeholder="D" className="w-8 border border-gray-300" />
                    <Input placeholder="M" className="w-8 border border-gray-300" />
                    <Input placeholder="M" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="text-sm font-medium">Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1 border border-gray-300"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex space-x-4 mt-1">
                    <label className="flex items-center text-xs">
                      <input 
                        type="radio" 
                        name="status" 
                        value="Single" 
                        checked={formData.status === 'Single'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="mr-1" 
                      /> Single
                    </label>
                    <label className="flex items-center text-xs">
                      <input 
                        type="radio" 
                        name="status" 
                        value="Married" 
                        checked={formData.status === 'Married'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="mr-1" 
                      /> Married
                    </label>
                    <label className="flex items-center text-xs">
                      <input 
                        type="radio" 
                        name="status" 
                        value="Divorce" 
                        checked={formData.status === 'Divorce'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="mr-1" 
                      /> Divorce
                    </label>
                    <label className="flex items-center text-xs">
                      <input 
                        type="radio" 
                        name="status" 
                        value="Others" 
                        checked={formData.status === 'Others'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="mr-1" 
                      /> Others
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Postcode</Label>
                  <Input
                    value={formData.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <div className="flex space-x-4 mt-1">
                    <label className="flex items-center text-xs">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="Male" 
                        checked={formData.gender === 'Male'}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="mr-1" 
                      /> Male
                    </label>
                    <label className="flex items-center text-xs">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="Female" 
                        checked={formData.gender === 'Female'}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="mr-1" 
                      /> Female
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">City/Country</Label>
                  <Input
                    value={formData.cityCountry}
                    onChange={(e) => handleInputChange('cityCountry', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Contact Number *</Label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 border border-gray-300"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Introducer Name</Label>
                  <Input
                    value={formData.introducerName}
                    onChange={(e) => handleInputChange('introducerName', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Introducer ID</Label>
                  <Input
                    value={formData.introducerID}
                    onChange={(e) => handleInputChange('introducerID', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Section B - Applicant's Bank Details */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                <h3 className="font-bold text-sm">B. APPLICANT'S BANK DETAILS</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Account Holder Name *</Label>
                  <Input
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Bank Name *</Label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Account Number *</Label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Section C - Additional Information */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                <h3 className="font-bold text-sm">C. ADDITIONAL INFORMATION</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">1. Do you have prior experience in sales or marketing?</Label>
                  <textarea
                    value={formData.previousExperience}
                    onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                    className="mt-1 w-full border border-gray-300 p-2 h-20 resize-none"
                    placeholder="Please describe your experience..."
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">2. Are you currently promoting any other company or product?</Label>
                  <textarea
                    value={formData.currentlyPromoting}
                    onChange={(e) => handleInputChange('currentlyPromoting', e.target.value)}
                    className="mt-1 w-full border border-gray-300 p-2 h-20 resize-none"
                    placeholder="Please provide details..."
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">3. Preferred working style:</Label>
                  <div className="flex space-x-6 mt-2">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="workingStyle" 
                        value="Full-time" 
                        checked={formData.workingStyle === 'Full-time'}
                        onChange={(e) => handleInputChange('workingStyle', e.target.value)}
                        className="mr-2" 
                      /> Full-time
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="workingStyle" 
                        value="Part-time" 
                        checked={formData.workingStyle === 'Part-time'}
                        onChange={(e) => handleInputChange('workingStyle', e.target.value)}
                        className="mr-2" 
                      /> Part-time
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section D - Beneficiary Details */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                <h3 className="font-bold text-sm">D. BENEFICIARY DETAILS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <Input
                    value={formData.beneficiaryFullName}
                    onChange={(e) => handleInputChange('beneficiaryFullName', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">NRIC</Label>
                  <Input
                    value={formData.beneficiaryNRIC}
                    onChange={(e) => handleInputChange('beneficiaryNRIC', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <div className="flex space-x-1 mt-1">
                    <Input placeholder="D" className="w-8 border border-gray-300" />
                    <Input placeholder="D" className="w-8 border border-gray-300" />
                    <Input placeholder="M" className="w-8 border border-gray-300" />
                    <Input placeholder="M" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                    <Input placeholder="Y" className="w-8 border border-gray-300" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Postcode</Label>
                  <Input
                    value={formData.beneficiaryPostcode}
                    onChange={(e) => handleInputChange('beneficiaryPostcode', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">City/Country</Label>
                  <Input
                    value={formData.beneficiaryCityCountry}
                    onChange={(e) => handleInputChange('beneficiaryCityCountry', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Relation</Label>
                  <Input
                    value={formData.beneficiaryRelation}
                    onChange={(e) => handleInputChange('beneficiaryRelation', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Contact Number</Label>
                  <Input
                    value={formData.beneficiaryContactNumber}
                    onChange={(e) => handleInputChange('beneficiaryContactNumber', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    value={formData.beneficiaryEmailAddress}
                    onChange={(e) => handleInputChange('beneficiaryEmailAddress', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Account Holder Name</Label>
                  <Input
                    value={formData.beneficiaryAccountHolderName}
                    onChange={(e) => handleInputChange('beneficiaryAccountHolderName', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Bank Name</Label>
                  <Input
                    value={formData.beneficiaryBankName}
                    onChange={(e) => handleInputChange('beneficiaryBankName', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Account Number</Label>
                  <Input
                    value={formData.beneficiaryAccountNumber}
                    onChange={(e) => handleInputChange('beneficiaryAccountNumber', e.target.value)}
                    className="mt-1 border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Section E - Consultant Authorization */}
            <div className="mb-6">
              <div className="bg-cyan-500 text-white p-2 mb-4">
                <h3 className="font-bold text-sm">E. CONSULTANT AUTHORIZATION</h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-sm leading-relaxed">
                  <p className="mb-4">
                    I hereby constitute the above-mentioned person as my beneficiary, and I declare that the information 
                    provided herein is true, complete and accurate to the best of my knowledge. I understand that any 
                    false, incomplete or inaccurate information may result in the rejection of this application or 
                    termination of any business relationship. I also acknowledge that providing false, misleading or incomplete information 
                    may have legal consequences.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="declaration"
                    checked={formData.declaration}
                    onCheckedChange={(checked) => handleInputChange('declaration', checked)}
                  />
                  <Label htmlFor="declaration" className="text-sm">
                    I hereby constitute the above-mentioned person as my beneficiary, and I declare that the information 
                    provided herein is true, complete and accurate to the best of my knowledge. *
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label className="text-sm font-medium">Applicant Signature</Label>
                    <Input
                      value={formData.applicantSignature}
                      onChange={(e) => handleInputChange('applicantSignature', e.target.value)}
                      className="mt-1 border border-gray-300"
                      placeholder="Type your full name as signature"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <div className="flex space-x-1 mt-1">
                      <Input placeholder="D" className="w-8 border border-gray-300" />
                      <Input placeholder="D" className="w-8 border border-gray-300" />
                      <Input placeholder="M" className="w-8 border border-gray-300" />
                      <Input placeholder="M" className="w-8 border border-gray-300" />
                      <Input placeholder="Y" className="w-8 border border-gray-300" />
                      <Input placeholder="Y" className="w-8 border border-gray-300" />
                      <Input placeholder="Y" className="w-8 border border-gray-300" />
                      <Input placeholder="Y" className="w-8 border border-gray-300" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 border border-gray-300"
                    placeholder="**Kindly provide a copy of the consultant's I.C. for front & back page of the form submitted for verification purposes."
                  />
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
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}