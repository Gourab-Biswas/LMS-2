import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'completed' 
  },
}, { timestamps: true });

export const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
async function getCompletedPayments() {
  try {
    const completedPayments = await Purchase.find({ status: 'completed' })
      .populate('courseId')  // populate course details if needed
      .populate('userId');   // populate user details if needed

    return completedPayments;
  } catch (error) {
    console.error('Error fetching completed payments:', error);
    throw error;
  }
}
async function getPendingPayments() {
  try {
    const pendingPayments = await Purchase.find({ status: 'pending' })
      .populate('courseId')  // populate course details if needed
      .populate('userId');   // populate user details if needed

    return pendingPayments;
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    throw error;
  }
}
async function getFailedPayments() {
  try {
    const failedPayments = await Purchase.find({ status: 'failed' })
      .populate('courseId')  // populate course details if needed
      .populate('userId');   // populate user details if needed

    return failedPayments;
  } catch (error) {
    console.error('Error fetching failed payments:', error);
    throw error;
  }
} 
