import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, GraduationCap, Award, Users, BookOpen,
  Briefcase, Globe, Shield, Zap, CheckCircle, Star,
  ChevronRight, Phone, MessageSquare, Laptop, Settings,
  Cpu, Building, User, MapPin, Send, HelpCircle
} from 'lucide-react';
import CourseCard from '../../components/CourseCard/CourseCard';
import courseService from '../../services/courseService';
import './Home.css';
import { toast } from 'react-hot-toast';

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats CountUp hooks
  const [studentsCount, studentsRef] = useCountUp(15000);
  const [coursesCount, coursesRef] = useCountUp(50);
  const [partnersCount, partnersRef] = useCountUp(200);
  const [ratingCount, ratingRef] = useCountUp(48); // 4.8

  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    mobile: '',
    college: '',
    city: '',
    duration: '4-weeks',
  });
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseService.listCourses({ limit: 4 });
        setCourses(res.courses || res.data || []);
      } catch {
        // Fallback demo courses matching backend structure
        setCourses([
          {
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            title: 'Full Stack Web Development Internship',
            description: 'Hands-on training covering modern frontend (React), backend (Node/Express), database integration and cloud deployment.',
            type: 'online',
            is_new_badge: true,
            category: { name: 'Computer Science Engineering', colour_code: '#0f766e' },
          },
          {
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            title: 'Industrial Training in CAD and Manufacturing',
            description: 'Physical & offline training covering CAD modeling, component design analysis, and assembly-to-production workflows.',
            type: 'industrial',
            is_new_badge: false,
            category: { name: 'Mechanical Engineering', colour_code: '#1e40af' },
          },
          {
            id: 'demo-3',
            title: 'Data Science & Machine Learning Program',
            description: 'Comprehensive program covering Python coding, exploratory data analytics, machine learning model building, and API integration.',
            type: 'online',
            is_new_badge: true,
            category: { name: 'Information Technology', colour_code: '#0f766e' },
          },
          {
            id: 'demo-4',
            title: 'Embedded Systems & IoT Integration',
            description: 'Learn microcontrollers design, sensory inputs processing, RTOS operations, and IoT telemetry reporting via MQTT.',
            type: 'offline',
            is_new_badge: false,
            category: { name: 'Electronics Engineering', colour_code: '#ea580c' },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnquiryChange = (e) => {
    setEnquiryForm({ ...enquiryForm, [e.target.name]: e.target.value });
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();

    // Verification
    if (enquiryForm.mobile.length !== 10 || !/^\d{10}$/.test(enquiryForm.mobile)) {
      toast.error('Mobile number must be a valid 10-digit number.');
      return;
    }

    setSubmittingEnquiry(true);
    setTimeout(() => {
      setSubmittingEnquiry(false);
      setEnquirySuccess(true);
      toast.success('Your inquiry has been submitted! Our mentors will call you shortly.');
    }, 1500);
  };

  const resetEnquiryForm = () => {
    setEnquiryForm({
      name: '',
      email: '',
      mobile: '',
      college: '',
      city: '',
      duration: '4-weeks',
    });
    setEnquirySuccess(false);
  };

  return (
    <div className="home-redesign">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content animate-fade-in">
            <span className="hero-badge">
              <Zap size={14} /> AICTE Recognized Learning Platform
            </span>
            <h1 className="hero-title">
              Launch Your Career with <span className="highlight-text">Real Industry</span> Internships
            </h1>
            <p className="hero-subtitle">
              India's leading platform for online & offline internship training, industrial projects, and verified certifications for engineering, BBA/MBA & commerce students.
            </p>
            <div className="hero-actions">
              <a href="#enquiry-section" className="btn btn-primary btn-lg">
                Apply Now <ArrowRight size={18} />
              </a>
              <Link to="/courses" className="btn btn-outline btn-lg">
                Explore Courses
              </Link>
            </div>
            
            <div className="hero-checklists">
              <span className="check-item"><CheckCircle size={16} /> 15,000+ Students Trained</span>
              <span className="check-item"><CheckCircle size={16} /> 200+ Partner Companies</span>
              <span className="check-item"><CheckCircle size={16} /> AICTE & ISO Recognized</span>
            </div>
          </div>
          
          <div className="hero-visual animate-fade-in animate-delay-1">
            <div className="illustration-container">
              {/* Modern geometric illustration placeholder built with CSS styling */}
              <div className="floating-bubble card-students">
                <Users size={16} /> <span>15k+ Learners</span>
              </div>
              <div className="floating-bubble card-placement">
                <Award size={16} /> <span>100% Verified</span>
              </div>
              
              <div className="hero-illustration">
                <div className="circle-bg"></div>
                <div className="student-graphic">
                  <Laptop size={64} className="graphic-laptop" />
                  <div className="graphic-charts">
                    <div className="bar bar-1"></div>
                    <div className="bar bar-2"></div>
                    <div className="bar bar-3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Trust Bar / Stats ──────────────────────────────────── */}
      <section className="trust-bar-section">
        <div className="container">
          <div className="stats-cards-grid">
            <div className="stat-card" ref={studentsRef}>
              <div className="stat-icon-wrapper"><GraduationCap size={24} /></div>
              <div>
                <h3 className="stat-number">{studentsCount.toLocaleString()}+</h3>
                <p className="stat-label">Students Trained</p>
              </div>
            </div>
            <div className="stat-card" ref={partnersRef}>
              <div className="stat-icon-wrapper"><Building size={24} /></div>
              <div>
                <h3 className="stat-number">{partnersCount}+</h3>
                <p className="stat-label">Partner Companies</p>
              </div>
            </div>
            <div className="stat-card" ref={coursesRef}>
              <div className="stat-icon-wrapper"><BookOpen size={24} /></div>
              <div>
                <h3 className="stat-number">{coursesCount}+</h3>
                <p className="stat-label">Courses Available</p>
              </div>
            </div>
            <div className="stat-card" ref={ratingRef}>
              <div className="stat-icon-wrapper star-color"><Star size={24} /></div>
              <div>
                <h3 className="stat-number">{(ratingCount / 10).toFixed(1)}/5</h3>
                <p className="stat-label">Student Rating</p>
              </div>
            </div>
          </div>

          <div className="partner-badges-wrapper">
            <p className="partner-title">Accreditations & Certificates Partnering</p>
            <div className="partner-badges-row">
              <div className="accreditation-badge">AICTE Approved</div>
              <div className="accreditation-badge">ISO 9001:2015</div>
              <div className="accreditation-badge">MSME Registered</div>
              <div className="accreditation-badge">Cloudtechz Partner</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Departments Grid ───────────────────────────────────── */}
      <section className="departments-section" id="departments">
        <div className="container">
          <h2 className="section-title">Internships by <span className="gradient-text">Department</span></h2>
          <p className="section-subtitle">Choose your core field of interest and get matched with relevant company project mandates.</p>

          <div className="departments-grid">
            {[
              { icon: <Laptop size={32} />, title: 'Computer Science', desc: 'Web Dev, AI/ML, App Dev, Cybersecurity & Cloud Computing', color: '#0f766e' },
              { icon: <Settings size={32} />, title: 'Mechanical', desc: 'AutoCAD, SolidWorks, Catia modeling & manufacturing systems', color: '#1e40af' },
              { icon: <Cpu size={32} />, title: 'Electrical', desc: 'Power networks design, MATLAB modeling, and solar analytics', color: '#ea580c' },
              { icon: <Zap size={32} />, title: 'Electronics', desc: 'VLSI, PCB design, IoT systems design & firmware testing', color: '#10b981' },
              { icon: <Building size={32} />, title: 'Civil / Architecture', desc: 'StaadPro modeling, Revit design & structure cost estimation', color: '#4f46e5' }
            ].map((dept, idx) => (
              <Link to="/courses" key={idx} className="department-card glass-card">
                <div className="dept-icon-box" style={{ color: dept.color, background: `${dept.color}10` }}>
                  {dept.icon}
                </div>
                <h3 className="dept-card-title">{dept.title}</h3>
                <p className="dept-card-desc">{dept.desc}</p>
                <span className="dept-card-link">Explore Roles <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Featured Programs Carousel ──────────────────────────── */}
      <section className="featured-section" id="featured-programs">
        <div className="container">
          <h2 className="section-title">Trending <span className="gradient-text">Internship Programs</span></h2>
          <p className="section-subtitle">Learn the exact skills requested by startups and tech conglomerates, complete with live project mentor assistance.</p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="featured-grid-row">
              {courses.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}

          <div className="view-all-row">
            <Link to="/courses" className="btn btn-outline">
              View All Certifications <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Offline Internship Promo ────────────────────────────── */}
      <section className="offline-promo-section">
        <div className="container">
          <div className="promo-banner-card">
            <div className="promo-banner-content">
              <span className="promo-tag">Featured Program</span>
              <h2 className="promo-title">Offline & Industrial Internship Program</h2>
              <p className="promo-desc">
                Gain hands-on machinery / physical workstation expertise. Book your seat with a token advance, and pay the rest after starting your training directly at the company location.
              </p>
              
              <div className="fee-box">
                <div className="fee-item">
                  <span className="fee-value">₹500</span>
                  <span className="fee-label">Token Reservation Fee</span>
                </div>
                <div className="fee-divider">+</div>
                <div className="fee-item">
                  <span className="fee-value">Remaining Fee</span>
                  <span className="fee-label">Payable at company start</span>
                </div>
              </div>

              <div className="promo-actions">
                <a href="#enquiry-section" className="btn btn-primary">Book Seat Now</a>
                <Link to="/courses" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>Learn More</Link>
              </div>
            </div>
            
            <div className="promo-banner-features">
              <div className="feature-row">
                <CheckCircle size={20} />
                <div>
                  <h4>On-Site Workspace</h4>
                  <p>Train at core company centers under industrial supervisors.</p>
                </div>
              </div>
              <div className="feature-row">
                <CheckCircle size={20} />
                <div>
                  <h4>Zero Risk Booking</h4>
                  <p>Fully refundable booking fee if matching project is not approved.</p>
                </div>
              </div>
              <div className="feature-row">
                <CheckCircle size={20} />
                <div>
                  <h4>Placement Support</h4>
                  <p>Top performers matched with on-site full-time employment roles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Why Internship Matters ──────────────────────────────── */}
      <section className="why-choose-us" id="why-choose-us">
        <div className="container">
          <h2 className="section-title">Why an Internship <span className="gradient-text">Matters</span></h2>
          <p className="section-subtitle">Academic degrees teach theory, but employers search for practical operational proof. Here is how we bridge the gap:</p>

          <div className="why-matters-grid">
            {[
              { icon: <Shield size={24} />, title: 'Verified Certification', desc: 'Receive ISO-compliant certificates with custom verification hashes linked directly to your resume.' },
              { icon: <Briefcase size={24} />, title: 'Real Company Projects', desc: 'Work on actual live deployments, codebase changes, or physical structural planning drafts.' },
              { icon: <Users size={24} />, title: '1-on-1 Mentor Guidance', desc: 'Get access to direct call schedules with engineers and consultants who guide you past bugs.' },
              { icon: <Laptop size={24} />, title: 'Flexible Mode Options', desc: 'Choose between fully-paced online programs or on-site offline industrial workshops.' },
              { icon: <Award size={24} />, title: 'Career Prep Assistance', desc: 'Access mock HR interviews, resume cleanup sessions, and direct placement partner rosters.' }
            ].map((mat, i) => (
              <div key={i} className="why-matters-card">
                <div className="matters-icon-box">{mat.icon}</div>
                <h3 className="matters-card-title">{mat.title}</h3>
                <p className="matters-card-desc">{mat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Success Stories / Testimonials ──────────────────────── */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <h2 className="section-title">Success Stories of our <span className="gradient-text">Alumni</span></h2>
          <p className="section-subtitle">See how Indian students from various colleges transitioned from classrooms to software and industrial teams.</p>

          <div className="testimonials-grid">
            {[
              { name: 'Rohan Sharma', college: 'VIT Vellore', course: 'Full Stack Web Dev', quote: 'The projects built during the InternshipWala program got me short-listed for my Amazon interview. The verified certification is real.', rating: 5, avatar: 'R' },
              { name: 'Priya Patel', college: 'Nirma University', course: 'CAD & SolidWorks Training', quote: 'Being able to register with just ₹500 allowed me to test the program. The offline company onboarding was swift and professional.', rating: 5, avatar: 'P' },
              { name: 'Amit Verma', college: 'SRM Chennai', course: 'Data Science & Machine Learning', quote: 'Learned pandas, sklearn, and model serving. Built a prediction pipeline that actually works on real-world datasets.', rating: 5, avatar: 'A' }
            ].map((testi, idx) => (
              <div key={idx} className="testimonial-card glass-card">
                <div className="testi-header">
                  <div className="testi-avatar">{testi.avatar}</div>
                  <div>
                    <h4 className="testi-name">{testi.name}</h4>
                    <p className="testi-college">{testi.college} &bull; {testi.course}</p>
                  </div>
                </div>
                <div className="testi-stars">
                  {[...Array(testi.rating)].map((_, i) => <Star key={i} size={14} className="star-filled" />)}
                </div>
                <p className="testi-quote">"{testi.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Comparison Section ──────────────────────────────────── */}
      <section className="comparison-section">
        <div className="container">
          <h2 className="section-title">Compare <span className="gradient-text">Internship Platforms</span></h2>
          <p className="section-subtitle">How InternshipWALA stack up against traditional learning and internship providers in India:</p>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th className="highlight-column">InternshipWALA</th>
                  <th>Typical Video Platforms</th>
                  <th>Standard Listing Portals</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feat-title">Project Mandate Type</td>
                  <td className="highlight-column verified-check">✓ Real Company Tasks</td>
                  <td>✗ Theory Only</td>
                  <td>✓ Varies (Mainly Listings)</td>
                </tr>
                <tr>
                  <td className="feat-title">Mentorship Call Access</td>
                  <td className="highlight-column verified-check">✓ Included (1-on-1 Help)</td>
                  <td>✗ No Support</td>
                  <td>✗ Self Directed</td>
                </tr>
                <tr>
                  <td className="feat-title">Offline Booking Mode</td>
                  <td className="highlight-column verified-check">✓ Yes (₹500 token booking)</td>
                  <td>✗ Online Only</td>
                  <td>✗ Listing Only</td>
                </tr>
                <tr>
                  <td className="feat-title">Accreditation status</td>
                  <td className="highlight-column verified-check">✓ AICTE & ISO Certified</td>
                  <td>✗ Varies (Unrecognized)</td>
                  <td>✗ Not Applicable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 9. Enquiry / Lead-Gen Form ────────────────────────────── */}
      <section className="enquiry-section" id="enquiry-section">
        <div className="container">
          <div className="enquiry-card glass-card">
            <div className="enquiry-info-column">
              <h2>Talk to our Career Advisors</h2>
              <p>Unsure which internship track fits your curriculum requirement? Fill out the details and our counseling mentors will call you to map your engineering/BBA course plan.</p>
              <div className="advice-points">
                <div className="adv-point"><CheckCircle size={16} /> Free curriculum evaluation call</div>
                <div className="adv-point"><CheckCircle size={16} /> Get syllabus brochures on WhatsApp</div>
                <div className="adv-point"><CheckCircle size={16} /> Verified ISO certificate validation</div>
              </div>
            </div>

            <div className="enquiry-form-column">
              {enquirySuccess ? (
                <div className="form-empty-state animate-scale-in">
                  <div className="success-icon-box"><CheckCircle size={48} /></div>
                  <h3>Thank you, {enquiryForm.name}!</h3>
                  <p>Your inquiry is received. A career advisor will contact you on <strong>{enquiryForm.mobile}</strong> within 2 hours.</p>
                  <button onClick={resetEnquiryForm} className="btn btn-outline btn-sm">Submit another query</button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="interactive-enquiry-form">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="enq-name">Full Name</label>
                      <input
                        id="enq-name"
                        type="text"
                        name="name"
                        required
                        placeholder="E.g. Akash Patel"
                        className="form-input"
                        value={enquiryForm.name}
                        onChange={handleEnquiryChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="enq-email">Email Address</label>
                      <input
                        id="enq-email"
                        type="email"
                        name="email"
                        required
                        placeholder="name@college.edu"
                        className="form-input"
                        value={enquiryForm.email}
                        onChange={handleEnquiryChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="enq-mobile">Mobile Number</label>
                      <input
                        id="enq-mobile"
                        type="tel"
                        name="mobile"
                        required
                        placeholder="10-digit phone number"
                        className="form-input"
                        value={enquiryForm.mobile}
                        onChange={handleEnquiryChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="enq-college">College / University</label>
                      <input
                        id="enq-college"
                        type="text"
                        name="college"
                        required
                        placeholder="E.g. IIT Bombay"
                        className="form-input"
                        value={enquiryForm.college}
                        onChange={handleEnquiryChange}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="enq-city">City</label>
                      <input
                        id="enq-city"
                        type="text"
                        name="city"
                        required
                        placeholder="E.g. Noida"
                        className="form-input"
                        value={enquiryForm.city}
                        onChange={handleEnquiryChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="enq-duration">Preferred Duration</label>
                      <select
                        id="enq-duration"
                        name="duration"
                        className="form-select"
                        value={enquiryForm.duration}
                        onChange={handleEnquiryChange}
                      >
                        <option value="4-weeks">4 Weeks Program</option>
                        <option value="6-weeks">6 Weeks Program</option>
                        <option value="8-weeks">8 Weeks Program</option>
                        <option value="6-months">6 Months (Full semester)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={submittingEnquiry}
                  >
                    {submittingEnquiry ? (
                      <>
                        <span className="spinner spinner-sm" style={{ marginRight: '8px', borderTopColor: '#fff' }}></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Request Call Back <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. Final CTA Section ─────────────────────────────────── */}
      <section className="final-cta-section">
        <div className="container">
          <div className="final-cta-card">
            <h2>Bridge the Gap Between Classroom & Job</h2>
            <p>Enroll in a certified program today. Secure your industrial offline training seat for just ₹500 advance booking fee.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <Link to="/courses" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'white' }}>Browse Internships</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Sticky WhatsApp Button ────────────────────────────── */}
      <a
        href="https://wa.me/919876543210"
        className="sticky-whatsapp-btn"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with counseling advisor"
      >
        <MessageSquare size={24} />
      </a>
    </div>
  );
}
