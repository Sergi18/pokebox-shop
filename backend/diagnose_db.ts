import pool from './lib/db';

async function diagnose() {
  try {
    const profiles = await pool.query('SELECT count(*) FROM public.profiles');
    const wallets = await pool.query('SELECT count(*) FROM public.wallets');
    const transactions = await pool.query('SELECT count(*) FROM public.transactions');
    
    console.log('--- Database Diagnosis ---');
    console.log(`Profiles: ${profiles.rows[0].count}`);
    console.log(`Wallets: ${wallets.rows[0].count}`);
    console.log(`Transactions: ${transactions.rows[0].count}`);
    
    if (parseInt(profiles.rows[0].count) > 0) {
      const sample = await pool.query('SELECT id, username FROM public.profiles LIMIT 1');
      console.log(`Sample User: ${sample.rows[0].username} (${sample.rows[0].id})`);
      
      const wallet = await pool.query('SELECT * FROM public.wallets WHERE user_id = $1', [sample.rows[0].id]);
      console.log(`Sample Wallet Balance: ${wallet.rows[0]?.balance || 'No wallet found'}`);
    }
  } catch (error) {
    console.error('Diagnosis failed:', error);
  } finally {
    process.exit();
  }
}

diagnose();
