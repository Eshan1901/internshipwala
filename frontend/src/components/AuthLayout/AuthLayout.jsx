import { GraduationCap, Award, CheckCircle } from 'lucide-react';
import './AuthLayout.css';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-container">
      {/* Visual / Info Left Panel */}
      <div className="auth-info-panel">
        <div className="auth-info-panel__glow" />
        <div className="auth-info-panel__content">
          <div className="auth-info-logo">
            <GraduationCap size={32} />
            <span>Internship<span className="gradient-text">Wala</span></span>
          </div>

          <h2 className="auth-info-title">
            Unlock the gateway to your <span className="gradient-text">dream career</span>.
          </h2>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <CheckCircle size={20} className="benefit-icon" />
              <div>
                <h4>Practical Project Portfolio</h4>
                <p>Work on industry-aligned assignments curated by experts.</p>
              </div>
            </div>
            <div className="auth-benefit">
              <Award size={20} className="benefit-icon" />
              <div>
                <h4>Verified Certifications</h4>
                <p>Sharable digital credentials trusted by core enterprises.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form / Interactive Right Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card glass-card animate-scale-in">
          <div className="auth-form-header">
            <h1 className="auth-title">{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
