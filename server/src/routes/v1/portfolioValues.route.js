const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { portfolioValuesValidation } = require('../../validations');
const { portfolioValuesController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(portfolioValuesValidation.addPortfolioValue), portfolioValuesController.addPortfolioValue)

router
  .route('/:portfolioId')
  .get(auth("getPortfolioValues"), validate(portfolioValuesValidation.getPortfolioValues), portfolioValuesController.getPortfolioValues)

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Portfolio Values
 *   description: Portfolio Value management and retrieval
 */

/**
 * @swagger
 * /values:
 *   post:
 *     summary: Add a portfolio value
 *     description:
 *     tags: [Portfolio Values]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portfolioId
 *               - portfolioValue
 *             properties:
 *               portfolioId:
 *                 type: string
 *               portfolioValue:
 *                 type: number
 *             example:
 *               portfolioId: 61dc6b6d1becfd7338f52cb4
 *               portfolioValue: 150.00
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/PortfolioValue'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Portfolio with this ID does not exist
 */

/**
 * @swagger
 * /values/{id}:
 *   get:
 *     summary: Get all portfolio values for a given portfolio
 *     description: 
 *     tags: [Portfolio Values]
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
 *                $ref: '#/components/schemas/PortfolioValue'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

