import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Briefcase, Building, CheckCircle, Send } from 'lucide-react';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobService.getJob(id);
        setJob(res.data);
      } catch {
        toast.error('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to apply.');
      return;
    }
    try {
      setApplying(true);
      await jobService.apply(id, { cover_letter: coverLetter });
      setApplied(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="section container" style={{ paddingTop: '7rem' }}><LoadingSpinner /></div>;
  if (!job) return <div className="section container" style={{ paddingTop: '7rem' }}><p style={{ color: 'var(--color-text-muted)' }}>Job not found.</p></div>;

  const daysLeft = job.deadline
    ? Math.ceil((new Date(job.deadline) - Date.now()) / 86400000)
    : null;

  return (
    <div className="job-detail-page section">
      <div className="container">
        <Link to="/jobs" className="back-link"><ArrowLeft size={16} /> Back to Jobs</Link>

        <div className="job-detail-grid">
          {/* Main Content */}
          <div className="job-detail-main">
            <div className="job-detail-hero glass-card animate-fade-in">
              <div className="job-detail-company-logo">
                <Building size={36} />
              </div>
              <div>
                <h1 className="job-detail-title">{job.title}</h1>
                <p className="job-detail-company">{job.company_name || 'InternshipWala Partner'}</p>
                <div className="job-detail-tags">
                  {job.location && <span className="job-tag"><MapPin size={13} />{job.location}</span>}
                  {job.type && <span className="job-tag type-tag">{job.type.replace('_', ' ')}</span>}
                  {daysLeft !== null && (
                    <span className={`job-tag ${daysLeft > 0 ? 'deadline-tag' : 'expired-tag'}`}>
                      <Clock size={13} />{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="job-description-card glass-card animate-fade-in animate-delay-1">
              <h2>About This Role</h2>
              <div className="job-description-text">
                {job.description || 'No description provided.'}
              </div>

              {job.requirements && (
                <>
                  <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Requirements</h3>
                  <div className="job-description-text">{job.requirements}</div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="job-detail-sidebar">
            {/* Quick Info */}
            <div className="job-info-card glass-card animate-fade-in">
              <h3>Job Overview</h3>
              <div className="job-info-rows">
                {job.stipend && (
                  <div className="info-row">
                    <span className="info-label">Stipend</span>
                    <span className="info-value stipend-value">₹{Number(job.stipend).toLocaleString('en-IN')}/mo</span>
                  </div>
                )}
                {job.duration && (
                  <div className="info-row">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{job.duration}</span>
                  </div>
                )}
                {job.openings && (
                  <div className="info-row">
                    <span className="info-label">Openings</span>
                    <span className="info-value">{job.openings}</span>
                  </div>
                )}
                {job.deadline && (
                  <div className="info-row">
                    <span className="info-label">Last Date</span>
                    <span className="info-value">{new Date(job.deadline).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Apply Card */}
            <div className="apply-card glass-card animate-fade-in animate-delay-1">
              {applied ? (
                <div className="apply-success">
                  <CheckCircle size={32} />
                  <p><strong>Applied Successfully!</strong><br />We'll notify you of updates.</p>
                </div>
              ) : (
                <>
                  <h3>Apply for This Role</h3>
                  {!isAuthenticated ? (
                    <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>Login to Apply</Link>
                  ) : (
                    <form onSubmit={handleApply}>
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label" htmlFor="cover-letter">Cover Letter (optional)</label>
                        <textarea
                          id="cover-letter"
                          className="form-input"
                          rows={5}
                          placeholder="Write a brief note about why you're a great fit..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applying || (daysLeft !== null && daysLeft <= 0)}
                        className="btn btn-primary btn-block"
                        id="apply-job-btn"
                        style={{ marginTop: '0.75rem' }}
                      >
                        {applying ? <div className="spinner spinner-sm" /> : <><Send size={15} /> Submit Application</>}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
