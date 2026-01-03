import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = 'your_client_id_here';

// Fix for libraries that call unbound fetch/Headers in browser
if (typeof window !== 'undefined') {
  const w = window;
  if (typeof globalThis.fetch !== 'function' && typeof w.fetch === 'function') {
    globalThis.fetch = (...args) => w.fetch(...args);
  }
  if (typeof globalThis.Headers !== 'function' && typeof w.Headers === 'function') {
    globalThis.Headers = w.Headers;
  }
  if (typeof globalThis.Request !== 'function' && typeof w.Request === 'function') {
    globalThis.Request = w.Request;
  }
  if (typeof globalThis.Response !== 'function' && typeof w.Response === 'function') {
    globalThis.Response = w.Response;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
