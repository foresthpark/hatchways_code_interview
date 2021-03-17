const axios = require("axios");
const redis = require("redis");

const REDIS_PORT = 6379;
const client = redis.createClient(REDIS_PORT);

const URL = "https://api.hatchways.io/assessment/blog/posts";

exports.getPing = async (req, res) => {
  const tag = req.query.tag;

  if (!tag) {
    return res.status(400).json({
      error: "Tags parameter is required",
    });
  }

  try {
    const response = await axios.get(`${URL}?tag=${tag}`);

    return res.send({
      success: true,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: "An error occurred. Please try again.",
    });
  }
};

exports.getPosts = async (req, res) => {
  const redisKey = req.query.tags + req.query.sortBy + req.query.direction;

  const tags = req.query.tags;
  const sortBy = req.query.sortBy || "id"; // if no direction in request, sortBy defaults to id
  const direction = req.query.direction || "asc"; // if no direction in request, direction defaults to asc

  const sortCollection = ["id", "reads", "likes", "popularity"]; // list of sotBy string. can add more later
  const sortCondition = sortCollection.includes(sortBy); // is the sortBy query valid or not?

  const directionCollection = ["asc", "desc"];
  const directionCondition = directionCollection.includes(direction); // is the direction query valid or not?

  if (!tags) {
    return res.status(400).json({
      error: "Tags parameter is required",
    });
  }

  if (!sortCondition || !directionCondition) {
    return res.status(400).send({
      error: "sortBy parameter is invalid",
    });
  }

  const splitTags = tags.split(","); // split tags string into array
  const tagLength = splitTags.length; // how many tags were in the query?
  let postCollection = [];
  const promises = [];

  for (let i = 0; i < tagLength; i++) {
    const dynamicUrl = `${URL}?tag=${splitTags[i]}`;

    client.get(splitTags[i], (err, cachedData) => {
      if (err) {
        return res.status(500).send({ error: "An error occurred. Try again." });
      }

      if (cachedData !== null) {
        promises.push(dynamicUrl);
      } else {
        postCollection = postCollection.concat(cachedData);
      }
    });
  }

  const tasks = promises.map((promise) => axios.get(promise));

  try {
    const responses = await Promise.allSettled(tasks);

    responses.map((response) => {
      postCollection = postCollection.concat(response.value.data.posts);
    });
  } catch (e) {
    return res.status(500).json({
      error: "An error occurred. Please try again.",
    });
  }

  // remove duplicates from array
  const getHash = (a) => a.id;
  const seen = new Set();

  // won't add element to Set if already 'has' element in the Set
  const uniquePosts = postCollection.filter((candidate) => {
    const hash = getHash(candidate);

    if (seen.has(hash)) return false;

    seen.add(hash);
    return true;
  });

  // reverse array based on direction
  const sortedPosts =
    direction === "asc"
      ? uniquePosts.sort((c1, c2) => (c1[sortBy] > c2[sortBy] ? 1 : -1)) // asc
      : uniquePosts.sort((c1, c2) => (c1[sortBy] > c2[sortBy] ? -1 : 1)); // desc

  // set this specific query to cache
  client.setex(redisKey, 3600, JSON.stringify(sortedPosts));

  return res.send({
    posts: sortedPosts,
  });
};
