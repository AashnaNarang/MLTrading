const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { securityValidation } = require('../../validations');
const { securityController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  // no auth for this for now because not sure how the Ml + trade algorithm will look
  .post(auth(), validate(securityValidation.createSecurity), securityController.createSecurity)
  .get(auth('securities'), validate(securityValidation.getSecurities), securityController.getSecurities);

router
  .route('/:securityId')
  .get(auth('security'), validate(securityValidation.getSecurity), securityController.getSecurity)
  .patch(auth('security'), validate(securityValidation.updateSecurity), securityController.updateSecurity)
  .delete(auth('security'), validate(securityValidation.deleteSecurity), securityController.deleteSecurity);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Securities
 *   description: Security management and retrieval
 */

/**
 * @swagger
 * /securities:
 *   post:
 *     summary: Create a security
 *     description:
 *     tags: [Securities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portfolio
 *               - securityName
 *               - securityCode
 *               - avgPrice
 *               - shares
 *             properties:
 *               portfolio:
 *                 type: string
 *               securityName:
 *                 type: string
 *               securityCode:
 *                 type: string
 *               avgPrice:
 *                  type: number
 *               shares:
 *                  type: number
 *             example:
 *               portfolio: 619308412ff24d3d28d7fe2b
 *               securityName: Shopify
 *               securityCode: SHOP
 *               avgPrice: 2568.50
 *               shares: 2
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Security'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Portfolio with this ID does not exist
 *       "400":
 *         description: Initial Free Cash Value must be valid, positive number
 *
 *   get:
 *     summary: Get all securities for your portfolio
 *     description: 
 *     tags: [Securities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: portfolio
 *         schema:
 *           type: string
 *         description: portfolio's id
 *         required: true
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of securities
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Security'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /securities/{id}:
 *   get:
 *     summary: Get a security
 *     description: Logged in users can fetch only their own security.
 *     tags: [Securities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Security id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Security'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a security
 *     description: Logged in users can only update their own information.
 *     tags: [Securities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: security id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               portfolio:
 *                 type: string
 *               securityName:
 *                 type: string
 *               securityCode:
 *                 type: string
 *               avgPrice:
 *                  type: number
 *               shares:
 *                  type: number
 *             example:
 *               portfolio: 619308412ff24d3d28d7fe2b
 *               securityName: Shopify
 *               securityCode: SHOP
 *               avgPrice: 2568.50
 *               shares: 2
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Security'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a security
 *     description: Logged in users can delete their own portfolios. 
 *     tags: [Securities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Security id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

