/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get public user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile with post count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email:
 *                       type: string
 *                       description: Only visible if user opted in via privacy settings
 *                 postCount:
 *                   type: integer
 *                 commentCount:
 *                   type: integer
 *                   nullable: true
 *                   description: Null if user's comments are private
 *       400:
 *         description: Invalid user ID
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 * /users/{userId}/liked-posts:
 *   get:
 *     summary: Get posts liked by a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated liked posts
 *       403:
 *         description: User's liked posts are private
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
