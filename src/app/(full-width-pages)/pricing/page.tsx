import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | AttendFlow - Attendance & Sync Management",
  description: "Flexible pricing plans for AttendFlow - Modern attendance and sync management platform",
};

// Dummy pricing tiers
const pricingTiers = [
  {
    id: 1,
    name: "Starter",
    range: "0 - 100",
    minUsers: 0,
    maxUsers: 100,
    pricePerUser: 8,
    description: "Perfect for small teams getting started",
    features: [
      "Up to 100 active users",
      "Real-time attendance sync",
      "Basic reporting",
      "Email support",
      "99.9% uptime SLA",
    ],
    highlighted: false,
  },
  {
    id: 2,
    name: "Growth",
    range: "100 - 500",
    minUsers: 100,
    maxUsers: 500,
    pricePerUser: 6,
    description: "Ideal for growing organizations",
    features: [
      "Up to 500 active users",
      "Real-time attendance sync",
      "Advanced reporting & analytics",
      "Priority email support",
      "99.9% uptime SLA",
      "Custom integrations",
    ],
    highlighted: true,
  },
  {
    id: 3,
    name: "Professional",
    range: "500 - 1000",
    minUsers: 500,
    maxUsers: 1000,
    pricePerUser: 5,
    description: "For established businesses",
    features: [
      "Up to 1000 active users",
      "Real-time attendance sync",
      "Advanced reporting & analytics",
      "Priority support with SLA",
      "99.99% uptime SLA",
      "Custom integrations",
      "Dedicated account manager",
    ],
    highlighted: false,
  },
  {
    id: 4,
    name: "Enterprise",
    range: "1000 - 3000",
    minUsers: 1000,
    maxUsers: 3000,
    pricePerUser: 4,
    description: "For large-scale operations",
    features: [
      "Up to 3000 active users",
      "Real-time attendance sync",
      "Enterprise reporting & analytics",
      "24/7 priority support",
      "99.99% uptime SLA",
      "Custom integrations",
      "Dedicated account manager",
      "Custom API access",
    ],
    highlighted: false,
  },
  {
    id: 5,
    name: "Enterprise Plus",
    range: "3000+",
    minUsers: 3000,
    maxUsers: null,
    pricePerUser: null,
    description: "Custom solutions for enterprise needs",
    features: [
      "Unlimited active users",
      "Real-time attendance sync",
      "Custom reporting & analytics",
      "24/7 dedicated support team",
      "99.99% uptime SLA",
      "Unlimited custom integrations",
      "Dedicated success team",
      "Custom API access",
      "On-premise deployment option",
    ],
    highlighted: false,
    contactUs: true,
  },
];

export default function PricingPage() {
  const calculatePrice = (tier: typeof pricingTiers[0], users: number) => {
    if (tier.contactUs) return "Contact Us";
    return `$${(tier.pricePerUser! * users).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Pay only for active users. No hidden fees.
              </p>
            </div>
            <Link
              href="/signin"
              className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Pricing Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                How we count active users
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  An active user is anyone whose attendance data was fetched during the billing month
                  (1st to end of month). You only pay for users who actually use the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-5">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl border ${
                tier.highlighted
                  ? "border-brand-600 shadow-xl scale-105 z-10"
                  : "border-gray-200 dark:border-gray-700"
              } bg-white dark:bg-gray-800 p-6 flex flex-col`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-brand-600 text-white whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {tier.description}
                </p>

                <div className="mt-4">
                  <div className="flex items-baseline">
                    {tier.contactUs ? (
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${tier.pricePerUser}
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          /user/month
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {tier.range} active users
                  </p>
                </div>

                {/* Example Pricing */}
                {!tier.contactUs && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Example monthly cost:
                    </p>
                    <div className="space-y-1">
                      {tier.minUsers > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {tier.minUsers} users:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {calculatePrice(tier, tier.minUsers)}
                          </span>
                        </div>
                      )}
                      {tier.maxUsers && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {tier.maxUsers} users:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {calculatePrice(tier, tier.maxUsers)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                {tier.contactUs ? (
                  <a
                    href="mailto:sales@attendflow.com"
                    className="block w-full text-center px-6 py-3 border border-brand-600 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                  >
                    Contact Sales
                  </a>
                ) : (
                  <Link
                    href="/signin"
                    className={`block w-full text-center px-6 py-3 rounded-lg transition-colors ${
                      tier.highlighted
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What counts as an active user?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              An active user is any employee whose attendance data was fetched from your attendance
              system during the billing month (from the 1st to the end of the month).
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Can I change my plan?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes! Your plan automatically adjusts based on the number of active users each month.
              You're always on the most cost-effective tier for your usage.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Is there a setup fee?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No setup fees, no hidden costs. You only pay for the active users each month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
