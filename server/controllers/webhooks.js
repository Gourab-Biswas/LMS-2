import { Webhook } from 'svix';
import Stripe from 'stripe';
import User from '../models/user.js';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------- Clerk Webhooks ----------------------
export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    const { data, type } = req.body;

    switch (type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + ' ' + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        return res.json({});
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + ' ' + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        return res.json({});
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        return res.json({});
      }

      default:
        return res.json({});
    }
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// ---------------------- Stripe Webhooks ----------------------
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        const session = sessions.data[0];
        if (!session?.metadata?.purchaseId) {
          return res.status(400).json({ error: 'Missing session metadata' });
        }

        const purchase = await Purchase.findById(session.metadata.purchaseId);
        if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

        const user = await User.findById(purchase.userId);
        const course = await Course.findById(purchase.courseId);

        if (!user || !course) {
          return res.status(404).json({ error: 'User or course not found' });
        }

        if (!course.enrolledStudents.includes(user._id)) {
          course.enrolledStudents.push(user._id);
          await course.save();
        }

        if (!user.enrolledCourses.includes(course._id)) {
          user.enrolledCourses.push(course._id);
          await user.save();
        }

        purchase.status = 'completed';
        await purchase.save();

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        const session = sessions.data[0];
        if (!session?.metadata?.purchaseId) {
          return res.status(400).json({ error: 'Missing session metadata' });
        }

        const purchase = await Purchase.findById(session.metadata.purchaseId);
        if (!purchase) return res.status(404).json({ error: 'Purchase not found' });

        purchase.status = 'failed';
        await purchase.save();

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};