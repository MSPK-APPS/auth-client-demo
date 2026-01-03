import React, { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { login, googleLogin, loading, error, authClient } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetFeedback, setResetFeedback] = useState(null);
  const [resendFeedback, setResendFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showGoogleSetPassword, setShowGoogleSetPassword] = useState(false);
  const [googleSetPasswordEmail, setGoogleSetPasswordEmail] = useState('');
  const [googleSetPasswordFeedback, setGoogleSetPasswordFeedback] = useState(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setResendFeedback(null);
    try {
      await login({ email, password });
    } catch (err) {
      // Check if account not verified
      if (
        err.code === 'EMAIL_NOT_VERIFIED' ||
        err.message?.toLowerCase().includes('not been verified') ||
        err.message?.toLowerCase().includes('not verified')
      ) {
        setResendFeedback('Your account has not been verified. Click below to resend verification.');
      }
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    setBusy(true);
    setResetFeedback(null);
    try {
      await authClient.requestPasswordReset({ email: resetEmail });
      setResetFeedback('Password reset email sent. Check your inbox.');
      setResetEmail('');
    } catch (err) {
      setResetFeedback(err.message || 'Failed to send reset email');
    } finally {
      setBusy(false);
    }
  }

  async function handleResendVerification() {
    setBusy(true);
    setResendFeedback(null);
    try {
      await authClient.resendVerificationEmail({ email, purpose: 'New Account' });
      setResendFeedback('Verification email sent. Please check your inbox.');
    } catch (err) {
      setResendFeedback(err.message || 'Failed to resend verification');
    } finally {
      setBusy(false);
    }
  }

  async function handleSendGoogleSetPasswordEmail(e) {
    e.preventDefault();
    setGoogleBusy(true);
    setGoogleSetPasswordFeedback(null);
    try {
      await authClient.sendGoogleUserSetPasswordEmail({ email: googleSetPasswordEmail });
      setGoogleSetPasswordFeedback('Email sent. Check your inbox to set a password.');
      setGoogleSetPasswordEmail('');
    } catch (err) {
      setGoogleSetPasswordFeedback(err.message || 'Failed to send email');
    } finally {
      setGoogleBusy(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    setSubmitted(true);
    setResendFeedback(null);
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.isNewUser) {
        console.log('Welcome, new user!');
      }
    } catch (err) {
      console.error('Google login failed:', err);
    }
  }

  const authMessage = () => {
    if (!submitted) return null;
    if (loading) return <p>Logging in...</p>;
    if (error) {
      return (
        <p style={{ color: 'crimson' }}>
          {error.status === 401 ? 'Invalid credentials' : error.message || 'Login failed'}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Please wait…' : 'Login'}
        </button>
      </form>
      {authMessage()}
      
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.9em', color: '#666' }}>or</span>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            setSubmitted(true);
            console.error('Google login failed');
          }}
          text="signin_with"
          shape="rectangular"
          size="large"
        />
      </div>

      {resendFeedback && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: resendFeedback.includes('sent') ? 'green' : 'crimson' }}>{resendFeedback}</p>
          {resendFeedback.includes('has not been verified') && (
            <button onClick={handleResendVerification} disabled={busy} style={{ marginTop: 8 }}>
              {busy ? 'Sending…' : 'Resend Verification Email'}
            </button>
          )}
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setShowReset(!showReset)} style={{ fontSize: '0.9em', background: 'transparent', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}>
          {showReset ? 'Hide' : 'Forgot password?'}
        </button>
        {showReset && (
          <form onSubmit={handlePasswordReset} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</button>
            {resetFeedback && <p style={{ color: resetFeedback.includes('sent') ? 'green' : 'crimson', fontSize: '0.9em' }}>{resetFeedback}</p>}
          </form>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => setShowGoogleSetPassword(!showGoogleSetPassword)} style={{ fontSize: '0.9em', background: 'transparent', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline' }}>
          {showGoogleSetPassword ? 'Hide' : 'No password? Are you a Google user?'}
        </button>
        {showGoogleSetPassword && (
          <form onSubmit={handleSendGoogleSetPasswordEmail} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="email"
              placeholder="Enter your Google account email"
              value={googleSetPasswordEmail}
              onChange={(e) => setGoogleSetPasswordEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={googleBusy}>{googleBusy ? 'Sending…' : 'Send Set-Password Email'}</button>
            {googleSetPasswordFeedback && (
              <p style={{ color: googleSetPasswordFeedback.includes('sent') ? 'green' : 'crimson', fontSize: '0.9em' }}>
                {googleSetPasswordFeedback}
              </p>
            )}
          </form>
        )}
      </div>
      <small style={{ opacity: 0.7, display: 'block', marginTop: 12 }}>Access token stored only in memory.</small>
    </div>
  );
}
