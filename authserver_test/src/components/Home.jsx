import React, { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';

export default function Home() {
  const { user, token, logout, refreshProfile, loading, authClient } = useAuth();
  // console.log(user);
  
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState(null);

  async function doChangePassword(e) {
    e.preventDefault();
    setBusy(true); setFeedback(null);
    try {
      await authClient.requestChangePasswordLink({ email: user?.email });
      setFeedback('Password change email sent. Check your inbox.');
    } catch (err) {
      setFeedback(err.message || 'Failed to send password change email');
    } finally { setBusy(false); }
  }

  async function doDeleteAccount(e) {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setBusy(true); setDeleteFeedback(null);
    try {
      await authClient.deleteAccount({ email: user?.email });
      setDeleteFeedback('Account deleted successfully. Logging out...');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      setDeleteFeedback(err.message || 'Delete account failed');
    } finally { setBusy(false); }
  }

  return (
    <div className="home-container">
      <h2>Welcome</h2>
      <div className="user-box">
        <p><strong>User ID:</strong> {user?.id || 'n/a'}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Name:</strong> {user?.name || '—'}</p>
        <p><strong>Login Method:</strong> {user?.login_method || '—'}</p>
        <p><strong>Google login:</strong> {user?.google_linked ? 'Yes' : '—'}</p>
        <p><strong>Token (truncated):</strong> {token ? token.slice(0, 18) + '…' : 'none'}</p>
      </div>
      <div className="actions">
        <button onClick={refreshProfile} disabled={loading}>Refresh Profile</button>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={doChangePassword} className="change-password" style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300 }}>
        <h3>Change Password</h3>
        <p style={{ margin: 0, fontSize: '0.9em' }}>We will email a secure link to {user?.email} to change your password.</p>
        <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Change Password Email'}</button>
      </form>
      {feedback && <p style={{ marginTop: 12, color: feedback.includes('success') ? 'green' : 'crimson' }}>{feedback}</p>}

      <div style={{ marginTop: 24 }}>
        <button onClick={() => setShowDeleteForm(!showDeleteForm)} style={{ fontSize: '0.9em', background: 'crimson', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
          {showDeleteForm ? 'Cancel' : 'Delete Account'}
        </button>
        {showDeleteForm && (
          <form onSubmit={doDeleteAccount} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 300, padding: '12px', background: '#fff3f3', border: '1px solid #ffcccc', borderRadius: '4px' }}>
            <p style={{ color: 'crimson', margin: 0, fontSize: '0.9em' }}>Are you sure? This cannot be undone.</p>
            <button type="submit" disabled={busy} style={{ background: 'crimson', color: 'white', padding: '8px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
              {busy ? 'Deleting…' : 'Confirm Delete Account'}
            </button>
            {deleteFeedback && <p style={{ margin: '8px 0 0 0', color: deleteFeedback.includes('successfully') ? 'green' : 'crimson', fontSize: '0.9em' }}>{deleteFeedback}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
