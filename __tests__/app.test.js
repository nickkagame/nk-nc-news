const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");

beforeEach(() => seed(testData));

afterAll(() => {
  return db.end();
});

describe("APP", () => {
  describe("get welcome message", () => {
    test("returns a status code of 200", () => {
      return request(app).get("/api/").expect(200);
    });
    test("should return welcome message to the user", () => {
      return request(app)
        .get("/api")
        .then(({ body }) => {
          expect(body.msg).toEqual("Welcome!");
        });
    });
  });
  describe("Testing GET /api/topics", () => {
    test("should return an array", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.topics)).toBe(true);
        });
    });
    test("should return an array of objects each containing properties SLUG and DESCRIPTION", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body.topics.length).toBeGreaterThan(0);
          expect(body.topics).toHaveLength(3);
          body.topics.forEach((topic) => {
            expect(topic).toHaveProperty("slug");
            expect(topic).toHaveProperty("description");
          });
        });
    });
    describe("/api/articles", () => {
      test("should return an array", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            expect(Array.isArray(body.articles)).toBe(true);
          });
      });
      test("should return an array containing correct number of objects with correct properties", () => {
        return request(app)
          .get("/api/articles")
          .then(({ body }) => {
            expect(body.articles).toHaveLength(12);
            body.articles.forEach((article) => {
              expect(article).toHaveProperty("author");
              expect(article).toHaveProperty("title");
              expect(article).toHaveProperty("topic");
              expect(article).toHaveProperty("created_at");
              expect(article).toHaveProperty("votes");
              expect(article).toHaveProperty("article_img_url");
              expect(article).toHaveProperty("comment_count");
            });
          });
      });
      test("should return an array with articles sorted in descending date order", () => {
        return request(app)
          .get("/api/articles")
          .then(({ body }) => {
            for (let i = 0; i < body.articles.length - 1; i++)
              expect(new Date(body.articles[i].created_at)).toBeAfter(
                new Date(body.articles[i + 1].created_at)
              );
          });
      });
    });
    describe("/api/articles/:article_id", () => {
      test("should return the correct article object with the correct properties", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body }) => {
            expect(body.article.author).toBe("butter_bridge");
            expect(body.article).toHaveProperty(`author`);
            expect(body.article).toHaveProperty(`title`);
            expect(body.article).toHaveProperty(`article_id`);
            expect(body.article).toHaveProperty(`body`);
            expect(body.article).toHaveProperty(`topic`);
            expect(body.article).toHaveProperty(`created_at`);
            expect(body.article).toHaveProperty(`votes`);
            expect(body.article).toHaveProperty(`article_img_url`);
          });
      });
      test("should return the correct article object with the correct properties", () => {
        return request(app)
          .get("/api/articles/4")
          .expect(200)
          .then(({ body }) => {
            expect(body.article.author).toBe("rogersop");
            expect(body.article).toHaveProperty(`author`);
            expect(body.article).toHaveProperty(`title`);
            expect(body.article).toHaveProperty(`article_id`);
            expect(body.article).toHaveProperty(`body`);
            expect(body.article).toHaveProperty(`topic`);
            expect(body.article).toHaveProperty(`created_at`);
            expect(body.article).toHaveProperty(`votes`);
            expect(body.article).toHaveProperty(`article_img_url`);
          });
      });
      test("error handling - should return 400 error with bad request / SQL injection", () => {
        return request(app)
          .get("/api/articles/t")
          .expect(400)
          .then(({ body }) => {
            console.log(body);
            expect(body.msg).toBe("bad article request");
          });
      });
      test("error handling - should return 404 error with valid but non-existant artcile id", () => {
        return request(app)
          .get("/api/articles/124125")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("article not found");
          });
      });
    });
    describe("Testing GET /api/articles/:article_id/comments", () => {
      test("should return an array", () => {
        return request(app)
          .get("/api/articles/3/comments")
          .expect(200)
          .then(({ body }) => {
            expect(Array.isArray(body.comments)).toBe(true);
          });
      });
      test("should return an array with array containing correct comments", () => {
        return request(app)
          .get("/api/articles/3/comments")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).toEqual([
              {
                comment_id: 10,
                body: "git push origin master",
                votes: 0,
                author: "icellusedkars",
                article_id: 3,
                created_at: "2020-06-20T07:24:00.000Z",
              },
              {
                comment_id: 11,
                body: "Ambidextrous marsupial",
                votes: 0,
                author: "icellusedkars",
                article_id: 3,
                created_at: "2020-09-19T23:10:00.000Z",
              },
            ]);
          });
      });
      test("should return an array with array containing correct comments", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).toHaveLength(11);
            body.comments.forEach((comment) => {
              expect(comment).toHaveProperty("comment_id");
              expect(comment).toHaveProperty("votes");
              expect(comment).toHaveProperty("created_at");
              expect(comment).toHaveProperty("author");
              expect(comment).toHaveProperty("body");
              expect(comment).toHaveProperty("article_id");
            });
          });
      });
      test("error handling - should return 404 error message with valid but non-existant path", () => {
        return request(app)
          .get("/api/articles/500/comments")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("article not found");
          });
      });
      test("error handling - should return 400 error with bad request / prevent SQL injection", () => {
        return request(app)
          .get("/api/articles/t/comments")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad article request");
          });
      });
      test("will return 200 and empty result if article does not have comments", () => {
        return request(app)
          .get("/api/articles/2/comments")
          .expect(200)
          .then(({ body }) => {
            expect(body.comments).toEqual([]);
          });
      });
    });
  });
});
