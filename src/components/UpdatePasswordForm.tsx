import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const UpdatePasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred updating your password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="bg-effects"><div className="stars" /></div>
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-logo">🌙</div>
            <h1 className="auth-title">Update Password</h1>
            <p className="auth-subtitle">
              Enter a strong, new password for your account
            </p>
          </div>

          <div className="card">
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                  Password updated successfully!
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Redirecting you to the dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="new-password" className="input-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
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
                    'Update Password'
                  )}
                </button>

                {error && <div className="auth-error">{error}</div>}
              </form>
            )}
            <div className="footer-credit">Brewed with ❤️ & ☕ in BLR by Shubham.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
