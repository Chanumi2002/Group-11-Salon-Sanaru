# 💄 Group 11 - Salon Sanaru Beauty Salon Management System

A comprehensive web-based beauty salon management system enabling customers to book appointments, purchase products, and receive personalized beauty recommendations while providing administrators with complete business control.

**Group:** Group 11 | **Live Version:** Development (Sprint 1 In Review ⏳)

---

## 🤝 Team (Sprint 1)

**Project:** Group 11 - Salon Sanaru

| Role | Member |
|------|--------|
| PM | Chanumi |
| QA | Dahamya |
| Developer 1 | Kunchana |
| Developer 2 | Thamod |

---

## � Sprint Status

| Sprint | Goal | Status | Duration |
|--------|------|--------|----------|
| 1 | User Management & Admin System | ⏳ IN REVIEW | Week 1-2 |

---

## �🚀 Quick Start

### Prerequisites
- Node.js 16+ & npm
- Java 17+
- MySQL 8.0+
- Maven 3.8+

### Setup & Run

**Backend:**
```bash
cd backend
mvn clean install -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
# Runs on http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 📊 Features Overview (Sprint 1 - In Review)

### ✅ Implemented
- User Registration & Login with JWT
- Admin Dashboard with statistics
- Customer Management (view, block, delete)
- Email notification system
  - Welcome email on registration
  - Account blocked notification with support contact
  - Account unblocked notification with login link
  - **Blocked login attempt reminder** - When blocked customers try to login, they receive an email reminder that their account is blocked
- Admin profile management
- Customer profile management
- Role-based access control (ADMIN/CUSTOMER)
- Account blocking enforcement - Blocked customers cannot login and receive clear error message with email notification

---

## 👥 User Roles

### Admin Access
- View dashboard statistics
- Manage customer accounts
- Block/Unblock customers
- Delete customers
- View own profile
- Change password

### Customer Access
- Register and login
- Manage profile
- View dashboard
- Browse homepage
- Change password

### Guest Access
- View public pages
- Read system information

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Spring Boot 3, Spring Security |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT + BCrypt |
| **Email** | Spring Mail + Gmail SMTP |
| **Build** | Maven & npm |

---

## 📁 Project Structure

```
Group-11-Salon-Sanaru/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/...
│   ├── pom.xml
│   └── application.properties
├── frontend/                   # React Application
│   ├── src/
│   ├── package.json
│   └── vite.config.js
```

---

## 🔑 Seed Admin Credentials

```
Email: admin@salonsanaru.com
Password: qazxsw
```

---

## 📱 Key Pages

### Admin
- `/admin_dashboard` - Main dashboard
- `/admin_dashboard/users` - User management
- `/admin_dashboard/profile` - Admin profile

### Customer
- `/customer_dashboard` - Dashboard
- `/homepage` - Customer homepage
- `/customer_profile` - Profile management

### Public
- `/` - Home
- `/login` - Login
- `/register` - Register

---

## 🐛 Current Build Status

⏳ **Frontend:** Builds successfully - Under Code Review
⏳ **Backend:** Compiles successfully - Under Code Review
⏳ **Integration Testing:** In Progress - Checking runtime functionality

---

##  Email Notifications

**Automatically Sent Emails:**
- ✅ **Welcome Email** - Sent when user registers
- ✅ **Account Blocked Email** - Sent when admin blocks customer
- ✅ **Account Unblocked Email** - Sent when admin unblocks customer
- ✅ **Blocked Login Attempt Email** - Sent when blocked customer attempts to login with notice: *"Your account is currently blocked. Attempting to login won't resolve this. Please contact support for assistance."*
- ✅ **Password Changed Email** - Confirmation when password is updated
- ✅ **Account Deleted Email** - Notification when account is deleted

**Blocked Login Feature:**
When an admin blocks a customer account:
1. Customer receives account blocked notification email
2. If customer tries to login, they see error: *"Your account has been blocked by admin. Attempting to login won't resolve this. Please contact support for assistance."*
3. A reminder email is sent to blocked customer informing them of the login attempt
4. Login is prevented until admin unblocks the account

---

##  Security Features

✅ Spring Security Framework
✅ JWT Token Authentication
✅ BCrypt Password Encryption
✅ Role-Based Access Control (RBAC)
✅ Secure CORS Configuration
✅ HttpOnly Cookies (ready)
✅ Account Blocking & Login Prevention
✅ Email-Based Security Notifications

---

##  API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
PUT    /api/auth/change-password
DELETE /api/auth/profile
```

### Admin
```
GET    /api/admin/customers
GET    /api/admin/customers/count
PUT    /api/admin/customers/{id}/block
PUT    /api/admin/customers/{id}/unblock
DELETE /api/admin/customers/{id}
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change port in `application.properties` |
| DB connection fails | Verify MySQL is running with correct credentials |
| Email not working | Check Gmail app password configuration |
| CORS errors | Ensure backend is running and CORS is configured |

---

## 📞 Support

**GitHub Issues:** Report bugs and request features
**Project Manager:** Contact sprint lead

---

## 📄 License

Proprietary Software - Salon Sanaru Management System
All Rights Reserved © 2026

---

**Status:** Sprint 1 IN REVIEW ⏳
**Last Updated:** February 28, 2026
**Version:** 1.0.0 (Beta)
