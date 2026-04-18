# 💄 Group 11 - Salon Sanaru Beauty Salon Management System


-----



## 📅 Sprint 4 - Appointment Booking & Review System

A comprehensive appointment management and review system enabling customers to book salon services with time slot selection, cancel appointments, view booking history, and submit detailed reviews with star ratings while providing administrators with booking approval and review moderation capabilities.

**Group:** Group 11 | **Status:** Sprint 4 In Progress 🔄 (Apr 17/23) | **Version:** 2.5.0

---

### 🤝 Team (Sprint 4)

**Project:** Group 11 - Salon Sanaru

| Role | Member | ID |
|------|--------|-----|
| PM | Perera K T L | IT24610793 |
| Dev 1 | Wijesinghe K | IT24102587 |
| Dev 2 | Wickramasinghe G K D K | IT24101516 |
| QA | Yavindi M D C | IT24101636 |

---

### 📋 Sprint Status

| Sprint | Goal | Status | Duration | Story Points |
|--------|------|--------|----------|--------------|
| 1 | User Management & Auth | ✅ COMPLETE | Week 1-2 | - |
| 2 | Service & Product Management | ✅ COMPLETE | 9 Mar - 23 Mar | 26 |
| 3 | E-Commerce & Payments | ✅ COMPLETE | 24 Mar - 8 Apr | 27 |
| 4 | Appointments & Reviews | 🔄 IN PROGRESS | 8 Apr - 23 Apr | 32 |

---

### 📋 Sprint 4 User Stories (8 Work Items - 32 Points)

**Sprint:** 8 Apr - 23 Apr | **Status:** 0 Complete | 19 In Review | 13 Done

### Epic 2: Appointment Management (5 Stories - 19 Points)

| Story ID | Title | Status | Points | Assignee |
|----------|-------|--------|--------|----------|
| SS-37 | STORY 1 - Book Appointment | 🔄 IN REVIEW | 5 | DK |
| SS-38 | STORY 2 - Cancel Appointment | 🔄 IN REVIEW | 3 | DK |
| SS-39 | STORY 3 - View Booking History | 🔄 IN REVIEW | 3 | DK |
| SS-41 | STORY 4 - Admin Appointment Approval | 🔄 IN REVIEW | 3 | DK |
| SS-42 | STORY 5 - Time Slot Management | 🔄 IN REVIEW | 5 | K |

### Epic 8: Review & Rating System (3 Stories - 13 Points)

| Story ID | Title | Status | Points | Assignee |
|----------|-------|--------|--------|----------|
| SS-60 | Story 1 - Submit Review & Rating | ✅ DONE | 5 | K |
| SS-61 | Story 2 - View Reviews | ✅ DONE | 3 | K |
| SS-62 | Story 3 - Admin Moderate Reviews | ✅ DONE | 5 | K |

---

## 🎯 Sprint 4 Objectives

- ✅ **Review & Rating System** - Complete submission, viewing, and admin moderation workflow
- 📋 **Appointment Booking System** - Implement booking, cancellation, history, and admin approval
- 🎯 **Time Slot Management** - Enable dynamic slot management with staff availability
- 🔄 **Email Notifications** - Appointment confirmations, reminders, and cancellation alerts
- 🧪 **System Testing** - Integration testing and refinement of appointment & review flows
- 🤖 **AI Integration** - AI-powered beauty recommendations and service suggestions (Upcoming)

---

## 📊 API Endpoints (Sprint 4)

### Appointment Endpoints
```
POST   /api/appointments              - Create new appointment
GET    /api/appointments              - Get user appointments
GET    /api/appointments/:id          - Get appointment details
PUT    /api/appointments/:id          - Reschedule appointment
DELETE /api/appointments/:id          - Cancel appointment
GET    /api/appointments/stats        - User appointment statistics
GET    /api/admin/appointments        - All appointments (admin)
GET    /api/admin/appointments/pending - Pending approval (admin)
POST   /api/admin/appointments/:id/approve - Approve booking (admin)
POST   /api/admin/appointments/:id/reject  - Reject booking (admin)
```

### Time Slot Endpoints
```
GET    /api/timeslots?serviceId=:id&staffId=:id  - Get available slots
GET    /api/timeslots/staff/:id       - Get staff upcoming slots
POST   /api/timeslots                 - Create time slot (admin)
PUT    /api/timeslots/:id             - Update time slot (admin)
DELETE /api/timeslots/:id             - Delete time slot (admin)
```

### Review Endpoints
```
POST   /api/reviews                   - Submit review
GET    /api/reviews/service/:id       - Get service reviews
GET    /api/reviews/user              - Get user's reviews
PUT    /api/reviews/:id               - Update own review
DELETE /api/reviews/:id               - Delete own review
GET    /api/reviews/admin/pending     - Get pending reviews (admin)
POST   /api/reviews/:id/approve       - Approve review (admin)
POST   /api/reviews/:id/reject        - Reject review (admin)
POST   /api/reviews/:id/respond       - Admin response to review
POST   /api/reviews/:id/helpful       - Mark review helpful
GET    /api/reviews/stats             - Review statistics
```

---

### 📊 Database Schema (Sprint 4)

#### Appointments Table
```
id (PK), user_id (FK), service_id (FK), staff_id (FK),
appointment_date, appointment_time, 
status (PENDING/APPROVED/REJECTED/CANCELLED/COMPLETED),
notes, created_at, updated_at
```

#### TimeSlots Table
```
id (PK), staff_id (FK), date, start_time, end_time,
is_available, appointment_id (FK),
created_at, updated_at
```

#### Reviews Table
```
id (PK), user_id (FK), service_id (FK), appointment_id (FK),
service_quality_rating (1-5), staff_rating (1-5),
overall_rating (1-5), title, content, 
photos_path, is_anonymous, is_approved,
helpful_count, unhelpful_count,
admin_response, created_at, updated_at
```

#### AppointmentNotifications Table
```
id (PK), appointment_id (FK), user_id (FK),
notification_type (CONFIRMATION/REMINDER/CANCELLATION),
sent_at, created_at
```

---

### 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5.x, Tailwind CSS, React Calendar |
| **Backend** | Spring Boot 4.0.3, Spring Data JPA, Hibernate |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT + BCrypt |
| **Email** | Spring Mail + SMTP |
| **File Upload** | Multipart/Form-Data for review photos |

---

### 🚀 Quick Start

#### Prerequisites
- Node.js 16+ & npm
- Java 17+
- MySQL 8.0+
- Maven 3.8+

#### Setup & Run

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

### 📋 Features Overview (Sprint 4 - In Progress 🔄)

#### ✅ Review & Rating System (Complete)
- Customer review submission with title and content
- Star rating system (1-5 stars)
  - Service quality rating
  - Staff rating
  - Overall rating (calculated average)
- Review moderation by admin
- Approve/Reject reviews before public display
- Admin response to reviews
- Helpful/Unhelpful marking
- Anonymous review option
- Review photo upload capability
- Review history tracking

#### 📋 Appointment Booking System (In Review)
- Customer appointment booking with service selection
- Staff member assignment to appointments
- Appointment date and time selection
- Appointment status tracking (PENDING/APPROVED/REJECTED/CANCELLED/COMPLETED)
- Appointment cancellation by customer
- Appointment rescheduling capability
- Booking history view for customers
- Personal appointment statistics

#### 📋 Admin Appointment Management (In Review)
- View all pending appointment requests
- Approve or reject appointment bookings
- Appointment detail inspection
- Appointment status management
- Email notifications on approval/rejection

#### 📋 Time Slot Management (In Review)
- Dynamic availability calendar for staff
- Time slot creation and configuration
- Availability status tracking
- Staff schedule management
- Booking conflict prevention
- Customizable slot duration

---

### 👥 User Roles

#### Admin Access
- ✅ Dashboard with appointment statistics
- ✅ Appointment approval/rejection
- ✅ Time slot management
- ✅ Review moderation and response
- ✅ Block/Unblock customers
- ✅ Profile management

#### Customer Access
- ✅ Browse available services
- ✅ View available time slots
- ✅ Book appointments
- ✅ Cancel appointments
- ✅ Reschedule appointments
- ✅ View booking history
- ✅ Submit reviews and ratings
- ✅ View appointment statistics

#### Guest Access
- ✅ View services
- ✅ View reviews and ratings
- ❌ Cannot book appointments (redirected to login)
- ❌ Cannot submit reviews (redirected to login)

---

### 📁 Project Structure (Sprint 4 Updates)

```
Group-11-Salon-Sanaru/
├── backend/
│   ├── src/main/java/com/sanaru/backend/
│   │   ├── controller/
│   │   │   ├── AppointmentController.java      # NEW
│   │   │   ├── TimeSlotController.java         # NEW
│   │   │   ├── ReviewController.java           # NEW
│   │   │   └── [Previous controllers...]
│   │   ├── service/
│   │   │   ├── AppointmentService.java         # NEW
│   │   │   ├── TimeSlotService.java            # NEW
│   │   │   ├── ReviewService.java              # NEW
│   │   │   ├── AppointmentNotificationService.java # NEW
│   │   │   └── [Previous services...]
│   │   ├── model/
│   │   │   ├── Appointment.java                # NEW
│   │   │   ├── TimeSlot.java                   # NEW
│   │   │   ├── Review.java                     # NEW
│   │   │   ├── AppointmentNotification.java    # NEW
│   │   │   └── [Previous models...]
│   │   ├── dto/
│   │   │   ├── AppointmentDTO.java             # NEW
│   │   │   ├── TimeSlotDTO.java                # NEW
│   │   │   ├── ReviewDTO.java                  # NEW
│   │   │   └── [Previous DTOs...]
│   │   ├── repository/
│   │   │   ├── AppointmentRepository.java      # NEW
│   │   │   ├── TimeSlotRepository.java         # NEW
│   │   │   ├── ReviewRepository.java           # NEW
│   │   │   └── [Previous repositories...]
│   │   └── util/
│   │       └── [Previous utilities...]
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AppointmentBookingPage.jsx      # NEW
│   │   │   ├── BookingHistoryPage.jsx          # NEW
│   │   │   ├── ReviewPage.jsx                  # NEW
│   │   │   ├── AdminApprovalsPage.jsx          # NEW
│   │   │   └── [Previous pages...]
│   │   ├── components/
│   │   │   ├── AppointmentCalendar.jsx         # NEW
│   │   │   ├── TimeSlotSelector.jsx            # NEW
│   │   │   ├── ReviewForm.jsx                  # NEW
│   │   │   ├── ReviewsDisplay.jsx              # NEW
│   │   │   └── [Previous components...]
│   │   ├── hooks/
│   │   │   ├── useCustomerAppointments.jsx     # NEW
│   │   │   └── useAdminNotifications.jsx       # NEW
│   │   └── [Previous directories...]
│   └── vite.config.js
└── README_SPRINT4.md
```

---

### 📱 Key Pages

#### Customer Pages
- `/customer_dashboard/appointments` - View bookings
- `/book-appointment` - New appointment booking
- `/customer_dashboard/booking-history` - Booking history
- `/reviews/service/:id` - Submit service review
- `/customer_dashboard/my-reviews` - View own reviews

#### Admin Pages
- `/admin_dashboard/appointments` - All appointments
- `/admin_dashboard/appointments/pending` - Pending approvals
- `/admin_dashboard/timeslots` - Time slot management
- `/admin_dashboard/reviews` - Review moderation
- `/admin_dashboard/staff-availability` - Staff schedule

#### Public Pages
- `/services/:id/reviews` - View service reviews
- `/reviews` - All approved reviews

---

### 🔐 Security Features

✅ **Authentication Required** - All appointment/review endpoints require login  
✅ **Customer Isolation** - Can only view/modify own appointments & reviews  
✅ **Admin Authorization** - CRUD operations require admin role  
✅ **Data Validation** - Service duration, staff availability validation  
✅ **Conflict Prevention** - Database constraints prevent double-booking  
✅ **Review Moderation** - Admin approval before public visibility  
✅ **Email Notifications** - Confirmation, reminder, and cancellation emails  
✅ **Input Sanitization** - XSS protection on review text  
✅ **Rate Limiting** - Prevent spam review submissions  

---

### 📊 Current Progress (As of Apr 17, 2026)

#### Completed ✅
- **Review & Rating System** (3 Stories - 13 Points) - EPIC 8
  - ✅ SS-60: Submit reviews with star ratings
  - ✅ SS-61: View service reviews and ratings
  - ✅ SS-62: Admin review moderation and response

#### In Review 🔄
- **Appointment Management** (5 Stories - 19 Points) - EPIC 2
  - 🔄 SS-37: Book appointment (5 pts)
  - 🔄 SS-38: Cancel appointment (3 pts)
  - 🔄 SS-39: View booking history (3 pts)
  - 🔄 SS-41: Admin appointment approval (3 pts)
  - 🔄 SS-42: Time slot management (5 pts)

#### Sprint Metrics
- **Sprint Duration:** 8 Apr - 23 Apr (16 days)
- **Current Day:** Day 10 (Progress: 62.5%)
- **Stories Completed:** 3/8 (37.5%)
- **Points Completed:** 13/32 (40.6%)
- **Stories In Review:** 5/8 (62.5%)
- **Points In Review:** 19/32 (59.4%)
- **Stories To Do:** 0/8 (0%)
- **Points To Do:** 0/32 (0%)

---

### 🔮 Next Steps

- [ ] Review and merge Appointment Booking (SS-37) implementation
- [ ] Review and merge Cancel Appointment (SS-38) implementation
- [ ] Review and merge View Booking History (SS-39) implementation
- [ ] Review and merge Admin Appointment Approval (SS-41) implementation
- [ ] Review and merge Time Slot Management (SS-42) implementation
- [ ] Integration testing for complete appointment workflow
- [ ] End-to-end email notification verification
- [ ] Performance testing and optimization
- [ ] User acceptance testing (UAT)
- [ ] Sprint 4 demo and release preparation

---

### 📞 Contact & Support

**Project Manager:** Perera K T L (IT24610793)  
**Development Team:** Group 11  
**QA Lead:** Yavindi M D C (IT24101636)  

---

### 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Appointment not showing | Verify appointment status in database |
| Email not sending | Check Gmail app password and SMTP settings |
| Time slot conflicts | Verify database constraints and validations |
| Review moderation stuck | Check admin permissions and approval workflow |
| Calendar not displaying | Clear cache and verify React Calendar integration |

---

**Status: 🔄 SPRINT 4 IN PROGRESS - APPOINTMENTS & REVIEWS MODULE**


---
---

### 📊 Features Overview (Sprint 3 - Complete ✅)

#### ✅ Shopping Cart System
- Add products to cart
- Update item quantities
- Remove items from cart
- Real-time cart total calculation
- Clear entire cart
- Cart persistence across sessions
- Cart badge with item count

#### ✅ Checkout & Order Management
- Checkout page with order summary
- Shipping address management
- Order confirmation
- Order history tracking
- Order status updates
- Order cancellation (if applicable)
- Invoice generation

#### ✅ Payment Processing
- **Sandbox Payment Integration** - PayHere/similar gateway
- Multiple payment method support (Visa, Mastercard, etc.)
- Payment success response handling
- Payment failure and cancellation handling
- Payment retry logic
- Secure payment data handling
- Transaction ID generation and tracking

#### ✅ Inventory Management
- Stock quantity tracking per product
- Low stock threshold configuration
- Automatic stock updates on purchase
- Stock validation before order confirmation
- Stock synchronization across orders
- Inventory alerts for admin

#### ✅ Transaction & Order History
- Transaction detail storage
- Order confirmation only after successful payment
- Complete transaction history for customers
- Admin transaction reporting
- Transaction status tracking
- Payment receipt generation

#### ✅ AI Beauty Recommendation System
- Beauty prescription based on user preferences
- Recommended services suggestions
- Curated product recommendations
- Grok AI integration
- Personalized beauty advice
- Recommendation caching for performance

#### ✅ Notification System
- Order confirmation emails
- Payment receipt emails
- Shipment tracking updates
- Order status change notifications
- Recommendation emails

---

### 👥 User Roles

#### Customer Access
- ✅ Browse and purchase products
- ✅ Manage shopping cart
- ✅ Complete checkout process
- ✅ Make secure payments
- ✅ View order history
- ✅ Track order status
- ✅ Receive AI recommendations
- ✅ Download invoices

#### Admin Access
- ✅ Inventory management
- ✅ Transaction reporting
- ✅ Order management
- ✅ Stock level monitoring
- ✅ Low stock alerts
- ✅ Payment transaction auditing
- ✅ Customer order history

---

### 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5.x, Tailwind CSS, Context API |
| **Backend** | Spring Boot 4.0.3, Spring Security, JPA/Hibernate |
| **Database** | MySQL 8.0 |
| **Payment Gateway** | PayHere Sandbox Integration |
| **AI Service** | Grok AI API |
| **Authentication** | JWT + BCrypt |
| **Email** | Spring Mail + SMTP |
| **Build** | Maven & npm |

---

### 📁 Project Structure (Sprint 3 Updates)

```
Group-11-Salon-Sanaru/
├── backend/
│   ├── src/main/java/com/sanaru/backend/
│   │   ├── controller/
│   │   │   ├── CartController.java          # NEW
│   │   │   ├── OrderController.java         # NEW
│   │   │   ├── PaymentController.java       # NEW
│   │   │   ├── InventoryController.java     # NEW
│   │   │   └── RecommendationController.java# NEW
│   │   ├── service/
│   │   │   ├── CartService.java             # NEW
│   │   │   ├── OrderService.java            # NEW
│   │   │   ├── PaymentService.java          # NEW
│   │   │   ├── InventoryService.java        # NEW
│   │   │   └── RecommendationService.java   # NEW
│   │   ├── model/
│   │   │   ├── Cart.java                    # NEW
│   │   │   ├── Order.java                   # NEW
│   │   │   ├── Transaction.java             # NEW
│   │   │   └── OrderItem.java               # NEW
│   │   ├── dto/
│   │   │   ├── CartDTO.java                 # NEW
│   │   │   ├── OrderDTO.java                # NEW
│   │   │   └── TransactionDTO.java          # NEW
│   │   ├── repository/
│   │   │   ├── CartRepository.java          # NEW
│   │   │   ├── OrderRepository.java         # NEW
│   │   │   ├── TransactionRepository.java   # NEW
│   │   │   └── InventoryRepository.java     # NEW
│   │   └── util/
│   │       ├── PaymentGatewayUtil.java      # NEW
│   │       └── OrderGenerator.java          # NEW
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CartPage.jsx                 # NEW
│   │   │   ├── CheckoutPage.jsx             # NEW
│   │   │   ├── PaymentPage.jsx              # NEW
│   │   │   ├── OrderConfirmationPage.jsx    # NEW
│   │   │   ├── OrderHistoryPage.jsx         # NEW
│   │   │   └── AiRecommendationPage.jsx     # NEW
│   │   ├── components/
│   │   │   ├── CartItemRow.jsx              # NEW
│   │   │   ├── OrderSummary.jsx             # NEW
│   │   │   ├── PaymentGateway.jsx           # NEW
│   │   │   └── RecommendationCard.jsx       # NEW
│   │   ├── context/
│   │   │   ├── CartContext.jsx              # NEW
│   │   │   └── OrderContext.jsx             # NEW
│   │   ├── services/
│   │   │   ├── cartService.js               # NEW
│   │   │   ├── paymentService.js            # NEW
│   │   │   ├── orderService.js              # NEW
│   │   │   └── recommendationService.js     # NEW
│   │   └── styles/
│   │       └── checkout.css                 # NEW
│   └── vite.config.js
└── README.md
```

---

### 🛒 Key Pages (Sprint 3)

#### Customer Shopping
- `/products` - Product listing
- `/products/:id` - Product details
- `/customer_dashboard/cart` - Shopping cart
- `/checkout` - Checkout process
- `/payment` - Payment gateway
- `/order-confirmation` - Order confirmation
- `/my-orders` - Order history

#### Admin
- `/admin_dashboard/inventory` - Inventory management
- `/admin_dashboard/orders` - Order management
- `/admin_dashboard/transactions` - Transaction reports
- `/admin_dashboard/low-stock` - Low stock alerts

#### AI Features
- `/customer_dashboard/ai-recommendation` - Beauty advisor
- `/customer_dashboard/ai-recommendation/prescriptions` - Beauty prescriptions

---

### 💳 Payment Gateway Integration

### PayHere Sandbox Setup
```
Merchant ID: [YOUR_MERCHANT_ID]
API Key: [YOUR_API_KEY]
Return URL: http://localhost:5173/payment-confirmation
Notify URL: http://localhost:8080/api/payment/notify
```

#### Payment Flow
1. Customer adds items to cart
2. Checkout page shows order summary
3. Customer initiates payment
4. Redirected to PayHere gateway
5. Payment processed
6. Callback received with transaction status
7. Order confirmed (only after successful payment)
8. Stock updated automatically
9. Confirmation email sent

#### Payment Status Management
- ✅ **SUCCESS** - Order confirmed, stock updated
- ❌ **FAILED** - Cart retained, retry option shown
- 🔄 **PENDING** - Awaiting payment confirmation
- ⏸️ **CANCELLED** - User cancelled payment

---

### 📦 API Endpoints (Sprint 3)

#### Cart Endpoints
```
POST   /api/cart/add          - Add item to cart
DELETE /api/cart/remove/:id   - Remove item
PUT    /api/cart/update       - Update quantity
GET    /api/cart              - Get cart items
POST   /api/cart/clear        - Clear cart
```

#### Order Endpoints
```
POST   /api/orders            - Create order
GET    /api/orders            - Get user orders
GET    /api/orders/:id        - Get order details
PUT    /api/orders/:id        - Update order status
DELETE /api/orders/:id        - Cancel order
```

#### Payment Endpoints
```
POST   /api/payment/initiate  - Start payment
POST   /api/payment/confirm   - Confirm payment
POST   /api/payment/notify    - Payment callback
GET    /api/transactions      - Transaction history
```

#### Inventory Endpoints
```
GET    /api/inventory/stock   - Check stock
GET    /api/inventory/low-stock - Low stock alerts
PUT    /api/inventory/update  - Update stock
```

#### Recommendation Endpoints
```
GET    /api/recommendations/beauty-prescription - Get recommendations
GET    /api/recommendations/products             - Recommended products
GET    /api/recommendations/services             - Recommended services
```

---

### 🔐 Security Features (Sprint 3 Additions)

✅ **Payment Data Protection** - Secure transmission to gateway
✅ **Order Validation** - Verify order before confirmation
✅ **Stock Synchronization** - Prevent overselling
✅ **Transaction Auditing** - All payments logged
✅ **Payment Confirmation** - Webhook verification
✅ **Admin Authorization** - Protected inventory endpoints

---

### 📊 Database Schema Updates (Sprint 3)

#### New Tables
- `orders` - Order details and status
- `order_items` - Items in each order
- `transactions` - Payment transaction records
- `carts` - Shopping cart data
- `inventory` - Stock and threshold levels

#### Key Fields
- Order: `id, user_id, total_amount, status, created_at`
- Transaction: `id, order_id, payment_id, status, amount, timestamp`
- Cart: `id, user_id, total_items, total_price`
- Inventory: `product_id, quantity, low_stock_threshold`

---

### ✅ Quality Assurance (Sprint 3)

#### Test Coverage
- ✅ Cart operations (add, remove, update)
- ✅ Checkout workflow
- ✅ Payment gateway integration
- ✅ Order confirmation logic
- ✅ Stock updates
- ✅ AI recommendation accuracy
- ✅ Error handling and edge cases

#### Known Issues
- None (All critical issues resolved)

---

### 🎯 Sprint 3 Metrics

| Metric | Value |
|--------|-------|
| Story Points Committed | 27 |
| Story Points Completed | 27 |
| Completion Rate | 100% |
| Number of User Stories | 8 |
| Bugs Reported | 4 |
| Bugs Fixed | 4 |
| Critical Issues | 0 |

---

### 🔮 Next Steps (Sprint 4+)

- [ ] Advanced analytics dashboard
- [ ] Subscription services
- [ ] Loyalty program
- [ ] Mobile app development
- [ ] Voice-based booking
- [ ] Enhanced AI recommendations
- [ ] Live chat support

---

### 📝 Deployment

### Build & Deploy
```bash
# Backend
cd backend
mvn clean package
java -jar target/salon-sanaru.jar

# Frontend  
cd frontend
npm run build
npm run preview
```

---

### 🆘 Troubleshooting

#### Payment Not Processing
- Verify PayHere credentials in `application.properties`
- Check internet connectivity
- Review payment gateway logs
- Ensure order amount is valid

#### Cart Not Synchronizing
- Clear browser cache
- Check CartContext state
- Verify API endpoint connectivity
- Review browser console for errors

#### Low Stock Alerts Not Showing
- Verify low_stock_threshold is set
- Check inventory repository query
- Confirm admin user permissions

---

### 📞 Contact & Support

**Project Manager:** Wijesinghe K (IT24102587)  
**Development Team:** Group 11  
**QA Lead:** Perera K T L (IT24610793)  

---

**Status: ✅ SPRINT 3 COMPLETE - E-COMMERCE PLATFORM OPERATIONAL**


-----


#

 ## 🏪 Sprint 2 - Service & Product Management

A comprehensive service and product management system enabling administrators to manage salon services and beauty products while allowing customers and guests to browse available offerings with secure role-based access control.

**Group:** Group 11 | **Status:** Sprint 2 Complete ✅ | **Version:** 1.2.0

---

### 🤝 Team (Sprint 2)

**Project:** Group 11 - Salon Sanaru

| Role | Member | ID |
|------|--------|-----|
| PM | Wickramasinghe G K D K | IT24101516 |
| Dev 1 | Yavindi M D C | IT24101636 |
| Dev 2 | Perera K T L | IT24610793 |
| QA | Wijesinghe K | IT24102587 |

---

### 📋 Sprint Status

| Sprint | Goal | Status | Duration | Story Points |
|--------|------|--------|----------|--------------|
| 1 | User Management & Auth | ✅ COMPLETE | Week 1-2 | - |
| 2 | Service & Product Management | ✅ COMPLETE | 9 Mar - 23 Mar | 26 |
| 3 | E-Commerce & Payments | ✅ COMPLETE | 24 Mar - 8 Apr | 27 |

---

### 🚀 Quick Start

#### Prerequisites
- Node.js 16+ & npm
- Java 17+
- MySQL 8.0+
- Maven 3.8+

#### Setup & Run

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

### 📊 Features Overview (Sprint 2 - Complete ✅)

#### ✅ Service Management (Admin)
- Complete Service CRUD operations (Create, Read, Update, Delete)
- Service details: name, description, price, duration
- Service image management
- Service listing and detail views
- Activate/deactivate services
- Admin service management dashboard
- Input validation and error handling

#### ✅ Product Management (Admin)
- Complete Product CRUD operations (Create, Read, Update, Delete)
- Product image upload and storage
- Product details: name, description, price, category
- Product categorization
- Product listing with filtering
- Admin product management dashboard
- Image validation and size limits
- Input validation and error handling

#### ✅ Public Service Browsing (Customer & Guest)
- View all available services
- Service detail pages with description, price, duration
- Service filtering and search
- Browse public service information
- "Book Now" buttons (redirects to login if guest)

#### ✅ Public Product Browsing (Customer & Guest)
- View all available products
- Product detail pages with pricing and descriptions
- Product categorization and filtering
- Product search functionality
- Browse public product information
- "Add to Cart" buttons (redirects to login if guest)

#### ✅ Guest Access Control
- Public access to services and products
- Guests can view but cannot:
  - Book appointments (redirected to login)
  - Add items to cart (redirected to login)
  - Submit reviews (redirected to login)
  - Access customer dashboard (redirected to login)
- Proper 401 Unauthorized responses for protected endpoints
- Login redirection for restricted actions
- Secure role-based access validation

#### ✅ Role-Based Access Control
- Admin-only operations (CRUD for services/products)
- Customer features (booking, cart, reviews)
- Guest read-only access
- Protected routes with authentication
- Backend authorization validation
- Error messages for unauthorized access

---

### 👥 User Roles

#### Admin Access
- ✅ Manage services (CRUD operations)
- ✅ Manage products (CRUD operations)
- ✅ View all services and products
- ✅ Upload and manage images
- ✅ Set pricing and categories
- ✅ Access admin dashboard
- ✅ View all customer activity

#### Customer Access
- ✅ Browse services and products
- ✅ View service and product details
- ✅ Search and filter offerings
- ✅ Book appointments (Sprint 3+)
- ✅ Add items to cart (Sprint 3+)
- ✅ Leave reviews (Sprint 3+)
- ✅ Access customer dashboard

#### Guest Access
- ✅ Browse public services
- ✅ Browse public products
- ✅ View service details
- ✅ View product details
- ✅ Search and filter
- ❌ Cannot book appointments (redirected to login)
- ❌ Cannot add to cart (redirected to login)
- ❌ Cannot submit reviews (redirected to login)

---

### 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5.x, Tailwind CSS, FormData API |
| **Backend** | Spring Boot 4.0.3, Spring Data JPA, Hibernate |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT + BCrypt |
| **File Uploads** | Multipart/Form-Data, Image validation |
| **Email** | Spring Mail + SMTP |
| **Validation** | Jakarta Bean Validation |
| **Build** | Maven & npm |

---

### 📁 Project Structure (Sprint 2 Updates)

```
Group-11-Salon-Sanaru/
├── backend/
│   ├── src/main/java/com/sanaru/backend/
│   │   ├── controller/
│   │   │   ├── ServiceController.java         # NEW
│   │   │   ├── ProductController.java         # NEW
│   │   │   ├── AuthController.java            # From Sprint 1
│   │   │   └── UserController.java            # From Sprint 1
│   │   ├── service/
│   │   │   ├── ServiceService.java            # NEW
│   │   │   ├── ProductService.java            # NEW
│   │   │   ├── FileUploadService.java         # NEW
│   │   │   └── AuthService.java               # From Sprint 1
│   │   ├── model/
│   │   │   ├── Service.java                   # NEW
│   │   │   ├── Product.java                   # NEW
│   │   │   ├── Category.java                  # NEW
│   │   │   └── User.java                      # From Sprint 1
│   │   ├── dto/
│   │   │   ├── ServiceDTO.java                # NEW
│   │   │   ├── ProductDTO.java                # NEW
│   │   │   └── UserDTO.java                   # From Sprint 1
│   │   ├── repository/
│   │   │   ├── ServiceRepository.java         # NEW
│   │   │   ├── ProductRepository.java         # NEW
│   │   │   ├── CategoryRepository.java        # NEW
│   │   │   └── UserRepository.java            # From Sprint 1
│   │   └── util/
│   │       ├── FileUploadUtil.java            # NEW
│   │       └── FileStorageService.java        # NEW
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ServicesPage.jsx               # NEW
│   │   │   ├── ProductsPage.jsx               # NEW
│   │   │   ├── AdminServicesPage.jsx          # NEW
│   │   │   ├── AdminProductsPage.jsx          # NEW
│   │   │   ├── LoginPage.jsx                  # From Sprint 1
│   │   │   └── HomePage.jsx                   # From Sprint 1
│   │   ├── components/
│   │   │   ├── ServiceCard.jsx                # NEW
│   │   │   ├── ProductCard.jsx                # NEW
│   │   │   ├── ServiceForm.jsx                # NEW
│   │   │   ├── ProductForm.jsx                # NEW
│   │   │   ├── ImageUpload.jsx                # NEW
│   │   │   └── ProtectedRoute.jsx             # From Sprint 1
│   │   ├── services/
│   │   │   ├── serviceApi.js                  # NEW
│   │   │   ├── productApi.js                  # NEW
│   │   │   └── authService.js                 # From Sprint 1
│   │   └── styles/
│   │       ├── services.css                   # NEW
│   │       └── products.css                   # NEW
│   └── vite.config.js
└── README.md
```

---

### �️ Key Pages (Sprint 2)

#### Public Pages (Guest Access)
- `/services` - Browse all salon services
- `/products` - Browse all beauty products
- `/services/:id` - Service details page
- `/products/:id` - Product details page
- `/` - Homepage

#### Customer Pages
- `/customer_dashboard` - Customer dashboard
- `/services` - View all services
- `/products` - View all products

#### Admin Pages
- `/admin_dashboard` - Admin dashboard
- `/admin_dashboard/services` - Service management (CRUD)
- `/admin_dashboard/products` - Product management (CRUD)
- `/admin_dashboard/users` - User management (from Sprint 1)

---

### � Management Workflows

#### Admin Service Management
1. Access `/admin_dashboard/services`
2. Click "Add Service" to create new service
3. Fill in service details (name, description, price, duration)
4. Upload service image
5. Submit to save
6. Edit or Delete existing services
7. View all services in list format

#### Admin Product Management
1. Access `/admin_dashboard/products`
2. Click "Add Product" to create new product
3. Fill in product details (name, description, price, category)
4. Upload product image (JPG/PNG/WEBP, max 5MB)
5. Select product category
6. Submit to save
7. Edit or Delete existing products
8. View all products in list format

#### Customer/Guest Service Browsing
1. Navigate to `/services` page
2. View all available services with images
3. Click on service card for details
4. See price, duration, description
5. Click "Book Now" (redirects to login if guest)

#### Customer/Guest Product Browsing
1. Navigate to `/products` page
2. View all available products with images
3. Filter by category if needed
4. Click on product for details  
5. See price, description, reviews
6. Click "Add to Cart" (redirects to login if guest)

---

### 🖼️ Image Upload System

#### Product/Service Images
- **Supported Formats:** JPG, JPEG, PNG, WEBP
- **Max Size:** 5MB per image
- **Storage:** Backend `/uploads` directory
- **Validation:** Size and format checked before upload
- **Error Handling:** Clear messages for invalid uploads

#### Upload Process
1. Select image file from computer
2. Click upload button in form
3. Validation checks file format and size
4. Image stored with unique filename
5. Image path saved to database
6. Display preview in UI

#### Access Control
- Guests can view images (public)
- Admin can upload new images
- Admin can update/replace images
- Admin can delete images with product/service

---

### 📊 API Endpoints (Sprint 2)

#### Service Endpoints
```
GET    /api/services               - Get all services (public)
GET    /api/services/:id           - Get service details (public)
POST   /api/services               - Create service (admin only)
PUT    /api/services/:id           - Update service (admin only)
DELETE /api/services/:id           - Delete service (admin only)
```

#### Product Endpoints
```
GET    /api/products               - Get all products (public)
GET    /api/products/:id           - Get product details (public)
GET    /api/products?category=:id  - Get products by category (public)
POST   /api/products               - Create product (admin only)
PUT    /api/products/:id           - Update product (admin only)
DELETE /api/products/:id           - Delete product (admin only)
```

#### Category Endpoints
```
GET    /api/categories             - Get all categories (public)
POST   /api/categories             - Create category (admin only)
PUT    /api/categories/:id         - Update category (admin only)
DELETE /api/categories/:id         - Delete category (admin only)
```

#### File Upload Endpoints
```
POST   /api/upload/image           - Upload image (multipart/form-data)
GET    /uploads/:filename          - Download image
```

---

### 🔐 Security Features (Sprint 2)

✅ **Role-Based Access Control** - Admin/Customer/Guest separation
✅ **Protected Endpoints** - CRUD operations require authentication
✅ **Image Validation** - Format and size checks before upload
✅ **File Storage** - Images stored outside web root
✅ **Admin Authorization** - Verify admin role for management operations
✅ **Input Validation** - Name, description, price validation
✅ **SQL Injection Prevention** - Prepared statements with JPA
✅ **XSS Protection** - Sanitized output in frontend
✅ **CORS Configuration** - Restricted to frontend domain
✅ **Error Handling** - Secure error messages (no stack traces to users)

---

### 📊 Database Schema (Sprint 2)

#### Services Table
```
id (PK), name, description, price, duration (minutes), 
image_path, is_active, created_at, updated_at
```

#### Products Table
```
id (PK), name, description, price, category_id (FK), 
image_path, stock_quantity, created_at, updated_at
```

#### Categories Table
```
id (PK), name, description, created_at, updated_at
```

#### Product_Categories Junction Table
```
product_id (FK), category_id (FK) - for many-to-many relationship
```

#### Key Constraints
- Service/Product names are not unique (duplicates allowed)
- Image path is required and not null
- Price must be greater than 0
- Foreign key constraints maintained

---

### ✅ Quality Assurance (Sprint 2)

#### Test Coverage
- ✅ Service CRUD operations (admin)
- ✅ Product CRUD operations (admin)
- ✅ Service browsing (customer & guest)
- ✅ Product browsing (customer & guest)
- ✅ Image upload and validation
- ✅ Role-based access control
- ✅ Guest access restrictions
- ✅ Protected endpoint authorization
- ✅ Error handling and messages

#### Issues Found & Resolved
- ✅ **Image Upload**: Boundary conditions tested, size limits enforced
- ✅ **Admin Product Creation**: Form validation and backend constraints verified
- ✅ **Role-Based Access**: Authorization checks implemented and tested
- ✅ **Frontend-Backend Sync**: Data consistency validated across operations
- ✅ **Multi-Role Testing**: All user types tested (Admin, Customer, Guest)

#### Known Issues
- None (All issues resolved before sprint completion)

---

### 🎯 Sprint 2 Metrics

| Metric | Value |
|--------|-------|
| Sprint Duration | 9 Mar - 23 Mar 2026 (15 days) |
| Story Points Committed | 26 |
| Story Points Completed | 26 |
| Completion Rate | 100% ✅ |
| Number of User Stories | 6 |
| Developers | 2 (Yavindi, Perera) |
| QA | 1 (Wijesinghe) |
| Bugs Found | 4 |
| Bugs Fixed | 4 |
| Critical Issues | 0 |

---

### ⚠️ Challenges Faced During Sprint 2

#### 1. Image Upload Handling
- **Challenge:** Managing multipart form data for image uploads
- **Issue:** Validation of file types and sizes
- **Solution:** Implemented comprehensive validation (JPG/PNG/WEBP, 5MB max)
- **Outcome:** ✅ Resolved - Images upload and store correctly

#### 2. Admin Product Creation Validation
- **Challenge:** Form validation and data type constraints
- **Issue:** Price precision, required field handling
- **Solution:** Server-side validation with proper error messages
- **Outcome:** ✅ Resolved - Admin can create products without errors

#### 3. Role-Based Access Control
- **Challenge:** Protecting admin endpoints from unauthorized access
- **Issue:** Guest users accessing restricted features
- **Solution:** JWT token validation, role checking on backend
- **Outcome:** ✅ Resolved - Proper 401 responses for unauthorized access

#### 4. Frontend-Backend Synchronization
- **Challenge:** Data consistency across create/update/delete operations
- **Issue:** Caching and real-time updates
- **Solution:** API cache invalidation, state management updates
- **Outcome:** ✅ Resolved - Data remains consistent

#### 5. Mid-Semester Exams Impact
- **Challenge:** First week of sprint overlapped with exams
- **Issue:** Reduced initial development velocity
- **Solution:** Team coordinated efforts, made up progress by sprint end
- **Outcome:** ✅ Resolved - All work completed on time despite initial slowdown

---

### 📝 Notifications (Sprint 2)

- Service created/updated/deleted (admin logging)
- Product created/updated/deleted (admin logging)
- Access denied notifications (unauthorized attempts logged)

---

### � Next Steps (Sprint 3)

- Implement appointment booking system
- Add staff management features
- Create review and rating system
- Email notification system
- Advanced search and filtering
- Real-time data synchronization

---

### 📞 Contact & Support

**Project Manager:** Wickramasinghe G K D K (IT24101516)  
**Development Team:** Group 11  
**QA Lead:** Wijesinghe K (IT24102587)  

For technical issues:
- Contact: group11@salonsanaru.com
- Sprint Meetings: Daily via WhatsApp

---

### ✅ Committed Work Completed

| Story | Title | Points | Status |
|-------|-------|--------|--------|
| SS-40 | Admin Manage Services (CRUD) | 5 | ✅ DONE |
| SS-43 | View Services (Customer) | 3 | ✅ DONE |
| SS-56 | Guest Browse Public Information | 5 | ✅ DONE |
| SS-57 | Restrict Protected Features for Guests | 5 | ✅ DONE |
| SS-55 | Customer Browse and View Products | 3 | ✅ DONE |
| SS-54 | Admin Manage Products (CRUD) | 5 | ✅ DONE |
| **TOTAL** | **6 Stories** | **26 points** | **✅ 100%** |

---

**Status: ✅ SPRINT 2 COMPLETE - SERVICE & PRODUCT MANAGEMENT OPERATIONAL**

*All committed work delivered on time. System ready for appointment booking features in Sprint 3.*



 ## 🏪 Sprint 1  - User Management, Authentication & Email Notification System

A comprehensive web-based beauty salon management system enabling customers to book appointments, purchase products, and receive personalized beauty recommendations while providing administrators with complete business control.

**Group:** Group 11 | **Status:** Sprint 1 Complete ✅ | **Version:** 1.0.2

---

### 🤝 Team (Sprint 1)

**Project:** Group 11 - Salon Sanaru

| Role | Member |
|------|--------|
| PM | Chanumi |
| QA | Dahamya |
| Developer 1 | Kunchana |
| Developer 2 | Thamod |

---

### 📋 Sprint Status

| Sprint | Goal | Status | Duration |
|--------|------|--------|----------|
| 1 | User Management, Email Validation, Homepage Hero | ✅ COMPLETE | Week 1-2 |

---

### 🚀 Quick Start

#### Prerequisites
- Node.js 16+ & npm
- Java 17+
- MySQL 8.0+
- Maven 3.8+

#### Setup & Run

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

### 📊 Features Overview (Sprint 1 - Complete ✅)

#### ✅ User Management & Authentication
- User Registration & Login with JWT token
- **Email Format Validation** - Regex pattern validation
- **Domain MX Records Validation** - Ensures email domain can receive emails
- **Throwaway Domain Detection** - Blocks 30+ temp email services
- Email normalization (case-insensitive matching)
- Google OAuth 2.0 integration with blocked user prevention
- Role-based access control (ADMIN/CUSTOMER)
- JWT token blacklist on logout

#### ✅ Admin Features
- Dashboard with customer statistics
- Customer Management (view, block, delete)
- Admin profile management with password change
- Account blocking enforcement
- Role-based access control

#### ✅ Customer Features
- User registration with email validation
- Login and profile management
- Password change functionality
- Dashboard with personal information
- Profile update capability

#### ✅ Email Notification System
- Welcome email on registration
- Account blocked notification with support contact
- Account unblocked notification
- Blocked login attempt reminder email
- Password changed confirmation email
- Account deleted notification email
- Appointment confirmation and reminders
- Booking confirmation emails

#### ✅ Homepage Features
- **Full-Screen Hero Section** with salon interior image (`salon-hero.jpg`)
- Responsive design on all devices
- Smooth animations with Framer Motion
- Service preview cards
- About section
- Call-to-action buttons

#### ✅ UI/UX Enhancements
- Dark/Light theme toggle
- Tailwind CSS styling
- Form validation (client + server)
- User-friendly error messages
- Protected routes with role-based access
- Toast notifications with Sonner
- Accessible form inputs

---

### 👥 User Roles

#### Admin Access
- Dashboard with customer statistics
- Customer management (view, block, delete)
- Block/Unblock customers with notifications
- Profile and password management
- Admin dashboard access

#### Customer Access
- Register with email validation
- Login and profile management
- View customer dashboard
- Browse homepage
- Secure password change

#### Guest Access
- View public homepage
- Access registration/login pages

---

### 🏗️ Tech Stack

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

### 📁 Project Structure

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

### 🔑 Seed Admin Credentials

```
Email: admin@salonsanaru.com
Password: qazxsw
```

---

### 📱 Key Pages

#### Admin
- `/admin_dashboard` - Dashboard with stats
- `/admin_dashboard/users` - Customer management
- `/admin_dashboard/profile` - Admin profile

#### Customer
- `/customer_dashboard` - Dashboard
- `/homepage` - Homepage
- `/customer_profile` - Profile

#### Public
- `/` - Homepage with hero image
- `/login` - Login
- `/register` - Registration

---

### ✉️ Email Validation System (NEW)

#### 3-Layer Validation

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

#### Applied Locations
- User registration (registerUser, registerAdminUser)
- Email updates
- Authentication flows

**Classes:**
- `EmailValidator.java` - Validation utility
- `InvalidEmailException.java` - Custom exception
- `GlobalExceptionHandler.java` - Exception handler

---

### 🔐 Security Features

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

### 📊 Build Status

✅ **Frontend:** No errors, ready to run
✅ **Backend:** BUILD SUCCESS - 38 files (8-9s)
✅ **Server:** Running on port 8080
✅ **Integration:** Ready for testing

---

### 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Kill process or change port in `application.properties` |
| DB connection fails | Verify MySQL credentials |
| Email not working | Check Gmail app password |
| CORS errors | Ensure backend is running |
| Hero image missing | Clear cache (Ctrl+Shift+R) |

---

### 📄 License

Proprietary - Salon Sanaru Management System
All Rights Reserved © 2026

---

**Status:** ✅ Sprint 1 Complete
**Last Updated:** March 2, 2026
**Version:** 1.0.5
**Next:** Sprint 2 - SERVICE & PRODUCT MANAGEMENT OPERATIONAL

