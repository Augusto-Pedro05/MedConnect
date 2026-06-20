import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import type { AuthResponse } from '../../types';
import './Auth.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });
      login(response.data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-card glass-card animate-slide-up">
        <div className="auth-header">
          <div className="auth-logo">
            <Heart className="auth-logo-icon" />
          </div>
          <h1>Welcome Back</h1>
          <p className="text-muted">Sign in to MedConnect</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input input-with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                className="form-input input-with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span className="text-muted">Don't have an account?</span>
          <Link to="/register">Create account</Link>
        </div>

        <div className="auth-demo-creds">
          <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
            <strong>Demo credentials</strong> (password: <code>password123</code>)
          </p>
          <p className="text-muted" style={{ fontSize: '0.7rem' }}>
            Doctor: dr.silva@medconnect.com · Patient: patient.costa@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
