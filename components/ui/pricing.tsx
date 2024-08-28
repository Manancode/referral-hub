import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon } from '@mantine/core'
import Link from 'next/link'
import { useState } from 'react'

const pricingPlans = [
  {
    name: 'Free',
    description: 'Start with essential tools to boost your online presence.',
    monthlyPrice: 0,
    annualPrice: 0,
    link: '/',
    features: [
      'Up to 100 Customers',
      'Basic Analytics',
      'Standard Support',
      'Email notfications',
    ],
  },
  {
    name: 'Basic',
    description:
      'Unlock enhanced features and premium content to supercharge your business.',
    monthlyPrice: 19,
    annualPrice: 190,
    link: '/',
    features: [
      'Up to 1000 Customers',
      'Basic Analytics',
      'Priority Support',
      'Email and SMS Notfications',
      'Customizable Rating Categories' , 
      'Basic Data Integrations' ,
      
    ],
  },
  {
    name: 'Premium',
    description:
      'Ultimate customization and dedicated support for enterprises.',
    monthlyPrice:49,
    annualPrice: 490,
    link: '/',
    features: [
     'Up to 10000 Customers',
      'Advanced Analytics',
      'Priority Support',
      'Email, SMS, Push Notfications',
      'Customizable Rating Categories' , 
      'Advanced Data Integrations' ,
      'Detailed Reports'
    ],
  },
]

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'M' | 'A'>('M')

  const Heading = () => (
    <div className="relative z-10 my-12 flex flex-col items-center justify-center gap-4">
      <div className="flex w-full flex-col items-start justify-center space-y-4 md:items-center">
        <div className="mb-2 inline-block rounded-full bg-red-100 px-2 py-[0.20rem] text-xs font-medium uppercase text-red-500 dark:bg-red-200">
          {' '}
          Pricing
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl dark:text-gray-200">
          Fair pricing, unfair advantage.
        </p>
        <p className="text-md max-w-xl text-gray-700 md:text-center dark:text-gray-300">
          Get started today and take your business to the next level.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBillingCycle('M')}
          className={cn(
            `rounded-lg px-4 py-2 text-sm font-medium `,
            billingCycle === 'M'
              ? 'relative bg-red-500 text-white '
              : 'text-gray-700 hover:bg-red-100 dark:text-gray-300 dark:hover:text-black',
          )}
        >
          Monthly
          {billingCycle === 'M' && <BackgroundShift shiftKey="monthly" />}
        </button>
        <button
          onClick={() => setBillingCycle('A')}
          className={cn(
            `rounded-lg px-4 py-2 text-sm font-medium `,
            billingCycle === 'A'
              ? 'relative bg-red-500 text-white '
              : 'text-gray-700 hover:bg-red-100 dark:text-gray-300 dark:hover:text-black',
          )}
        >
          Annual
          {billingCycle === 'A' && <BackgroundShift shiftKey="annual" />}
        </button>
      </div>
    </div>
  )

  const PricingCards = () => (
    <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row lg:gap-4">
      {pricingPlans.map((plan, index) => (
        <div
          key={index}
          className="w-full rounded-xl border-[1px] border-gray-300 p-6 text-left dark:border-gray-600"
        >
          <p className="mb-1 mt-0 text-sm font-medium uppercase text-red-500">
            {plan.name}
          </p>
          <p className="my-0 mb-6 text-sm text-gray-600">{plan.description}</p>
          <div className="mb-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={billingCycle === 'M' ? 'monthly' : 'annual'}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="my-0 text-3xl font-semibold text-gray-900 dark:text-gray-100"
              >
                <span>
                  ${billingCycle === 'M' ? plan.monthlyPrice : plan.annualPrice}
                </span>
                <span className="text-sm font-medium">
                  /{billingCycle === 'M' ? 'month' : 'year'}
                </span>
              </motion.p>
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                window.open(plan.link)
              }}
              className="mt-8 w-full rounded-lg bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-500/90"
            >
             <Link href='https://commonwaitlist.vercel.app/'>Get started</Link>
            </motion.button>
          </div>
          {plan.features.map((feature, idx) => (
            <div key={idx} className="mb-3 flex items-center gap-2">
              <CheckIcon className="text-red-500" size={18} />
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <section className="relative w-full overflow-hidden  py-12 text-black lg:px-2 lg:py-12">
      <Heading />
      <PricingCards />
    </section>
  )
}

const BackgroundShift = ({ shiftKey }: { shiftKey: string }) => (
  <motion.span
    key={shiftKey}
    layoutId="bg-shift"
    className="absolute inset-0 -z-10 rounded-lg bg-red-500"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
  />
)

export default function PricingPage() {
  return <Pricing />
}