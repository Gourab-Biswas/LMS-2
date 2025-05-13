// webhooks.js
import {Webhook} from 'svix'
import User from '../models/user.js';
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';


export const clerkWebhooks = async (req,res)=>{
    // ... (rest of your clerkWebhooks function remains the same)
}


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async (request,response)=>{
     const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }
  catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

// Handle the event
  switch (event.type) {
    case 'checkout.session.completed': { // Changed event type
      const session = event.data.object;
      const purchaseId = session.metadata.PurchaseId; // Access metadata directly from the session

      if (purchaseId) {
        try {
          const purchaseData = await Purchase.findById(purchaseId);
          const userData = await User.findById(purchaseData.userId);
          const courseData = await Course.findById(purchaseData.courseId.toString());

          if (purchaseData && userData && courseData) {
            // Ensure the student is not already enrolled
            if (!courseData.enrolledStudents.includes(userData._id)) {
              courseData.enrolledStudents.push(userData._id);
              await courseData.save();
            }

            if (!userData.enrolledCourses.includes(courseData._id)) {
              userData.enrolledCourses.push(courseData._id);
              await userData.save();
            }

            purchaseData.status = 'completed';
            await purchaseData.save();
            console.log(`Purchase ${purchaseId} marked as completed and user enrolled.`);
          } else {
            console.error(`Could not find Purchase, User, or Course for ID: ${purchaseId}`);
          }
        } catch (error) {
          console.error('Error processing completed checkout:', error);
        }
      } else {
        console.warn('Purchase ID not found in checkout session metadata.');
      }
      break;
    }
    case 'checkout.session.async_payment_succeeded': {
      // For asynchronous payment methods like SEPA Direct Debit, iDEAL, etc.
      const session = event.data.object;
      const purchaseId = session.metadata.PurchaseId;

      if (purchaseId) {
        try {
          const purchaseData = await Purchase.findById(purchaseId);
          if (purchaseData) {
            purchaseData.status = 'completed';
            await purchaseData.save();
            console.log(`Async Payment for Purchase ${purchaseId} succeeded.`);
          } else {
            console.error(`Could not find Purchase for ID: ${purchaseId}`);
          }
        } catch (error) {
          console.error('Error processing async payment succeeded:', error);
        }
      } else {
        console.warn('Purchase ID not found in async payment succeeded session metadata.');
      }
      break;
    }
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object;
      const purchaseId = session.metadata.PurchaseId;

      if (purchaseId) {
        try {
          const purchaseData = await Purchase.findById(purchaseId);
          if (purchaseData) {
            purchaseData.status = 'failed';
            await purchaseData.save();
            console.log(`Async Payment for Purchase ${purchaseId} failed.`);
          } else {
            console.error(`Could not find Purchase for ID: ${purchaseId}`);
          }
        } catch (error) {
          console.error('Error processing async payment failed:', error);
        }
      } else {
        console.warn('Purchase ID not found in async payment failed session metadata.');
      }
      break;
    }
    case 'payment_intent.succeeded':
      // You might not need to handle this separately if you handle 'checkout.session.completed'
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // It's better to rely on checkout.session.completed/failed for order fulfillment
      console.log(`PaymentIntent failed for: ${paymentIntentId}`);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});

}