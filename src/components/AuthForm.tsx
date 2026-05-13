import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Eye, EyeOff, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${'•'.repeat(Math.min(local.length - 3, 5))}${local[local.length - 1]}@${domain}`;
};

const AuthForm: React.FC = () => {
  // --- Mode state ---
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // --- Signup fields ---
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  // --- Common fields ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- Signup password (on OTP screen) ---
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // --- OTP state ---
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpEmail, setOtpEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- UI state ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  // --- Resend cooldown timer ---
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // --- Focus first OTP input when OTP screen appears ---
  useEffect(() => {
    if (otpSent) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 300);
    }
  }, [otpSent]);

  // --- OTP input handlers ---
  const handleOtpChange = useCallback((index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    setOtpCode((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        // Move to previous input and clear it
        otpInputRefs.current[index - 1]?.focus();
        setOtpCode((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      } else {
        setOtpCode((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }, [otpCode]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newCode = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setOtpCode(newCode);

    // Focus the next empty or the last input
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
  }, []);

  // Auto-submit removed — user must also enter password before submitting

  // --- Send OTP ---
  const handleSendOtp = async () => {
    setError(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your name');
      return;
    }
    if (!gender) {
      setError('Please select your gender');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      // Check if email is already registered
      const { data: emailExists, error: checkError } = await supabase
        .rpc('check_email_exists', { email_input: trimmedEmail });

      if (checkError) {
        console.error('Email check failed:', checkError);
        // Continue anyway if check fails — don't block user
      } else if (emailExists) {
        throw new Error('This email is already registered. Please sign in instead.');
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
          data: { display_name: trimmedName, gender },
        },
      });

      if (error) {
        if (error.message.includes('rate') || error.message.includes('limit')) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
        throw error;
      }

      setOtpEmail(trimmedEmail);
      setOtpSent(true);
      setOtpCode(Array(OTP_LENGTH).fill(''));
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccessMsg(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // --- Resend OTP ---
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: otpEmail,
        options: {
          shouldCreateUser: true,
          data: { display_name: name.trim(), gender },
        },
      });

      if (error) throw error;

      setOtpCode(Array(OTP_LENGTH).fill(''));
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccessMsg('A new code has been sent to your email.');
      otpInputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // --- Verify OTP + Set Password ---
  const handleVerifyAndSetPassword = async () => {
    const token = otpCode.join('');
    if (token.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // Step 1: Verify OTP — creates a session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token,
        type: 'email',
      });

      if (verifyError) {
        if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
          throw new Error('Invalid or expired code. Please request a new one.');
        }
        throw verifyError;
      }

      // Step 2: Set password + mark signup complete — user now has an active session
      const { error: updateError } = await supabase.auth.updateUser({
        password: signupPassword,
        data: { signup_complete: true },
      });

      if (updateError) {
        throw new Error('Account verified but failed to set password. Please update your password in settings.');
      }

      // Done — AuthContext picks up the session automatically
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      // Clear OTP on error so user can re-enter
      setOtpCode(Array(OTP_LENGTH).fill(''));
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // --- Password login / forgot password ---
  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        setSuccessMsg('Password reset link sent! Please check your email.');
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

  // --- Go back from OTP screen ---
  const handleOtpBack = () => {
    setOtpSent(false);
    setOtpCode(Array(OTP_LENGTH).fill(''));
    setSignupPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMsg(null);
  };

  // --- Reset state on mode switch ---
  const switchMode = (mode: 'signIn' | 'signUp' | 'forgotPassword') => {
    setError(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setOtpCode(Array(OTP_LENGTH).fill(''));
    setSignupPassword('');
    setConfirmPassword('');
    setResendCooldown(0);

    if (mode === 'signIn') {
      setIsSignUp(false);
      setIsForgotPassword(false);
    } else if (mode === 'signUp') {
      setIsSignUp(true);
      setIsForgotPassword(false);
    } else {
      setIsForgotPassword(true);
    }
  };

  // ========================
  // RENDER: OTP Verification Screen
  // ========================
  if (isSignUp && otpSent) {
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

          <div className="card otp-card">
            <button
              type="button"
              className="otp-back-btn"
              onClick={handleOtpBack}
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="otp-header">
              <div className="otp-icon">✉️</div>
              <h2 className="otp-title">Check your email</h2>
              <p className="otp-subtitle">
                We've sent a 6-digit code to
              </p>
              <p className="otp-email">{maskEmail(otpEmail)}</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleVerifyAndSetPassword(); }}>
              <div className="otp-input-group" onPaste={handleOtpPaste}>
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    className={`otp-digit ${digit ? 'filled' : ''} ${error ? 'otp-error' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              <div className="otp-password-section">
                <label className="input-label">Create Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Min. 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
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
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="input-label">Confirm Password</label>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading || otpCode.join('').length !== OTP_LENGTH || !signupPassword || !confirmPassword}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                ) : (
                  'Create Account'
                )}
              </button>

              {error && <div className="auth-error">{error}</div>}
              {successMsg && <div className="alert alert-success">{successMsg}</div>}
            </form>

            <div className="otp-resend">
              {resendCooldown > 0 ? (
                <span className="otp-resend-cooldown">
                  Resend code in <strong>{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleResendOtp}
                  disabled={loading}
                >
                  Didn't get the code? <strong>Resend</strong>
                </button>
              )}
            </div>
          </div>

          <div className="auth-toggle">
            Already have an account?{' '}
            <button onClick={() => switchMode('signIn')}>Sign In</button>
          </div>
          <div className="footer-credit">Brewed with ❤️ & ☕ in BLR by Shubham.</div>
        </div>
      </div>
    );
  }

  // ========================
  // RENDER: Sign Up / Sign In / Forgot Password
  // ========================
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
          <form
            onSubmit={isSignUp
              ? (e) => { e.preventDefault(); handleSendOtp(); }
              : handlePasswordSubmit
            }
          >
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

            {/* Password field — only for sign-in and forgot password flows */}
            {!isSignUp && !isForgotPassword && (
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
                    autoComplete="current-password"
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
            )}

            {!isSignUp && !isForgotPassword && (
              <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
                <button
                  type="button"
                  onClick={() => switchMode('forgotPassword')}
                  style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Send Verification Code' : 'Sign In'
              )}
            </button>

            {error && <div className="auth-error">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}
          </form>

          <div className="auth-toggle">
            {isForgotPassword ? (
              <>
                Remember your password?{' '}
                <button onClick={() => switchMode('signIn')}>Sign In</button>
              </>
            ) : isSignUp ? (
              <>
                Already have an account?{' '}
                <button onClick={() => switchMode('signIn')}>Sign In</button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => switchMode('signUp')}>Sign Up</button>
              </>
            )}
          </div>
          <div className="footer-credit">Brewed with ❤️ & ☕ in BLR by Shubham.</div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
