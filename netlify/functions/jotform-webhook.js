// JotForm Webhook Handler
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase (adjust based on your env setup)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
);

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'JotForm Webhook Endpoint Active',
      status: 'ready',
      endpoint: '/api/jotform-webhook',
      methods: ['POST'],
      description: 'This endpoint receives JotForm submissions and imports consultants'
    });
  }

  if (req.method === 'POST') {
    try {
      console.log('🔔 JotForm webhook received!');
      
      // Get form data from JotForm
      const formData = req.body;
      console.log('📋 Raw JotForm data:', formData);
      
      // Extract consultant information from JotForm fields
      const extractedData = {
        full_name: formData.q1_fullName || 
                  formData.q1_name || 
                  formData.fullName || 
                  formData.name || 
                  'Unknown Name',
        email: formData.q2_email || 
               formData.q2_emailAddress || 
               formData.email || 
               formData.emailAddress || 
               'unknown@example.com',
        role: 'consultant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Extracted consultant data:', extractedData);
      
      // Check if consultant already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', extractedData.email)
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ Error checking existing user:', checkError);
        return res.status(500).json({
          error: 'Database check failed',
          details: checkError.message
        });
      }
      
      if (existingUser) {
        console.log('⚠️ Consultant already exists:', extractedData.email);
        return res.status(200).json({
          success: true,
          message: 'Consultant already exists in system',
          data: extractedData
        });
      }
      
      // Insert new consultant
      const { data: insertedUser, error: insertError } = await supabase
        .from('user_profiles')
        .insert([extractedData])
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error inserting consultant:', insertError);
        return res.status(500).json({
          error: 'Failed to insert consultant',
          details: insertError.message
        });
      }
      
      console.log('🎉 Successfully imported consultant:', insertedUser);
      
      return res.status(200).json({
        success: true,
        message: 'Consultant imported successfully',
        data: insertedUser
      });
      
    } catch (error) {
      console.error('💥 Webhook processing error:', error);
      return res.status(500).json({
        error: 'Webhook processing failed',
        details: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
