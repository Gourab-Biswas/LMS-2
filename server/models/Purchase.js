import mongoose from "mongoose";


// Define the Purchase schema
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
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  }
}, { timestamps: true });

// Create the Purchase model
export const Purchase = mongoose.model('Purchase', PurchaseSchema);


// ✅ Helper function to update status after successful payment
export const markPurchaseAsCompleted = async (purchaseId) => {
  try {
    const updated = await Purchase.findByIdAndUpdate(
      purchaseId,
      { status: 'completed' },
      { new: true }
    );
    return updated;
  } catch (error) {
    console.error('Failed to update purchase status:', error);
    throw error;
  }
};