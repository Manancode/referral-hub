import Stripe from "stripe";

// Initialize Stripe client with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20",
    typescript: true
});

// Function to create a checkout session
export const getstripesession = async ({ priceid, domainurl, customerid }: {
    priceid: string;
    domainurl: string;
    customerid: string;
}) => {
    try {
        const session = await stripe.checkout.sessions.create({
            customer: customerid,
            mode: "subscription",
            billing_address_collection: "auto",
            line_items: [{ price: priceid, quantity: 1 }],
            payment_method_types: ['card'],
            customer_update: {
                address: "auto",
                name: "auto"
            },
            success_url: `${domainurl}/payment/success`,
            cancel_url: `${domainurl}/payment/cancelled`
        });

        return session.url as string; // Return the checkout session URL
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error; // Propagate the error for handling in the calling function
    }
};