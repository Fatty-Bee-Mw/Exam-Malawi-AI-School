/**
 * Payment service — PayChangu integration via backend API
 */

// In development, use relative URLs (proxied by React dev server)
// In production, use absolute URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

class PaymentService {
  constructor() {
    console.log('Payment Service initialized with base URL:', API_BASE_URL || 'using proxy');
  }

  async createPayment({ planId, phoneNumber, userId, userEmail, userName, amount }) {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/payment/create` : '/api/payment/create';
    console.log('Creating payment at:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: planId,
        phone_number: phoneNumber,
        amount: amount,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Payment initiation failed');
    }
    return data;
  }

  async verifyPayment(paymentId, userId) {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/payment/verify` : '/api/payment/verify';
    console.log('Verifying payment at:', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, user_id: userId }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Payment verification failed');
    }
    return data;
  }

  async getPaymentStatus(paymentId) {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/payment/status/${encodeURIComponent(paymentId)}` : `/api/payment/status/${encodeURIComponent(paymentId)}`;
    console.log('Getting payment status at:', url);
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || 'Could not check payment status');
    }
    return data;
  }

  async getSubscription(userId) {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/payment/subscription/${encodeURIComponent(userId)}` : `/api/payment/subscription/${encodeURIComponent(userId)}`;
    console.log('Getting subscription at:', url);
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || 'Could not load subscription');
    }
    return data.subscription;
  }

  /**
   * Poll until payment completes, fails, or times out.
   */
  async waitForPayment(paymentId, userId, { maxAttempts = 40, intervalMs = 3000 } = {}) {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this.getPaymentStatus(paymentId);

      if (status.status === 'completed' || status.subscription?.active) {
        return status;
      }

      if (['failed', 'cancelled', 'canceled'].includes(status.status)) {
        throw new Error('Payment was not completed. Please try again.');
      }

      const verify = await this.verifyPayment(paymentId, userId);
      if (verify.success && verify.subscription?.active) {
        return verify;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error('Payment timed out. If you approved on your phone, refresh the page in a moment.');
  }
}

const paymentService = new PaymentService();
export default paymentService;
