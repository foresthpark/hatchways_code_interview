const express = require('express');
const router = express.Router();
const {getPing, getPosts, getPostsTest} = require('../controllers/PostGetters')

const redis = require('redis')
const REDIS_PORT = 6379;
const client = redis.createClient(REDIS_PORT)

// cache middleware
// looks up key in cache. if key doesn't exist, middleware moves on to next function
const redisCache = (req, res, next) => {
  const redisKey = req.query.tags + req.query.sortBy + req.query.direction

  client.get(redisKey, (err, data) => {
    if (err) {
      return res.status(500).send({error: "An error occurred. Try again."})
    }

    if (data !== null) {
      res.send({
        posts: JSON.parse(data)
      })
    } else {
      next()
    }
  })
}

router.get(`/ping`, getPing);
router.get(`/posts`, redisCache, getPosts);

module.exports = router;
