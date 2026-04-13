import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

const IS_MOCK = !process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID.startsWith('YOUR_');

/**
 * GoogleSignInButton
 * Uses the implicit flow (token) to fetch profile from Google's userinfo endpoint,
 * then calls onSuccess({ sub, email, name, picture }) so the parent can call loginWithGoogle().
 *
 * Props:
 *   onSuccess(profile) — receives the decoded Google profile object
 *   onError(message)   — receives a string error message
 *   label              — button label text (default: "Continue with Google")
 */
export default function GoogleSignInButton({ onSuccess, onError, label = 'Continue with Google' }) {
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        // Fetch the user profile from Google's userinfo endpoint using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch Google profile');
        const profile = await res.json();
        // profile: { sub, email, name, picture, given_name, family_name, email_verified }
        onSuccess(profile);
      } catch (err) {
        onError(err.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      setLoading(false);
      const msg = err?.error_description || err?.error || 'Google sign-in was cancelled or failed.';
      onError(msg);
    },
  });

  const handleClick = () => {
    if (IS_MOCK) {
      setLoading(true);
      // Simulate network request delay for realistic UX
      setTimeout(() => {
        setLoading(false);
        onSuccess({
          sub: 'google_mock_' + Date.now(),
          email: 'demo.user@gmail.com',
          name: 'Demo Google User',
          picture: 'https://ui-avatars.com/api/?name=Demo+User&background=4285F4&color=fff',
        });
      }, 1500);
      return;
    }
    
    // Trigger real Google OAuth popup
    setLoading(true);
    googleLogin();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full relative overflow-hidden flex items-center justify-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 font-semibold py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm group"
    >
      {/* "Mock" indicator badge for developer awareness */}
      {IS_MOCK && !loading && (
        <span className="absolute top-1 right-1 text-[8px] uppercase tracking-widest font-bold bg-amber-500/20 text-amber-500 px-1 py-0.5 rounded shadow-sm border border-amber-500/20">
          Demo Mode
        </span>
      )}
      
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      ) : (
        /* Official Google G SVG */
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      <span className="group-hover:text-white transition-colors">{loading ? 'Signing in…' : label}</span>
    </button>
  );
}
