import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";
import { connect } from "mongoose";
import morgan from "morgan";
import { logger } from "./logger";
import { router } from "./routes";
import { router as allocine } from "./routes/allocine";
import { router as movies } from "./routes/movies";
import { router as states } from "./routes/states";

connect(
  "mongodb://heroku_cinema_user:heroku_cinema_user@ds059365.mongolab.com:59365/cinema",
  { useNewUrlParser: true }
);

const app = express();
const context = "/api";

const env = process.env.NODE_ENV || "development";
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === "development";

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

app.get("/", (_, res) => {
  res.send("Hello World");
});

const secret = "shhhhhhared-secret";
app.use("/api", expressJwt({ secret }).unless({ path: ["/login"] }));
app.post("/login", (req, res) => {
  if (req.body.password === process.env.PASSWORD) {
    const token = jwt.sign({}, secret, { expiresIn: "60 days" });
    res.send({
      token
    });
  } else {
    res.status(400).send("Bad password");
  }
});
app.post("/account", (req, res) => {
  const authorization = req.get("Authorization");
  if (authorization) {
    res.send(jwt.decode(authorization.substring("Bearer ".length)));
  }
  res.send(400);
});

app.use(context + "/", router);
app.use(context + "/movies", movies);
app.use(context + "/states", states);
app.use(context + "/allocine", allocine);

// front
app.use("/front", express.static("./fo2/build"));

/// catch 404 and forward to error handler
app.use((_req, res) => {
  res.send(404);
});

app.set("port", process.env.PORT || 3000);

const server = app.listen(app.get("port"), () => {
  const address = server.address();
  if (typeof address !== "string") {
    logger.info(`Express server listening on port ${address.port}`);
  }
});
