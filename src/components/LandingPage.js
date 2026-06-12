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
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { PLAN_LIMITS } from '../constants/limits';

export default function LandingPage() {
  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden bg-dark-primary flex flex-col">
      <nav className="sticky top-0 z-40 bg-dark-secondary/95 border-b border-dark-muted flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-dark-neon-blue" />
            <span className="text-sm font-bold text-white">Exam AI Malawi</span>
          </div>
          <div className="flex gap-2">
            <Link to="/login" className="text-gray-300 hover:text-white px-3 py-1 text-sm">
              Login
            </Link>
            <Link to="/signup" className="btn-primary text-white px-3 py-1 rounded-md text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 space-y-8">
        <section className="text-center pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            AI Exam Assistant for Malawian Schools
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-4">
            MANEB-focused study help, practice exams, and progress tracking — built for slow networks and mobile devices.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/signup" className="btn-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center justify-center">
              Start Free
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/login" className="border border-dark-muted text-gray-200 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-dark-accent">
              Login
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: SparklesIcon, title: 'Smart Questions', text: 'AI questions aligned with MANEB curriculum.' },
            { icon: ChartBarIcon, title: 'Track Progress', text: 'See strengths and topics to revise.' },
            { icon: GlobeAltIcon, title: 'Malawian Context', text: 'Content for MSCE and PLE preparation.' },
            { icon: ClockIcon, title: 'Always Available', text: 'Study anytime on phone or computer.' },
            { icon: ShieldCheckIcon, title: 'Secure', text: 'Your study data stays on your device.' },
            { icon: PhoneIcon, title: 'Mobile Friendly', text: 'Light app that works on low-end phones.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-hover p-4 rounded-xl">
              <Icon className="h-5 w-5 text-dark-neon-blue mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
              <p className="text-xs text-gray-400">{text}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-lg font-bold text-white text-center mb-4">Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="card-hover p-4 rounded-xl border border-dark-muted">
              <h3 className="font-semibold text-white">Free</h3>
              <p className="text-xl font-bold text-dark-neon-blue my-2">K0</p>
              <ul className="text-xs text-gray-400 space-y-1 mb-3">
                <li className="flex items-center gap-1"><CheckCircleIcon className="h-3 w-3 text-green-400" />{PLAN_LIMITS.free.questionsPerDay} questions/day</li>
                <li className="flex items-center gap-1"><CheckCircleIcon className="h-3 w-3 text-green-400" />{PLAN_LIMITS.free.examsPerDay} exam/day</li>
              </ul>
              <Link to="/signup" className="block text-center text-xs border border-dark-muted rounded-lg py-2 text-gray-200">Get Started</Link>
            </div>
            <div className="card-hover p-4 rounded-xl border border-dark-neon-blue">
              <h3 className="font-semibold text-white">Weekly</h3>
              <p className="text-xl font-bold text-dark-neon-blue my-2">K1,500<span className="text-xs text-gray-400">/week</span></p>
              <ul className="text-xs text-gray-400 space-y-1 mb-3">
                <li className="flex items-center gap-1"><CheckCircleIcon className="h-3 w-3 text-green-400" />{PLAN_LIMITS.premium.questionsPerDay} questions/day</li>
                <li className="flex items-center gap-1"><CheckCircleIcon className="h-3 w-3 text-green-400" />All subjects</li>
              </ul>
              <Link to="/signup" className="block text-center text-xs btn-primary text-white rounded-lg py-2">Subscribe</Link>
            </div>
            <div className="card-hover p-4 rounded-xl border border-dark-neon-purple">
              <h3 className="font-semibold text-white">Monthly</h3>
              <p className="text-xl font-bold text-dark-neon-blue my-2">K6,500<span className="text-xs text-gray-400">/month</span></p>
              <ul className="text-xs text-gray-400 space-y-1 mb-3">
                <li className="flex items-center gap-1"><CheckCircleIcon className="h-3 w-3 text-green-400" />Full premium access</li>
                <li className="flex items-center gap-1"><CheckCircleIcon className="h-3 w-3 text-green-400" />Best for exam season</li>
              </ul>
              <Link to="/signup" className="block text-center text-xs btn-primary text-white rounded-lg py-2">Subscribe</Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
          <a href="tel:+265880646248" className="card-hover p-4 rounded-xl text-center">
            <PhoneIcon className="h-6 w-6 text-dark-neon-blue mx-auto mb-2" />
            <p className="text-sm text-white font-medium">+265 880 646 248</p>
            <p className="text-xs text-gray-400">Call or WhatsApp</p>
          </a>
          <a href="mailto:ylikagwa@gmail.com" className="card-hover p-4 rounded-xl text-center">
            <EnvelopeIcon className="h-6 w-6 text-dark-neon-purple mx-auto mb-2" />
            <p className="text-sm text-white font-medium">ylikagwa@gmail.com</p>
            <p className="text-xs text-gray-400">Email support</p>
          </a>
        </section>
      </main>

      <footer className="flex-shrink-0 border-t border-dark-muted py-3 px-4 text-center text-xs text-gray-500">
        <p>© 2026 Exam AI Malawi · Powered by Fatty Ed-Tech</p>
        <div className="flex justify-center gap-4 mt-1">
          <Link to="/privacy" className="hover:text-gray-300">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-300">Terms</Link>
          <Link to="/cookies" className="hover:text-gray-300">Cookies</Link>
        </div>
      </footer>
    </div>
  );
}
