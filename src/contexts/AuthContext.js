import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import paymentService from '../services/paymentService';

const AuthContext = createContext();

const USERS_REGISTRY_KEY = 'examAIUsers';
const CURRENT_USER_KEY = 'examAIUser';

function loadUsersRegistry() {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsersRegistry(registry) {
  try {
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
    return true;
  } catch {
    return false;
  }
}

function persistUser(user) {
  const registry = loadUsersRegistry();
  registry[user.email] = user;
  if (!saveUsersRegistry(registry)) return false;
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return true;
  } catch {
    return false;
  }
}

export function useAuth() {
  return useContext(AuthContext);
}

function applySubscriptionToUser(user, subscription) {
  if (!user) return user;
  const active = subscription?.active;
  return {
    ...user,
    subscription: subscription || null,
    subscriptionPlan: active ? subscription.plan_id : null,
    subscriptionExpiresAt: active ? subscription.expires_at : null,
    isPremium: active ? subscription.is_premium : false,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async (user) => {
    if (!user?.id) return user;
    try {
      const subscription = await paymentService.getSubscription(user.id);
      const updated = applySubscriptionToUser(user, subscription);
      persistUser(updated);
      setCurrentUser(updated);
      return updated;
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      return user;
    }
  }, []);

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
      const storedUser = safeLocalStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Validate user object structure
        if (parsedUser && parsedUser.id && parsedUser.email) {
          setCurrentUser(parsedUser);
          refreshSubscription(parsedUser);
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
      
      const normalizedEmail = email.toLowerCase().trim();
      const registry = loadUsersRegistry();
      const existing = registry[normalizedEmail];

      const user = existing
        ? {
            ...existing,
            lastLogin: new Date().toISOString(),
          }
        : {
            id: `user_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`,
            email: normalizedEmail,
            name: email.split('@')[0],
            isPremium: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

      if (!persistUser(user)) {
        return { success: false, error: 'Failed to save user data. Please check browser settings.' };
      }

      setCurrentUser(user);
      await refreshSubscription(user);
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
      
      const normalizedEmail = email.toLowerCase().trim();
      const registry = loadUsersRegistry();

      if (registry[normalizedEmail]) {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }

      const user = {
        id: `user_${normalizedEmail.replace(/[^a-z0-9]/g, '_')}`,
        email: normalizedEmail,
        name: name.trim(),
        isPremium: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      if (!persistUser(user)) {
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
    safeLocalStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  const applySubscription = (subscription) => {
    if (!currentUser) return;
    const updated = applySubscriptionToUser(currentUser, subscription);
    if (persistUser(updated)) {
      setCurrentUser(updated);
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    applySubscription,
    refreshSubscription,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
