import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, CheckCircle, Clock, Search } from 'lucide-react';
import certificateService from '../../services/certificateService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './Certificates.css';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyNum, setVerifyNum] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await certificateService.myCertificates();
        setCertificates(res.data || []);
      } catch (err) {
        toast.error(err.message || 'Failed to load certificates.');
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleDownload = async (cert) => {
    try {
      const blob = await certificateService.download(cert.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${cert.cert_number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed. Please try again.');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyNum.trim()) return;
    try {
      setVerifying(true);
      setVerifyResult(null);
      const res = await certificateService.verify(verifyNum.trim());
      setVerifyResult({ success: true, data: res.data });
    } catch (err) {
      setVerifyResult({ success: false, message: err.message || 'Certificate not found.' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="certificates-page section">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My <span className="gradient-text">Certificates</span></h1>
          <p className="page-subtitle">Download and verify your internship completion certificates.</p>
        </div>

        {/* Public Verify Tool */}
        <div className="verify-section glass-card animate-fade-in">
          <h3 className="verify-title"><Search size={18} /> Verify a Certificate</h3>
          <p className="verify-desc">Enter a certificate number to publicly verify its authenticity.</p>
          <form onSubmit={handleVerify} className="verify-form">
            <input
              type="text"
              placeholder="e.g. IW-2024-00123"
              className="form-input"
              value={verifyNum}
              onChange={(e) => setVerifyNum(e.target.value)}
              id="cert-verify-input"
            />
            <button type="submit" disabled={verifying} className="btn btn-primary" id="cert-verify-btn">
              {verifying ? <div className="spinner spinner-sm" /> : 'Verify'}
            </button>
          </form>

          {verifyResult && (
            <div className={`verify-result ${verifyResult.success ? 'verify-success' : 'verify-fail'}`}>
              {verifyResult.success ? (
                <>
                  <CheckCircle size={20} />
                  <div>
                    <strong>Valid Certificate</strong>
                    <p>{verifyResult.data?.student_name} — {verifyResult.data?.course_title}</p>
                    <p>Issued: {verifyResult.data?.issued_at ? new Date(verifyResult.data.issued_at).toLocaleDateString('en-IN') : '—'}</p>
                  </div>
                </>
              ) : (
                <>
                  <span>❌</span>
                  <span>{verifyResult.message}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* My Certificates */}
        <div className="certs-section">
          <h2 className="section-heading">Issued Certificates</h2>
          {loading ? (
            <LoadingSpinner />
          ) : certificates.length === 0 ? (
            <div className="empty-state glass-card">
              <Award size={48} className="empty-icon" />
              <h3>No Certificates Yet</h3>
              <p>Complete an internship program to receive your verified certificate.</p>
            </div>
          ) : (
            <div className="certs-grid">
              {certificates.map((cert) => (
                <div key={cert.id} className="cert-card glass-card animate-fade-in">
                  <div className="cert-icon-wrapper">
                    <Award size={32} />
                  </div>
                  <div className="cert-info">
                    <h3 className="cert-course">{cert.enrollment?.course?.title || 'Internship Program'}</h3>
                    <p className="cert-number">#{cert.cert_number}</p>
                    <p className="cert-date">
                      <Clock size={13} />
                      {cert.issued_at
                        ? `Issued: ${new Date(cert.issued_at).toLocaleDateString('en-IN')}`
                        : 'Pending Approval'}
                    </p>
                  </div>
                  <div className="cert-actions">
                    <span className={`badge ${cert.is_approved ? 'badge-success' : 'badge-accent'}`}>
                      {cert.is_approved ? <><CheckCircle size={12} /> Approved</> : <><Clock size={12} /> Pending</>}
                    </span>
                    {cert.is_approved && (
                      <button
                        onClick={() => handleDownload(cert)}
                        className="btn btn-sm btn-outline"
                        id={`download-cert-${cert.id}`}
                      >
                        <Download size={14} /> Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
