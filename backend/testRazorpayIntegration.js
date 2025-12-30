// Test Script for Razorpay Payment Integration
// Run this script to test the complete payment flow

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let admissionId = '';
let paymentOrderId = '';

// Test user credentials (adjust as needed)
const testUser = {
  email: 'admin@smartinstitute.com',
  password: 'admin123'
};

async function testPaymentFlow() {
  console.log('🚀 Starting Razorpay Payment Integration Test...\n');

  try {
    // Step 1: Login
    console.log('📝 Step 1: Testing Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Test Razorpay Order Creation
    console.log('\n💳 Step 2: Testing Razorpay Order Creation...');
    const orderResponse = await axios.post(
      `${API_BASE}/payments/create-order`,
      {
        amount: 1000, // ₹10
        currency: 'INR',
        receipt: 'TEST-001',
        notes: {
          test: 'payment_flow',
          admissionId: 'test_admission_id'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    
    paymentOrderId = orderResponse.data.order.id;
    console.log('✅ Razorpay order created:', paymentOrderId);
    console.log('📊 Order details:', JSON.stringify(orderResponse.data.order, null, 2));

    // Step 3: Test Payment Verification (mock)
    console.log('\n🔍 Step 3: Testing Payment Verification...');
    console.log('⚠️  Note: This would normally be called after actual Razorpay payment');
    
    // Mock verification data
    const mockVerificationData = {
      razorpay_order_id: paymentOrderId,
      razorpay_payment_id: 'pay_test_payment_id',
      razorpay_signature: 'test_signature',
      admissionId: 'test_admission_id',
      paymentType: 'ONE_TIME',
      installmentNumber: 1
    };
    
    console.log('📝 Mock verification data prepared');
    console.log('🔗 To test actual verification, complete a real payment first');

    // Step 4: Test Installment Creation
    console.log('\n📅 Step 4: Testing Installment Creation...');
    const installmentResponse = await axios.post(
      `${API_BASE}/payments/installments`,
      {
        admissionId: 'test_admission_id',
        numberOfInstallments: 3,
        installmentAmount: 333.33,
        firstInstallmentDate: new Date()
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    console.log('✅ Installments created successfully');

    // Step 5: Test Payment History
    console.log('\n📋 Step 5: Testing Payment History...');
    const historyResponse = await axios.get(
      `${API_BASE}/payments/admission/test_admission_id`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    console.log('✅ Payment history retrieved');

    // Step 6: Test Installment Schedule
    console.log('\n📊 Step 6: Testing Installment Schedule...');
    const scheduleResponse = await axios.get(
      `${API_BASE}/payments/installments/test_admission_id`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    console.log('✅ Installment schedule retrieved');

    // Step 7: Test Payment Statistics
    console.log('\n📈 Step 7: Testing Payment Statistics...');
    const statsResponse = await axios.get(
      `${API_BASE}/payments/stats`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );
    console.log('✅ Payment statistics retrieved');
    console.log('📊 Stats:', JSON.stringify(statsResponse.data, null, 2));

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Authentication');
    console.log('✅ Razorpay Order Creation');
    console.log('✅ Installment Creation');
    console.log('✅ Payment History');
    console.log('✅ Installment Schedule');
    console.log('✅ Payment Statistics');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Hint: Check your login credentials');
    }
    if (error.response?.status === 403) {
      console.log('💡 Hint: Check user permissions');
    }
  }
}

// Test frontend integration checklist
function checkFrontendIntegration() {
  console.log('\n🌐 Frontend Integration Checklist:');
  console.log('□ Razorpay script loaded in frontend');
  console.log('□ Payment type selection working');
  console.log('□ EMI calculation functional');
  console.log('□ Installment schedule display');
  console.log('□ Razorpay checkout opens');
  console.log('□ Payment verification completes');
  console.log('□ Receipt generation works');
  console.log('□ Role-based permissions applied');
}

// Database models verification
function checkDatabaseModels() {
  console.log('\n🗄️  Database Models Checklist:');
  console.log('□ Admission model updated with payment fields');
  console.log('□ Payment model with Razorpay fields');
  console.log('□ Installment model created');
  console.log('□ Database indexes created');
  console.log('□ Pre-save middleware working');
}

// Configuration verification
function checkConfiguration() {
  console.log('\n⚙️  Configuration Checklist:');
  console.log('□ Razorpay keys in .env file');
  console.log('□ Backend routes registered');
  console.log('□ CORS configured for frontend');
  console.log('□ Payment controller functions');
  console.log('□ Error handling implemented');
}

// Run all checks
async function runCompleteTest() {
  await testPaymentFlow();
  checkFrontendIntegration();
  checkDatabaseModels();
  checkConfiguration();
  
  console.log('\n🎯 Integration Complete!');
  console.log('📖 For manual testing:');
  console.log('1. Start backend server: npm start');
  console.log('2. Start frontend server: npm run dev');
  console.log('3. Navigate to admission form');
  console.log('4. Test One Time Payment flow');
  console.log('5. Test EMI Payment flow');
  console.log('6. Verify receipt generation');
  console.log('7. Check payment history');
}

// Execute the test
if (require.main === module) {
  runCompleteTest();
}

module.exports = { testPaymentFlow, runCompleteTest };
