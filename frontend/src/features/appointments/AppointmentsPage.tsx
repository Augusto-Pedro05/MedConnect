import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import type { Appointment, AppointmentRequest, DoctorProfile } from '../../types';
import {
  Calendar,
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import './Appointments.css';

export function AppointmentsPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(
    searchParams.get('action') === 'new'
  );
  const [bookingData, setBookingData] = useState<AppointmentRequest>({
    doctorId: 0,
    dateTime: '',
    notes: '',
  });
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apptRes, doctorsRes] = await Promise.all([
        api.get<Appointment[]>('/api/appointments'),
        user?.role === 'PATIENT'
          ? api.get<DoctorProfile[]>('/api/doctors')
          : Promise.resolve({ data: [] as DoctorProfile[] }),
      ]);
      setAppointments(apptRes.data);
      setDoctors(doctorsRes.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setSubmitting(true);

    try {
      await api.post('/api/appointments', bookingData);
      setShowBooking(false);
      setSearchParams({});
      setBookingData({ doctorId: 0, dateTime: '', notes: '' });
      await loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setBookingError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, { status });
      await loadData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredAppointments =
    filter === 'ALL'
      ? appointments
      : appointments.filter((a) => a.status === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <p className="text-muted">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="appointments-page page-enter">
      <div className="dashboard-header">
        <div>
          <h1>Appointments</h1>
          <p className="text-muted">Manage your scheduled visits</p>
        </div>
        {user?.role === 'PATIENT' && !showBooking && (
          <button
            className="btn btn-primary"
            onClick={() => setShowBooking(true)}
          >
            <Plus size={18} />
            Book Appointment
          </button>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && user?.role === 'PATIENT' && (
        <div className="booking-card glass-card animate-slide-up mb-lg">
          <div className="card-header">
            <h3>
              <Calendar size={18} />
              Book New Appointment
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setShowBooking(false);
                setSearchParams({});
              }}
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleBook} className="booking-form">
            {bookingError && (
              <div className="auth-error">{bookingError}</div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="booking-doctor">Select Doctor</label>
              <select
                id="booking-doctor"
                className="form-input"
                value={bookingData.doctorId}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    doctorId: Number(e.target.value),
                  })
                }
                required
              >
                <option value={0}>Choose a doctor...</option>
                {doctors.map((doc) => (
                  <option key={doc.userId} value={doc.userId}>
                    Dr. {doc.firstName} {doc.lastName} — {doc.specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="booking-datetime">
                Date & Time (30-min slots: :00 or :30)
              </label>
              <input
                id="booking-datetime"
                type="datetime-local"
                className="form-input"
                value={bookingData.dateTime}
                onChange={(e) =>
                  setBookingData({ ...bookingData, dateTime: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="booking-notes">Notes (optional)</label>
              <textarea
                id="booking-notes"
                className="form-input"
                placeholder="Describe your symptoms or reason for visit..."
                value={bookingData.notes}
                onChange={(e) =>
                  setBookingData({ ...bookingData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || !bookingData.doctorId}
            >
              {submitting ? <div className="spinner" /> : 'Confirm Booking'}
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="filter-tabs mb-lg">
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' && <Search size={14} />}
            {f === 'SCHEDULED' && <Clock size={14} />}
            {f === 'COMPLETED' && <CheckCircle size={14} />}
            {f === 'CANCELLED' && <XCircle size={14} />}
            {f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="filter-count">
              {f === 'ALL'
                ? appointments.length
                : appointments.filter((a) => a.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <Calendar size={48} />
            <p>No appointments found</p>
          </div>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((appt) => (
            <div key={appt.id} className="glass-card appointment-card">
              <div className="appointment-card-header">
                <span
                  className={`badge badge-${appt.status.toLowerCase()}`}
                >
                  {appt.status}
                </span>
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                  {appt.durationMinutes} min
                </span>
              </div>

              <div className="appointment-card-body">
                <h4>
                  {user?.role === 'PATIENT'
                    ? `Dr. ${appt.doctorName}`
                    : appt.patientName}
                </h4>
                {appt.doctorSpecialty && (
                  <span className="text-muted">{appt.doctorSpecialty}</span>
                )}
                <div className="appointment-card-time">
                  <Calendar size={14} />
                  <span>
                    {new Date(appt.dateTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="appointment-card-time">
                  <Clock size={14} />
                  <span>
                    {new Date(appt.dateTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {appt.notes && (
                  <p
                    className="text-muted"
                    style={{ fontSize: '0.8125rem', marginTop: '8px' }}
                  >
                    {appt.notes}
                  </p>
                )}
              </div>

              {appt.status === 'SCHEDULED' && (
                <div className="appointment-card-actions">
                  {user?.role === 'DOCTOR' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        handleStatusUpdate(appt.id, 'COMPLETED')
                      }
                    >
                      <CheckCircle size={14} />
                      Complete
                    </button>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      handleStatusUpdate(appt.id, 'CANCELLED')
                    }
                  >
                    <XCircle size={14} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
