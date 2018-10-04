var model = require('../models/movieModel.js');
var fs = require("fs");
/**
 * movieController.js
 *
 * @description :: Server-side logic for managing movies.
 */
module.exports = {

  /**
   * movieController.list()
   */
  list: function (req, res) {
    const {title, genres, types, seen, unseen} = req.query;
    let query;

    const titleFilter = title ? {title: {'$regex': title || '', '$options': 'i'}} : {};
    query = model.find({
      ...titleFilter,
    });
    if (seen !== unseen) query = query.and({seen: !!seen});

    if(genres) {
      query = query.and([
        { $or: genres.split(',').map(genre => ({genre})) },
      ])
    }

    if(types) {
      query = query.and([
        { $or: types.split(',').map(type=> ({type})) },
      ])
    }

    query.sort('title season').limit(50).exec(function (err, movies) {
      if (err) {
        return res.json(500, {
          message: 'Error getting movie.',
          error: err,
        });
      }
      return res.json(movies);
    });
  },

  /**
   * movieController.show()
   */
  show: function (req, res) {
    var id = req.params.id;
    model.findOne({
      _id: id
    }, function (err, movie) {
      if (err) {
        return res.json(500, {
          message: 'Error getting movie.'
        });
      }
      if (!movie) {
        return res.json(404, {
          message: 'No such movie'
        });
      }
      return res.json(movie);
    });
  },

  /**
   * movieController.create()
   */
  create: function (req, res) {
    var movie = new model({
      title: req.body.title,
      type: req.body.type,
      genre: req.body.genre,
      state: req.body.state,
      stateSummary: req.body.stateSummary,
      season: req.body.season,
      seen: false,
      id_allocine: req.body.id_allocine,
      file: req.body.file,
      summary: req.body.summary,
      trash: req.body.trash
    });

    movie.save(function (err, movie) {
      if (err) {
        return res.json(500, {
          message: 'Error saving movie',
          error: err
        });
      }
      return res.json({
        message: 'saved',
        _id: movie._id
      });
    });
  },

  /**
   * movieController.update()
   */
  update: function (req, res) {
    var id = req.params.id;
    model.findOne({
      _id: id
    }, function (err, movie) {
      if (err) {
        return res.json(500, {
          message: 'Error saving movie',
          error: err
        });
      }
      if (!movie) {
        return res.json(404, {
          message: 'No such movie'
        });
      }

      movie.title = req.body.title ? req.body.title : movie.title;
      movie.type = req.body.type ? req.body.type : movie.type;
      movie.genre = req.body.genre ? req.body.genre : movie.genre;
      movie.id_allocine = req.body.id_allocine;
      movie.state = req.body.state && req.body.state > 0 && req.body.state < 6 ? req.body.state : movie.state;
      movie.stateSummary = req.body.stateSummary != null ? req.body.stateSummary : movie.stateSummary; // != null to handle empty string
      movie.season = req.body.season ? req.body.season : movie.season;
      movie.season = req.body.type === 'Film' ? null : movie.season;
      movie.seen = req.body.seen ? req.body.seen : false;
      movie.trash = req.body.trash ? req.body.trash : false;
      movie.summary = req.body.summary ? req.body.summary : null;
      movie.filedata = req.body.filedata ? req.body.filedata : null;
      if (req.file && req.file.path) {
        fs.readFile(req.file.path, function (err, datas) {
          movie.filedata = new Buffer(datas, 'binary').toString('base64');
          fs.unlink(req.file.path);
          save();
        })
      } else {
        save();
      }

      function save() {
        movie.save(function (err, movie) {
          if (err) {
            return res.json(500, {
              message: 'Error getting movie.'
            });
          }
          if (!movie) {
            return res.json(404, {
              message: 'No such movie'
            });
          }
          return res.json(movie);
        });
      }
    });
  },

  /**
   * movieController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;
    model.findByIdAndRemove(id, function (err, movie) {
      if (err) {
        return res.json(500, {
          message: 'Error getting movie.'
        });
      }
      return res.json(movie);
    });
  },

  getGenres: function (req, res) {
    model.distinct("genre", function (err, genres) {

      if (err) {
        return res.json(500, {
          message: 'Error getting genres.'
        });
      }
      if(!genres.includes('Drame')) genres.push('Drame');
      return res.json(genres);
    });
  }
};
