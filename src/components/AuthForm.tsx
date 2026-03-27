import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

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
        if (!gender) {
          setError('Please select your gender');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { display_name: trimmedName, gender } },
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
          <div className="auth-logo">🌙</div>
          <h1 className="auth-title">Dream Interpreter</h1>
          <p className="auth-subtitle">
            Uncover the hidden meaning of your dreams
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
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
                <div className="input-group">
                  <label className="input-label">Gender</label>
                  <div className="dropdown-container">
                    <div 
                      className={`dropdown-trigger ${isGenderOpen ? 'open' : ''}`}
                      onClick={() => setIsGenderOpen(!isGenderOpen)}
                    >
                      <span style={{ color: gender ? 'inherit' : 'var(--text-muted)' }}>
                        {gender ? genderOptions.find(o => o.value === gender)?.label : 'Select your gender'}
                      </span>
                      <ChevronDown size={14} style={{ transform: isGenderOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {isGenderOpen && (
                      <div className="dropdown-menu">
                        {genderOptions.map((opt) => (
                          <div 
                            key={opt.value}
                            className={`dropdown-item ${gender === opt.value ? 'selected' : ''}`}
                            onClick={() => {
                              setGender(opt.value);
                              setIsGenderOpen(false);
                            }}
                          >
                            <span>{opt.label}</span>
                            {gender === opt.value && <Check size={12} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
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
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
          <div className="footer-credit">Brewed with ❤️ & ☕ in BLR by Shubham.</div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
