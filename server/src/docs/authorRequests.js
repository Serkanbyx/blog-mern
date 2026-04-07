/**
 * @swagger
 * /author-requests:
 *   post:
 *     summary: Submit a new author request
 *     tags: [Author Requests]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: I would like to contribute as a blog author...
 *     responses:
 *       201:
 *         description: Author request submitted
 *       400:
 *         description: Already an author or pending request exists
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /author-requests/mine:
 *   get:
 *     summary: Get current user's most recent author request
 *     tags: [Author Requests]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Author request data (or null if none)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AuthorRequest'
 *   delete:
 *     summary: Cancel pending author request
 *     tags: [Author Requests]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Author request cancelled
 *       400:
 *         description: No pending request found
 */
