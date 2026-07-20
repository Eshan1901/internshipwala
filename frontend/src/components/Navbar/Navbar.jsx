import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, CreditCard, Award, LogIn, UserPlus, Phone } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMobileDropdownOpen('');
    setDropdownOpen(false);
  }, [location]);

  const toggleMobileDropdown = (name) => {
    setMobileDropdownOpen(mobileDropdownOpen === name ? '' : name);
  };

  const LogoIcon = () => (
    <svg viewBox="0 0 100 100" className="logo-svg" width="38" height="38">
      <circle cx="50" cy="50" r="46" fill="#00A2E8" />
      <path d="M25 70 L45 50 L55 60 L75 32" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 32 H75 V49" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      {/* ── Top Bar ────────────────────────────────────────── */}
      <div className="top-bar">
        <div className="container top-bar__inner">
          <div className="top-bar__left">
            <span className="customer-care">
              <Phone size={12} />
              Customer Care: <a href="tel:+917070436444">+91-7070436444</a>
            </span>
            <div className="social-icons">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter" title="Twitter">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Facebook">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                  <path d="M9 8H7v3h2v9h3v-9h3.6l.4-3H12V6c0-.9.2-1.2 1.2-1.2H15V2h-2.8C9.7 2 9 3.2 9 5.5V8z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="top-bar__right">
            {isAuthenticated ? (
              <div className="top-bar__auth-group">
                <span className="top-bar__user-greet">
                  <User size={12} />
                  Hello, {user?.full_name?.split(' ')[0] || 'User'}
                </span>
                <span className="top-bar__divider">|</span>
                <button onClick={logout} className="top-bar__logout-btn">
                  <LogOut size={12} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="top-bar__auth-group">
                <Link to="/login" className="top-bar__link" id="top-nav-login">
                  <LogIn size={12} />
                  Login
                </Link>
                <span className="top-bar__divider">|</span>
                <Link to="/register" className="top-bar__link" id="top-nav-register">
                  <UserPlus size={12} />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navbar ────────────────────────────────────── */}
      <nav className="navbar">
        <div className="container navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo" id="nav-logo">
            <div className="logo-container">
              <LogoIcon />
              <div className="logo-text">
                <span className="logo-text__main">INTERNSHIP WALA</span>
                <span className="logo-text__sub">CAREERS</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="navbar__links-desktop">
            <Link
              to="/"
              className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
              id="nav-home"
            >
              Home
            </Link>

            {/* About Dropdown */}
            <div className="navbar__dropdown-container">
              <span className="navbar__link">
                About <ChevronDown size={13} className="chevron" />
              </span>
              <div className="navbar__dropdown-menu">
                <a href="#why-choose-us" className="navbar__dropdown-item">Who We Are</a>
                <a href="#enquiry-section" className="navbar__dropdown-item">Our Mission</a>
                <Link to="/blog" className="navbar__dropdown-item">Our Blog</Link>
              </div>
            </div>

            {/* Jobs Dropdown */}
            <div className="navbar__dropdown-container">
              <span className="navbar__link">
                Jobs <ChevronDown size={13} className="chevron" />
              </span>
              <div className="navbar__dropdown-menu">
                <Link to="/jobs" className="navbar__dropdown-item">Latest Openings</Link>
                <a href="#enquiry-section" className="navbar__dropdown-item">Apply for Job</a>
              </div>
            </div>

            <Link
              to="/courses"
              className={`navbar__link ${location.pathname === '/courses' ? 'navbar__link--active' : ''}`}
              id="nav-study-abroad"
            >
              Study Abroad
            </Link>

            {/* Department Dropdown */}
            <div className="navbar__dropdown-container">
              <span className="navbar__link">
                Department <ChevronDown size={13} className="chevron" />
              </span>
              <div className="navbar__dropdown-menu">
                <Link to="/courses" className="navbar__dropdown-item">Computer Science</Link>
                <Link to="/courses" className="navbar__dropdown-item">Mechanical Engineering</Link>
                <Link to="/courses" className="navbar__dropdown-item">Electrical Engineering</Link>
                <Link to="/courses" className="navbar__dropdown-item">Electronics Engineering</Link>
                <Link to="/courses" className="navbar__dropdown-item">Civil Engineering</Link>
              </div>
            </div>

            {/* CSE Internship Dropdown */}
            <div className="navbar__dropdown-container">
              <span className="navbar__link">
                CSE Internship <ChevronDown size={13} className="chevron" />
              </span>
              <div className="navbar__dropdown-menu">
                <Link to="/courses" className="navbar__dropdown-item">Full Stack Web Dev</Link>
                <Link to="/courses" className="navbar__dropdown-item">Python & ML</Link>
                <Link to="/courses" className="navbar__dropdown-item">Data Science</Link>
                <Link to="/courses" className="navbar__dropdown-item">Android Development</Link>
              </div>
            </div>

            {/* Core Internship Dropdown */}
            <div className="navbar__dropdown-container">
              <span className="navbar__link">
                Core Internship <ChevronDown size={13} className="chevron" />
              </span>
              <div className="navbar__dropdown-menu">
                <Link to="/courses" className="navbar__dropdown-item">Mechanical CAD</Link>
                <Link to="/courses" className="navbar__dropdown-item">Embedded Systems & IoT</Link>
                <Link to="/courses" className="navbar__dropdown-item">EV Design</Link>
                <Link to="/courses" className="navbar__dropdown-item">Revit Architecture</Link>
              </div>
            </div>

            {/* More Dropdown */}
            <div className="navbar__dropdown-container">
              <span className="navbar__link">
                More <ChevronDown size={13} className="chevron" />
              </span>
              <div className="navbar__dropdown-menu">
                <Link to="/blog" className="navbar__dropdown-item">Blog</Link>
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className="navbar__dropdown-item">Dashboard</Link>
                    <Link to="/enrollments" className="navbar__dropdown-item">My Enrollments</Link>
                    <Link to="/payments" className="navbar__dropdown-item">My Payments</Link>
                    <Link to="/certificates" className="navbar__dropdown-item">Certificates</Link>
                  </>
                )}
              </div>
            </div>

            <a href="#enquiry-section" className="navbar__link" id="nav-contact">
              Contact Us
            </a>
          </div>

          {/* Desktop User Avatar Menu if logged in */}
          {isAuthenticated && (
            <div className="navbar__actions-desktop">
              <div className="navbar__user-menu">
                <button
                  className="navbar__user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  id="nav-user-menu"
                >
                  <div className="navbar__avatar">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="navbar__user-name">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown size={15} className={dropdownOpen ? 'rotate-180' : ''} />
                </button>
                {dropdownOpen && (
                  <div className="navbar__dropdown animate-scale-in" id="nav-dropdown">
                    <Link to="/dashboard" className="navbar__dropdown-item" id="nav-dashboard">
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/enrollments" className="navbar__dropdown-item" id="nav-enrollments">
                      <User size={15} /> My Enrollments
                    </Link>
                    <Link to="/payments" className="navbar__dropdown-item" id="nav-payments">
                      <CreditCard size={15} /> My Payments
                    </Link>
                    <Link to="/certificates" className="navbar__dropdown-item" id="nav-certificates">
                      <Award size={15} /> Certificates
                    </Link>
                    <button onClick={logout} className="navbar__dropdown-item navbar__dropdown-item--danger" id="nav-logout">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="navbar__toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            id="nav-toggle"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`navbar__drawer ${isOpen ? 'navbar__drawer--open' : ''}`}>
          <div className="navbar__drawer-inner">
            <Link to="/" className="navbar__drawer-link" id="nav-mobile-home">Home</Link>
            
            {/* Mobile About */}
            <div className="navbar__mobile-dropdown">
              <button className="navbar__mobile-toggle-btn" onClick={() => toggleMobileDropdown('about')}>
                About <ChevronDown size={16} className={mobileDropdownOpen === 'about' ? 'rotate-180' : ''} />
              </button>
              {mobileDropdownOpen === 'about' && (
                <div className="navbar__mobile-menu">
                  <a href="#why-choose-us" className="navbar__mobile-subitem">Who We Are</a>
                  <a href="#enquiry-section" className="navbar__mobile-subitem">Our Mission</a>
                  <Link to="/blog" className="navbar__mobile-subitem">Our Blog</Link>
                </div>
              )}
            </div>

            {/* Mobile Jobs */}
            <div className="navbar__mobile-dropdown">
              <button className="navbar__mobile-toggle-btn" onClick={() => toggleMobileDropdown('jobs')}>
                Jobs <ChevronDown size={16} className={mobileDropdownOpen === 'jobs' ? 'rotate-180' : ''} />
              </button>
              {mobileDropdownOpen === 'jobs' && (
                <div className="navbar__mobile-menu">
                  <Link to="/jobs" className="navbar__mobile-subitem">Latest Openings</Link>
                  <a href="#enquiry-section" className="navbar__mobile-subitem">Apply for Job</a>
                </div>
              )}
            </div>

            <Link to="/courses" className="navbar__drawer-link" id="nav-mobile-study-abroad">Study Abroad</Link>

            {/* Mobile Department */}
            <div className="navbar__mobile-dropdown">
              <button className="navbar__mobile-toggle-btn" onClick={() => toggleMobileDropdown('department')}>
                Department <ChevronDown size={16} className={mobileDropdownOpen === 'department' ? 'rotate-180' : ''} />
              </button>
              {mobileDropdownOpen === 'department' && (
                <div className="navbar__mobile-menu">
                  <Link to="/courses" className="navbar__mobile-subitem">Computer Science</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Mechanical Engineering</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Electrical Engineering</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Electronics Engineering</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Civil Engineering</Link>
                </div>
              )}
            </div>

            {/* Mobile CSE Internship */}
            <div className="navbar__mobile-dropdown">
              <button className="navbar__mobile-toggle-btn" onClick={() => toggleMobileDropdown('cse')}>
                CSE Internship <ChevronDown size={16} className={mobileDropdownOpen === 'cse' ? 'rotate-180' : ''} />
              </button>
              {mobileDropdownOpen === 'cse' && (
                <div className="navbar__mobile-menu">
                  <Link to="/courses" className="navbar__mobile-subitem">Full Stack Web Dev</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Python & ML</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Data Science</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Android Development</Link>
                </div>
              )}
            </div>

            {/* Mobile Core Internship */}
            <div className="navbar__mobile-dropdown">
              <button className="navbar__mobile-toggle-btn" onClick={() => toggleMobileDropdown('core')}>
                Core Internship <ChevronDown size={16} className={mobileDropdownOpen === 'core' ? 'rotate-180' : ''} />
              </button>
              {mobileDropdownOpen === 'core' && (
                <div className="navbar__mobile-menu">
                  <Link to="/courses" className="navbar__mobile-subitem">Mechanical CAD</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Embedded Systems & IoT</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">EV Design</Link>
                  <Link to="/courses" className="navbar__mobile-subitem">Revit Architecture</Link>
                </div>
              )}
            </div>

            {/* Mobile More */}
            <div className="navbar__mobile-dropdown">
              <button className="navbar__mobile-toggle-btn" onClick={() => toggleMobileDropdown('more')}>
                More <ChevronDown size={16} className={mobileDropdownOpen === 'more' ? 'rotate-180' : ''} />
              </button>
              {mobileDropdownOpen === 'more' && (
                <div className="navbar__mobile-menu">
                  <Link to="/blog" className="navbar__mobile-subitem">Blog</Link>
                  {isAuthenticated && (
                    <>
                      <Link to="/dashboard" className="navbar__mobile-subitem">Dashboard</Link>
                      <Link to="/enrollments" className="navbar__mobile-subitem">My Enrollments</Link>
                      <Link to="/payments" className="navbar__mobile-subitem">My Payments</Link>
                      <Link to="/certificates" className="navbar__mobile-subitem">Certificates</Link>
                      <button onClick={logout} className="navbar__mobile-subitem text-danger">Logout</button>
                    </>
                  )}
                </div>
              )}
            </div>

            <a href="#enquiry-section" className="navbar__drawer-link" id="nav-mobile-contact">Contact Us</a>

            {/* Mobile Guest Auth Buttons */}
            {!isAuthenticated && (
              <div className="navbar__drawer-auth">
                <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
