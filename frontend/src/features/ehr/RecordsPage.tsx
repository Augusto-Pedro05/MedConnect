import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import type { HealthRecord, HealthRecordRequest, Appointment } from '../../types';
import {
  FileText,
  Plus,
  X,
  Clock,
  Stethoscope,
  Pill,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import './Records.css';

export function RecordsPage() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<HealthRecordRequest>({
    patientId: 0,
    diagnosis: '',
    clinicalNotes: '',
    prescription: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user?.role === 'PATIENT') {
        const res = await api.get<HealthRecord[]>(
          `/api/records/patient/${user.userId}`
        );
        setRecords(res.data);
      } else if (user?.role === 'DOCTOR') {
        // Doctor: load appointments to get patient list
        const apptRes = await api.get<Appointment[]>('/api/appointments');
        setAppointments(apptRes.data);

        // Load records for each unique patient
        const patientIds = [
          ...new Set(apptRes.data.map((a) => a.patientId)),
        ];
        const allRecords: HealthRecord[] = [];
        for (const pid of patientIds) {
          try {
            const res = await api.get<HealthRecord[]>(
              `/api/records/patient/${pid}`
            );
            allRecords.push(...res.data);
          } catch {
            // Doctor may not have access to all patients' records
          }
        }
        setRecords(allRecords);
      }
    } catch (err) {
      console.error('Failed to load records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/api/records', formData);
      setShowCreate(false);
      setFormData({
        patientId: 0,
        diagnosis: '',
        clinicalNotes: '',
        prescription: '',
      });
      await loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFormError(error.response?.data?.message || 'Failed to create record');
    } finally {
      setSubmitting(false);
    }
  };

  const uniquePatients = [
    ...new Map(
      appointments.map((a) => [a.patientId, { id: a.patientId, name: a.patientName }])
    ).values(),
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <p className="text-muted">Loading health records...</p>
      </div>
    );
  }

  return (
    <div className="records-page page-enter">
      <div className="dashboard-header">
        <div>
          <h1>Health Records</h1>
          <p className="text-muted">
            {user?.role === 'PATIENT'
              ? 'Your electronic health record timeline'
              : 'Manage patient health records'}
          </p>
        </div>
        {user?.role === 'DOCTOR' && !showCreate && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} />
            New Record
          </button>
        )}
      </div>

      {/* Create Record Form (Doctor only) */}
      {showCreate && user?.role === 'DOCTOR' && (
        <div className="glass-card animate-slide-up mb-lg" style={{ borderColor: 'var(--accent-primary)' }}>
          <div className="card-header">
            <h3>
              <ClipboardList size={18} />
              Create Health Record
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowCreate(false)}
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="record-form">
            {formError && <div className="auth-error">{formError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="rec-patient">Patient</label>
              <select
                id="rec-patient"
                className="form-input"
                value={formData.patientId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    patientId: Number(e.target.value),
                  })
                }
                required
              >
                <option value={0}>Select patient...</option>
                {uniquePatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rec-diagnosis">Diagnosis</label>
              <input
                id="rec-diagnosis"
                type="text"
                className="form-input"
                placeholder="Primary diagnosis"
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rec-notes">Clinical Notes</label>
              <textarea
                id="rec-notes"
                className="form-input"
                placeholder="Detailed clinical observations..."
                value={formData.clinicalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, clinicalNotes: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rec-prescription">Prescription</label>
              <textarea
                id="rec-prescription"
                className="form-input"
                placeholder="Medications and dosage..."
                value={formData.prescription}
                onChange={(e) =>
                  setFormData({ ...formData, prescription: e.target.value })
                }
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || !formData.patientId}
            >
              {submitting ? <div className="spinner" /> : 'Save Record'}
            </button>
          </form>
        </div>
      )}

      {/* Records Timeline */}
      {records.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <FileText size={48} />
            <p>No health records found</p>
          </div>
        </div>
      ) : (
        <div className="records-timeline">
          {records.map((record) => (
            <div
              key={record.id}
              className={`record-timeline-item glass-card ${
                expandedId === record.id ? 'expanded' : ''
              }`}
            >
              <div
                className="record-timeline-header"
                onClick={() =>
                  setExpandedId(
                    expandedId === record.id ? null : record.id
                  )
                }
              >
                <div className="record-timeline-dot" />
                <div className="record-timeline-info">
                  <h4>{record.diagnosis}</h4>
                  <div className="record-meta">
                    <span>
                      <Stethoscope size={14} />
                      Dr. {record.doctorName}
                    </span>
                    <span>
                      <Clock size={14} />
                      {new Date(record.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="record-expand-icon">
                  {expandedId === record.id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </div>

              {expandedId === record.id && (
                <div className="record-timeline-body animate-fade-in">
                  {record.clinicalNotes && (
                    <div className="record-section">
                      <h5>
                        <ClipboardList size={16} />
                        Clinical Notes
                      </h5>
                      <p>{record.clinicalNotes}</p>
                    </div>
                  )}
                  {record.prescription && (
                    <div className="record-section">
                      <h5>
                        <Pill size={16} />
                        Prescription
                      </h5>
                      <p>{record.prescription}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
