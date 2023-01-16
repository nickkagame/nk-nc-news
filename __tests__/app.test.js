const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
// import 'jest-date'

beforeEach(() => seed(testData));

describe.only("APP", () => {
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
      test("should return an array containing correct objects with correct properties", () => {
        return request(app)
          .get("/api/articles")
          .then(({ body }) => {
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
            for(let i = 0; i < body.articles.length-1; i++)
                expect(new Date (body.articles[i].created_at)).toBeAfter(new Date((body.articles[i+1].created_at)))
          });
      });
    });
  });
});
