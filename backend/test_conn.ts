import pool from './lib/db';

async function test() {
  console.log('Testing connection...');
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected! Server time:', res.rows[0].now);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    process.exit();
  }
}

test();
