# FullStack Intern Coding Challenge

## Tech Stack
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Frontend**: React.js

## Requirements
Web application that allows users to submit ratings for stores (1-5 scale).
Single login system with role-based access control.

## User Roles
1. **System Administrator**
2. **Normal User** 
3. **Store Owner**

## Functionalities

### System Administrator
- Add new stores, normal users, and admin users
- Dashboard with analytics:
  - Total users
  - Total stores  
  - Total ratings
- User management with details: Name, Email, Password, Address
- Store listings with: Name, Email, Address, Rating
- User listings with: Name, Email, Address, Role
- Filtering capabilities on all listings
- View detailed user information (including Store Owner ratings)

### Normal User
- Sign up and login
- Signup fields: Name, Email, Address, Password
- Update password
- View all registered stores
- Search stores by Name and Address
- Store listings display: Store Name, Address, Overall Rating, User's Rating, Submit/Modify Rating options
- Submit/modify ratings (1-5)

### Store Owner
- Login functionality
- Update password
- Dashboard features:
  - View users who rated their store
  - View average store rating

## Form Validations
- **Name**: 20-60 characters
- **Address**: Max 400 characters
- **Password**: 8-16 characters, min 1 uppercase, min 1 special character
- **Email**: Standard email validation

## Additional Requirements
- Sorting support (ascending/descending) for key fields
- Follow best practices for frontend and backend
- Proper database schema design
