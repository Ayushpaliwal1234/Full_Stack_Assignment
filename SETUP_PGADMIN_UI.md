# 🖥️ PostgreSQL Setup Using pgAdmin 4 UI

## Step 1: Open pgAdmin 4

1. **Find pgAdmin 4**: Search for "pgAdmin 4" in Windows Start Menu
2. **Launch**: Click to open pgAdmin 4
3. **Wait**: It will open in your web browser (usually at http://localhost:xxxx)
4. **First Time Setup**: You might be asked to set a master password - choose something simple like `admin`

## Step 2: Connect to PostgreSQL Server

1. **Left Panel**: You should see "Servers" in the tree view
2. **Expand Servers**: Click the arrow next to "Servers"
3. **Find PostgreSQL**: You should see "PostgreSQL 15" or similar
4. **Connect**: Double-click on "PostgreSQL 15" (or right-click → Connect Server)
5. **Enter Password**: Enter the password you set during PostgreSQL installation (likely `postgres`)

![pgAdmin Connection](https://i.imgur.com/connection-example.png)

## Step 3: Create the Database

1. **Right-click on "Databases"**: In the left tree under PostgreSQL server
2. **Select "Create" → "Database..."**
3. **Database Name**: Enter `store_rating_db`
4. **Owner**: Keep as `postgres`
5. **Click "Save"**

![Create Database](https://i.imgur.com/create-db-example.png)

## Step 4: Import Database Schema

### Method 1: Using Query Tool (Recommended)

1. **Find Your Database**: In left tree, expand "Databases" → find "store_rating_db"
2. **Right-click** on `store_rating_db`
3. **Select "Query Tool"**
4. **Open SQL File**:
   - Click the folder icon in the Query Tool toolbar
   - Navigate to: `C:\Users\Ayush\Downloads\fullstack-task\backend\database_schema.sql`
   - Click "Open"
5. **Execute**: Click the "Execute" button (▶️ play icon) or press F5
6. **Wait**: You should see "Query returned successfully" at the bottom

### Method 2: Using Restore (Alternative)

1. **Right-click** on `store_rating_db`
2. **Select "Restore..."**
3. **Choose File**: Select your `database_schema.sql` file
4. **Click "Restore"**

## Step 5: Verify Database Creation

1. **Refresh Database**: Right-click on `store_rating_db` → "Refresh"
2. **Expand Database**: Click arrow next to `store_rating_db`
3. **Expand "Schemas" → "public" → "Tables"**
4. **You should see**:
   - `users` table
   - `stores` table
   - `ratings` table

![Tables Created](https://i.imgur.com/tables-example.png)

## Step 6: Check Sample Data

1. **Right-click on `users` table** → "View/Edit Data" → "All Rows"
2. **You should see 5 users**:
   - 1 admin: `admin@storerating.com`
   - 2 store owners: `john@beststore.com`, `jane@supermarket.com`
   - 2 regular users: `alice@customer.com`, `bob@customer.com`

3. **Check stores table**: Should have 2 stores
4. **Check ratings table**: Should have 3 sample ratings

## Step 7: Test Connection from Backend

Now test if your backend can connect:

```cmd
cd C:\Users\vaida\Downloads\fullstack-task\backend
npm install
npm run dev
```

You should see:
```
🚀 Store Rating System API Server Started
===============================================
Connected to PostgreSQL database
```

## 🚨 Troubleshooting in pgAdmin

### Issue: Can't connect to PostgreSQL server
**Solution**:
1. Check if PostgreSQL service is running:
   - Press `Win + R`, type `services.msc`
   - Look for "postgresql-x64-XX" service
   - If stopped, right-click and "Start"

### Issue: Wrong password
**Solution**:
1. In pgAdmin, right-click PostgreSQL server → "Properties"
2. Go to "Connection" tab
3. Try these common passwords:
   - `postgres`
   - `admin`
   - (empty/blank)
   - The password you remember setting

### Issue: Database creation fails
**Solution**:
1. Make sure you're connected to PostgreSQL server first
2. Try creating with different owner (like your Windows username)

### Issue: SQL file import fails
**Solution**:
1. Copy the contents of `database_schema.sql` manually:
   - Open the file in Notepad
   - Copy all content
   - Paste into Query Tool
   - Execute

## 📄 Manual SQL Commands (If Needed)

If you prefer to run SQL commands manually, open Query Tool and run these one by one:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(60) NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT CHECK (length(address) <= 400),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'store_owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Continue with rest of schema...
```

## ✅ Verification Checklist

- [ ] pgAdmin 4 opened successfully
- [ ] Connected to PostgreSQL server
- [ ] Database `store_rating_db` created
- [ ] SQL schema imported successfully
- [ ] Tables visible: users, stores, ratings
- [ ] Sample data present in tables
- [ ] Backend connects without errors

## 🎯 Next Steps

Once database is set up in pgAdmin:

1. **Test Backend**: `npm run dev` from backend folder
2. **Check Health**: Open http://localhost:5000/health
3. **Test Login**: Try logging in with demo accounts
4. **Start Frontend**: `npm start` from frontend folder

## 🔐 Demo Accounts

After successful setup, test with these accounts:
- **Admin**: `admin@storerating.com` / `Admin123!`
- **Store Owner**: `john@beststore.com` / `Admin123!`
- **User**: `alice@customer.com` / `Admin123!`

---

## 💡 Tips for pgAdmin 4

- **Query Tool**: Best way to run SQL commands
- **Object Explorer**: Left panel shows all database objects
- **Data Grid**: Easy way to view and edit table data
- **Backup/Restore**: For database management
- **Connection Saving**: pgAdmin remembers your connections

Need more help? Let me know which step you're having trouble with!
