import React, { createContext, useState, useContext, useEffect } from 'react';
import storage from '../utils/storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe localStorage wrapper
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage getItem error:', error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.error('localStorage setItem error:', error);
        return false;
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('localStorage removeItem error:', error);
        return false;
      }
    }
  };

  useEffect(() => {
    try {
      const storedUser = safeLocalStorage.getItem('examAIUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Validate user object structure
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setCurrentUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      // Basic validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        name: email.split('@')[0],
        isPremium: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      const saved = safeLocalStorage.setItem('examAIUser', JSON.stringify(user));
      if (!saved) {
        return { success: false, error: 'Failed to save user data. Please check browser settings.' };
      }
      
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (email, password, name) => {
    try {
      // Basic validation
      if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' };
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }
      
      // Password validation
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }
      
      // Name validation
      if (name.trim().length < 2) {
        return { success: false, error: 'Name must be at least 2 characters long' };
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user = {
        id: Date.now().toString(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        isPremium: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      const saved = safeLocalStorage.setItem('examAIUser', JSON.stringify(user));
      if (!saved) {
        return { success: false, error: 'Failed to save user data. Please check browser settings.' };
      }
      
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    safeLocalStorage.removeItem('examAIUser');
    setCurrentUser(null);
  };

  const upgradeToPremium = () => {
    if (currentUser) {
      const premiumUser = { ...currentUser, isPremium: true };
      const saved = safeLocalStorage.setItem('examAIUser', JSON.stringify(premiumUser));
      if (saved) {
        setCurrentUser(premiumUser);
      } else {
        console.error('Failed to save premium upgrade');
      }
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    upgradeToPremium,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
