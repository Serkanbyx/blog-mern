/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Toggle like on a post (registered users)
 *     tags: [Likes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalLikes:
 *                   type: integer
 *                 isLiked:
 *                   type: boolean
 *       403:
 *         description: Only published posts can be liked
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /posts/{id}/guest-like:
 *   post:
 *     summary: Toggle like on a post (guest users via fingerprint)
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fingerprint]
 *             properties:
 *               fingerprint:
 *                 type: string
 *                 description: UUID v4 browser fingerprint
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Guest like toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalLikes:
 *                   type: integer
 *                 isLiked:
 *                   type: boolean
 *       400:
 *         description: Invalid fingerprint format
 *   get:
 *     summary: Check if a guest has liked a post
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: fingerprint
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isLiked:
 *                   type: boolean
 */
