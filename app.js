const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const postRouter = require("./routes/posts")
const app = express();

const PORT = 4000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', postRouter);

app.get("/", (req, res) => {
  return res.status(200).json({ test: "success" });
});

app.listen(PORT, () => console.log(`server is up on port: ${PORT}🚀`))

module.exports = app;
