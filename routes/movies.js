const express = require("express");
const router = express.Router();
const pool = require("../queries.js");
const authMiddleware = require('../middleware.js');

// movies.js
/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Operasi terkait film
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         year:
 *           type: integer
 *     MovieInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         year:
 *           type: integer
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Dapatkan daftar film
 *     tags: [Movies]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Batasi jumlah film yang akan diambil
 *     responses:
 *       '200':
 *         description: Respon berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Dapatkan film berdasarkan ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID film
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Respon berhasil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       '404':
 *         description: Film tidak ditemukan
 */

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Tambahkan film baru
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieInput'
 *     responses:
 *       '201':
 *         description: Film berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       '500':
 *         description: Kesalahan Server Internal
 */

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Perbarui film berdasarkan ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID film
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieInput'
 *     responses:
 *       '200':
 *         description: Film berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       '404':
 *         description: Film tidak ditemukan
 *       '500':
 *         description: Kesalahan Server Internal
 */

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Hapus film berdasarkan ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID film
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Film berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       '404':
 *         description: Film tidak ditemukan
 *       '500':
 *         description: Kesalahan Server Internal
 */

// GET dengan autentikasi token untuk menampilkan daftar film
router.get("/list/:token", authMiddleware, (request, response) => {
    const limit = request.query.limit;
    let query = 'SELECT * FROM movies';

    if (limit) {
        query += ` LIMIT ${parseInt(limit)}`; // Menambahkan LIMIT jika limit diberikan
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

// GET untuk menampilkan data film berdasarkan ID
router.get('/:id', async (request, response) => {
    try {
        const id = request.params.id;
        const query = 'SELECT * FROM movies WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length > 0) {
            response.json(result.rows[0]);
        } else {
            response.status(404).json("Not Found");
        }
    } catch (error) {
        console.error('Error querying the database:', error);
        response.status(500).json("Internal Server Error");
    }
});

// POST: Menambahkan data film baru
router.post('/', async (request, response) => {
    try {
        const { title, genres, year } = request.body;
        const query = 'INSERT INTO movies (title, genres, year) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [title, genres, year]);
        response.status(201).json({ message: 'Data berhasil dimasukkan ke dalam database', insertedData: result.rows[0] });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: error.message });
    }
});

// PUT: Memperbarui data film berdasarkan ID
router.put('/:id', async (request, response) => {
    try {
        const id = request.params.id;
        const { title, genres, year } = request.body;
        const query = 'UPDATE movies SET title = $1, genres = $2, year = $3 WHERE id = $4 RETURNING *';
        const result = await pool.query(query, [title, genres, year, id]);

        if (result.rows.length > 0) {
            response.json(result.rows[0]);
        } else {
            response.status(404).json("Not Found");
        }
    } catch (error) {
        console.error('Error querying the database:', error);
        response.status(500).json("Internal Server Error");
    }
});

// DELETE: Menghapus data film berdasarkan ID
router.delete('/:id', async (request, response) => {
    try {
        const id = request.params.id;
        const query = 'DELETE FROM movies WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rows.length > 0) {
            response.json({ message: 'Film berhasil dihapus', deletedFilm: result.rows[0] });
        } else {
            response.status(404).json("Not Found");
        }
    } catch (error) {
        console.error('Error querying the database:', error);
        response.status(500).json("Internal Server Error");
    }
});

module.exports = router;