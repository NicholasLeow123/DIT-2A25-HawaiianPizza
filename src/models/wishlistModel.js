const pool = require("../db/db"); // adjust to your DB file path

exports.addToWishlist = async (sessionId, carId) => {
  const query = `
    INSERT INTO wishlist (session_id, car_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [sessionId, carId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

exports.removeFromWishlist = async (sessionId, carId) => {
  const query = `
    DELETE FROM wishlist
    WHERE session_id = $1 AND car_id = $2
    RETURNING *;
  `;
  const values = [sessionId, carId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

exports.getWishlist = async (sessionId) => {
  const query = `
    SELECT w.*, c.name, c.type, c.price_display
    FROM wishlist w
    JOIN cars c ON c.id = w.car_id
    WHERE w.session_id = $1
    ORDER BY w.created_at DESC;
  `;
  const values = [sessionId];
  const { rows } = await pool.query(query, values);
  return rows;
};
