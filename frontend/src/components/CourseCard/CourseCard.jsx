import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './CourseCard.css';

const typeColors = {
  online: { bg: '#e6f4f2', color: '#0f766e', border: '#b2dfdb' },
  offline: { bg: '#eef2ff', color: '#1e40af', border: '#c7d2fe' },
  industrial: { bg: '#fff7ed', color: '#ea580c', border: '#ffedd5' },
};

export default function CourseCard({ course, index = 0 }) {
  const typeStyle = typeColors[course.type] || typeColors.online;

  return (
    <Link
      to={`/courses/${course.id}`}
      className="course-card glass-card animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
      id={`course-card-${course.id}`}
    >
      {/* Thumbnail */}
      <div className="course-card__thumbnail">
        <div className="course-card__thumbnail-bg" style={{
          background: `linear-gradient(135deg, ${typeStyle.bg}, #f8fafc)`
        }}>
          <div className="course-card__thumbnail-icon">
            {course.type === 'online' ? '💻' : course.type === 'industrial' ? '🏭' : '📍'}
          </div>
        </div>
        {course.is_new_badge && (
          <span className="badge badge-new course-card__new-badge">
            <Sparkles size={10} /> New
          </span>
        )}
      </div>

      {/* Content */}
      <div className="course-card__content">
        {/* Category & Type */}
        <div className="course-card__meta">
          {course.category && (
            <span
              className="course-card__category"
              style={{ color: course.category.colour_code || 'var(--color-primary)' }}
            >
              {course.category.name}
            </span>
          )}
          <span
            className="badge"
            style={{
              background: typeStyle.bg,
              color: typeStyle.color,
              border: `1px solid ${typeStyle.border}`,
            }}
          >
            {course.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="course-card__title">{course.title}</h3>

        {/* Description */}
        <p className="course-card__desc">{course.description}</p>

        {/* Footer */}
        <div className="course-card__footer">
          <span className="course-card__cta">
            View Details <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
