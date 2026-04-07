/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "JPEG, PNG or WebP image (max 5 MB)"
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/v1234/blog/abc.jpg
 *       400:
 *         description: No file provided or invalid file type/size
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
