import React, { useState } from 'react';
import { PricingIcon, CheckIcon } from '../Icons.tsx';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  credits: number;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out Amrikyy AI OS',
    credits: 100,
    features: [
      '100 AI Credits per month',
      'Access to basic AI agents',
      'Image generation (limited)',
      'Text-to-speech (basic voices)',
      'Community support',
      '1 custom agent',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'For power users and creators',
    credits: 5000,
    popular: true,
    features: [
      '5,000 AI Credits per month',
      'All AI agents unlocked',
      'Unlimited image generation',
      'Premium voices & video generation',
      'Priority support',
      'Unlimited custom agents',
      'Advanced workflow automation',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For teams and organizations',
    credits: 25000,
    features: [
      '25,000 AI Credits per month',
      'Everything in Pro',
      'Team collaboration features',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced analytics',
      'White-label options',
    ],
  },
];

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  credits: number;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    date: '2025-01-15',
    description: 'Pro Plan - Monthly Subscription',
    amount: 29,
    credits: 5000,
  },
  {
    id: '2',
    date: '2025-01-10',
    description: 'AI Credits Purchase',
    amount: 10,
    credits: 1000,
  },
];

/**
 * PricingApp - Subscription & Pricing interface
 * Features:
 * - Display pricing tiers (Free, Pro, Enterprise)
 * - Feature comparison table
 * - Upgrade/downgrade functionality
 * - Billing history
 * - AI Credits purchase interface
 */
const PricingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'billing' | 'credits'>('plans');
  const [currentPlan] = useState('free');
  const [creditsToPurchase, setCreditsToPurchase] = useState(1000);

  const creditPackages = [
    { credits: 500, price: 5, bonus: 0 },
    { credits: 1000, price: 10, bonus: 100 },
    { credits: 5000, price: 45, bonus: 1000 },
    { credits: 10000, price: 80, bonus: 3000 },
  ];

  return (
    <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
      {/* Header */}
      <header className="flex-shrink-0 p-6 border-b border-border-color">
        <div className="flex items-center gap-3 mb-4">
          <PricingIcon className="w-8 h-8 text-primary-purple" />
          <h1 className="font-display text-2xl font-bold">Pricing & Billing</h1>
        </div>

        {/* Tabs */}
        <nav className="flex gap-2 bg-black/20 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'plans'
                ? 'bg-primary-purple text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Plans
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'billing'
                ? 'bg-primary-purple text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Billing History
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'credits'
                ? 'bg-primary-purple text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Buy Credits
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-grow overflow-y-auto p-6">
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative bg-bg-secondary rounded-lg p-6 border ${
                    tier.popular
                      ? 'border-primary-purple shadow-lg shadow-primary-purple/20'
                      : 'border-border-color'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-purple text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-text-secondary">/{tier.period}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{tier.description}</p>
                    <div className="mt-3 text-sm">
                      <span className="text-primary-cyan font-semibold">
                        {tier.credits.toLocaleString()} AI Credits
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      currentPlan === tier.id
                        ? 'bg-bg-tertiary text-text-secondary cursor-not-allowed'
                        : tier.popular
                        ? 'bg-primary-purple hover:bg-primary-purple/80 text-white'
                        : 'bg-bg-tertiary hover:bg-primary-purple/20 text-white border border-border-color'
                    }`}
                    disabled={currentPlan === tier.id}
                  >
                    {currentPlan === tier.id ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Billing History</h2>
            <div className="bg-bg-secondary rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-black/20">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">Date</th>
                    <th className="text-left p-4 text-sm font-semibold">Description</th>
                    <th className="text-right p-4 text-sm font-semibold">Amount</th>
                    <th className="text-right p-4 text-sm font-semibold">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRANSACTIONS.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-border-color">
                      <td className="p-4 text-sm text-text-secondary">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">{transaction.description}</td>
                      <td className="p-4 text-sm text-right">${transaction.amount}</td>
                      <td className="p-4 text-sm text-right text-primary-cyan">
                        +{transaction.credits.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Purchase AI Credits</h2>
              <p className="text-text-secondary">
                Top up your AI Credits to continue using premium features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.credits}
                  className={`bg-bg-secondary rounded-lg p-6 border cursor-pointer transition-all ${
                    creditsToPurchase === pkg.credits
                      ? 'border-primary-purple shadow-lg shadow-primary-purple/20'
                      : 'border-border-color hover:border-primary-purple/50'
                  }`}
                  onClick={() => setCreditsToPurchase(pkg.credits)}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {pkg.credits.toLocaleString()}
                    </div>
                    <div className="text-sm text-text-secondary mb-3">AI Credits</div>
                    {pkg.bonus > 0 && (
                      <div className="text-xs text-success mb-3">
                        +{pkg.bonus} Bonus Credits
                      </div>
                    )}
                    <div className="text-2xl font-bold text-primary-cyan">${pkg.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full md:w-auto px-8 py-3 bg-primary-purple hover:bg-primary-purple/80 rounded-lg font-semibold transition-colors">
              Purchase {creditsToPurchase.toLocaleString()} Credits
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PricingApp;