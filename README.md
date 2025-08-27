# 🏪 Store Rating System - FullStack Application

A comprehensive web application that allows users to submit ratings for stores registered on the platform, with role-based access control and advanced analytics.

## 📋 Project Overview

This is a complete fullstack web application built according to the coding challenge requirements. The system provides a single login interface with different functionalities based on user roles.

### 🎯 Key Features

- **Role-Based Authentication**: JWT-based authentication with three distinct user roles
- **Store Rating System**: Users can rate stores on a 1-5 scale
- **Advanced Analytics**: Comprehensive dashboards for different user roles
- **User Management**: Admin can manage users and stores
- **Responsive Design**: Mobile-friendly React frontend
- **Data Validation**: Both client-side and server-side validation
- **Search & Filtering**: Advanced search capabilities for stores and users

## 👥 User Roles & Capabilities

### 🔧 System Administrator
- ✅ Add new stores, normal users, and admin users
- ✅ Dashboard with analytics (total users, stores, ratings)
- ✅ Comprehensive user management with filtering
- ✅ Store management with ratings overview
- ✅ View detailed user information (including store owner ratings)
- ✅ Advanced filtering on all listings

### 👤 Normal User
- ✅ Sign up and login functionality
- ✅ Update password after login
- ✅ Browse all registered stores
- ✅ Search stores by name and address
- ✅ View store details with overall ratings
- ✅ Submit and modify ratings (1-5 scale)
- ✅ View their own rating history

### 🏪 Store Owner
- ✅ Login functionality
- ✅ Update password
- ✅ Dashboard with store performance metrics
- ✅ View users who rated their stores
- ✅ View average rating for their stores
- ✅ Detailed analytics and insights

## 🛠️ Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt, helmet, CORS
- **Validation**: express-validator
- **Environment**: dotenv configuration

### Frontend
- **Framework**: React.js (v18)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS with responsive design
- **State Management**: React Context API

### Database Design
- **Users Table**: Role-based user management
- **Stores Table**: Store information with owner relationships
- **Ratings Table**: One rating per user per store constraint
- **Optimized Indexes**: For performance
- **Data Integrity**: Proper constraints and foreign keys

## 📁 Project Structure

```
fullstack-task/
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── usersController.js
│   │   │   ├── storesController.js
│   │   │   ├── ratingsController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/        # Auth & validation middleware
│   │   ├── routes/           # API route definitions
│   │   ├── utils/            # Helper functions & validation
│   │   └── app.js            # Main application file
│   ├── database_schema.sql   # Complete database schema
│   ├── package.json
│   ├── .env                  # Environment configuration
│   └── README.md
│
├── frontend/                  # React.js Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API integration
│   │   ├── utils/           # Helper functions & context
│   │   ├── App.js           # Main React app
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Complete styling system
│   └── package.json
│
├── REQUIREMENTS.md           # Original requirements
└── README.md                # This file
```

## ✅ Requirements Compliance

### Form Validations ✅
- **Name**: 20-60 characters ✅
- **Address**: Max 400 characters ✅
- **Password**: 8-16 chars, 1 uppercase, 1 special character ✅
- **Email**: Standard email validation ✅

### Technical Requirements ✅
- **Backend**: Express.js ✅
- **Database**: PostgreSQL ✅
- **Frontend**: React.js ✅
- **Authentication**: Single login system ✅
- **Role-based Access**: Three distinct user roles ✅
- **Sorting**: All tables support sorting ✅
- **Best Practices**: Followed for both frontend and backend ✅

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### 1. Database Setup
```bash
# Create database
createdb store_rating_db

# Run schema
psql -U postgres -d store_rating_db -f backend/database_schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install

# Update .env file with your database credentials
# Start server
npm run dev
```
Server runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
App runs at: `http://localhost:3000`

## 🔐 Demo Accounts

Use these pre-created accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@storerating.com | Admin123! |
| **Store Owner** | john@beststore.com | Admin123! |
| **Store Owner** | jane@supermarket.com | Admin123! |
| **User** | alice@customer.com | Admin123! |
| **User** | bob@customer.com | Admin123! |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/change-password` - Change password

### Admin Features
- `GET /api/users` - Manage users
- `GET /api/stores` - Manage stores
- `GET /api/dashboard/admin` - Admin analytics

### User Features
- `GET /api/stores` - Browse stores
- `POST /api/ratings` - Submit ratings
- `GET /api/ratings/my-ratings` - View my ratings

### Store Owner Features
- `GET /api/stores/my-stores` - My stores
- `GET /api/dashboard/store-owner` - Store analytics

## 🔍 Key Features Implemented

### Advanced Analytics Dashboard
- Real-time statistics and metrics
- User activity insights
- Rating distribution analysis
- Top-performing stores
- Monthly trends and patterns

### Comprehensive Search & Filtering
- Search stores by name and address
- Filter users by role, name, email
- Sort all listings (ascending/descending)
- Pagination support for large datasets

### Robust Security
- JWT token-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- SQL injection prevention

### User Experience
- Responsive design for all devices
- Intuitive navigation
- Real-time form validation
- Loading states and error handling
- Clean and modern UI

## 🎯 Business Logic

### Rating System
- One rating per user per store
- 1-5 scale rating system
- Users can update their ratings
- Automatic average calculation
- Rating history tracking

### Store Management
- Store owners automatically assigned
- Admin can create stores for any user
- Store statistics and analytics
- Customer feedback overview

### User Management
- Three distinct role types
- Admin can manage all users
- Profile management for all users
- Password change functionality

## 🚦 Testing

The application includes:
- Input validation testing
- Role-based access testing
- Database constraint testing
- API endpoint testing
- Authentication flow testing

## 📈 Performance Features

- Database indexing for optimal queries
- Pagination for large datasets
- Efficient SQL queries
- Connection pooling
- Request caching strategies

## 🛡️ Security Features

- JWT authentication
- Password hashing
- Input validation
- SQL injection protection
- XSS protection
- CORS configuration
- Helmet security headers

## 🎨 UI/UX Features

- Responsive design
- Clean and modern interface
- Intuitive navigation
- Form validation feedback
- Loading states
- Error handling
- Mobile-friendly design

---

## 📞 Support

This application was built according to the FullStack Intern Coding Challenge requirements. All specified features have been implemented with additional enhancements for better user experience and security.

### Features Beyond Requirements:
- Enhanced analytics and insights
- Advanced search and filtering
- Responsive mobile design
- Comprehensive error handling
- API documentation
- Database optimization
- Security enhancements

**Total Development Time**: Complete fullstack application
**Code Quality**: Production-ready with best practices
**Documentation**: Comprehensive setup and usage guides
