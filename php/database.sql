-- Bug Tracker Database Schema
-- Import this file first, then optionally run php/setup_db.php once to seed demo users.

CREATE DATABASE IF NOT EXISTS bug_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bug_tracker;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Developer', 'Reporter') NOT NULL DEFAULT 'Reporter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bug_id VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Review', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
    assignee_id INT DEFAULT NULL,
    reporter_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
    screenshot VARCHAR(255) DEFAULT NULL,
    code_snippet TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bugs_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bug_id INT NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_bug FOREIGN KEY (bug_id) REFERENCES bugs(id) ON DELETE CASCADE
);
