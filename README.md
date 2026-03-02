# 💄 Group 11 - Salon Sanaru Beauty Salon Management System

A comprehensive web-based beauty salon management system enabling customers to book appointments, purchase products, and receive personalized beauty recommendations while providing administrators with complete business control.

**Group:** Group 11 | **Status:** Sprint 1 Complete ✅ | **Version:** 1.0.2

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

## 📋 Sprint Status

| Sprint | Goal | Status | Duration |
|--------|------|--------|----------|
| 1 | User Management, Email Validation, Homepage Hero | ✅ COMPLETE | Week 1-2 |

---

## 🚀 Quick Start

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
mvn spring-boot:run
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

## 📊 Features Overview (Sprint 1 - Complete ✅)

### ✅ User Management & Authentication
- User Registration & Login with JWT token
- **Email Format Validation** - Regex pattern validation
- **Domain MX Records Validation** - Ensures email domain can receive emails
- **Throwaway Domain Detection** - Blocks 30+ temp email services
- Email normalization (case-insensitive matching)
- Google OAuth 2.0 integration with blocked user prevention
- Role-based access control (ADMIN/CUSTOMER)
- JWT token blacklist on logout

### ✅ Admin Features
- Dashboard with customer statistics
- Customer Management (view, block, delete)
- Admin profile management with password change
- Account blocking enforcement
- Role-based access control

### ✅ Customer Features
- User registration with email validation
- Login and profile management
- Password change functionality
- Dashboard with personal information
- Profile update capability

### ✅ Email Notification System
- Welcome email on registration
- Account blocked notification with support contact
- Account unblocked notification
- Blocked login attempt reminder email
- Password changed confirmation email
- Account deleted notification email
- Appointment confirmation and reminders
- Booking confirmation emails

### ✅ Homepage Features
- **Full-Screen Hero Section** with salon interior image (`salon-hero.jpg`)
- Responsive design on all devices
- Smooth animations with Framer Motion
- Service preview cards
- About section
- Call-to-action buttons

### ✅ UI/UX Enhancements
- Dark/Light theme toggle
- Tailwind CSS styling
- Form validation (client + server)
- User-friendly error messages
- Protected routes with role-based access
- Toast notifications with Sonner
- Accessible form inputs

---

## 👥 User Roles

### Admin Access
- Dashboard with customer statistics
- Customer management (view, block, delete)
- Block/Unblock customers with notifications
- Profile and password management
- Admin dashboard access

### Customer Access
- Register with email validation
- Login and profile management
- View customer dashboard
- Browse homepage
- Secure password change

### Guest Access
- View public homepage
- Access registration/login pages

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5.x, Tailwind CSS, Framer Motion |
| **Backend** | Spring Boot 3.x, Spring Security, JPA/Hibernate |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT + BCrypt + Token Blacklist |
| **Email** | Spring Mail + Gmail SMTP |
| **Validation** | Jakarta, Email Validator (MX Records) |
| **Build** | Maven & npm |

---

## 📁 Project Structure

```
Group-11-Salon-Sanaru/
├── backend/
│   ├── src/main/java/com/sanaru/backend/
│   │   ├── controller/        # API endpoints
│   │   ├── service/           # Business logic
│   │   ├── model/             # JPA entities
│   │   ├── dto/               # Data transfer objects
│   │   ├── security/          # JWT & security
│   │   ├── util/              # EmailValidator utility
│   │   ├── exception/         # Custom exceptions
│   │   └── repository/        # Database access
│   ├── pom.xml
│   └── application.properties
├── frontend/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API integration
│   │   ├── context/          # React context
│   │   ├── assets/           # Images & static
│   │   │   └── salon-hero.jpg # Homepage hero image ✨
│   │   └── styles/           # CSS
│   ├── package.json
│   └── vite.config.js
└── README.md
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
- `/admin_dashboard` - Dashboard with stats
- `/admin_dashboard/users` - Customer management
- `/admin_dashboard/profile` - Admin profile

### Customer
- `/customer_dashboard` - Dashboard
- `/homepage` - Homepage
- `/customer_profile` - Profile

### Public
- `/` - Homepage with hero image
- `/login` - Login
- `/register` - Registration

---

## ✉️ Email Validation System (NEW)

### 3-Layer Validation

**1. Format Check**
- Pattern: `^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- Validates email structure

**2. Domain MX Records**
- Queries DNS for MX records
- Ensures domain can receive emails
- Error: "Email domain does not exist or cannot receive emails"

**3. Throwaway Domain Detection**
- Blocks 30+ temporary email services:
  - tempmail.com, mailinator.com, 10minutemail.com
  - yopmail.com, temp-mail.io, etc.
- Error: "Throwaway/temporary email addresses are not allowed"

### Applied Locations
- User registration (registerUser, registerAdminUser)
- Email updates
- Authentication flows

**Classes:**
- `EmailValidator.java` - Validation utility
- `InvalidEmailException.java` - Custom exception
- `GlobalExceptionHandler.java` - Exception handler

---

## 🔐 Security Features

✅ **JWT Authentication** - Token-based, stateless
✅ **Token Blacklist** - O(1) logout invalidation
✅ **Password Hashing** - BCrypt with salt
✅ **Email Validation** - Format, domain, throwaway checks
✅ **Blocked User Prevention** - Works on email/password AND OAuth
✅ **CORS Protection** - Configured for frontend
✅ **Protected Routes** - Role-based access control
✅ **Form Validation** - Server-side validation
✅ **Email Normalization** - Case-insensitive matching

---

## 📊 Build Status

✅ **Frontend:** No errors, ready to run
✅ **Backend:** BUILD SUCCESS - 38 files (8-9s)
✅ **Server:** Running on port 8080
✅ **Integration:** Ready for testing

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Kill process or change port in `application.properties` |
| DB connection fails | Verify MySQL credentials |
| Email not working | Check Gmail app password |
| CORS errors | Ensure backend is running |
| Hero image missing | Clear cache (Ctrl+Shift+R) |

---

## 📄 License

Proprietary - Salon Sanaru Management System
All Rights Reserved © 2026

---

**Status:** ✅ Sprint 1 Complete
**Last Updated:** March 2, 2026
**Version:** 1.0.5
**Next:** Sprint 2 - Appointments & Booking

