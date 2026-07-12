import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react';
import courseService from '../../services/courseService';
import CourseCard from '../../components/CourseCard/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './Courses.jsx'; // self ref for routing if needed or just standard styles import
import './Courses.css';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, categoriesRes] = await Promise.all([
          courseService.listCourses(),
          courseService.getCategories(),
        ]);
        setCourses(coursesRes.courses || coursesRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setError('Failed to fetch courses. Loading demo courses instead.');
        // Fallback demo courses matching backend structure
        setCourses([
          {
            id: 'aaaa-aaaa-aaaa',
            title: 'Full Stack Web Development Internship',
            description: 'Hands-on internship covering frontend, backend, and deployment.',
            type: 'online',
            is_new_badge: true,
            category_id: '1111-1111-1111',
            category: { id: '1111-1111-1111', name: 'Computer Science Engineering', colour_code: '#2563EB' },
          },
          {
            id: 'bbbb-bbbb-bbbb',
            title: 'Industrial Training in CAD and Manufacturing',
            description: 'Mechanical domain internship with design-to-production workflow.',
            type: 'industrial',
            is_new_badge: false,
            category_id: '2222-2222-2222',
            category: { id: '2222-2222-2222', name: 'Mechanical Engineering', colour_code: '#EA580C' },
          },
          {
            id: 'cccc-cccc-cccc',
            title: 'Data Science & Machine Learning Program',
            description: 'Comprehensive program covering Python, ML algorithms, and real-world data analysis.',
            type: 'online',
            is_new_badge: true,
            category_id: '1111-1111-1111',
            category: { id: '1111-1111-1111', name: 'Computer Science Engineering', colour_code: '#2563EB' },
          },
        ]);
        setCategories([
          { id: '1111-1111-1111', name: 'Computer Science Engineering', colour_code: '#2563EB' },
          { id: '2222-2222-2222', name: 'Mechanical Engineering', colour_code: '#EA580C' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Client-side filtering logic
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category_id === selectedCategory || (course.category && course.category.id === selectedCategory);
    const matchesType = selectedType === 'all' || course.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="courses-page container section">
      {/* Title */}
      <div className="courses-header">
        <h1 className="courses-title">
          Explore Our <span className="gradient-text">Programs</span>
        </h1>
        <p className="courses-subtitle">
          Choose from industry-aligned online courses, offline bootcamps, and industrial internship programs.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar glass-card">
        {/* Search */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search programs, tools, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="course-search-input"
          />
        </div>

        {/* Category Select */}
        <div className="filter-select-group">
          <label htmlFor="category-select" className="visually-hidden">Category</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Type Select */}
        <div className="filter-select-group">
          <label htmlFor="type-select" className="visually-hidden">Delivery Type</label>
          <select
            id="type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="industrial">Industrial</option>
          </select>
        </div>
      </div>

      {/* Alert message if demo mode */}
      {error && (
        <div className="demo-notice" id="demo-notice">
          <span>{error}</span>
        </div>
      )}

      {/* Course List Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching awesome programs..." />
      ) : filteredCourses.length > 0 ? (
        <div className="courses-grid">
          {filteredCourses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      ) : (
        <div className="empty-courses glass-card animate-scale-in" id="empty-courses">
          <BookOpen size={48} className="empty-icon" />
          <h3>No Programs Found</h3>
          <p>We couldn't find any courses matching your search criteria. Try removing filters or changing your search terms.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedType('all');
            }}
            className="btn btn-outline"
            id="reset-filters-btn"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
