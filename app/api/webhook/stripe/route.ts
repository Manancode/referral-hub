import { stripe } from "@/app/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/app/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const customerId = String(session.customer);

      // Find the user based on the Stripe customer ID
      const user = await prisma.user.findUnique({
        where: { stripeCustomerId : customerId },
      });

      if (!user) {
        throw new Error("User not found...");
      }

      // Create the subscription in the database
      await prisma.subscription.create({
        data: {
          stripeSubscriptionId: subscription.id,
          userId: user.id,
          currentPeriodStart: new Date(subscription.current_period_start * 1000), // Convert to Date
          currentPeriodEnd: new Date(subscription.current_period_end * 1000), // Convert to Date
          status: subscription.status,
          planId: subscription.items.data[0].price.id,
          interval: String(subscription.items.data[0].plan.interval),
         
        },
      });
    } else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      // Retrieve the subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (!existingSubscription) {
        // If the subscription does not exist, create it
        const customerId = subscription.customer as string;
        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          throw new Error("User not found...");
        }

        await prisma.subscription.create({
          data: {
            stripeSubscriptionId: subscription.id,
            userId: user.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000), // Convert to Date
            currentPeriodEnd: new Date(subscription.current_period_end * 1000), // Convert to Date
            status: subscription.status,
            planId: subscription.items.data[0].price.id,
            interval: String(subscription.items.data[0].plan.interval),
          },
        });
      } else {
        
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            currentPeriodStart: new Date(subscription.current_period_start * 1000), // Convert to Date
            currentPeriodEnd: new Date(subscription.current_period_end * 1000), // Convert to Dat  
            status: subscription.status,
            planId: subscription.items.data[0].price.id,
            interval: String(subscription.items.data[0].plan.interval),
          },
        });
      }
    }

    return new Response(null, { status: 200 });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response("Webhook error", { status: 400 });
  }
}