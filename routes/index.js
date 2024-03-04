/**
 * @swagger
 * components:
 *   schemas:
 *     SampleObject:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get the home page
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           text/html:
 *             example: Home Page
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
