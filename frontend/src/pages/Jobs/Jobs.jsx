import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Search, Filter, ChevronRight, Building } from 'lucide-react';
import jobService from '../../services/jobService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './Jobs.css';

const JOB_TYPES = ['all', 'full_time', 'part_time', 'internship', 'contract'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 10 };
        if (search) params.search = search;
        if (type !== 'all') params.type = type;
        const res = await jobService.listJobs(params);
        setJobs(res.data || []);
        setMeta(res.meta || null);
      } catch (err) {
        toast.error(err.message || 'Failed to load job listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [page, type]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
    return diff > 0 ? `${diff} days left` : 'Expired';
  };

  return (
    <div className="jobs-page section">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Job <span className="gradient-text">Opportunities</span></h1>
          <p className="page-subtitle">Explore placement and internship opportunities from our partner companies.</p>
        </div>

        {/* Search & Filter */}
        <div className="jobs-controls glass-card animate-fade-in">
          <form onSubmit={handleSearch} className="search-row">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search job title, company..."
                className="form-input search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="job-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" id="job-search-btn">Search</button>
          </form>

          <div className="filter-row">
            <Filter size={15} />
            <span className="filter-label">Type:</span>
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                className={`filter-chip ${type === t ? 'active' : ''}`}
                onClick={() => { setType(t); setPage(1); }}
                id={`filter-${t}`}
              >
                {t === 'all' ? 'All' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div className="empty-state glass-card">
            <Briefcase size={48} className="empty-icon" />
            <h3>No Jobs Found</h3>
            <p>Try adjusting your search or check back later for new listings.</p>
          </div>
        ) : (
          <>
            <div className="jobs-list">
              {jobs.map((job, i) => {
                const deadline = daysLeft(job.deadline);
                return (
                  <div key={job.id} className="job-card glass-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="job-card-main">
                      <div className="company-logo-placeholder">
                        <Building size={24} />
                      </div>
                      <div className="job-info">
                        <h3 className="job-title">{job.title}</h3>
                        <p className="job-company">{job.company_name || 'InternshipWala Partner'}</p>
                        <div className="job-tags">
                          {job.location && (
                            <span className="job-tag"><MapPin size={12} />{job.location}</span>
                          )}
                          {job.type && (
                            <span className="job-tag type-tag">{job.type.replace('_', ' ')}</span>
                          )}
                          {deadline && (
                            <span className={`job-tag ${deadline === 'Expired' ? 'expired-tag' : 'deadline-tag'}`}>
                              <Clock size={12} />{deadline}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="job-card-footer">
                      {job.stipend && (
                        <span className="job-stipend">₹{Number(job.stipend).toLocaleString('en-IN')}/mo</span>
                      )}
                      <Link
                        to={`/jobs/${job.id}`}
                        className="btn btn-sm btn-outline"
                        id={`view-job-${job.id}`}
                      >
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="pagination-row">
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} id="prev-jobs-page">Previous</button>
                <span className="page-indicator">Page {meta.page} of {meta.totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} id="next-jobs-page">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
