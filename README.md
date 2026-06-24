<div align="center">
  <br />
    <h1 align="center">Product Browser API</h1>
<br />

<div>

</div>

</div>



A backend application built with Node.js, Express, PostgreSQL (Neon), and React that allows users to browse a large product catalog (~200,000 products), filter by category, and paginate efficiently while maintaining consistency even when data changes during browsing.

## 🎯 Live Demo
Live Application URL: https://resume-screener-ashy.vercel.app/

##  Features

- Browse 200,000+ products
- Filter products by category
- Cursor-based pagination for high performance
- Snapshot-based consistency to prevent duplicates and missed products
- PostgreSQL indexing for efficient querying
- Bulk data generation and seeding
- React + Vite frontend for product browsing

## Tech Stack
- Backend
  - Node.js
  -  Express.js
  - PostgreSQL (Neon)

- Frontend
  - React
  - Vite
  - Tailwind CSS
  - Axios

## Database Schema
```
CREATE TABLE products ( 
    id BIGSERIAL PRIMARY KEY, 
    name TEXT NOT NULL, 
    category TEXT NOT NULL, 
    price DECIMAL(10,2) NOT NULL, 
    created_at TIMESTAMP NOT NULL, 
    updated_at TIMESTAMP NOT NULL 
    );
```

## Indexes
```
CREATE INDEX idx_products_updated_id 
ON products(updated_at DESC, id DESC); 

CREATE INDEX idx_products_category_updated_id 
ON products(category, updated_at DESC, id DESC);
```

These indexes allow PostgreSQL to efficiently execute pagination and filtered queries without scanning large portions of the table.

## Seeding Data

The database is populated with 200,000 products using PostgreSQL's generate_series() function.

This approach was chosen instead of inserting rows one-by-one from Node.js because it minimizes network overhead and leverages PostgreSQL's optimized data generation capabilities.

code
```
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
```

Run:
```
node seed.js
```

## Pagination Strategy

- Why Not Offset Pagination?

Traditional pagination using:
```
LIMIT 20 OFFSET 10000
```

becomes slower as offsets grow because PostgreSQL must skip an increasing number of rows.

It can also produce duplicates or missing records when new products are inserted or updated while a user is browsing.

## Cursor Pagination

Products are ordered by:
```
ORDER BY updated_at DESC, id DESC
```

Each response returns a cursor containing:
```
{
  "updated_at": "...",
  "id": 123
}
```

The next request retrieves records after that cursor:
```
WHERE (updated_at, id) < ($1, $2)
```
This allows PostgreSQL to use the composite index efficiently and maintain constant query performance regardless of dataset size.

**Consistency While Data Changes**

A snapshot timestamp is generated on the first request:
```
{
  "snapshot": "2026-06-24T10:00:00.000Z"
}
```
All subsequent requests include the same snapshot.

Queries apply:
```
WHERE updated_at <= snapshot
```
This ensures:

- No duplicate products
- No missed products
- Consistent browsing experience

even if products are inserted or updated while the user is paging through results.



## ⚙️ Running the Project

### Backend

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
     https://github.com/Amit-yadav099/Resume-Screener.git
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
   
    **Create .env file in the backend directory :**
    ```bash
    PORT=5000
    DATABASE_URL=mongodb://localhost:27017/contact_manager
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend   
    npm install

4.  **Run the Application:**
    
    Start the backend Server
   
    ```bash
    cd backend
    npm run dev
    # Server runs on http://localhost:5000
    ```
    Start the frontend Server
    ```bash
    cd frontend
    npm run dev
    # App runs on http://localhost:5173
    ```

## Future Improvements
- Infinite scrolling
- Full-text product search
- Redis caching
- Price range filtering
- Category aggregation endpoint
- Automated tests
- Docker deployment


Built using Node.js, Express, PostgreSQL (Neon), React, and Tailwind CSS.