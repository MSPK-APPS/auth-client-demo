const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authclient = require('@mspkapps/auth-client').default;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!API_KEY || !API_SECRET) {
  console.warn('Warning: API_KEY or API_SECRET not set in environment.');
  process.exit(1);
}

// Initialize the auth client once at startup
authclient.init({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  googleClientId: GOOGLE_CLIENT_ID,
  keyInPath: true,
});

console.log('Auth client initialized');

// Helper to extract token from Authorization header
function getTokenFromHeader(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  if (auth.startsWith('Bearer ')) return auth.substring(7);
  if (auth.startsWith('UserToken ')) return auth.substring(10);
  return auth;
}

// ========== Auth Endpoints ==========

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, name, ...extra } = req.body;
    const result = await authclient.register({ email, username, password, name, extra });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Login with email/username and password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const result = await authclient.login({ email, username, password });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Google authentication
app.post('/api/auth/google', async (req, res) => {
  try {
    const { id_token } = req.body;
    const result = await authclient.googleAuth({ id_token });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Request password reset
app.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authclient.client.requestPasswordReset({ email });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Request change password link
app.post('/api/auth/request-change-password-link', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authclient.client.requestChangePasswordLink({ email });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const result = await authclient.client.resendVerificationEmail({ email, purpose });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Delete account
app.post('/api/auth/delete-account', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authclient.client.deleteAccount({ email, password });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Send Google user set password email
app.post('/api/auth/set-password-google-user', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authclient.client.sendGoogleUserSetPasswordEmail({ email });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// ========== User Endpoints (require authentication) ==========

// Get user profile
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    authclient.setToken(token);
    const result = await authclient.getProfile();
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Update user profile
app.patch('/api/user/profile', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    authclient.setToken(token);
    const result = await authclient.updateProfile(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

// Verify token
app.post('/api/auth/verify-token', async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const result = await authclient.verifyToken(token);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Auth backend server listening on port ${port}`));
