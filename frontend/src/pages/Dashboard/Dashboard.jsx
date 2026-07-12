import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import {
  User, Mail, Phone, Calendar, MapPin, GraduationCap,
  Award, Camera, Settings, Lock, Edit3, Save, X
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    country: '',
    father_name: '',
    present_course: '',
    branch: '',
    year_qualifying: '',
    college_name: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
  });

  // Sync state with Context user when loaded
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        father_name: user.father_name || '',
        present_course: user.present_course || '',
        branch: user.branch || '',
        year_qualifying: user.year_qualifying || '',
        college_name: user.college_name || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Clean request data — send non-empty values
      const cleanData = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '') cleanData[key] = formData[key];
      });

      const res = await userService.updateProfile(cleanData);
      updateUser(res.data);
      toast.success(res.message || 'Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.current_password || !passwordData.new_password) {
      toast.error('Both password fields are mandatory.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.changePassword(passwordData);
      toast.success(res.message || 'Password updated successfully!');
      setPasswordData({ current_password: '', new_password: '' });
    } catch (err) {
      toast.error(err.message || 'Password update failed. Verify current password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB maximum
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be less than 5MB.');
      return;
    }

    try {
      setLoading(true);
      const res = await userService.uploadPhoto(file);
      updateUser({ profile_photo_url: res.data?.profile_photo_url });
      toast.success('Profile image updated!');
    } catch (err) {
      toast.error(err.message || 'Photo upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page section">
      <div className="container">
        <h1 className="dashboard-title">
          Student <span className="gradient-text">Dashboard</span>
        </h1>

        <div className="dashboard-grid">
          {/* Main profile section */}
          <div className="dashboard-main">
            {/* Header info card */}
            <div className="profile-header-card glass-card animate-fade-in">
              <div className="avatar-wrapper">
                <div className="profile-avatar">
                  {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt="Profile" className="avatar-img" />
                  ) : (
                    <span>{user?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <label className="photo-upload-btn" htmlFor="photo-upload">
                  <Camera size={14} />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="profile-summary">
                <h2>{user?.full_name || 'Student Account'}</h2>
                <p className="college-text">{user?.college_name || 'College Details'}</p>
                <div className="profile-badges">
                  {user?.is_verified ? (
                    <span className="badge badge-success">Verified</span>
                  ) : (
                    <span className="badge badge-accent">Verification Pending</span>
                  )}
                  <span className="badge badge-primary">{user?.present_course || 'Course'}</span>
                </div>
              </div>

              <div className="edit-action-container">
                {isEditing ? (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-outline btn-sm"
                    id="cancel-edit-btn"
                  >
                    <X size={16} /> Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary btn-sm"
                    id="edit-profile-btn"
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form Content */}
            <div className="profile-form-section glass-card animate-fade-in animate-delay-1">
              <div className="section-title-wrapper">
                <User size={20} className="section-icon" />
                <h3>Personal & Academic Details</h3>
              </div>

              <form onSubmit={handleProfileSubmit} id="profile-details-form">
                <div className="form-grid">
                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-fullname">Full Name</label>
                    <input
                      id="dashboard-fullname"
                      type="text"
                      name="full_name"
                      disabled={!isEditing}
                      value={formData.full_name}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-email">Email Address</label>
                    <input
                      id="dashboard-email"
                      type="email"
                      name="email"
                      disabled={true} // Email is non-editable as primary identifier
                      value={formData.email}
                      className="form-input"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-mobile">Mobile Number</label>
                    <input
                      id="dashboard-mobile"
                      type="text"
                      name="mobile"
                      disabled={!isEditing}
                      value={formData.mobile}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* DOB */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-dob">Date of Birth</label>
                    <input
                      id="dashboard-dob"
                      type="date"
                      name="dob"
                      disabled={!isEditing}
                      value={formData.dob}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* College */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-college">College / University</label>
                    <input
                      id="dashboard-college"
                      type="text"
                      name="college_name"
                      disabled={!isEditing}
                      value={formData.college_name}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* Course */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-course">Present Course</label>
                    <input
                      id="dashboard-course"
                      type="text"
                      name="present_course"
                      disabled={!isEditing}
                      value={formData.present_course}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* Branch */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-branch">Branch / Specialization</label>
                    <input
                      id="dashboard-branch"
                      type="text"
                      name="branch"
                      disabled={!isEditing}
                      value={formData.branch}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* Year */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-year">Graduation Year</label>
                    <input
                      id="dashboard-year"
                      type="text"
                      name="year_qualifying"
                      disabled={!isEditing}
                      value={formData.year_qualifying}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* Address */}
                  <div className="form-group span-2">
                    <label className="form-label" htmlFor="dashboard-address">Address Details</label>
                    <input
                      id="dashboard-address"
                      type="text"
                      name="address"
                      disabled={!isEditing}
                      value={formData.address}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>

                  {/* Location block */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-city">City</label>
                    <input
                      id="dashboard-city"
                      type="text"
                      name="city"
                      disabled={!isEditing}
                      value={formData.city}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dashboard-state">State</label>
                    <input
                      id="dashboard-state"
                      type="text"
                      name="state"
                      disabled={!isEditing}
                      value={formData.state}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {isEditing && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ marginTop: '1.5rem' }}
                    id="save-profile-btn"
                  >
                    {loading ? (
                      <div className="spinner spinner-sm" />
                    ) : (
                      <>
                        <Save size={16} /> Save Changes
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar Settings (Password change, options) */}
          <div className="dashboard-sidebar">
            <div className="profile-form-section glass-card animate-fade-in animate-delay-2">
              <div className="section-title-wrapper">
                <Lock size={20} className="section-icon" />
                <h3>Change Password</h3>
              </div>

              <form onSubmit={handlePasswordSubmit} id="change-password-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="current-pass-input">Current Password</label>
                  <input
                    id="current-pass-input"
                    type="password"
                    name="current_password"
                    required
                    placeholder="••••••••"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-pass-input">New Password</label>
                  <input
                    id="new-pass-input"
                    type="password"
                    name="new_password"
                    required
                    placeholder="••••••••"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-outline btn-block"
                  style={{ marginTop: '1rem' }}
                  id="change-password-btn"
                >
                  {loading ? (
                    <div className="spinner spinner-sm" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>

            {/* Support / Quick Help Card */}
            <div className="help-card glass-card animate-fade-in animate-delay-3">
              <h3>Need Assistance?</h3>
              <p>For enrollments, payments, or verification queries, contact support desk:</p>
              <div className="help-links">
                <a href="mailto:career.internshipwala@gmail.com" className="help-link">
                  <Mail size={16} /> career.internshipwala@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
