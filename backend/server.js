const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'devops',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'voting_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database');

    // Ensure required tables exist (safe to run multiple times)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(256) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        option_id CHAR(1) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);

    console.log('🔧 Ensured required tables exist');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}

initDB();

// --- Helpers ---

// PBKDF2 Hashing
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, hash, salt) => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// --- Endpoints ---

// Health Check
app.get('/health', async (req, res) => {
  const dbStatus = pool ? 'connected' : 'disconnected';
  res.json({ status: 'healthy', service: 'backend', db: dbStatus });
});

// AUTH: Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  if (!pool) return res.status(503).json({ error: 'Database unavailable' });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(409).json({ error: 'Username taken' });

    const { salt, hash } = hashPassword(password);
    await pool.execute(
      'INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)', 
      [username, hash, salt]
    );
    
    res.json({ success: true, message: 'User created' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// AUTH: Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!pool) return res.status(503).json({ error: 'Database unavailable' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    if (!verifyPassword(password, user.password_hash, user.salt)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Returning static token for frontend compatibility (stateless/no-auth)
    res.json({ token: 'auth_disabled', username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Aggregated Votes (Public)
app.get('/api/votes', async (req, res) => {
  const defaultVotes = { a: 0, b: 0 };
  
  if (!pool) return res.json(defaultVotes);

  try {
    const [rows] = await pool.query(
      'SELECT option_id, COUNT(*) as count FROM votes GROUP BY option_id'
    );
    
    const results = { ...defaultVotes };
    rows.forEach(row => {
      if (Object.prototype.hasOwnProperty.call(results, row.option_id)) {                // (results.hasOwnProperty(row.option_id)) original
        results[row.option_id] = parseInt(row.count);
      }
    });
    
    res.json(results);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Cast Vote (Open)
app.post('/api/vote', async (req, res) => {
  const { option } = req.body;
  if (!['a', 'b'].includes(option)) {
    return res.status(400).json({ error: 'Invalid option' });
  }

  if (!pool) return res.status(503).json({ error: 'Database unavailable' });

  try {
    await pool.execute('INSERT INTO votes (option_id) VALUES (?)', [option]);
    res.json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset (Open)
app.post('/api/reset', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database unavailable' });
  try {
    // Using DELETE instead of TRUNCATE for better compatibility with standard user permissions
    const [result] = await pool.query('DELETE FROM votes');
    console.log(`🧹 Database reset: ${result.affectedRows} votes removed`);
    res.json({ success: true, deletedCount: result.affectedRows });
  } catch (error) {
    console.error('❌ Reset failed:', error);
    res.status(500).json({ error: 'Database reset operation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});