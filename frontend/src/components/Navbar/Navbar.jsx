import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, GraduationCap, LogOut, User, ChevronDown, Phone, MessageSquare } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="nav-logo">
          <div className="navbar__logo-icon">
            <GraduationCap size={26} />
          </div>
          <span className="navbar__logo-text">
            Internship<span className="brand-accent-text">WALA</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className={`navbar__links ${isOpen ? 'navbar__links--open' : ''}`}>
          <Link
            to="/"
            className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
            id="nav-home"
          >
            Home
          </Link>
          <Link
            to="/courses"
            className={`navbar__link ${location.pathname.startsWith('/courses') ? 'navbar__link--active' : ''}`}
            id="nav-courses"
          >
            Internships
          </Link>
          <a href="#departments" className="navbar__link" id="nav-departments">
            Departments
          </a>
          <a href="#featured-programs" className="navbar__link" id="nav-programs">
            Programs
          </a>
          <a href="#why-choose-us" className="navbar__link" id="nav-about">
            Why Us
          </a>
          <a href="#enquiry-section" className="navbar__link" id="nav-contact">
            Contact
          </a>

          {/* Mobile-only Contact & Social links in Drawer */}
          <div className="navbar__mobile-contact">
            <a href="tel:+919876543210" className="contact-icon-btn">
              <Phone size={18} /> <span>Call Us</span>
            </a>
            <a href="https://wa.me/919876543210" className="contact-icon-btn whatsapp-color" target="_blank" rel="noopener noreferrer">
              <MessageSquare size={18} /> <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="navbar__mobile-auth">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-sm" id="nav-mobile-dashboard">
                  Dashboard
                </Link>
                <button onClick={logout} className="btn btn-ghost btn-sm" id="nav-mobile-logout">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm" id="nav-mobile-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" id="nav-mobile-register">
                  Register Now
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Contact and Auth actions on Desktop */}
        <div className="navbar__actions-group">
          {/* Quick Contact Icons */}
          <div className="navbar__quick-contacts">
            <a href="tel:+919876543210" className="navbar__icon-link" title="Call Us">
              <Phone size={20} />
            </a>
            <a href="https://wa.me/919876543210" className="navbar__icon-link whatsapp-icon" target="_blank" rel="noopener noreferrer" title="WhatsApp Chat">
              <MessageSquare size={20} />
            </a>
          </div>

          {/* Desktop Auth Button Section */}
          <div className="navbar__auth">
            {isAuthenticated ? (
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
                  <ChevronDown size={16} className={dropdownOpen ? 'rotate-180' : ''} />
                </button>
                {dropdownOpen && (
                  <div className="navbar__dropdown animate-scale-in" id="nav-dropdown">
                    <Link to="/dashboard" className="navbar__dropdown-item" id="nav-dashboard">
                      <User size={16} />
                      Dashboard
                    </Link>
                    <button onClick={logout} className="navbar__dropdown-item navbar__dropdown-item--danger" id="nav-logout">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" id="nav-login">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" id="nav-register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="navbar__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          id="nav-toggle"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
