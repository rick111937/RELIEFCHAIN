import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  NGO: 'ngo',
};

// Mock credentials for demo purposes
const MOCK_USERS = [
  { id: 1, email: 'admin@reliefchain.in', password: 'Admin@123', role: ROLES.ADMIN, name: 'Super Admin', org: 'ReliefChain DAO' },
  { id: 2, email: 'ngo@reliefchain.in', password: 'NGO@123', role: ROLES.NGO, name: 'Riya Sharma', org: 'Asha Foundation' },
];

function persist(user) {
  localStorage.setItem('reliefchain_user', JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('reliefchain_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('reliefchain_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    const found = MOCK_USERS.find(
      u => u.email === email && u.password === password && u.role === role
    );
    if (!found) throw new Error('Invalid credentials. Please check your email, password, and role.');
    const session = { ...found };
    delete session.password;
    setUser(session);
    persist(session);
    return session;
  };

  /**
   * loginWithGoogle — called after @react-oauth/google decodes the credential JWT.
   * `googleProfile` contains: { sub, email, name, picture, given_name, family_name }
   * We default new Google users to NGO role; they can be promoted to admin later.
   */
  const loginWithGoogle = async (googleProfile, role = ROLES.NGO) => {
    const session = {
      id: googleProfile.sub,
      email: googleProfile.email,
      name: googleProfile.name,
      avatar: googleProfile.picture,
      role,          // role selected on the form at time of Google sign-in
      org: '',
      provider: 'google',
    };
    setUser(session);
    persist(session);
    return session;
  };

  const register = async (data) => {
    const newUser = {
      id: Date.now(),
      email: data.email,
      role: data.role,
      name: data.name,
      org: data.org || '',
    };
    setUser(newUser);
    persist(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reliefchain_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, register, loading, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
