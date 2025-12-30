# Razorpay Payment Gateway Integration Documentation

## Overview
Successfully integrated Razorpay Payment Gateway into Smart Institute admission system with comprehensive One Time and EMI payment options.

## 🚀 Features Implemented

### 1. Payment Type Selection
- **One Time Payment**: Full course fee payment in single transaction
- **EMI / Installment Payment**: Split course fees into 2, 3, 6, 9, or 12 installments

### 2. Razorpay Integration
- Secure payment processing with Razorpay checkout
- Automatic payment verification
- Digital receipt generation
- Transaction tracking and history

### 3. EMI Management
- Dynamic installment calculation
- Installment schedule preview
- Due date tracking
- Status management (PAID/UNPAID/OVERDUE)

### 4. Role-Based Access Control
- **Super Admin / Admin / Branch Admin**: Full payment control, can modify amounts
- **Reception**: Can initiate payments only
- **Student**: Can view payment history and pay pending installments

## 📁 Files Modified/Created

### Backend Files
```
backend/
├── .env                           # Razorpay credentials added
├── models/
│   ├── Admission.js               # Updated with payment structure
│   ├── Payment.js                 # Enhanced with Razorpay fields
│   └── Installment.js             # New EMI model
├── controllers/
│   └── payment.controller.js      # New payment processing logic
├── routes/
│   └── payments.js                # Updated with Razorpay endpoints
└── testRazorpayIntegration.js     # Comprehensive test script
```

### Frontend Files
```
frontend/src/pages/
└── AdmissionForm.jsx              # Enhanced with payment UI
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Frontend URL (for Razorpay callback)
FRONTEND_URL=http://localhost:5173
```

### Database Schema Updates

#### Admission Model
```javascript
paymentDetails: {
  paymentType: { enum: ['ONE_TIME', 'EMI'], default: 'ONE_TIME' },
  totalFees: Number,
  paidAmount: { default: 0 },
  pendingAmount: Number,
  paymentStatus: { enum: ['PAID', 'PARTIAL', 'PENDING'], default: 'PENDING' },
  paymentMode: { enum: ['Cash', 'Online', 'PhonePe', 'Google Pay', 'Razorpay', 'Other'] },
  razorpayOrderId: String,
  numberOfInstallments: Number,
  installmentAmount: Number
}
```

#### Payment Model
```javascript
{
  admissionId: ObjectId,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paymentType: { enum: ['ONE_TIME', 'EMI', 'REGISTRATION'] },
  isVerified: { default: false },
  verifiedAt: Date
}
```

#### Installment Model
```javascript
{
  admissionId: ObjectId,
  installmentNo: Number,
  amount: Number,
  dueDate: Date,
  status: { enum: ['PAID', 'UNPAID', 'OVERDUE'], default: 'UNPAID' },
  paymentId: ObjectId
}
```

## 🌐 API Endpoints

### Payment Processing
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature

### Installment Management
- `POST /api/payments/installments` - Create EMI schedule
- `GET /api/payments/installments/:admissionId` - Get installment schedule
- `POST /api/payments/installments/:installmentId/pay` - Pay specific installment

### Payment History
- `GET /api/payments/admission/:admissionId` - Get payment history
- `GET /api/payments/stats` - Get payment statistics

## 💳 Payment Flow

### One Time Payment Flow
1. User selects "One Time Payment"
2. System shows total course fees
3. User clicks "Pay & Submit Admission"
4. Admission form is submitted
5. Razorpay checkout opens with course fee amount
6. User completes payment
7. Payment is verified automatically
8. Admission status updated to PAID
9. Receipt generated with payment details

### EMI Payment Flow
1. User selects "EMI / Installment Payment"
2. User selects number of installments (2/3/6/9/12)
3. System calculates installment amounts
4. Installment schedule is displayed
5. User clicks "Pay & Submit Admission"
6. Admission form is submitted
7. Razorpay checkout opens with first installment amount
8. User pays first installment
9. Payment is verified automatically
10. Installment schedule is created in database
11. Admission status updated to PARTIAL
12. Receipt generated with EMI details

## 🔐 Security Features

### Payment Verification
- Razorpay signature verification using HMAC-SHA256
- Server-side payment validation
- Automatic fraud detection

### Data Protection
- Sensitive payment data encrypted
- Razorpay keys stored in environment variables
- No payment data exposed in frontend logs

### Access Control
- Role-based payment permissions
- JWT authentication required
- Admin-only controls for sensitive operations

## 📱 UI/UX Features

### Payment Interface
- Clean, professional payment section
- Real-time EMI calculation
- Interactive installment schedule table
- Visual payment status indicators
- Loading states and error handling

### Receipt Generation
- Comprehensive payment receipts
- Download as text file
- Share functionality
- Payment history tracking

### Role-Based UI
- Admin controls for fee modification
- Student-restricted interface
- Receptionist payment initiation

## 🧪 Testing

### Automated Testing
```bash
# Run comprehensive test suite
cd backend
node testRazorpayIntegration.js
```

### Manual Testing Checklist
1. **Setup**
   - [ ] Backend server running on port 5000
   - [ ] Frontend server running on port 5173
   - [ ] Razorpay test credentials configured

2. **One Time Payment Test**
   - [ ] Select course with fees
   - [ ] Choose "One Time Payment"
   - [ ] Verify total amount display
   - [ ] Complete Razorpay payment
   - [ ] Check receipt generation
   - [ ] Verify payment status

3. **EMI Payment Test**
   - [ ] Select course with fees
   - [ ] Choose "EMI / Installment Payment"
   - [ ] Select installment count
   - [ ] Verify schedule display
   - [ ] Pay first installment
   - [ ] Check installment creation
   - [ ] Verify partial payment status

4. **Role-Based Testing**
   - [ ] Admin can modify fees
   - [ ] Student cannot modify fees
   - [ ] Reception can initiate payments
   - [ ] Permission restrictions working

## 🚀 Deployment Guide

### Production Setup
1. **Razorpay Account**
   - Create Razorpay production account
   - Get production API keys
   - Update .env with production credentials

2. **Environment Configuration**
   ```env
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Database Migration**
   - Run database migration scripts
   - Update existing admission records
   - Create indexes for performance

4. **Frontend Build**
   ```bash
   cd frontend
   npm run build
   ```

5. **Backend Deployment**
   ```bash
   cd backend
   npm start
   ```

## 📊 Monitoring & Analytics

### Payment Metrics
- Transaction success rate
- Payment method distribution
- EMI vs One Time payment ratio
- Revenue tracking by payment type

### Error Tracking
- Payment failure reasons
- Razorpay integration errors
- Verification failures
- Network timeout issues

## 🔧 Troubleshooting

### Common Issues

#### Payment Verification Failed
```
Error: Invalid payment signature
```
**Solution**: Check Razorpay key secret and ensure proper signature verification

#### Order Creation Failed
```
Error: Failed to create payment order
```
**Solution**: Verify Razorpay API keys and network connectivity

#### CORS Issues
```
Error: Razorpay checkout blocked by CORS
```
**Solution**: Ensure frontend URL is whitelisted in Razorpay dashboard

#### Database Connection
```
Error: Admission not found during payment verification
```
**Solution**: Check database connection and admission record creation

### Debug Mode
Enable debug logging:
```env
DEBUG=razorpay:*
```

## 📞 Support

### Razorpay Support
- Documentation: https://razorpay.com/docs/
- Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com/

### Technical Support
- Check logs: `backend/logs/payment.log`
- Test API: Use provided test script
- Database: Verify MongoDB connection

## 🎯 Success Metrics

### Integration Success Indicators
- ✅ Payment orders created successfully
- ✅ Payment verification working
- ✅ EMI schedule generation
- ✅ Receipt generation functional
- ✅ Role-based permissions active
- ✅ Error handling implemented
- ✅ Security measures in place

### Performance Metrics
- Payment processing time < 3 seconds
- Verification response time < 1 second
- UI response time < 500ms
- Database query optimization
- Zero payment data breaches

---

## 🎉 Conclusion

The Razorpay Payment Gateway integration is now complete and fully functional. The Smart Institute admission system supports:

✅ **Secure One Time Payments**
✅ **Flexible EMI Options**  
✅ **Professional Payment Interface**
✅ **Comprehensive Receipt Generation**
✅ **Role-Based Access Control**
✅ **Robust Error Handling**
✅ **Production-Ready Security**

The system is ready for production deployment and can handle real payment transactions with Razorpay's secure infrastructure.
