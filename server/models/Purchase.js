import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: { //  IMPORTANT: Storing Clerk's userId as String
        type: String,
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

const Purchase = mongoose.model('Purchase', PurchaseSchema);

//  --- Purchase Helper Functions ---

//  Create a new purchase record
async function createPurchase(courseId, userId, amount) {
    try {
        const newPurchase = new Purchase({ courseId, userId, amount });
        return await newPurchase.save();
    } catch (error) {
        console.error('Error creating purchase:', error);
        throw error; //  Re-throw to be caught by the caller
    }
}

//  Mark a purchase as completed and populate user details
async function markPurchaseAsCompleted(purchaseId) {
    try {
        const updatedPurchase = await Purchase.findByIdAndUpdate(
            purchaseId,
            { status: 'completed' },
            { new: true } //  Return the modified document
        ).populate({
            path: 'courseId',
            select: 'title' //  Example: Select specific course fields
        }).populate({
            path: 'userId', //  No ref needed, it's a String now
            select: 'name email' //  Example: Select specific user fields
        });

        if (!updatedPurchase) {
            throw new Error('Purchase not found');
        }

        return updatedPurchase;
    } catch (error) {
        console.error('Error marking purchase as completed:', error);
        throw error;
    }
}

//  Get purchase details by ID, with populated course and user
async function getPurchaseDetails(purchaseId) {
    try {
        const purchase = await Purchase.findById(purchaseId)
            .populate({
                path: 'courseId',
                select: 'title'
            })
            .populate({
                path: 'userId',
                select: 'name email'
            });

        if (!purchase) {
            throw new Error('Purchase not found');
        }
        return purchase;
    } catch (error) {
        console.error('Error getting purchase details:', error);
        throw error;
    }
}

export { Purchase, createPurchase, markPurchaseAsCompleted, getPurchaseDetails };