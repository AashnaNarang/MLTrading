const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { tradeValidation } = require('../../validations');
const { tradeController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(tradeValidation.addTrade), tradeController.addTrade)
  .get(auth("trade"), validate(tradeValidation.getTrades), tradeController.getTrades);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Trades
 *   description: Trade management and retrieval
 */

/**
 * @swagger
 * /trades:
 *   post:
 *     summary: Add a trade
 *     description:
 *     tags: [Trades]
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
 *               - price
 *               - action 
 *               - security
 *               - sharesTraded
 *             properties:
 *               portfolio:
 *                 type: string
 *               price:
 *                 type: number
 *               action:
 *                 type: string
 *               security:
 *                 type: string
 *               sharesTraded:
 *                 type: number
 *             example:
 *               portfolio: 61dc6b6d1becfd7338f52cb4
 *               price: 150.00
 *               action: Purchased
 *               security: 61dc6b6d1becfd7338f52cb4
 *               sharesTraded: 4
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Trade'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Portfolio with this ID does not exist
 *
 *   get:
 *     summary: Get all trades for your portfolio
 *     description: 
 *     tags: [Trades]
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
 *         description: Maximum number of trades
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
 *                     $ref: '#/components/schemas/Trade'
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