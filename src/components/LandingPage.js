import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  ClockIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <nav className="bg-dark-secondary/80 backdrop-blur-lg border-b border-dark-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-dark-neon-blue mr-3" />
              <span className="text-xl font-bold neon-text">Exam AI Malawi</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-dark-neon-blue px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="btn-primary text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-radial from-dark-neon-blue/10 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="neon-text">AI-Powered Exam Assistant</span>
              <br />
              <span className="text-gray-300">for Malawian Schools</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Transform your study experience with intelligent exam preparation, 
              personalized questions, and instant feedback tailored to the Malawian curriculum.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="btn-primary text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center group"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features" 
                className="border border-dark-neon-blue text-dark-neon-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-dark-neon-blue/10 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 neon-text">Why Choose Exam AI Malawi?</h2>
            <p className="text-gray-400 text-lg">Advanced features designed for academic excellence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-hover p-6 rounded-xl">
              <div className="w-12 h-12 bg-dark-neon-blue/20 rounded-lg flex items-center justify-center mb-4">
                <SparklesIcon className="h-6 w-6 text-dark-neon-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Smart Question Generation</h3>
              <p className="text-gray-400">
                AI-powered questions tailored to Malawian curriculum standards and your learning pace.
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl">
              <div className="w-12 h-12 bg-dark-neon-purple/20 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-dark-neon-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Performance Analytics</h3>
              <p className="text-gray-400">
                Track your progress with detailed insights and identify areas for improvement.
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl">
              <div className="w-12 h-12 bg-dark-neon-green/20 rounded-lg flex items-center justify-center mb-4">
                <GlobeAltIcon className="h-6 w-6 text-dark-neon-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Local Curriculum Focus</h3>
              <p className="text-gray-400">
                Content aligned with Malawian examination boards and educational standards.
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl">
              <div className="w-12 h-12 bg-dark-neon-pink/20 rounded-lg flex items-center justify-center mb-4">
                <ClockIcon className="h-6 w-6 text-dark-neon-pink" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">24/7 Availability</h3>
              <p className="text-gray-400">
                Study anytime, anywhere with instant AI assistance whenever you need it.
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <AcademicCapIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Multiple Subjects</h3>
              <p className="text-gray-400">
                Comprehensive coverage across Mathematics, Science, English, and Social Studies.
              </p>
            </div>

            <div className="card-hover p-6 rounded-xl">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Exam Simulation</h3>
              <p className="text-gray-400">
                Practice with realistic exam conditions and time constraints to build confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 neon-text">Choose Your Plan</h2>
            <p className="text-gray-400 text-lg">Start free and upgrade as you progress</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card-hover p-8 rounded-xl border-2 border-gray-600">
              <h3 className="text-2xl font-bold mb-2 text-white">Free Plan</h3>
              <p className="text-gray-400 mb-6">Perfect for getting started</p>
              <div className="text-3xl font-bold mb-6 neon-text">K0</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  10 questions per day
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  3 exams per day
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  Basic subjects
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  Progress tracking
                </li>
              </ul>
              <Link 
                to="/signup" 
                className="w-full border border-dark-neon-blue text-dark-neon-blue px-6 py-3 rounded-lg font-semibold hover:bg-dark-neon-blue/10 transition-all text-center block"
              >
                Get Started
              </Link>
            </div>

            <div className="card-hover p-8 rounded-xl border-2 border-dark-neon-purple relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Premium Plan</h3>
              <p className="text-gray-400 mb-6">Unlimited learning potential</p>
              <div className="text-3xl font-bold mb-6 neon-text">K5,000<span className="text-lg text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  Unlimited questions
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  20 exams per day
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  All subjects
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircleIcon className="h-5 w-5 text-dark-neon-green mr-3" />
                  PDF export
                </li>
              </ul>
              <Link 
                to="/signup" 
                className="w-full btn-primary text-white px-6 py-3 rounded-lg font-semibold text-center block"
              >
                Start Premium Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-secondary/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="neon-text">Get in Touch</span>
          </h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to us via phone, WhatsApp, or email.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Phone/WhatsApp */}
            <div className="card-hover p-8 rounded-xl">
              <div className="w-16 h-16 bg-dark-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="h-8 w-8 text-dark-neon-blue" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Call or WhatsApp</h3>
              <a 
                href="tel:+265880646248" 
                className="text-dark-neon-blue text-lg font-semibold hover:text-dark-neon-green transition-colors block mb-2"
              >
                +265 880 646 248
              </a>
              <p className="text-gray-400 text-sm">Available for calls and WhatsApp</p>
            </div>

            {/* Email */}
            <div className="card-hover p-8 rounded-xl">
              <div className="w-16 h-16 bg-dark-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="h-8 w-8 text-dark-neon-purple" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
              <a 
                href="mailto:ylikagwa@gmail.com" 
                className="text-dark-neon-purple text-lg font-semibold hover:text-dark-neon-pink transition-colors block mb-2"
              >
                ylikagwa@gmail.com
              </a>
              <p className="text-gray-400 text-sm">We'll respond within 24 hours</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark-secondary border-t border-dark-muted py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-6 w-6 text-dark-neon-blue mr-2" />
                <span className="text-lg font-bold neon-text">Exam AI Malawi</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering Malawian students with AI-powered education.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button className="hover:text-dark-neon-blue transition-colors text-left">Features</button></li>
                <li><button className="hover:text-dark-neon-blue transition-colors text-left">Pricing</button></li>
                <li><button className="hover:text-dark-neon-blue transition-colors text-left">API</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button className="hover:text-dark-neon-blue transition-colors text-left">Help Center</button></li>
                <li><a href="#contact" className="hover:text-dark-neon-blue transition-colors text-left block">Contact</a></li>
                <li><button className="hover:text-dark-neon-blue transition-colors text-left">Status</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/privacy" className="hover:text-dark-neon-blue transition-colors text-left block">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-dark-neon-blue transition-colors text-left block">Terms</Link></li>
                <li><Link to="/cookies" className="hover:text-dark-neon-blue transition-colors text-left block">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-muted mt-8 pt-8 text-center text-gray-400 text-sm">
            <p className="mb-2">&copy; 2025 Exam AI Malawi. All rights reserved.</p>
            <p className="text-xs">
              Powered by <span className="text-dark-neon-blue font-semibold">Fatty AI-Ed-Tech</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
