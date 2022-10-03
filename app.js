const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

//importing routers
const userRouter = require("./routes/userRoutes");
const pomoRouter = require("./routes/pomoRoutes");
const spotifyRouter = require("./routes/spotifyRoutes");

//importing error handler
const errorHandler = require("./controllers/errorController");
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

//setting the routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/pomos", pomoRouter);
app.use("/api/v1/spotify", spotifyRouter);

//setting global error handler
app.use(errorHandler);
module.exports = app;
