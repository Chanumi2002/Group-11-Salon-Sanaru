-- Salon Sanaru - Sprint 1 Database Schema (User Management)
-- Run this only if you want to create the DB/schema manually. Otherwise JPA (ddl-auto=update) creates tables.

CREATE DATABASE IF NOT EXISTS saloon_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE saloon_db;

-- 1. Role table (lookup: ADMIN, CUSTOMER). Application uses this for role-based access.
CREATE TABLE IF NOT EXISTS roles (
  id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

INSERT IGNORE INTO roles (id, name) VALUES (1, 'ADMIN'), (2, 'CUSTOMER');

-- 2. User table. Passwords are hashed with BCrypt in the application (password encryption setup).
CREATE TABLE IF NOT EXISTS users (
  id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
  email                   VARCHAR(255) NOT NULL UNIQUE,
  password                VARCHAR(255) NOT NULL,
  first_name              VARCHAR(255) NOT NULL,
  last_name               VARCHAR(255) NOT NULL,
  phone                   VARCHAR(255),
  role                    VARCHAR(50) NOT NULL,
  gender                  VARCHAR(50),
  enabled                 BOOLEAN DEFAULT TRUE,
  email_verified          BOOLEAN DEFAULT FALSE,
  verification_token      VARCHAR(255),
  verification_token_expiry DATETIME(6),
  created_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updated_at              DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);
