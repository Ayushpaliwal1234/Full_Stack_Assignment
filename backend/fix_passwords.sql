-- Fix Password Hashes for Store Rating System
-- Run this SQL in pgAdmin Query Tool to fix login issues

-- Update all users with correct password hash for 'Admin123!'
UPDATE users SET password = '$2a$10$z/onhwW7/ng8yCVejHY5WuD2PTSnl8xV844T9l9h/3skQn/O3r2hK' WHERE email = 'admin@storerating.com';
UPDATE users SET password = '$2a$10$OjCZCOnhPe67wbBp44TS4.Sk/dDBLj0CANyRa3.8hyoKDbeZ14X0O' WHERE email = 'john@beststore.com';
UPDATE users SET password = '$2a$10$PEE5RTf/0vFlikPEoib4pOJfZwsZzjiIxygg0uO1VllUlVcGGmmeO' WHERE email = 'jane@supermarket.com';
UPDATE users SET password = '$2a$10$EbG/EpB04hOVvBzDxE65KOg8mLhRhfsl9VedDIL/mEiZz.F4yx7qa' WHERE email = 'alice@customer.com';
UPDATE users SET password = '$2a$10$xp2S2gRiEgyN1z.atrWdPOwKP9rv/sqZ5EZCk2HGnvY2jiZ89yfE.' WHERE email = 'bob@customer.com';

-- Verify updates
SELECT email, role, 
       CASE 
         WHEN password = '$2a$10$z/onhwW7/ng8yCVejHY5WuD2PTSnl8xV844T9l9h/3skQn/O3r2hK' THEN 'ADMIN HASH CORRECT'
         WHEN password = '$2a$10$OjCZCOnhPe67wbBp44TS4.Sk/dDBLj0CANyRa3.8hyoKDbeZ14X0O' THEN 'JOHN HASH CORRECT'
         WHEN password = '$2a$10$PEE5RTf/0vFlikPEoib4pOJfZwsZzjiIxygg0uO1VllUlVcGGmmeO' THEN 'JANE HASH CORRECT'
         WHEN password = '$2a$10$EbG/EpB04hOVvBzDxE65KOg8mLhRhfsl9VedDIL/mEiZz.F4yx7qa' THEN 'ALICE HASH CORRECT'
         WHEN password = '$2a$10$xp2S2gRiEgyN1z.atrWdPOwKP9rv/sqZ5EZCk2HGnvY2jiZ89yfE.' THEN 'BOB HASH CORRECT'
         ELSE 'HASH INCORRECT'
       END as password_status
FROM users 
ORDER BY role, email;
