import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { Heart, Mail, Lock, User, ArrowRight, Stethoscope } from 'lucide-react';
import type { AuthResponse } from '../../types';
import './Auth.css';

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '',
    specialty: '',
    licenseNumber: '',
    bio: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>('/api/auth/register', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Registration failed');
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

      <div className="auth-card glass-card animate-slide-up" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <Heart className="auth-logo-icon" />
          </div>
          <h1>Create Account</h1>
          <p className="text-muted">Join MedConnect today</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          {step === 1 && (
            <div className="animate-fade-in">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-first">First Name</label>
                <div className="input-icon-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="reg-first"
                    type="text"
                    className="form-input input-with-icon"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group mt-md">
                <label className="form-label" htmlFor="reg-last">Last Name</label>
                <input
                  id="reg-last"
                  type="text"
                  className="form-input"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  required
                />
              </div>

              <div className="form-group mt-md">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input input-with-icon"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => update('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group mt-md">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="reg-password"
                    type="password"
                    className="form-input input-with-icon"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="form-group mt-md">
                <label className="form-label">I am a...</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-card ${formData.role === 'PATIENT' ? 'selected' : ''}`}
                    onClick={() => update('role', 'PATIENT')}
                  >
                    <User size={24} />
                    <span>Patient</span>
                  </button>
                  <button
                    type="button"
                    className={`role-card ${formData.role === 'DOCTOR' ? 'selected' : ''}`}
                    onClick={() => update('role', 'DOCTOR')}
                  >
                    <Stethoscope size={24} />
                    <span>Doctor</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg w-full mt-lg"
                disabled={!formData.role || !formData.email || !formData.password}
                onClick={() => setStep(2)}
              >
                Continue
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              {formData.role === 'DOCTOR' ? (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-specialty">Specialty</label>
                    <input
                      id="reg-specialty"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cardiology"
                      value={formData.specialty}
                      onChange={(e) => update('specialty', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group mt-md">
                    <label className="form-label" htmlFor="reg-license">License Number</label>
                    <input
                      id="reg-license"
                      type="text"
                      className="form-input"
                      placeholder="e.g. CRM-SP-123456"
                      value={formData.licenseNumber}
                      onChange={(e) => update('licenseNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group mt-md">
                    <label className="form-label" htmlFor="reg-bio">Bio</label>
                    <textarea
                      id="reg-bio"
                      className="form-input"
                      placeholder="Brief professional bio..."
                      value={formData.bio}
                      onChange={(e) => update('bio', e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="reg-dob">Date of Birth</label>
                    <input
                      id="reg-dob"
                      type="date"
                      className="form-input"
                      value={formData.dateOfBirth}
                      onChange={(e) => update('dateOfBirth', e.target.value)}
                    />
                  </div>
                  <div className="form-group mt-md">
                    <label className="form-label" htmlFor="reg-blood">Blood Type</label>
                    <select
                      id="reg-blood"
                      className="form-input"
                      value={formData.bloodType}
                      onChange={(e) => update('bloodType', e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="form-group mt-md">
                    <label className="form-label" htmlFor="reg-allergies">Allergies</label>
                    <input
                      id="reg-allergies"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Penicillin, None"
                      value={formData.allergies}
                      onChange={(e) => update('allergies', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-md mt-lg">
                <button
                  type="button"
                  className="btn btn-secondary btn-lg"
                  onClick={() => setStep(1)}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ flex: 2 }}
                >
                  {loading ? <div className="spinner" /> : 'Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <span className="text-muted">Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
