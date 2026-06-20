import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import type { Appointment, HealthRecord } from '../../types';
import {
  Calendar,
  FileText,
  Clock,
  Activity,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
} from 'lucide-react';
import './Dashboard.css';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apptRes, recordsRes] = await Promise.all([
        api.get<Appointment[]>('/api/appointments'),
        user?.role === 'PATIENT'
          ? api.get<HealthRecord[]>(`/api/records/patient/${user.userId}`)
          : Promise.resolve({ data: [] as HealthRecord[] }),
      ]);
      setAppointments(apptRes.data);
      setRecords(recordsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'SCHEDULED'
  );
  const completedAppointments = appointments.filter(
    (a) => a.status === 'COMPLETED'
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page page-enter">
      <div className="dashboard-header">
        <div>
          <h1>
            {user?.role === 'DOCTOR' ? 'Doctor' : 'Patient'} Dashboard
          </h1>
          <p className="text-muted">
            Here's an overview of your{' '}
            {user?.role === 'DOCTOR' ? 'practice' : 'health'} today
          </p>
        </div>
        {user?.role === 'PATIENT' && (
          <Link to="/appointments?action=new" className="btn btn-primary">
            <Plus size={18} />
            Book Appointment
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon stat-icon-primary">
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{upcomingAppointments.length}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>

        <div className="stat-card glass-card" style={{ animationDelay: '80ms' }}>
          <div className="stat-icon stat-icon-success">
            <Activity size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{completedAppointments.length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card glass-card" style={{ animationDelay: '160ms' }}>
          <div className="stat-icon stat-icon-purple">
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {user?.role === 'PATIENT' ? records.length : appointments.length}
            </span>
            <span className="stat-label">
              {user?.role === 'PATIENT' ? 'Health Records' : 'Total Patients'}
            </span>
          </div>
        </div>

        <div className="stat-card glass-card" style={{ animationDelay: '240ms' }}>
          <div className="stat-icon stat-icon-warning">
            {user?.role === 'DOCTOR' ? <Users size={22} /> : <TrendingUp size={22} />}
          </div>
          <div className="stat-info">
            <span className="stat-value">{appointments.length}</span>
            <span className="stat-label">
              {user?.role === 'DOCTOR' ? 'Appointments' : 'Total Visits'}
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Upcoming Appointments */}
        <div className="glass-card">
          <div className="card-header">
            <h3>
              <Calendar size={18} />
              Upcoming Appointments
            </h3>
            <Link to="/appointments" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="empty-state">
              <Clock size={40} />
              <p>No upcoming appointments</p>
              {user?.role === 'PATIENT' && (
                <Link to="/appointments?action=new" className="btn btn-primary btn-sm">
                  Book Now
                </Link>
              )}
            </div>
          ) : (
            <div className="appointment-list">
              {upcomingAppointments.slice(0, 5).map((appt) => (
                <div key={appt.id} className="appointment-item">
                  <div className="appointment-time">
                    <span className="time-date">
                      {new Date(appt.dateTime).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="time-hour">
                      {new Date(appt.dateTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <span className="appointment-name">
                      {user?.role === 'PATIENT'
                        ? `Dr. ${appt.doctorName}`
                        : appt.patientName}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      {appt.notes || 'No notes'}
                    </span>
                  </div>
                  <span className="badge badge-scheduled">Scheduled</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Records / Activity */}
        <div className="glass-card">
          <div className="card-header">
            <h3>
              <FileText size={18} />
              {user?.role === 'PATIENT' ? 'Recent Health Records' : 'Recent Activity'}
            </h3>
            <Link to="/records" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {user?.role === 'PATIENT' && records.length === 0 ? (
            <div className="empty-state">
              <FileText size={40} />
              <p>No health records yet</p>
            </div>
          ) : user?.role === 'PATIENT' ? (
            <div className="records-list">
              {records.slice(0, 4).map((record) => (
                <div key={record.id} className="record-item">
                  <div className="record-dot" />
                  <div className="record-info">
                    <span className="record-diagnosis">{record.diagnosis}</span>
                    <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      Dr. {record.doctorName} ·{' '}
                      {new Date(record.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="records-list">
              {completedAppointments.slice(0, 4).map((appt) => (
                <div key={appt.id} className="record-item">
                  <div className="record-dot record-dot-completed" />
                  <div className="record-info">
                    <span className="record-diagnosis">{appt.patientName}</span>
                    <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      {new Date(appt.dateTime).toLocaleDateString()} · {appt.notes || 'Completed'}
                    </span>
                  </div>
                </div>
              ))}
              {completedAppointments.length === 0 && (
                <div className="empty-state">
                  <Activity size={40} />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
