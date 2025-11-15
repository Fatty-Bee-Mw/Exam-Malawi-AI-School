import React from 'react';
import { Link } from 'react-router-dom';
import { Square3Stack3DIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CookiePolicy() {
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
          <Square3Stack3DIcon className="h-12 w-12 text-dark-neon-green mr-4" />
          <h1 className="text-4xl font-bold neon-text">Cookie Policy</h1>
        </div>

        <div className="bg-dark-secondary rounded-xl p-8 border border-dark-muted space-y-6 text-gray-300">
          <p className="text-sm text-gray-400">Last Updated: November 13, 2025</p>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit 
              a website. They help websites remember your preferences and provide a personalized experience. Cookies do not 
              contain personal information that can identify you directly, but they can store information about your 
              browsing activities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Cookies</h2>
            <p>
              Exam AI Malawi uses cookies and similar technologies (collectively referred to as "cookies") to enhance your 
              experience, understand how you use our Service, and improve our platform. We primarily use browser localStorage 
              rather than traditional cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Types of Technologies We Use</h2>
            
            <h3 className="text-xl font-semibold text-dark-neon-blue mb-3">Essential Technologies</h3>
            <p className="mb-2">These are necessary for the Service to function properly:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>localStorage:</strong> Stores your account information, preferences, and study progress locally in your browser</li>
              <li><strong>Session Data:</strong> Keeps you logged in during your visit</li>
              <li><strong>Security:</strong> Helps prevent fraud and ensure platform security</li>
            </ul>

            <h3 className="text-xl font-semibold text-dark-neon-blue mb-3 mt-4">Functional Technologies</h3>
            <p className="mb-2">These enhance your experience by remembering your choices:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>User Preferences:</strong> Remember your settings like theme preferences</li>
              <li><strong>Study Progress:</strong> Track your learning progress and performance</li>
              <li><strong>Subject Selection:</strong> Remember your preferred subjects</li>
            </ul>

            <h3 className="text-xl font-semibold text-dark-neon-blue mb-3 mt-4">Analytics Technologies (Optional)</h3>
            <p className="mb-2">Help us understand how users interact with our Service:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Usage Statistics:</strong> Anonymous data about how you use the platform</li>
              <li><strong>Performance Monitoring:</strong> Identify and fix technical issues</li>
              <li><strong>Feature Analytics:</strong> Understand which features are most valuable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Technologies</h2>
            <p>
              We may use third-party services that set their own cookies or use similar technologies. These services include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong>Analytics Services:</strong> To understand platform usage (e.g., Google Analytics if enabled)</li>
              <li><strong>Payment Processors:</strong> For secure payment processing (premium subscriptions)</li>
              <li><strong>Customer Support:</strong> To provide better customer service</li>
            </ul>
            <p className="mt-3">
              These third parties have their own privacy policies and cookie policies. We recommend reviewing their policies 
              to understand how they use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. localStorage vs. Traditional Cookies</h2>
            <p>
              Exam AI Malawi primarily uses <strong>localStorage</strong>, which is a modern web storage technology that differs 
              from traditional cookies:
            </p>
            <div className="bg-dark-accent p-4 rounded-lg mt-3 space-y-2">
              <p><strong className="text-dark-neon-green">✓ localStorage Benefits:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Stores larger amounts of data (5-10MB vs 4KB for cookies)</li>
                <li>Data never expires unless manually deleted</li>
                <li>Data is not sent to the server with every request (faster performance)</li>
                <li>More secure as data stays on your device</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. How We Store Your Data</h2>
            <p>The following information is stored in your browser's localStorage:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong>User Profile:</strong> Your email, name, and account preferences</li>
              <li><strong>Study Data:</strong> Your progress, scores, and learning history</li>
              <li><strong>Usage Limits:</strong> Track free tier limits (questions per day, exams per day)</li>
              <li><strong>Settings:</strong> Your personalized settings and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Managing Cookies and localStorage</h2>
            
            <h3 className="text-xl font-semibold text-dark-neon-blue mb-3">Browser Settings</h3>
            <p className="mb-3">You can control and manage cookies through your browser settings:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold text-dark-neon-blue mb-3 mt-4">Clear localStorage</h3>
            <p>To clear localStorage for Exam AI Malawi:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4 mt-2">
              <li>Open your browser's Developer Tools (F12 key)</li>
              <li>Go to the "Application" or "Storage" tab</li>
              <li>Find "Local Storage" in the sidebar</li>
              <li>Select our website and click "Clear All"</li>
            </ol>
            <p className="mt-3 text-yellow-400">
              <strong>Note:</strong> Clearing localStorage will log you out and reset all your preferences and progress.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Private/Incognito Mode</h2>
            <p>
              When using private or incognito browsing mode:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Our Service will still function using in-memory storage as a fallback</li>
              <li>Your data will be cleared when you close the browser</li>
              <li>You'll need to log in again each time you visit</li>
              <li>Your study progress won't be saved between sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Impact of Disabling Cookies/Storage</h2>
            <p>
              If you disable cookies and localStorage:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>You may not be able to access certain features of the Service</li>
              <li>You'll need to log in every time you visit</li>
              <li>Your preferences and settings won't be saved</li>
              <li>Study progress tracking may not work properly</li>
              <li>The platform may use in-memory fallback storage (data lost on page refresh)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Data Security</h2>
            <p>
              We implement security measures to protect data stored in localStorage:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Sensitive data is not stored in plain text</li>
              <li>We validate data integrity before use</li>
              <li>Regular security audits of storage mechanisms</li>
              <li>Automatic data cleanup for stale information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Children's Privacy</h2>
            <p>
              We do not knowingly collect cookies or localStorage data from children under 13 without parental consent. 
              If a parent or guardian becomes aware that their child has provided us with information without their consent, 
              please contact us, and we will delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons. 
              We will notify you of any material changes by posting the new Cookie Policy on this page and updating the 
              "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. Contact Us</h2>
            <p className="mb-3">If you have questions about our use of cookies and localStorage, please contact us:</p>
            <div className="bg-dark-accent p-4 rounded-lg">
              <p><strong className="text-dark-neon-green">Email:</strong> ylikagwa@gmail.com</p>
              <p><strong className="text-dark-neon-green">Phone/WhatsApp:</strong> +265 880 646 248</p>
              <p><strong className="text-dark-neon-green">Organization:</strong> Fatty AI-Ed-Tech</p>
            </div>
          </section>

          <section className="border-t border-dark-muted pt-6 mt-8">
            <p className="text-sm text-gray-400">
              By using Exam AI Malawi, you consent to our use of cookies and localStorage as described in this Cookie Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
