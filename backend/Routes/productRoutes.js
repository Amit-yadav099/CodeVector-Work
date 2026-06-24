const express = require('express');
const router = express.Router();
const pool = require('../db');

// Encode cursor
function encodeCursor(updated_at, id) {
  return Buffer.from(
    JSON.stringify({
      updated_at,
      id,
    })
  ).toString('base64');
}

// Decode cursor
function decodeCursor(cursor) {
  return JSON.parse(
    Buffer.from(cursor, 'base64').toString('utf8')
  );
}

router.get('/products', async (req, res) => {
  try {
    const {
      category,
      cursor,
      snapshot,
      limit = 20,
    } = req.query;

    const parsedLimit = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100
    );

    // First request gets a snapshot timestamp
    const snapshotTime = snapshot || new Date().toISOString();

    const conditions = [];
    const params = [];

    // Freeze dataset
    conditions.push(`updated_at <= $${params.length + 1}`);
    params.push(snapshotTime);

    // Category filter
    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    // Cursor pagination
    if (cursor) {
      const { updated_at, id } = decodeCursor(cursor);

      conditions.push(
        `(updated_at, id) < ($${params.length + 1}, $${params.length + 2})`
      );

      params.push(updated_at, id);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    params.push(parsedLimit);

    const query = `
      SELECT
        id,
        name,
        category,
        price,
        created_at,
        updated_at
      FROM products
      ${whereClause}
      ORDER BY updated_at DESC, id DESC
      LIMIT $${params.length}
    `;

    const result = await pool.query(query, params);

    const products = result.rows;

    let nextCursor = null;

    if (products.length === parsedLimit) {
      const lastProduct = products[products.length - 1];

      nextCursor = encodeCursor(
        lastProduct.updated_at,
        lastProduct.id
      );
    }

    return res.status(200).json({
      products,
      nextCursor,
      snapshot: snapshotTime,
      hasMore: products.length === parsedLimit,
    });
  } catch (error) {
    console.error('Products API Error:', error);

    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});

module.exports = router;