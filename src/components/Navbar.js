import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserLimits } from '../contexts/UserLimitsContext';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  CreditCardIcon,
  AcademicCapIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { currentUser, logout, upgradeToPremium } = useAuth();
  const { currentPlan, getRemainingQuestions, getRemainingExams } = useUserLimits();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser?.email === 'ylikagwa@gmail.com' || currentUser?.name?.toLowerCase().includes('admin');

  const handleUpgrade = () => {
    upgradeToPremium();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-dark-secondary border-b border-dark-muted backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-dark-neon-blue mr-3" />
            <span className="text-xl font-bold neon-text">Exam AI Malawi</span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/dashboard" className="text-gray-300 hover:text-dark-neon-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <HomeIcon className="h-4 w-4 inline mr-2" />
                Dashboard
              </a>
              <a href="/dashboard" className="text-gray-300 hover:text-dark-neon-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <ChartBarIcon className="h-4 w-4 inline mr-2" />
                Analytics
              </a>
              {isAdmin && (
                <a href="/admin" className="text-gray-300 hover:text-dark-neon-purple px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <CogIcon className="h-4 w-4 inline mr-2" />
                  Admin Panel
                </a>
              )}
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-dark-muted">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  currentPlan === 'premium' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {currentPlan === 'premium' ? 'PREMIUM' : 'FREE'}
                </span>
                <span className="text-xs text-gray-400">
                  {getRemainingQuestions()} Q / {getRemainingExams()} E left
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-neon-blue"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-dark-neon-blue to-dark-neon-purple flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-2 text-gray-300">{currentUser?.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-accent border border-dark-muted ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-300 border-b border-dark-muted">
                        {currentUser?.email}
                      </div>
                      {currentPlan === 'free' && (
                        <button
                          onClick={handleUpgrade}
                          className="flex items-center px-4 py-2 text-sm text-dark-neon-green hover:bg-dark-muted w-full text-left"
                        >
                          <CreditCardIcon className="h-4 w-4 mr-2" />
                          Upgrade to Premium
                        </button>
                      )}
                      <button
                        onClick={logout}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-dark-muted w-full text-left"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-dark-neon-blue"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/dashboard" className="text-gray-300 hover:text-dark-neon-blue block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </a>
            <a href="/dashboard" className="text-gray-300 hover:text-dark-neon-blue block px-3 py-2 rounded-md text-base font-medium">
              Analytics
            </a>
            {isAdmin && (
              <a href="/admin" className="text-gray-300 hover:text-dark-neon-purple block px-3 py-2 rounded-md text-base font-medium">
                Admin Panel
              </a>
            )}
            <div className="border-t border-dark-muted pt-2">
              <div className="px-3 py-2">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  currentPlan === 'premium' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {currentPlan === 'premium' ? 'PREMIUM' : 'FREE'}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {getRemainingQuestions()} Q / {getRemainingExams()} E left today
                </p>
              </div>
              {currentPlan === 'free' && (
                <button
                  onClick={handleUpgrade}
                  className="text-dark-neon-green block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Upgrade to Premium
                </button>
              )}
              <button
                onClick={logout}
                className="text-gray-300 hover:text-dark-neon-blue block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
