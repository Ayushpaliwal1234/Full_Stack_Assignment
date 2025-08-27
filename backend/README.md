# Store Rating System - Backend API

A comprehensive RESTful API for a store rating system built with Node.js, Express.js, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin can manage users with different roles
- **Store Management**: CRUD operations for stores
- **Rating System**: Users can rate stores (1-5 scale)
- **Dashboard Analytics**: Statistics and insights for different user roles
- **Data Validation**: Comprehensive input validation and sanitization
- **Security**: Helmet, CORS, bcrypt password hashing
- **Error Handling**: Comprehensive error handling and logging

## User Roles

1. **System Administrator**: Manage users, stores, view analytics
2. **Store Owner**: Manage their stores, view ratings received
3. **Normal User**: Browse stores, submit ratings

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors
- **Environment**: dotenv

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database named `store_rating_db`
2. Run the database schema:

```bash
psql -U postgres -d store_rating_db -f database_schema.sql
```

### 3. Environment Configuration

Update the `.env` file with your database credentials:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=your_database_password

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin Only)
- `GET /api/users` - Get all users with filtering
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Stores
- `GET /api/stores` - Get all stores with filtering
- `POST /api/stores` - Create store (admin only)
- `GET /api/stores/:id` - Get store by ID
- `PUT /api/stores/:id` - Update store (admin/owner)
- `DELETE /api/stores/:id` - Delete store (admin only)
- `GET /api/stores/my-stores` - Get owner's stores

### Ratings
- `POST /api/ratings` - Submit rating
- `PUT /api/ratings` - Update rating
- `GET /api/ratings/my-ratings` - Get user's ratings
- `GET /api/ratings/store/:storeId` - Get store ratings
- `DELETE /api/ratings/store/:storeId` - Delete rating
- `GET /api/ratings/all` - Get all ratings (admin only)

### Dashboard
- `GET /api/dashboard/admin` - Admin statistics
- `GET /api/dashboard/store-owner` - Store owner statistics
- `GET /api/dashboard/user` - User statistics
- `GET /api/dashboard/store/:storeId` - Store-specific statistics

### Utility
- `GET /health` - Health check endpoint
- `GET /` - API documentation

## Default Test Accounts

The database schema includes sample users:

- **Admin**: `admin@storerating.com` / `Admin123!`
- **Store Owner**: `john@beststore.com` / `Admin123!`
- **Store Owner**: `jane@supermarket.com` / `Admin123!`
- **User**: `alice@customer.com` / `Admin123!`
- **User**: `bob@customer.com` / `Admin123!`

## Validation Rules

### User Registration/Creation
- **Name**: 20-60 characters
- **Email**: Valid email format
- **Password**: 8-16 characters, at least 1 uppercase, 1 special character
- **Address**: Max 400 characters

### Store Creation
- **Name**: Required, max 100 characters
- **Email**: Valid email format
- **Address**: Required, max 400 characters

### Rating Submission
- **Rating**: Integer between 1-5
- **Store ID**: Valid UUID

## Error Handling

The API includes comprehensive error handling for:
- Database connection errors
- JWT authentication errors
- Validation errors
- PostgreSQL constraint violations
- 404 routes
- 500 internal server errors

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: express-validator for all inputs
- **CORS Protection**: Configured for frontend domain
- **Helmet**: Security headers
- **Rate Limiting**: Built-in Express rate limiting

## Database Schema

- **Users**: UUID primary key, role-based access
- **Stores**: Linked to store owners
- **Ratings**: One rating per user per store
- **Indexes**: Optimized for common queries
- **Constraints**: Data integrity enforcement

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
src/
├── config/         # Database configuration
├── controllers/    # Request handlers
├── middleware/     # Authentication & validation
├── routes/         # API route definitions
├── utils/          # Helper functions
└── app.js          # Main application file
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper database credentials
4. Set up SSL/TLS
5. Use a process manager (PM2)
6. Configure reverse proxy (nginx)

## Support

For issues or questions, please check the API documentation at `http://localhost:5000/` when the server is running.
