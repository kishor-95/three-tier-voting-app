-- -- Create database (safe if it already exists)
-- CREATE DATABASE IF NOT EXISTS voting_app;

-- -- Use the database
-- USE voting_app;

-- -- Create votes table
-- CREATE TABLE IF NOT EXISTS votes (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   option_name VARCHAR(50) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


CREATE DATABASE IF NOT EXISTS voting_app;
USE voting_app;

CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  option_id CHAR(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
