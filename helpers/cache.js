const redis = require('redis')

const REDIS_PORT = 6379;
const client = redis.createClient(REDIS_PORT)

exports.tagCacher = (key,data) => {
  client.setex(key, 3600, data)
}

exports.tagCacheChecker = (tag, data) => {
  client.get(tag, (err, redisData) => {
    if (err) {
      return res.status(500).send({error: "An error occurred. Try again."})
    }

    if (data !== null) {
      return JSON.parse(redisData)
    } else {
      //
    }
  })
}