var express = require('express');
var router = express.Router();
var controller = require('../controllers/movieController.js');
var multer = require('multer')
var upload = multer({
  dest: 'uploads/'
})

/*
 * GET
 */
router.get('/', function (req, res) {
  controller.list(req, res);
});
/*
 * GET
 */
router.get('/genre', function (req, res) {
  controller.getGenres(req, res);
});

/*
 * GET
 */
router.get('/type', function (req, res) {
  res.json(['Film', 'Série']);
});

/*
 * GET
 */
router.get('/:id', function (req, res) {
  controller.show(req, res);
});

/*
 * POST
 */
router.post('/', function (req, res) {
  controller.create(req, res);
});

/*
 * POST
 */
router.post('/:id/upload', upload.single('file'), function (req, res) {
  controller.update(req, res);
});

/*
 * PUT
 */
router.put('/:id', function (req, res) {
  controller.update(req, res);
});

/*
 * DELETE
 */
router.delete('/:id', function (req, res) {
  controller.remove(req, res);
});

module.exports = router;
