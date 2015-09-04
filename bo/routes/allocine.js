var express = require('express');
var router = express.Router();
var allocine = require('allocine-api');


/*
 * GET
 */
router.get('/', function (req, res) {
  var type = req.query.type === 'Film' ? 'movie' : 'tvseries';
  allocine.api('search', {
    q: req.query.title,
    filter: type,
    count: 200
  }, function (error, results) {
    if (error) {
      console.log('Error : ' + error);
      return;
    }

    var datas = results.feed.movie || results.feed.tvseries;
    res.json(datas);
  });
});

/*
 * GET
 */
router.get('/movie/:id', function (req, res) {
  allocine.api('movie', {
    code: req.params.id
  }, function (error, result) {
    if (error) {
      console.log('Error : ' + error);
      return;
    }

    res.json(result);
  });
});

router.get('/serie/:id', function (req, res) {
  allocine.api('tvseries', {
    code: req.params.id
  }, function (error, result) {
    if (error) {
      console.log('Error : ' + error);
      return;
    }

    res.json(result);
  });
});

module.exports = router;
