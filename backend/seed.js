/**
 * Database Seed Script — InternshipWala
 *
 * Seeds initial/default tables (Roles, Permissions, Categories, Settings, CMS)
 * and creates a Super Admin account with a secure hashed password.
 *
 * Run: node seed.js
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ Error: DATABASE_URL not found in environment.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const ROLES = [
  { name: 'super_admin', description: 'Full platform access with no restrictions' },
  { name: 'content_manager', description: 'Manage courses, blog posts, CMS pages, and media' },
  { name: 'student_manager', description: 'View and manage student accounts and enrollments' },
  { name: 'finance_manager', description: 'View payments, approve refunds, and generate reports' },
  { name: 'support_staff', description: 'Handle contact messages and student notifications' },
];

const PERMISSIONS = [
  { name: 'View Dashboard', module: 'dashboard', action: 'read' },
  { name: 'Manage Courses', module: 'courses', action: 'create' },
  { name: 'Edit Courses', module: 'courses', action: 'update' },
  { name: 'Delete Courses', module: 'courses', action: 'delete' },
  { name: 'View Courses', module: 'courses', action: 'read' },
  { name: 'Manage Students', module: 'students', action: 'create' },
  { name: 'Edit Students', module: 'students', action: 'update' },
  { name: 'View Students', module: 'students', action: 'read' },
  { name: 'Disable Students', module: 'students', action: 'delete' },
  { name: 'View Payments', module: 'payments', action: 'read' },
  { name: 'Approve Payments', module: 'payments', action: 'update' },
  { name: 'Process Refunds', module: 'payments', action: 'delete' },
  { name: 'Generate Certificates', module: 'certificates', action: 'create' },
  { name: 'Approve Certificates', module: 'certificates', action: 'update' },
  { name: 'Manage Job Listings', module: 'jobs', action: 'create' },
  { name: 'Edit Job Listings', module: 'jobs', action: 'update' },
  { name: 'Delete Job Listings', module: 'jobs', action: 'delete' },
  { name: 'Manage Blog', module: 'blog', action: 'create' },
  { name: 'Edit Blog', module: 'blog', action: 'update' },
  { name: 'Manage CMS Pages', module: 'cms', action: 'create' },
  { name: 'Edit CMS Pages', module: 'cms', action: 'update' },
  { name: 'Send Notifications', module: 'notifications', action: 'create' },
  { name: 'View Activity Logs', module: 'logs', action: 'read' },
  { name: 'Manage Settings', module: 'settings', action: 'update' },
];

const CATEGORIES = [
  { name: 'Computer Science Engineering', slug: 'cse', department: 'Engineering', colour_code: '#2196F3', display_order: 1 },
  { name: 'Electrical Engineering', slug: 'ee', department: 'Engineering', colour_code: '#FF9800', display_order: 2 },
  { name: 'Mechanical Engineering', slug: 'me', department: 'Engineering', colour_code: '#9C27B0', display_order: 3 },
  { name: 'Electronics Engineering', slug: 'ece', department: 'Engineering', colour_code: '#4CAF50', display_order: 4 },
  { name: 'Civil Engineering', slug: 'civil', department: 'Engineering', colour_code: '#795548', display_order: 5 },
  { name: 'Management (BBA / MBA)', slug: 'management', department: 'Management', colour_code: '#E91E63', display_order: 6 },
  { name: 'Arts, Commerce & Sciences', slug: 'arts-commerce', department: 'Arts', colour_code: '#FF5722', display_order: 7 },
  { name: 'Emerging Technologies (AI / ML / Cloud)', slug: 'ai-ml', department: 'Technology', colour_code: '#00BCD4', display_order: 8 },
];

const CMS_PAGES = [
  { slug: 'about-us', title: 'About Us', content: 'Content pending CMS update.', is_published: true },
  { slug: 'terms-conditions', title: 'Terms & Conditions', content: 'Content pending CMS update.', is_published: true },
  { slug: 'privacy-policy', title: 'Privacy Policy', content: 'Content pending CMS update.', is_published: true },
];

const SETTINGS = [
  { key: 'site_name', value: 'InternshipWala', description: 'Platform display name' },
  { key: 'support_phone', value: '+91-7070436444', description: 'Customer care number' },
  { key: 'support_email', value: 'career.internshipwala@gmail.com', description: 'Support email address' },
  { key: 'refund_policy_days', value: '7', description: 'Days before refund window closes' },
  { key: 'otp_expiry_minutes', value: '15', description: 'OTP validity in minutes' },
  { key: 'certificate_prefix', value: 'IW', description: 'Prefix for certificate numbers (e.g. IW-2026-001)' },
  { key: 'payment_gateway', value: 'razorpay', description: 'Active payment gateway slug' },
  { key: 'min_age_registration', value: '14', description: 'Minimum student age for registration' },
  { key: 'jurisdiction', value: 'Patna, India', description: 'Legal dispute jurisdiction per Terms & Conditions' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Seeding roles...');
    const roleIds = {};
    for (const r of ROLES) {
      const { rows } = await client.query(
        `INSERT INTO roles (name, description) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, name`,
        [r.name, r.description]
      );
      roleIds[rows[0].name] = rows[0].id;
    }

    console.log('Seeding permissions...');
    const permIds = [];
    for (const p of PERMISSIONS) {
      const { rows } = await client.query(
        `INSERT INTO permissions (name, module, action) VALUES ($1, $2, $3)
         ON CONFLICT (module, action) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [p.name, p.module, p.action]
      );
      permIds.push(rows[0].id);
    }

    console.log('Wiring role permissions...');
    // Super admin gets all permissions (though middleware bypasses, let's keep database robust)
    const superAdminRoleId = roleIds['super_admin'];
    for (const permId of permIds) {
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [superAdminRoleId, permId]
      );
    }

    console.log('Seeding course categories...');
    for (const c of CATEGORIES) {
      await client.query(
        `INSERT INTO course_categories (name, slug, department, colour_code, display_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [c.name, c.slug, c.department, c.colour_code, c.display_order]
      );
    }

    console.log('Seeding CMS pages...');
    for (const p of CMS_PAGES) {
      await client.query(
        `INSERT INTO cms_pages (slug, title, content, is_published)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [p.slug, p.title, p.content, p.is_published]
      );
    }

    console.log('Seeding settings...');
    for (const s of SETTINGS) {
      await client.query(
        `INSERT INTO settings (key, value, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description`,
        [s.key, s.value, s.description]
      );
    }

    console.log('Creating default Super Admin account...');
    const adminEmail = 'admin@internshipwala.com';
    const adminPass = 'AdminPassword@12345';
    const hash = await bcrypt.hash(adminPass, 10);

    const { rows: adminRows } = await client.query(
      `INSERT INTO admin_users (full_name, email, password_hash, is_active)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      ['Super Admin', adminEmail, hash]
        );
    const adminId = adminRows[0].id;

    console.log('Assigning super_admin role to default admin...');
    await client.query(
      `INSERT INTO admin_user_roles (admin_user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [adminId, superAdminRoleId]
    );

    await client.query('COMMIT');
    console.log('✅ Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Email:    admin@internshipwala.com');
    console.log('Admin Password: AdminPassword@12345');
    console.log('----------------------------------------------------');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
