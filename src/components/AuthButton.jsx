import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

export default function AuthButton() {
  const { isAuthenticated, isConfigured, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Don't show anything while loading
  if (loading) return null;

  // Don't show auth buttons if Supabase isn't configured
  if (!isConfigured) {
    return (
      <div 
        style={{
          padding: '0.5rem 1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--danger)',
          fontWeight: 600,
        }}
      >
        Local Mode
      </div>
    );
  }

  // Show user menu if authenticated
  if (isAuthenticated) {
    return <UserMenu />;
  }

  // Show sign in/sign up buttons
  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="btn"
        style={{ fontSize: '0.875rem' }}
      >
        <LogIn size={16} />
        Sign In
      </button>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
