const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { portfolioValidation } = require('../../validations');
const { portfolioController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('managePortfolios'), validate(portfolioValidation.createPortfolio), portfolioController.createPortfolio)
  .get(auth('getPortfolios'), validate(portfolioValidation.getPortfolios), portfolioController.getPortfolios);

router
  .route('/:portfolioId')
  .get(auth('getPortfolios'), validate(portfolioValidation.getPortfolio), portfolioController.getPortfolio)
  .patch(auth('managePortfolios'), validate(portfolioValidation.updatePortfolio), portfolioController.updatePortfolio)
  .delete(auth('managePortfolios'), validate(portfolioValidation.deletePortfolio), portfolioController.deletePortfolio);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Portfolios
 *   description: Portfolio management and retrieval
 */

/**
 * @swagger
 * /portfolios:
 *   post:
 *     summary: Create a portfolio
 *     description: 
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - portfolioType
 *               - initialFreeCash
 *               - transactionCost
 *             properties:
 *               user:
 *                 type: string
 *               portfolioType:
 *                 type: string
 *               initialFreeCash:
 *                 type: number
 *               transactionCost:
 *                  type: number
 *             example:
 *               user: 619308412ff24d3d28d7fe2b
 *               portfolioType: personal
 *               initialFreeCash: 150.00
 *               transactionCost: 1.50
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Portfolio'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: User with this ID does not exist
 *       "400":
 *         description: Initial Free Cash Value must be valid, positive number 
 *
 *   get:
 *     summary: Get all portfolios
 *     description: Only admins can retrieve all portfolios.
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: user's id
 *       - in: query
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
 *         description: Maximum number of users
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
 *                     $ref: '#/components/schemas/User'
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
 * /portfolios/{id}:
 *   get:
 *     summary: Get a portfolio
 *     description: Logged in users can fetch only their own portfolio. Only admins can fetch other portfolios.
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a portfolio
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: portfolio id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               portfolioType:
 *                 type: string
 *               currPortfolioValue:
 *                 type: number
 *               initialFreeCash:
 *                 type: number
 *               freeCash:
 *                 type: number
 *               transactionCost:
 *                  type: number
 *             example:
 *               user: 619308412ff24d3d28d7fe2b
 *               portfolioType: personal
 *               currPortfolioValue: 500.00
 *               initialFreeCash: 150.00
 *               freeCash: 150.00
 *               transactionCost: 1.50
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Portfolio'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a portfolio
 *     description: Logged in users can delete their own portfolios. Only admins can delete other users.
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio id
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
