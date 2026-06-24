require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Clearing existing data...');

    await client.query(`
      TRUNCATE TABLE products RESTART IDENTITY;
    `);

    console.log('Generating 200,000 products...');

    const start = Date.now();

    await client.query(`
      INSERT INTO products (
        name,
        category,
        price,
        created_at,
        updated_at
      )
      SELECT
        'Product ' || gs,
        (
          ARRAY[
            'Electronics',
            'Books',
            'Clothing',
            'Home',
            'Toys',
            'Sports'
          ]
        )[floor(random() * 6 + 1)],
        ROUND((random() * 1000)::numeric, 2),
        NOW() - (random() * interval '730 days'),
        NOW() - (random() * interval '30 days')
      FROM generate_series(1, 200000) gs;
    `);

    const end = Date.now();

    console.log(`Seeded 200,000 products`);
    console.log(`Time taken: ${((end - start) / 1000).toFixed(2)} seconds`);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}
seed();