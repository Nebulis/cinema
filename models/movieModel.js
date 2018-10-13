var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var movieSchema = new Schema({
  title: String,
  genre: [String],
  type: String,
  season: Number,
  idAllocine: Number,
  state: Number,
  stateSummary: String,
  // seen is either a boolean in case of movies, either an array on boolean in case of season
  seen: Schema.Types.Mixed,
  filedata: String,
  summary: String,
  trash: Boolean,
  netflix: Boolean,
  productionYear: Number
});

module.exports = mongoose.model("movie", movieSchema);
