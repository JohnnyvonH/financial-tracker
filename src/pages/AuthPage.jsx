import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Loader, Github, DollarSign, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage({ onBack }) {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, signInWithOAuth, resetPassword, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && onBack) {
      onBack();
    }
  }, [isAuthenticated, onBack]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        if (onBack) onBack();
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, { full_name: fullName });
        if (error) throw error;
        setMessage('Check your email to confirm your account!');
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setMode('signin');
          setMessage('');
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) throw error;
      // OAuth will redirect, so no need to call onBack
    } catch (err) {
      setError(err.message || 'OAuth sign in failed');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: 'var(--card-bg)',
        borderRadius: '1rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border-light)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '1.5rem' }}>
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Reset Password'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Financial Tracker
              </p>
            </div>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="btn-icon"
              style={{ color: 'var(--text-secondary)' }}
              title="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div 
              style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.5rem',
                color: 'var(--danger)',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div 
              style={{
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.5rem',
                color: 'var(--success)',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    style={{ paddingLeft: '2.75rem' }}
                  />
                  <User 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{ paddingLeft: '2.75rem' }}
                />
                <Mail 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Password (not for reset) */}
            {mode !== 'reset' && (
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    style={{ paddingLeft: '2.75rem' }}
                  />
                  <Lock 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Email'}
                </>
              )}
            </button>
          </form>

          {/* OAuth Buttons (not for reset) */}
          {mode !== 'reset' && (
            <>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  margin: '1.5rem 0',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleOAuthSignIn('google')}
                  className="btn"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleOAuthSignIn('github')}
                  className="btn"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <Github size={18} />
                  GitHub
                </button>
              </div>
            </>
          )}

          {/* Mode Switcher */}
          <div 
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}
          >
            {mode === 'signin' && (
              <>
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Sign up
                  </button>
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  <button
                    onClick={() => setMode('reset')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Forgot password?
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <p>
                Remember your password?{' '}
                <button
                  onClick={() => setMode('signin')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
