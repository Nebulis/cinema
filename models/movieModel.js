var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var movieSchema = new Schema({
  "title": String,
  "genre": String,
  "type": String,
  "season": Number,
  "id_allocine": Number,
  "state": Number,
  "stateSummary": String,
  "seen": Boolean,
  "filedata": String,
  "summary": String,
  "trash": Boolean
});

module.exports = mongoose.model('movie', movieSchema);
