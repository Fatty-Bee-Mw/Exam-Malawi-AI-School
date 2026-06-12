import React, { useState } from 'react';
import { XMarkIcon, CreditCardIcon, CheckIcon } from '@heroicons/react/24/outline';
import paymentService from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';
import { formatApiError, safeRender } from '../utils/errorHandler';

const plans = [
  {
    id: 'daily',
    name: 'Daily',
    price: 250,
    duration: '1 Day',
    features: ['15 questions/day', '5 exams/day', 'Basic AI tutor'],
    popular: false,
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: 1500,
    duration: '7 Days',
    features: ['25 questions/day', '10 exams/day', 'Advanced AI tutor', 'Progress tracking'],
    popular: true,
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 6500,
    duration: '30 Days',
    features: ['45 questions/day', '20 exams/day', 'Advanced AI tutor', 'Progress tracking', 'PDF export', 'Priority support'],
    popular: false,
  },
];

export default function PaymentModal({ isOpen, onClose, onSubscribe }) {
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!currentUser?.id) {
      setError('Please log in to subscribe');
      return;
    }

    setIsProcessing(true);
    setError('');
    setStatusMessage('Initiating payment...');

    try {
      const plan = plans.find((p) => p.id === selectedPlan);
      if (!plan) {
        setError('Invalid plan selected');
        return;
      }

      const createResult = await paymentService.createPayment({
        planId: selectedPlan,
        phoneNumber,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        amount: plan.price,
      });

      setStatusMessage('Approve the payment prompt on your phone. Waiting for confirmation...');

      const result = await paymentService.waitForPayment(createResult.payment_id, currentUser.id);
      const subscription = result.subscription || result;

      if (subscription?.active || result.status === 'completed') {
        onSubscribe(selectedPlan, createResult.payment_id, subscription);
        onClose();
      } else {
        setError('Payment not confirmed yet. Please try again.');
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-secondary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-dark-muted">
        <div className="sticky top-0 bg-dark-secondary border-b border-dark-muted p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-dark-neon-green mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
                <p className="text-gray-400 text-sm">Choose your subscription plan</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => !isProcessing && setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-dark-neon-green bg-dark-neon-green/10'
                    : 'border-dark-muted bg-dark-accent hover:border-dark-neon-green/50'
                } ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-dark-neon-green to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="text-3xl font-bold text-dark-neon-green">
                    K{plan.price.toLocaleString()}
                    <span className="text-sm text-gray-400 font-normal">/{plan.duration}</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-300">
                      <CheckIcon className="h-4 w-4 text-dark-neon-green mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-dark-accent rounded-xl p-6 border border-dark-muted">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number (Airtel Money or TNM Mpamba)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 0991234567 or 0881234567"
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-dark-primary border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-neon-green disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-2">
                You will receive a payment prompt on your phone. We detect Airtel (099/098) or TNM (088) automatically.
              </p>
            </div>

            {statusMessage && (
              <div className="mb-4 p-3 bg-dark-neon-blue/10 border border-dark-neon-blue/50 rounded-lg">
                <p className="text-sm text-dark-neon-blue">
                  {safeRender(statusMessage)}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">
                  {safeRender(error)}
                </p>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={isProcessing || !selectedPlan}
              className="w-full btn-primary text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Waiting for payment...
                </span>
              ) : (
                `Pay K${selectedPlan ? plans.find((p) => p.id === selectedPlan)?.price?.toLocaleString() || '0' : '0'}`
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Secure payment powered by PayChangu. Your plan activates automatically after payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
