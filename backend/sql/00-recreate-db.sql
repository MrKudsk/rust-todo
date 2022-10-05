-- DEV ONLY - Brute Force recreate DB for live dev and unit test
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE username = 'app_user';
DROP DATABASE IF EXISTS app_db;
DROP USER IF EXISTS app_user;

-- DEV ONLY - for quick iteration
CREATE USER app_user PASSWORD 'app_passW0rd!';
CREATE DATABASE app_db OWNER app_user ENCODING = 'UTF-8';


