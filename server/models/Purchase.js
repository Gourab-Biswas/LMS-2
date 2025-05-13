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
    default: 'completed'
  }
}, { timestamps: true });

// Create the Purchase model
export const Purchase = mongoose.model('Purchase', PurchaseSchema);

// ✅ Helper function to update status and return the full purchase details
export const markPurchaseAsCompleted = async (purchaseId) => {
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { status: 'completed' },
      { new: true } // Return the updated document
    ).populate('userId'); // Populate the userId field to get user details

    return updatedPurchase;
  } catch (error) {
    console.error('Failed to update purchase status:', error);
    throw error;
  }
};

// 💡 Optional: Helper function to fetch purchase details with user info
export const getPurchaseDetailsWithBuyer = async (purchaseId) => {
  try {
    const purchaseDetails = await Purchase.findById(purchaseId).populate('userId');
    return purchaseDetails;
  } catch (error) {
    console.error('Failed to fetch purchase details:', error);
    throw error;
  }
};