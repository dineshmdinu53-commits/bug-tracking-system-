# Bug Tracker

PHP + MySQL bug tracking app with role-based access for `Admin`, `Developer`, and `Reporter`.

## What works

- Login and registration with hashed passwords
- Dashboard stats and recent bug activity
- Create, list, filter, and view bugs
- Assign bugs to developers
- Update bug status and post comments
- Optional AI code-fix action when `BUG_TRACKER_GEMINI_API_KEY` is configured

## Project structure

- `index.html` - login page
- `register.html` - registration page
- `dashboard.html` - overview dashboard
- `create-bug.html` - new bug form
- `bug-list.html` - bug list and filters
- `bug-report.html` - bug detail page
- `admin/assign_bug.php` - admin assignment page
- `php/` - backend endpoints, DB config, and setup scripts

## Local setup with XAMPP

1. Copy the `bug-tracker` folder into your web root, for example `htdocs/bug-tracker`.
2. Create a MySQL database named `bug_tracker`.
3. Import [`php/database.sql`](php/database.sql).
4. Set environment variables for PHP/Apache if needed:
   - `BUG_TRACKER_DB_HOST`
   - `BUG_TRACKER_DB_PORT`
   - `BUG_TRACKER_DB_NAME`
   - `BUG_TRACKER_DB_USER`
   - `BUG_TRACKER_DB_PASS`
   - `BUG_TRACKER_GEMINI_API_KEY` for the AI feature
5. Open `http://localhost/bug-tracker/php/setup_db.php` once to create demo accounts.
6. Open `http://localhost/bug-tracker/`.

## Demo accounts

- `admin@bugtracker.com` / `admin123`
- `dev@bugtracker.com` / `dev123`
- `reporter@bugtracker.com` / `reporter123`

## Deployment notes

- Use PHP 8.1+ with PDO MySQL enabled.
- Make sure the `php/uploads/` directory is writable by the web server.
- Do not store real secrets in `php/config.php`; use environment variables instead.
- If you deploy behind HTTPS, the AI endpoint will work normally without local SSL bypasses.

## Important note

This project is still a classic PHP app, not a static hosting project. It must be deployed on a server that supports:

- PHP
- MySQL
- writable uploads
- sessions
