import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: '',
    grade: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const grades = [
    'Form 1', 'Form 2', 'Form 3', 'Form 4',
    'Year 1', 'Year 2', 'Year 3', 'Year 4',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all password fields');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signup(formData.email, formData.password, formData.name);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-primary px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-radial from-dark-neon-blue/10 via-transparent to-transparent"></div>
      
      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-dark-neon-blue to-dark-neon-purple rounded-full flex items-center justify-center mb-6">
            <AcademicCapIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold neon-text mb-2">Create Account</h2>
          <p className="text-gray-400">Join Exam AI Malawi and start learning smarter</p>
        </div>

        <div className="card-hover p-8 rounded-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= num 
                      ? 'bg-gradient-to-r from-dark-neon-blue to-dark-neon-purple text-white' 
                      : 'bg-dark-accent text-gray-400 border border-dark-muted'
                  }`}>
                    {step > num ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      num
                    )}
                  </div>
                  {num < 3 && (
                    <div className={`w-full h-0.5 mx-2 ${
                      step > num ? 'bg-gradient-to-r from-dark-neon-blue to-dark-neon-purple' : 'bg-dark-muted'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Basic Info</span>
              <span>Password</span>
              <span>School Info</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none input-glow transition-all"
                  placeholder="John Banda"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none input-glow transition-all"
                  placeholder="student@school.edu.mw"
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full btn-primary text-white py-3 px-4 rounded-lg font-semibold"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none input-glow transition-all"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none input-glow transition-all"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border border-dark-muted text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-dark-accent transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 btn-primary text-white py-3 px-4 rounded-lg font-semibold"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-300 mb-2">
                  School Name
                </label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  value={formData.school}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-accent border border-dark-muted rounded-lg text-white placeholder-gray-500 focus:outline-none input-glow transition-all"
                  placeholder="Your school name"
                />
              </div>

              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-300 mb-2">
                  Grade/Level
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-dark-accent border border-dark-muted rounded-lg text-white focus:outline-none input-glow transition-all"
                >
                  <option value="">Select your grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 border border-dark-muted text-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-dark-accent transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-dark-neon-blue hover:text-dark-neon-blue/80 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-gray-500 text-xs">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
