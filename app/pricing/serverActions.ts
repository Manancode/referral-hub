"use server"

import prisma from '../lib/db'
import { getstripesession, stripe } from '../lib/stripe'

export async function createSubscription(userId: string, priceId: string) {
  const dbuser = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      stripeCustomerId: true,
    }
  })

  if (!dbuser?.stripeCustomerId) {
    throw new Error("Unable to get customer id")
  }

  const subscriptionUrl = await getstripesession({
    customerid: dbuser.stripeCustomerId,
    domainurl: process.env.NODE_ENV === "production" ? process.env.PRODUCTION_URL as string : "http://localhost:3000",
    priceid: priceId,
  })

  return subscriptionUrl
}

export async function createCustomerPortal(userId: string) {
  const data = await prisma.subscription.findUnique({
    where: {
      userId,
    },
    select: {
      user: {
        select: {
          stripeCustomerId: true,
        }
      }
    }
  })

  if (!data?.user.stripeCustomerId) {
    throw new Error("Unable to get customer id")
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.user.stripeCustomerId,
    return_url: process.env.NODE_ENV === "production" ? process.env.PRODUCTION_URL as string : "http://localhost:3000/dashboard"
  })

  return session.url
}