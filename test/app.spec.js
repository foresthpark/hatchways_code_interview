
const app = require("../app");
// const request = require("supertest")
const chai = require("chai")
const chaiHttp = require("chai-http")

chai.should()
chai.use(chaiHttp)

describe("GET /api/ping", function () {

  it("it should have status code 400", (done) => {
    chai.request(app)
      .get('/api/ping')
      .end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it("should return status 400", done => {
    chai.request(app)
      .get('/api/ping')
      .query({test: 'foo'})
      .end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it("should return status 200", done => {
    chai.request(app)
      .get('/api/ping')
      .query({tag: 'history'})
      .end((err, res) => {
        res.should.have.status(200)
        done()
      })
  })

  it("body should be an object", done => {
    chai.request(app)
      .get('/api/ping')
      .query({tag: 'history'})
      .end((err, res) => {
        res.body.should.be.a('object')
        done()
      })
  })

  it("body should have success property", done => {
    chai.request(app)
      .get('/api/ping')
      .query({tag: 'history'})
      .end((err, res) => {
        res.body.should.have.property("success")
        done()
      })
  })

  it("body success value should be true", done => {
    chai.request(app)
      .get('/api/ping')
      .query({tag: 'history'})
      .end((err, res) => {
        res.body.should.have.property("success").equal(true)
        done()
      })
  })
});

describe("GET /api/posts", function () {

  it("it should have status code 400", (done) => {
    chai.request(app)
      .get('/api/posts')
      .query({tag: "tech,history", direction: "desc", sortBy: "likes"})
      .end((err, res) => {
        res.should.have.status(400)
        done()
      })
  })

  it("body should be an object", done => {
    chai.request(app)
      .get('/api/posts')
      .end((err, res) => {
        res.body.should.be.a('object')
        done()
      })
  })

  it("body should have error property", done => {
    chai.request(app)
      .get('/api/posts')
      .end((err, res) => {
        res.body.should.have.property("error")
        done()
      })
  })

  it("body error value should be Tags parameter is required", done => {
    chai.request(app)
      .get('/api/posts')
      .end((err, res) => {
        res.body.should.have.property("error").to.equal("Tags parameter is required")
        done()
      })
  })
});

describe("GET /api/posts [Only tags query]", function () {
  it("[Only tags query] should be status 200", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech"})
      .end((err, res) => {
        res.should.be.status(200)
        done()
      })
  })

  it("[Only tags query] should have object properties", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech"})
      .end((err, res) => {
        res.body.should.have.property("posts")
        res.body['posts'][0].should.have.property('id')
        res.body['posts'][0].should.have.property('author')
        res.body['posts'][0].should.have.property('authorId')
        res.body['posts'][0].should.have.property('likes')
        res.body['posts'][0].should.have.property('popularity')
        res.body['posts'][0].should.have.property('reads')
        res.body['posts'][0].should.have.property('tags')
        done()
      })
  })

  it("[Only tags query] tags should include query field tags", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech"})
      .end((err, res) => {
        res.body['posts'][0]['tags'].should.include("tech")
        done()
      })
  })
})

describe("GET /api/posts [INVALID PARAMS]", function () {
  it("[INVALID sortBy PARAMS] should be status 400", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech", sortBy: "likesssss", direction:"asc" })
      .end((err, res) => {
        res.should.be.status(400)
        done()
      })
  })

  it("[INVALID direction PARAMS] should be status 400", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech", sortBy: "likes", direction:"test" })
      .end((err, res) => {
        res.should.be.status(400)
        done()
      })
  })

  it("[INVALID direction PARAMS] should be status 400", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech", sortBy: "likes", direction:"test" })
      .end((err, res) => {
        res.body.should.have.property("error")
        done()
      })
  })
})

describe("GET /api/posts [PROPER REQUEST]", function () {
  it("[PROPER REQUEST] should be status 200", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"tech,health", sortBy: "likes", direction:"desc" })
      .end((err, res) => {
        res.should.be.status(200)
        done()
      })
  })

  it("[PROPER REQUEST] direction=asc sortBy=id first id should be 1", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"tech,health", sortBy: "id", direction:"asc" })
      .end((err, res) => {
        res.body['posts'][0]['id'].should.be.equal(1)
        done()
      })
  })

})

describe("GET /api/posts [FINAL TEST] - [COMPARE WITH SOLUTION]", function () {
  it("[PROPER REQUEST] first id should be 95", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech", sortBy: "likes", direction:"desc" })
      .end((err, res) => {
        res.body['posts'][0]['id'].should.be.equal(95)
        done()
      })
  })

  it("[PROPER REQUEST] last element author sould be Bryson Bowers", done => {
    chai.request(app)
      .get('/api/posts')
      .query({tags:"history,tech", sortBy: "likes", direction:"desc" })
      .end((err, res) => {
        const lastElement = res.body['posts'].pop()
        lastElement['author'].should.be.equal("Bryson Bowers")
        done()
      })
  })

})