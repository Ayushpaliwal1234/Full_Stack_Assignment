# 🗄️ PostgreSQL Database Setup Guide - Windows

## Step 1: Install PostgreSQL

### Option A: Download from Official Website (Recommended)
1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Choose the latest version (15.x or 16.x)
4. Download the Windows x86-64 installer
5. Run the installer as administrator

### Option B: Using Chocolatey (if you have it)
```powershell
choco install postgresql
```

### Option C: Using Winget (Windows Package Manager)
```powershell
winget install PostgreSQL.PostgreSQL
```

## Step 2: Installation Process

During installation:
1. **Installation Directory**: Keep default (`C:\Program Files\PostgreSQL\15\`)
2. **Components**: Select all (PostgreSQL Server, pgAdmin, Command Line Tools)
3. **Data Directory**: Keep default
4. **Password**: Set password as `postgres` (or remember what you set)
5. **Port**: Keep default `5432`
6. **Locale**: Keep default

## Step 3: Verify PostgreSQL Installation

Open Command Prompt or PowerShell as Administrator and test:

```cmd
# Check if PostgreSQL service is running
sc query postgresql-x64-15

# Test connection
psql -U postgres -h localhost
```

If it asks for password, enter `postgres` (or whatever you set during installation).

## Step 4: Create the Database

### Method 1: Using Command Line
```cmd
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE store_rating_db;

# Exit
\q
```

### Method 2: Using pgAdmin (GUI)
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to local server (password: `postgres`)
3. Right-click "Databases" → Create → Database
4. Name: `store_rating_db`
5. Click Save

## Step 5: Run Database Schema

Navigate to your project folder and run:

```cmd
cd C:\Users\Ayush\Downloads\fullstack-task

# Run the database schema
psql -U postgres -h localhost -d store_rating_db -f backend/database_schema.sql
```

## Step 6: Verify Database Setup

```cmd
# Connect to your database
psql -U postgres -h localhost -d store_rating_db

# List tables
\dt

# Check sample data
SELECT * FROM users;
SELECT * FROM stores;
SELECT * FROM ratings;

# Exit
\q
```

You should see:
- 5 users (1 admin, 2 store owners, 2 regular users)
- 2 stores
- 3 ratings

## Step 7: Update Environment Configuration

Your `.env` file has been updated with these settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=postgres
```

**If you used a different password during installation:**
1. Open `backend\.env`
2. Change `DB_PASSWORD=postgres` to your actual password

## Step 8: Test Backend Connection

```cmd
cd backend
npm install
npm run dev
```

You should see:
```
🚀 Store Rating System API Server Started
===============================================
Environment: development
Server: http://localhost:5000
Health Check: http://localhost:5000/health
API Documentation: http://localhost:5000/
===============================================
Connected to PostgreSQL database
```

## 🚨 Troubleshooting

### Issue: "psql is not recognized"
**Solution**: Add PostgreSQL to your PATH
1. Open System Properties → Advanced → Environment Variables
2. Add to PATH: `C:\Program Files\PostgreSQL\15\bin`
3. Restart Command Prompt

### Issue: "Connection refused"
**Solution**: Start PostgreSQL service
```cmd
# Start service
net start postgresql-x64-15

# Or check services.msc and start "postgresql-x64-15"
```

### Issue: "Password authentication failed"
**Solution**: Reset PostgreSQL password
1. Find `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\15\data\`)
2. Change `md5` to `trust` temporarily
3. Restart PostgreSQL service
4. Connect and change password:
   ```sql
   ALTER USER postgres PASSWORD 'postgres';
   ```
5. Revert `pg_hba.conf` back to `md5`

### Issue: Database creation fails
**Solution**: Connect as superuser first
```cmd
# Connect as postgres user
psql -U postgres -h localhost

# Then create database
CREATE DATABASE store_rating_db;
```

## 🔧 Alternative: Using Docker (Optional)

If you prefer Docker:

```cmd
# Run PostgreSQL in Docker
docker run --name postgres-store-rating -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=store_rating_db -p 5432:5432 -d postgres:15

# Run schema
docker exec -i postgres-store-rating psql -U postgres -d store_rating_db < backend/database_schema.sql
```

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `store_rating_db` created
- [ ] Schema tables created (users, stores, ratings)
- [ ] Sample data inserted
- [ ] Backend connects successfully
- [ ] Health check endpoint works: http://localhost:5000/health

## 🎯 Quick Test

1. Start backend: `npm run dev` (from backend folder)
2. Open browser: http://localhost:5000/health
3. Should show: `{"status":"OK","database":"Connected"}`

## 🔐 Default Test Accounts

After setup, you can login with:
- **Admin**: `admin@storerating.com` / `Admin123!`
- **Store Owner**: `john@beststore.com` / `Admin123!`
- **User**: `alice@customer.com` / `Admin123!`

---

## 💡 Next Steps

Once database is set up:
1. Test backend API endpoints
2. Start frontend development
3. Test complete application flow

Need help? Check the logs in the backend console for any database connection errors!
