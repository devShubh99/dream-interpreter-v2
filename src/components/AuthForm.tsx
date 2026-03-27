import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const trimmedName = name.trim();
        if (!trimmedName) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { display_name: trimmedName } },
        });
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered');
          }
          throw error;
        }
        setSuccessMsg('Account created! Please check your email and click the confirmation link to sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) {
          if (error.message.includes('Invalid login')) {
            throw new Error('Invalid email or password');
          }
          throw error;
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">Dream Interpreter</h1>
          <p className="auth-subtitle">
            Share your dream, discover its meaning ✨
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="input-group">
                <label htmlFor="name" className="input-label">Name</label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={50}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            {error && <div className="auth-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}
          </form>

          <div className="auth-toggle">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMsg(null); }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
