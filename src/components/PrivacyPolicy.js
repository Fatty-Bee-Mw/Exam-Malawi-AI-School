import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center text-dark-neon-blue hover:text-dark-neon-green transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <div className="flex items-center mb-8">
          <ShieldCheckIcon className="h-12 w-12 text-dark-neon-blue mr-4" />
          <h1 className="text-4xl font-bold neon-text">Privacy Policy</h1>
        </div>

        <div className="bg-dark-secondary rounded-xl p-8 border border-dark-muted space-y-6 text-gray-300">
          <p className="text-sm text-gray-400">Last Updated: November 13, 2025</p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Exam AI Malawi. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              AI-powered exam assistant platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-dark-neon-blue mb-3">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name and email address (when you create an account)</li>
              <li>Login credentials (securely hashed)</li>
              <li>Profile information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-semibold text-dark-neon-blue mb-3 mt-4">Usage Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Questions you ask and exam content you generate</li>
              <li>Study progress and performance metrics</li>
              <li>Subject preferences and learning patterns</li>
              <li>Device information and browser type</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and improve our AI-powered learning services</li>
              <li>Personalize your learning experience</li>
              <li>Track your progress and generate analytics</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Security</h2>
            <p>
              Your data is stored locally in your browser using localStorage technology. We implement appropriate technical 
              and organizational security measures to protect your personal information. However, no method of transmission 
              over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p className="mb-3">We do not sell, trade, or rent your personal information to third parties. We may share information only in these circumstances:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
            <p>
              Our service is intended for students of all ages. If you are under 18, please ensure you have parental 
              consent before using our platform. We do not knowingly collect information from children under 13 without 
              parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than Malawi. We ensure appropriate 
              safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the platform after 
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
            <p className="mb-3">If you have questions about this Privacy Policy, please contact us:</p>
            <div className="bg-dark-accent p-4 rounded-lg">
              <p><strong className="text-dark-neon-blue">Email:</strong> ylikagwa@gmail.com</p>
              <p><strong className="text-dark-neon-blue">Phone:</strong> +265 880 646 248</p>
              <p><strong className="text-dark-neon-blue">Organization:</strong> Fatty AI-Ed-Tech</p>
            </div>
          </section>

          <section className="border-t border-dark-muted pt-6 mt-8">
            <p className="text-sm text-gray-400">
              By using Exam AI Malawi, you acknowledge that you have read and understood this Privacy Policy and agree 
              to its terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
