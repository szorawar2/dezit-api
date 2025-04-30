-- Create the userbase table
CREATE TABLE IF NOT EXISTS userbase (
    id SERIAL PRIMARY KEY,
    username VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(45) NOT NULL
);

-- Create the messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES userbase(id) ON DELETE CASCADE,
    chat_number INT,
    message VARCHAR(3000),
    file_name VARCHAR(1000),
    file_id VARCHAR(1020),
    time_of_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Index to optimize lookups by user
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
