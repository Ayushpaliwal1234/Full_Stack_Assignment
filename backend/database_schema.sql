-- Database: store_rating_db
-- Create the database first: CREATE DATABASE store_rating_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
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

-- Stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL CHECK (length(address) <= 400),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id) -- One rating per user per store
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_owner_id ON stores(owner_id);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_store_id ON ratings(store_id);
CREATE INDEX idx_ratings_rating ON ratings(rating);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion
-- Default admin user (password: Admin123!)
INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator User', 'admin@storerating.com', '$2a$10$z/onhwW7/ng8yCVejHY5WuD2PTSnl8xV844T9l9h/3skQn/O3r2hK', '123 Admin Street, Admin City', 'admin');

-- Sample store owners
INSERT INTO users (name, email, password, address, role) VALUES 
('John Store Owner Smith', 'john@beststore.com', '$2a$10$OjCZCOnhPe67wbBp44TS4.Sk/dDBLj0CANyRa3.8hyoKDbeZ14X0O', '456 Business Ave, Commerce City', 'store_owner'),
('Jane Store Manager Wilson', 'jane@supermarket.com', '$2a$10$PEE5RTf/0vFlikPEoib4pOJfZwsZzjiIxygg0uO1VllUlVcGGmmeO', '789 Market Street, Trade Town', 'store_owner');

-- Sample stores
INSERT INTO stores (name, email, address, owner_id) VALUES 
('Best Electronics Store', 'contact@beststore.com', '456 Business Ave, Commerce City', (SELECT id FROM users WHERE email = 'john@beststore.com')),
('Super Grocery Market', 'info@supermarket.com', '789 Market Street, Trade Town', (SELECT id FROM users WHERE email = 'jane@supermarket.com'));

-- Sample normal users
INSERT INTO users (name, email, password, address, role) VALUES 
('Alice Customer Johnson', 'alice@customer.com', '$2a$10$EbG/EpB04hOVvBzDxE65KOg8mLhRhfsl9VedDIL/mEiZz.F4yx7qa', '321 Customer Lane, Buyer City', 'user'),
('Bob Regular Customer', 'bob@customer.com', '$2a$10$xp2S2gRiEgyN1z.atrWdPOwKP9rv/sqZ5EZCk2HGnvY2jiZ89yfE.', '654 User Street, Client Town', 'user');

-- Sample ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES 
((SELECT id FROM users WHERE email = 'alice@customer.com'), (SELECT id FROM stores WHERE name = 'Best Electronics Store'), 5),
((SELECT id FROM users WHERE email = 'alice@customer.com'), (SELECT id FROM stores WHERE name = 'Super Grocery Market'), 4),
((SELECT id FROM users WHERE email = 'bob@customer.com'), (SELECT id FROM stores WHERE name = 'Best Electronics Store'), 4);

-- View for store ratings summary
CREATE VIEW store_ratings_summary AS
SELECT 
    s.id,
    s.name,
    s.email,
    s.address,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(r.id) as total_ratings
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, s.name, s.email, s.address;
