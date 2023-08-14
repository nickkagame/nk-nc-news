const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const endpoints = require('../endpoints.json')


beforeEach(() => seed(testData));

afterAll(() => {
  return db.end();
});

describe("APP", () => {
  describe('/api/healthcheck', () => {
    test('200 - API healthcheck responds with 200 and a welcome message', () => { 
        return request(app)
        .get('/api/healthcheck')
        .expect(200)
        .then(({body}) => {
        expect(body.msg).toBe('everything is working fine!')          
        })
    })
  })
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
            expect(Object.keys(topic)).toHaveLength(2)
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
              expect(article).toEqual(expect.objectContaining(
                { author: expect.any(String),
                  title: expect.any(String),
                  article_id: expect.any(Number),
                  body: expect.any(String),
                  topic: expect.any(String),
                  created_at: expect.any(String),
                  votes: expect.any(Number),
                  article_img_url: expect.any(String),
                }
              ))
            });
          });
      });
      test("should return an array with articles sorted in descending date order", () => {
        return request(app)
          .get("/api/articles")
          .then(({ body }) => {
           expect(body.articles).toBeSortedBy('created_at',  {descending: true} )
          });
      });
    });
    describe("/api/articles/:article_id", () => {
      test("should return the correct article object with the correct properties", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body }) => {
            expect(body.article.article_id).toBe(1)
            expect(body.article).toEqual(expect.objectContaining(
                { author: expect.any(String),
                  title: expect.any(String),
                  article_id: expect.any(Number),
                  body: expect.any(String),
                  topic: expect.any(String),
                  created_at: expect.any(String),
                  votes: expect.any(Number),
                  article_img_url: expect.any(String),
                }
              ));
          });
      });
      test("should return the correct article object with the correct properties", () => {
        return request(app)
          .get("/api/articles/4")
          .expect(200)
          .then(({ body }) => {
            expect(body.article.article_id).toBe(4)
          })
        })
      });
      test("error handling - should return 400 error with bad request / SQL injection", () => {
        return request(app)
          .get("/api/articles/t")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad article request");
          });
      });
      test("error handling - should return 404 error with valid but non-existant article id", () => {
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

    describe("PATCH - update votes", () => {
      test("will respond with 200", () => {
        const votesObj = { inc_votes: 1 };
        return request(app).patch("/api/articles/1").send(votesObj).expect(200);
      });
      test("will respond with single article object with correct properties", () => {
        const votesObj = { inc_votes: 1 };
        return request(app)
          .patch("/api/articles/1")
          .send(votesObj)
          .expect(200)
          .then(({ body }) => {
            expect(Object.keys(body.article)).toHaveLength(8);
            expect(body.article).toEqual({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              body: expect.any(String),
              topic: expect.any(String),
              created_at: "2020-07-09T20:11:00.000Z",
              votes: expect.any(Number),
              article_img_url: expect.any(String),
            });
          });
      });
      test("will respond with single article object with votes incremented +1", () => {
        const votesObj = { inc_votes: 1 };
        return request(app)
          .patch("/api/articles/1")
          .send(votesObj)
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).toEqual(101);
          });
      });
      test("will respond with article object with votes incremented -100", () => {
        const votesObj = { inc_votes: -100 };
        return request(app)
          .patch("/api/articles/1")
          .send(votesObj)
          .expect(200)
          .then(({ body }) => {
            expect(body.article.votes).toEqual(0);
          });
      });
      test("error handling - will return 400 for invalid request", () => {
        const votesObj = { inc_votes: -100 };
        return request(app)
          .patch("/api/articles/qwrq")
          .send(votesObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad article request");
          });
      });
      test("error handling - will return 404 for valid but non existant article request", () => {
        const votesObj = { inc_votes: -100 };
        return request(app)
          .patch("/api/articles/12592")
          .send(votesObj)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("article not found");
          });
      });
      test("error handling - will return 400 for invalid inc_votes input", () => {
        const votesObj = { inc_votes: "string" };
        return request(app)
          .patch("/api/articles/1")
          .send(votesObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid votes input");
          });
      });
    });

    describe("7/POST/api/articles/articleid/comment", () => {
      const commentToAdd = {
        username: "butter_bridge",
        body: "This article is amazing.  This has changed my life",
      };
      test("responds with an object with the posted comment / correct properties", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .send(commentToAdd)
          .expect(201)
          .then(({ body }) => {
            expect(Object.keys(body.commentAdded)).toHaveLength(6);
            expect(body.commentAdded).toEqual({
              comment_id: expect.any(Number),
              article_id: expect.any(Number),
              body: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            });
          });
      });
      test("error handling - should return 404 error with valid but non-existant article id", () => {
        return request(app)
          .post("/api/articles/124125/comments")
          .send(commentToAdd)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("article not found");
          });
      });
      test("error handling - should return 400 error with bad request / SQL injection", () => {
        return request(app)
          .post("/api/articles/t/comments")
          .send(commentToAdd)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad post request");
          });
      });
      test("error handling - should return 400 error with bad request for comment that is too short", () => {
        const commentToAdd = {
          username: "butter_bridge",
          body: "This",
        };
        return request(app)
          .post("/api/articles/1/comments")
          .send(commentToAdd)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad post request - comment format error");
          });
      });
      test("error handling - should return 400 error with bad request for comment that has wrong keys", () => {
        const commentToAdd = {
          username: "butter_bridge",
          body: "This",
          id: "12513513515151512",
        };
        return request(app)
          .post("/api/articles/1/comments")
          .send(commentToAdd)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad post request - comment format error");
          });
      });
      describe("QUERIES", () => {
        test("Query returns and array", () => {
          return request(app)
            .get("/api/articles/?filter_by=cats")
            .expect(200)
            .then(({ body }) => {
              expect(Array.isArray(body.articles)).toEqual(true);
            });
        });
        test("Query to return articles by topic", () => {
          return request(app)
            .get("/api/articles/?topic=mitch")
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach((article) => {
                expect(article.topic).toBe("mitch");
              });
            });
        });
        test("Query to return articles by topic with correct properties", () => {
          return request(app)
            .get("/api/articles/?topic=cats")
            .expect(200)
            .then(({ body }) => {
              body.articles.forEach((article) => {
                expect(article).toEqual({
                  article_id: expect.any(Number),
                  title: expect.any(String),
                  topic: "cats",
                  author: expect.any(String),
                  body: expect.any(String),
                  created_at: expect.any(String),
                  comment_count: expect.any(String),
                  article_img_url: expect.any(String),
                  votes: expect.any(Number),
                });
              });
            });
        });
        test("Query to sort by any column", () => {
          return request(app)
            .get("/api/articles/?sort=comment_count")
            .expect(200)
            .then(({ body }) => {
              for (let i = 0; i < body.articles.length - 1; i++)
                expect(+body.articles[i].comment_count).toBeGreaterThanOrEqual(
                  +body.articles[i + 1].comment_count
                );
            });
        });

        

        test("Query to sort by any column 2", () => {
          return request(app)
            .get("/api/articles/?sort=votes")
            .expect(200)
            .then(({ body }) => {
              for (let i = 0; i < body.articles.length - 1; i++)
                expect(+body.articles[i].votes).toBeGreaterThanOrEqual(
                  +body.articles[i + 1].votes
                );
            });
        });

        test("Query to sort by any column ascending", () => {
          return request(app)
            .get("/api/articles/?sort=comment_count&order=asc")
            .expect(200)
            .then(({ body }) => {
              for (let i = 0; i < body.articles.length - 1; i++)
                expect(+body.articles[i].comment_count).toBeLessThanOrEqual(
                  +body.articles[i + 1].comment_count
                );
            });
        });

        test("Query to sort by any column 2 ascending", () => {
          return request(app)
            .get("/api/articles/?sort=votes&order=asc")
            .expect(200)
            .then(({ body }) => {
              for (let i = 0; i < body.articles.length - 1; i++)
                expect(+body.articles[i].votes).toBeLessThanOrEqual(
                  +body.articles[i + 1].votes
                );
            });
        });

        test("Query to order by decending", () => {
          return request(app)
            .get("/api/articles/?order=asc")
            .expect(200)
            .then(({ body }) => {
              for (let i = 0; i < body.articles.length - 1; i++)
                expect(new Date(body.articles[i].created_at)).toBeBefore(
                  new Date(body.articles[i + 1].created_at)
                );
            });
        });
        test("If query is ommited all articles are returned", () => {
          return request(app)
            .get("/api/articles/?topic=")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).toHaveLength(12);
              body.articles.forEach((article) => {
                expect(article).toEqual({
                  article_id: expect.any(Number),
                  title: expect.any(String),
                  topic: expect.any(String),
                  author: expect.any(String),
                  body: expect.any(String),
                  created_at: expect.any(String),
                  comment_count: expect.any(String),
                  article_img_url: expect.any(String),
                  votes: expect.any(Number),
                });
              });
            });
        });
        test("error handling - should return 400 error with bad request / SQL injection attempt", () => {
          return request(app)
            .get("/api/articles/?topic=qfq33ofoqbfq")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe("bad query request");
            });
        });
        test("error handling - should return 400 error with bad request  when attempting wrong input for ordering", () => {
          return request(app)
            .get("/api/articles/?order=ascKILLDATABASE")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe("bad query request");
            });
        });
        test("error handling - should return 400 error with bad request when attempting wrong input for sorting", () => {
          return request(app)
            .get("/api/articles/?sort=124124")
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe("bad query request");
            });
        });
      });
      describe("9_GET_USERS", () => {
        test("should return an array", () => {
          return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
              expect(Array.isArray(body.users)).toBe(true);
            });
        });
        test("should return array of object each with correct properties", () => {
          return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
              expect(body.users).toHaveLength(4);
              body.users.forEach((user) => {
                expect(user).toEqual({
                  username: expect.any(String),
                  name: expect.any(String),
                  avatar_url: expect.any(String),
                });
              });
            });
        });
      });
    });
    describe("12 DELETE COMMENTS", () => {
      test("will return a 204 once completed", () => {
        return request(app).delete("/api/comments/3").expect(204);
      });
      test("error handling - should return 400 error with bad request / SQL injection attempt", () => {
        return request(app)
          .delete("/api/comments/skunk")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad delete request");
          });
      });
      
      test("error handling - should return 404 error with valid but no existent request ", () => {
        return request(app)
          .delete("/api/comments/124124")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("comment not found");
          });
      });
      describe("10 GET COMMENT COUNT", () => {
        test("should return article object with all correct properties and comment count added and that comment count is a digit, not letter", () => {
          return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({ body }) => {
              expect(/^\d+$/.test(body.article.votes)).toBe(true);
              expect(body.article).toEqual({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                body: expect.any(String),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes:  expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(String)
              });
            });
        });
      });
    });
  });
  describe("GET API - summary of all the endpoint options for this API", () => {
    test("responds with 200 code", () => {
      return request(app).get("/api").expect(200);
    });
    test("should return object with the correct API titles", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          expect(body.obj).toEqual(endpoints)
          expect(body.obj).toHaveProperty("GET /api");
          expect(body.obj).toHaveProperty("GET /api/topics");
          expect(body.obj).toHaveProperty("GET /api/articles");
          expect(body.obj).toHaveProperty('GET /api/articles/:article_id');
          expect(body.obj).toHaveProperty('GET /api/articles/:article_id/comments');
          expect(body.obj).toHaveProperty("POST /api/articles/:article_id/comments");
          expect(body.obj).toHaveProperty("GET /api/users");
        });
    });
  });


