import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Calendar, FileText, Shield,
  Award, Briefcase, ChevronRight, Zap, GraduationCap, DollarSign
} from 'lucide-react';
import courseService from '../../services/courseService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await courseService.getCourseDetail(id);
        const courseData = res.data || res;
        setCourse(courseData);
        if (courseData.course_duration_fees?.length > 0) {
          setSelectedDuration(courseData.course_duration_fees[0]);
        }
      } catch (err) {
        setError('Failed to fetch course details. Loading fallback content.');
        // Fallback matching MockCourseRepository output schema
        const mockDetail = {
          id: id,
          title: id === 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
            ? 'Industrial Training in CAD and Manufacturing'
            : 'Full Stack Web Development Internship',
          description: 'Hands-on internship program covering core development, industrial best practices, testing, and deployment workflows with verified certification.',
          type: id === 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' ? 'industrial' : 'online',
          syllabus: 'Introduction to HTML5 & CSS3, Javascript Fundamentals, Building responsive layouts, backend routing with Express, REST APIs, Database schemas with Prisma ORM, testing, and cloud deployment.',
          skills_covered: 'REST APIs, Git workflows, deployment, Backend Architecture, Modern state management, responsive designs',
          tools_used: 'VS Code, GitHub, Postman, Node.js, Render, PostgreSQL',
          category: { name: 'Computer Science Engineering', colour_code: '#2563EB' },
          course_modules: [
            { id: 'm1', module_no: 1, title: 'Web Fundamentals', description: 'Semantic HTML, CSS variables, and layout systems (Flexbox, Grid).' },
            { id: 'm2', module_no: 2, title: 'Modern JavaScript', description: 'ES6 syntax, async/await, promise chains, DOM manipulation.' },
            { id: 'm3', module_no: 3, title: 'Node.js & Express.js APIs', description: 'Setting up servers, router mechanisms, dependency injections, and rate limiters.' },
            { id: 'm4', module_no: 4, title: 'Databases & ORM', description: 'SQL databases, postgres connections, migrations, and Prisma models.' },
          ],
          course_duration_fees: [
            { id: 'df1', label: '2 Months (8 Weeks)', fee: 4999 },
            { id: 'df2', label: '3 Months (12 Weeks)', fee: 6999 },
          ],
        };
        setCourse(mockDetail);
        setSelectedDuration(mockDetail.course_duration_fees[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Retrieving detailed curriculum..." size="lg" />;
  }

  if (!course) {
    return (
      <div className="course-detail-error container section">
        <ArrowLeft size={16} />
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary">Back to Courses</Link>
      </div>
    );
  }

  // Parse skills and tools lists
  const skillsList = course.skills_covered ? course.skills_covered.split(',').map(s => s.trim()) : [];
  const toolsList = course.tools_used ? course.tools_used.split(',').map(t => t.trim()) : [];

  return (
    <div className="course-detail-page section">
      <div className="container">
        {/* Back Link */}
        <Link to="/courses" className="back-link">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        {error && <div className="demo-notice">{error}</div>}

        {/* Hero Section of Course */}
        <div className="course-detail-hero glass-card animate-fade-in">
          <div className="course-detail-hero__content">
            <span
              className="course-detail-hero__category"
              style={{ color: course.category?.colour_code || 'var(--color-primary-light)' }}
            >
              {course.category?.name || 'Internship Training'}
            </span>
            <h1 className="course-detail-hero__title">{course.title}</h1>
            <p className="course-detail-hero__desc">{course.description}</p>

            <div className="course-detail-hero__badges">
              <span className="badge badge-primary">{course.type}</span>
              <span className="badge badge-success">Verified Certificate</span>
              <span className="badge badge-accent">100% Practical</span>
            </div>
          </div>

          {/* Quick Info Box / Purchase Card */}
          <div className="course-purchase-card glass-card animate-scale-in">
            <div className="course-purchase-card__header">
              <h3>Join Program</h3>
              <p>Choose your duration and get immediate access.</p>
            </div>

            {/* Duration Selector */}
            <div className="duration-selector">
              {course.course_duration_fees?.map((df) => (
                <button
                  key={df.id}
                  onClick={() => setSelectedDuration(df)}
                  className={`duration-option ${selectedDuration?.id === df.id ? 'duration-option--active' : ''}`}
                >
                  <span className="duration-label">{df.label}</span>
                  <span className="duration-price">₹{df.fee.toLocaleString()}</span>
                </button>
              ))}
            </div>

            {/* Total Price */}
            {selectedDuration && (
              <div className="purchase-price-section">
                <span className="price-label">Program Fee:</span>
                <span className="price-value">₹{selectedDuration.fee.toLocaleString()}</span>
              </div>
            )}

            <Link
              to={`/register?course_id=${course.id}&duration_id=${selectedDuration?.id || ''}`}
              className="btn btn-accent btn-block"
              id="enroll-now-btn"
            >
              Enroll Now <ChevronRight size={18} />
            </Link>

            <div className="purchase-features">
              <div className="purchase-feature">
                <Shield size={16} /> Secure Payment Processing
              </div>
              <div className="purchase-feature">
                <Award size={16} /> Industry-recognized Certificate
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs/Grids */}
        <div className="course-detail-grid">
          {/* Syllabus / Modules */}
          <div className="course-curriculum">
            <h2 className="section-subtitle-left">Curriculum Overview</h2>
            <div className="modules-list">
              {course.course_modules?.map((mod) => (
                <div key={mod.id} className="module-item glass-card">
                  <div className="module-item__header">
                    <span className="module-number">Module {mod.module_no}</span>
                    <h3 className="module-title">{mod.title}</h3>
                  </div>
                  <p className="module-desc">{mod.description}</p>
                </div>
              ))}
            </div>

            {/* Core Syllabus Summary */}
            {course.syllabus && (
              <div className="syllabus-section glass-card">
                <h3>Syllabus Overview</h3>
                <p>{course.syllabus}</p>
              </div>
            )}
          </div>

          {/* Sidebar Skills, Tools & Outcomes */}
          <div className="course-outcomes-sidebar">
            {/* Skills Card */}
            {skillsList.length > 0 && (
              <div className="outcomes-card glass-card">
                <h3>Skills You'll Master</h3>
                <div className="skills-grid">
                  {skillsList.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      <CheckCircle2 size={16} className="skill-check" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Card */}
            {toolsList.length > 0 && (
              <div className="outcomes-card glass-card">
                <h3>Tools You'll Learn</h3>
                <div className="tools-grid">
                  {toolsList.map((tool, index) => (
                    <span key={index} className="tool-badge">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Opportunities / Outcomes */}
            <div className="outcomes-card glass-card">
              <h3>Career Path & Outcomes</h3>
              <ul className="outcomes-list">
                <li>
                  <Briefcase size={16} className="outcome-icon" />
                  <strong>Job Roles:</strong> Full Stack Dev, Backend Intern, Systems Engineer.
                </li>
                <li>
                  <GraduationCap size={16} className="outcome-icon" />
                  <strong>Target Audience:</strong> CSE, IT, ECE engineering graduates & professionals.
                </li>
                <li>
                  <Calendar size={16} className="outcome-icon" />
                  <strong>Program Structure:</strong> Hands-on projects with industry evaluation checkpoints.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
