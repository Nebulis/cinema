var express = require("express");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var routes = require("./routes/index");
var movies = require("./routes/movies");
var states = require("./routes/states");
var allocine = require("./routes/allocine");

var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

const logger = require("./logger");

mongoose.connect(
  "mongodb://heroku_cinema_user:heroku_cinema_user@ds059365.mongolab.com:59365/cinema"
);

var app = express();
var context = "/api";

var env = process.env.NODE_ENV || "development";
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == "development";

app.use(morgan("dev"));
app.use(
  bodyParser.json({
    limit: "50mb"
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb"
  })
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

var secret = "shhhhhhared-secret";
app.use("/api", expressJwt({ secret: secret }).unless({ path: ["/login"] }));
app.post("/login", function(req, res) {
  if (req.body.password === process.env.PASSWORD) {
    var token = jwt.sign({}, secret, { expiresIn: "60 days" });
    res.send({
      token: token
    });
  } else {
    res.status(400).send("Bad password");
  }
});
app.post("/account", function(req, res) {
  res.send(jwt.decode(req.get("Authorization").substring("Bearer ".length)));
});

app.use(context + "/", routes);
app.use(context + "/movies", movies);
app.use(context + "/states", states);
app.use(context + "/allocine", allocine);

//front
app.use("/front", express.static("./fo2/build"));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/// error handlers
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  logger.error(err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
    title: "error"
  });
});

app.set("port", process.env.PORT || 3000);

var server = app.listen(app.get("port"), function() {
  logger.info("Express server listening on port " + server.address().port);
});
