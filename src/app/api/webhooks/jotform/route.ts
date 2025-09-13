import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Dynamic supabase import to avoid build-time initialization
async function getSupabase() {
  const { supabase } = await import('@/lib/supabase');
  return supabase;
}

// Jotform webhook configuration
const JOTFORM_WEBHOOK_SECRET = process.env.JOTFORM_WEBHOOK_SECRET || 'your-webhook-secret';
const ALLOWED_IPS = [
  '54.208.102.37',
  '54.208.102.38', 
  '54.208.102.39',
  '54.208.102.40',
  // Add more Jotform IPs as needed
];

// Store processed submission IDs to prevent duplicates
const processedSubmissions = new Set<string>();

interface JotformSubmission {
  submissionID: string;
  formID: string;
  ip: string;
  created_at: string;
  status: string;
  new: string;
  flag: string;
  notes: string;
  updated_at: string;
  answers: Record<string, {
    name: string;
    order: string;
    text: string;
    type: string;
    answer?: string;
    prettyFormat?: string;
  }>;
}

// Field mapping from Jotform to our Applications table
const FIELD_MAPPING = {
  // Section A - Personal Details
  'full_name': ['3', 'fullName', 'name'], // Common field IDs for name
  'email': ['4', 'email', 'emailAddress'],
  'nric': ['5', 'nric', 'ic', 'identityCard'],
  'date_of_birth': ['6', 'dateOfBirth', 'dob', 'birthDate'],
  'contact_number': ['7', 'phone', 'phoneNumber', 'contactNumber'],
  'gender': ['8', 'gender'],
  'address': ['9', 'address', 'homeAddress'],
  'postcode': ['10', 'postcode', 'postalCode'],
  'city_country': ['11', 'city', 'cityCountry', 'location'],
  'status': ['12', 'maritalStatus', 'status'],
  
  // Section B - Bank Details
  'account_holder_name': ['13', 'accountHolderName', 'bankAccountName'],
  'bank_name': ['14', 'bankName', 'bank'],
  'account_number': ['15', 'accountNumber', 'bankAccountNumber'],
  
  // Section C - Additional Information
  'previous_experience': ['16', 'experience', 'previousExperience'],
  'currently_promoting': ['17', 'currentlyPromoting', 'otherCompanies'],
  'working_style': ['18', 'workingStyle', 'workPreference'],
  
  // Section D - Beneficiary Details
  'beneficiary_full_name': ['19', 'beneficiaryName', 'emergencyContactName'],
  'beneficiary_nric': ['20', 'beneficiaryNric', 'beneficiaryIC'],
  'beneficiary_date_of_birth': ['21', 'beneficiaryDob', 'beneficiaryBirthDate'],
  'beneficiary_postcode': ['22', 'beneficiaryPostcode'],
  'beneficiary_city_country': ['23', 'beneficiaryCity', 'beneficiaryLocation'],
  'beneficiary_relation': ['24', 'relationship', 'beneficiaryRelation'],
  'beneficiary_contact_number': ['25', 'beneficiaryPhone', 'emergencyPhone'],
  'beneficiary_email_address': ['26', 'beneficiaryEmail'],
  'beneficiary_account_holder_name': ['27', 'beneficiaryAccountName'],
  'beneficiary_bank_name': ['28', 'beneficiaryBank'],
  'beneficiary_account_number': ['29', 'beneficiaryAccountNumber'],
  
  // Section E - Authorization
  'declaration': ['30', 'declaration', 'agreement', 'terms'],
  'applicant_signature': ['31', 'signature', 'digitalSignature'],
  'signature_date': ['32', 'signatureDate'],
  'signature_name': ['33', 'signatureName'],
  
  // Referral Information
  'introducer_name': ['34', 'introducerName', 'referrerName'],
  'introducer_id': ['35', 'introducerId', 'referrerId'],
};

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!signature || !JOTFORM_WEBHOOK_SECRET) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', JOTFORM_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Check if IP is allowed
function isAllowedIP(ip: string): boolean {
  // In development, allow all IPs
  if (process.env.NODE_ENV === 'development') return true;
  
  return ALLOWED_IPS.includes(ip);
}

// Extract field value from Jotform answers
function extractFieldValue(answers: Record<string, any>, fieldMappings: string[]): string | null {
  for (const mapping of fieldMappings) {
    // Try direct field ID match
    if (answers[mapping]) {
      const answer = answers[mapping];
      return answer.answer || answer.text || answer.prettyFormat || null;
    }
    
    // Try field name match (case insensitive)
    for (const [key, value] of Object.entries(answers)) {
      if (value.name && value.name.toLowerCase().includes(mapping.toLowerCase())) {
        return value.answer || value.text || value.prettyFormat || null;
      }
    }
  }
  return null;
}

// Map Jotform submission to application data
function mapJotformToApplication(submission: JotformSubmission): any {
  const { answers } = submission;
  const applicationData: any = {
    // Metadata
    jotform_submission_id: submission.submissionID,
    jotform_form_id: submission.formID,
    application_status: 'PENDING',
    kyc_status: 'PENDING',
    created_at: new Date(submission.created_at).toISOString(),
  };
  
  // Map all fields using the field mapping
  for (const [dbField, jotformFields] of Object.entries(FIELD_MAPPING)) {
    const value = extractFieldValue(answers, jotformFields);
    if (value) {
      // Handle special field types
      if (dbField === 'declaration') {
        applicationData[dbField] = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value === '1';
      } else if (dbField.includes('date')) {
        // Try to parse date
        try {
          applicationData[dbField] = new Date(value).toISOString().split('T')[0];
        } catch {
          applicationData[dbField] = value;
        }
      } else {
        applicationData[dbField] = value;
      }
    }
  }
  
  return applicationData;
}

// Store document references
async function storeDocumentReferences(submissionId: string, answers: Record<string, any>) {
  const documents = [];
  
  // Look for file uploads in the answers
  for (const [key, value] of Object.entries(answers)) {
    if (value.type === 'control_fileupload' && value.answer) {
      documents.push({
        submission_id: submissionId,
        field_name: value.name || `field_${key}`,
        file_url: value.answer,
        document_type: getDocumentType(value.name || ''),
        created_at: new Date().toISOString()
      });
    }
  }
  
  if (documents.length > 0) {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from('application_documents')
        .insert(documents);
        
      if (error) {
        console.error('Error storing document references:', error);
      }
    } catch (error) {
      console.error('Error storing documents:', error);
    }
  }
}

// Determine document type from field name
function getDocumentType(fieldName: string): string {
  const name = fieldName.toLowerCase();
  if (name.includes('identity') || name.includes('ic') || name.includes('nric')) return 'identity';
  if (name.includes('address') || name.includes('utility')) return 'address';
  if (name.includes('bank') || name.includes('statement')) return 'bank';
  if (name.includes('agreement') || name.includes('contract')) return 'agreement';
  return 'other';
}

// Log webhook activity
async function logWebhookActivity(type: 'success' | 'error' | 'duplicate', submissionId: string, details: any) {
  try {
    const supabase = await getSupabase();
    await supabase
      .from('webhook_logs')
      .insert({
        webhook_type: 'jotform',
        event_type: type,
        submission_id: submissionId,
        details: details,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error logging webhook activity:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Verify IP allowlist
    if (!isAllowedIP(clientIP)) {
      console.warn(`Webhook request from unauthorized IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Unauthorized IP address' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.text();
    const signature = request.headers.get('x-jotform-signature') || '';
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse submission data
    let submission: JotformSubmission;
    try {
      // Jotform sends data as form-encoded or JSON
      if (request.headers.get('content-type')?.includes('application/json')) {
        submission = JSON.parse(body);
      } else {
        // Parse form data
        const formData = new URLSearchParams(body);
        submission = JSON.parse(formData.get('rawRequest') || '{}');
      }
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      );
    }
    
    // Check for required fields
    if (!submission.submissionID || !submission.answers) {
      console.error('Missing required fields in submission');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check for duplicate submission (idempotency)
    if (processedSubmissions.has(submission.submissionID)) {
      console.log(`Duplicate submission ignored: ${submission.submissionID}`);
      await logWebhookActivity('duplicate', submission.submissionID, { reason: 'Already processed' });
      return NextResponse.json(
        { message: 'Submission already processed' },
        { status: 200 }
      );
    }
    
    // Check database for existing submission
    const supabase = await getSupabase();
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('jotform_submission_id', submission.submissionID)
      .single();
      
    if (existingApplication) {
      console.log(`Submission already exists in database: ${submission.submissionID}`);
      processedSubmissions.add(submission.submissionID);
      await logWebhookActivity('duplicate', submission.submissionID, { reason: 'Already in database' });
      return NextResponse.json(
        { message: 'Submission already exists' },
        { status: 200 }
      );
    }
    
    // Map Jotform data to application format
    const applicationData = mapJotformToApplication(submission);
    
    // Check for duplicate email
    if (applicationData.email) {
      const { data: existingEmail } = await supabase
        .from('applications')
        .select('id, email')
        .eq('email', applicationData.email)
        .single();
        
      if (existingEmail) {
        console.log(`Duplicate email application: ${applicationData.email}`);
        await logWebhookActivity('error', submission.submissionID, { 
          reason: 'Duplicate email', 
          email: applicationData.email 
        });
        return NextResponse.json(
          { error: 'Email already exists in applications' },
          { status: 409 }
        );
      }
    }
    
    // Insert application into database
    const { data: newApplication, error: insertError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select('id, email, full_name')
      .single();
      
    if (insertError) {
      console.error('Error inserting application:', insertError);
      await logWebhookActivity('error', submission.submissionID, { 
        error: insertError.message,
        data: applicationData 
      });
      return NextResponse.json(
        { error: 'Failed to store application' },
        { status: 500 }
      );
    }
    
    // Store document references
    await storeDocumentReferences(submission.submissionID, submission.answers);
    
    // Mark submission as processed
    processedSubmissions.add(submission.submissionID);
    
    // Log successful processing
    await logWebhookActivity('success', submission.submissionID, {
      application_id: newApplication.id,
      email: newApplication.email,
      name: newApplication.full_name
    });
    
    console.log(`Successfully processed application: ${newApplication.id} for ${newApplication.email}`);
    
    return NextResponse.json(
      { 
        message: 'Application processed successfully',
        application_id: newApplication.id
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Jotform webhook endpoint - POST only' },
    { status: 405 }
  );
}