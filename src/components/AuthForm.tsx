import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      setError('Please enter a username');
      setLoading(false);
      return;
    }

    // Use a synthetic email for Supabase Auth (it requires email)
    const syntheticEmail = `${trimmedUsername}@dreaminterpreter.app`;

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: syntheticEmail,
          password,
          options: { data: { username: trimmedUsername } },
        });
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('This username is already taken');
          }
          throw error;
        }
        setSuccessMsg('Account created! Signing you in...');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password,
        });
        if (error) {
          if (error.message.includes('Invalid login')) {
            throw new Error('Invalid username or password');
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
            <div className="input-group">
              <label htmlFor="username" className="input-label">Username</label>
              <input
                id="username"
                type="text"
                className="input"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={24}
                autoComplete="username"
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
