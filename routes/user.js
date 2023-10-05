const express = require("express");
const router = express.Router();
const pool = require("../queries.js");
const { signToken } = require('../aunt.js'); 

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operasi terkait pengguna
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         gender:
 *           type: string
 *         role:
 *           type: string
 *     UserInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         gender:
 *           type: string
 *         role:
 *           type: string
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Dapatkan daftar pengguna
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Batasi jumlah pengguna yang akan diambil
 *     responses:
 *       '200':
 *         description: Respon berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '500':
 *         description: Kesalahan Server Internal
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrasi pengguna baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       '201':
 *         description: Registrasi berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       '400':
 *         description: Permintaan tidak valid
 *       '500':
 *         description: Kesalahan Server Internal
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Masuk ke akun pengguna
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       '200':
 *         description: Masuk berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Kesalahan Server Internal
 */

// GET: Mengambil seluruh data user
router.get("/", (request, response) => {
    const limit = request.query.limit;

    let query = 'SELECT * FROM users';

    if (limit) {
        query += ` LIMIT ${parseInt(limit)}`;
    }

    pool.query(query, (error, result) => {
        if (error) {
            console.error('Error querying the database:', error);
            response.status(500).json("Internal Server Error");
        } else {
            response.json(result.rows);
        }
    });
});

// GET: Mengambil data user berdasarkan ID
router.get('/:id', async (request, response) => {
  try {
      const id = request.params.id;
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length > 0) {
          response.json(result.rows[0]);
      } else {
          response.status(404).json("User Not Found");
      }
  } catch (error) {
      console.error('Error querying the database:', error);
      response.status(500).json("Internal Server Error");
  }
});

router.post("/login", (request, response) => {
    const { email, password } = request.body;
    pool.query(`SELECT * FROM users WHERE email = $1`, [email], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return response.status(500).json({ message: "Internal Server Error" });
        }

        if (result.rows.length === 0) {
            console.error('User not found for email:', email);
            return response.status(401).json({ message: "Unauthorized: User not found" });
        }

        // Check password without bcrypt.compare
        const user = result.rows[0];
        if (password !== user.password) {
            console.error('Password mismatch for email:', email);
            return response.status(401).json({ message: 'Unauthorized: Invalid password' });
        }

        const token = signToken({ email: user.email, role: user.role });
        if (!token) {
            console.error('Error generating token for email:', email);
            return response.status(500).json({ message: "Internal Server Error: Token generation failed" });
        }

        response.json({ token: token });
    });
});

router.post("/register", async (request, response) => {
  try {
      const { email, password, gender, role } = request.body;

      // Mengecek apakah email sudah ada
      const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length > 0) {
          return response.status(400).json({ message: "Email already exists" });
      }

      // Menyimpan user baru ke database
      const query = 'INSERT INTO users (email, password, gender, role) VALUES ($1, $2, $3, $4) RETURNING id, email, gender, role';
      const result = await pool.query(query, [email, password, gender, role]);

      // Mengembalikan user yang telah didaftarkan
      response.status(201).json(result.rows[0]);
  } catch (error) {
      console.error('Error querying the database:', error);
      response.status(500).json("Internal Server Error");
  }
});

module.exports = router;
