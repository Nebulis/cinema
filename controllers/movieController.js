var model = require("../models/movieModel.js");
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
  list: function(req, res) {
    // EXAMPLE OF BULK UPDATE
    // model.update({}, {netflix: false}, {multi: true}, (err) => {
    //   console.log(err);
    //   console.log('DONE')
    // });

    // EXAMPLE OF UPDATE BY STREAMING DATA
    // var cursor = model.find({}).select({'filedata': 0}).cursor();
    // cursor.on('data', function(movie) {
    //   console.log(movie.genre);
    //   movie.genre = [movie.genre];
    //   movie.save(function (err, doc) {
    //     console.log(doc._id);
    //   });
    // });
    // cursor.on('close', function() {
    //   console.log('clooooooooooose')
    // });

    const {
      title,
      genres,
      types,
      seen,
      unseen,
      netflix,
      unnetflix,
      productionYear
    } = req.query;
    let query;

    const titleFilter = title
      ? { title: { $regex: title || "", $options: "i" } }
      : {};
    query = model.find({
      ...titleFilter
    });
    if (netflix !== unnetflix) query = query.and({ netflix: !!netflix });
    if (productionYear) query = query.and({ productionYear });

    if (seen !== unseen) {
      query = query.and([
        // must match
        // - film where field.seen = seen
        // - tvshows where seen in field.seen
        { $or: [{ seen: !!seen }, { seen: { $in: [!!seen] } }] }
      ]);
    }

    if (genres) {
      query = query.and([{ $or: genres.split(",").map(genre => ({ genre })) }]);
    }

    if (types) {
      query = query.and([{ $or: types.split(",").map(type => ({ type })) }]);
    }

    query
      .sort("title season")
      // .limit(30)
      .select({ filedata: 0 })
      .exec(function(err, movies) {
        if (err) {
          return res.json(500, {
            message: "Error getting movie.",
            error: err
          });
        }
        return res.json(movies);
      });
  },

  /**
   * movieController.show()
   */
  show: function(req, res) {
    var id = req.params.id;
    model.findOne(
      {
        _id: id
      },
      function(err, movie) {
        if (err) {
          return res.json(500, {
            message: "Error getting movie."
          });
        }
        if (!movie) {
          return res.json(404, {
            message: "No such movie"
          });
        }
        return res.json(movie);
      }
    );
  },

  /**
   * movieController.create()
   */
  create: function(req, res) {
    const season = parseInt(req.body.season, 10);
    var movie = new model({
      title: req.body.title,
      type: req.body.type,
      genre: req.body.genre,
      state: req.body.state,
      stateSummary: req.body.stateSummary,
      season: req.body.type === "Film" ? null : season,
      seen: req.body.type === "Film" ? false : Array(season).fill(false),
      idAllocine: req.body.idAllocine,
      netflix: false,
      file: req.body.file,
      summary: req.body.summary,
      trash: req.body.trash,
      productionYear: req.body.productionYear
    });

    movie.save(function(err, movie) {
      if (err) {
        return res.json(500, {
          message: "Error saving movie",
          error: err
        });
      }
      return res.json(movie);
    });
  },

  /**
   * movieController.update()
   */
  update: function(req, res) {
    var id = req.params.id;
    model.findOne(
      {
        _id: id
      },
      function(err, movie) {
        if (err) {
          return res.json(500, {
            message: "Error saving movie",
            error: err
          });
        }
        if (!movie) {
          return res.json(404, {
            message: "No such movie"
          });
        }

        const season = parseInt(req.body.season, 10);

        const seenForTvShows = (newSeason, oldSeason, seen) => {
          if(newSeason < oldSeason) {
            return seen.slice(0, newSeason) //less season than before, remove extra seen
          }
          return seen.concat(Array(newSeason - oldSeason).fill(false));
        }

        movie.title = req.body.title || movie.title;
        movie.type = req.body.type || movie.type;
        movie.genre = req.body.genre || movie.genre;
        movie.productionYear = req.body.productionYear || movie.productionYear;
        movie.idAllocine = req.body.idAllocine;
        movie.state =
          req.body.state && req.body.state > 0 && req.body.state < 64
            ? req.body.state
            : movie.state;
        movie.stateSummary =
          req.body.stateSummary != null
            ? req.body.stateSummary
            : movie.stateSummary; // != null to handle empty string
        movie.seen =
          req.body.type === "Film" ?
            (req.body.seen || false) // TODO may reset seen if seen is not passed down
            :
            seenForTvShows(season, movie.season, req.body.seen);
        movie.season = season || movie.season;
        movie.trash = req.body.trash || false;
        movie.summary = req.body.summary || null;
        movie.filedata = req.body.filedata || null;
        movie.netflix = !!req.body.netflix;
        if (req.file && req.file.path) {
          fs.readFile(req.file.path, function(err, datas) {
            movie.filedata = new Buffer(datas, "binary").toString("base64");
            fs.unlink(req.file.path);
            save();
          });
        } else {
          save();
        }

        function save() {
          movie.save(function(err, movie) {
            if (err) {
              return res.json(500, {
                message: "Error getting movie."
              });
            }
            if (!movie) {
              return res.json(404, {
                message: "No such movie"
              });
            }
            return res.json(movie);
          });
        }
      }
    );
  },

  /**
   * movieController.remove()
   */
  remove: function(req, res) {
    var id = req.params.id;
    model.findByIdAndRemove(id, function(err, movie) {
      if (err) {
        return res.json(500, {
          message: "Error getting movie."
        });
      }
      return res.json(movie);
    });
  },

  getGenres: function(req, res) {
    model.distinct("genre", function(err, genres) {
      if (err) {
        return res.json(500, {
          message: "Error getting genres."
        });
      }
      return res.json(genres.sort());
    });
  }
};
