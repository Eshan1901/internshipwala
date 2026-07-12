import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, MapPin, ArrowRight } from 'lucide-react';
import './Footer.css';
import { toast } from 'react-hot-toast';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Successfully subscribed to our newsletter!');
    setEmail('');
  };

  return (
    <footer className="footer" id="footer-section">
      <div className="container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <div className="footer__logo-icon">
                <GraduationCap size={24} />
              </div>
              <span className="footer__logo-text">
                Internship<span className="brand-accent-text">WALA</span>
              </span>
            </Link>
            <p className="footer__desc">
              India's leading career acceleration and internship training platform by Cloudtechz InternshipWALA Private Limited.
            </p>
            <div className="footer__socials">
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Github">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer__col">
            <h4 className="footer__heading">Navigation</h4>
            <div className="footer__links">
              <Link to="/" className="footer__link">Home</Link>
              <Link to="/courses" className="footer__link">All Internships</Link>
              <a href="#departments" className="footer__link">Departments</a>
              <a href="#testimonials" className="footer__link">Success Stories</a>
              <a href="#why-choose-us" className="footer__link">Why Us</a>
            </div>
          </div>

          {/* Programs Column */}
          <div className="footer__col">
            <h4 className="footer__heading">Programs</h4>
            <div className="footer__links">
              <Link to="/courses?type=online" className="footer__link">Online Internships</Link>
              <Link to="/courses?type=industrial" className="footer__link">Industrial Training</Link>
              <Link to="/courses?type=offline" className="footer__link">Offline Internships</Link>
              <Link to="/courses" className="footer__link">Capstone Projects</Link>
            </div>
          </div>

          {/* Contact & Newsletter Column */}
          <div className="footer__col footer__col--newsletter">
            <h4 className="footer__heading">Contact & Newsletter</h4>
            <div className="footer__contact-info">
              <p className="contact-item">
                <Mail size={16} /> career.internshipwala@gmail.com
              </p>
              <p className="contact-item">
                <MapPin size={16} /> Noida / New Delhi, India
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="footer__newsletter-form">
              <label htmlFor="newsletter-email" className="visually-hidden">Subscribe to Newsletter</label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Enter your email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} Cloudtechz InternshipWALA Private Limited. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <a href="#" className="footer__bottom-link">Privacy Policy</a>
            <span className="divider">|</span>
            <a href="#" className="footer__bottom-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
