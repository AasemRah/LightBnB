const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'bootcampx'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return db
    .query(
      `
    SELECT * FROM users
    WHERE email = $1;
  `,
      [email],
      (res) => { //callback function
        if (res) return res.rows[0];
        return null;
      }
    )
    .then((res) => {
      if (res) {
        return res;
      } else {
        return null;
      }
    })
    .catch((err) => console.error("query error", err.stack));
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return db
    .query(
      `
    SELECT * FROM users
    WHERE name = $1;
  `,
      [id],
      res => {
        if (res) return res.rows[0];
        return null;
      }
    )
    .then((res) => {
      if (res) {
        return res;
      } else {
        return null;
      }
    })
    .catch((err) => console.error("query error", err.stack));
  // return Promise.resolve(users[id]);
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return db
    .query(
      `
    INSERT INTO users(name, email, password)
    VALUES($1 ,$2, $3)
    RETURNING *;
  `,
      [user.name, user.email, user.password]
    )
    .then((res) => res.rows)
    .catch((err) => console.error("query error", err.stack));
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return db
    .query(
      `
    SELECT
      properties.id AS id,
      title,
      cost_per_night,
      start_date,
      end_date,
      avg(rating) as rating,
      cover_photo_url,
      thumbnail_photo_url
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON property_reviews.property_id = properties.id
    WHERE end_date < NOW()::DATE AND
      reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    limit $2;
  `,
      [guest_id, limit]
    )
    .then((res) => res.rows)
    .catch((err) => console.error("query error", err.stack));
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
