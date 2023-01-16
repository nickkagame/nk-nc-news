const request = require('supertest')
const app = require("../app")
const db = require("../db/connection")
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/index');

beforeEach(() => seed(testData));


describe.only('APP', () => {
    describe('get welcome message', () => {
        test('returns a status code of 200', () => {
            return request(app)
            .get('/api/')
            .expect(200)
        })
        test('should return welcome message to the user', () => {
            return request(app)
            .get('/api')
            .then(({body})=> {
                expect (body.msg).toEqual("Welcome!")
            })
        })
    })
    describe('Testing GET /api/topics', () => {
        test('should return an array', () => {
            return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                expect(Array.isArray(body.topics)).toBe(true)
            })
        })
        test('should return an array of objects each containing properties SLUG and DESCRIPTION', () => {
            return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body}) => {
                    expect(body.topics.length).toBeGreaterThan(0)
                body.topics.forEach((topic) => {
                    expect(topic).toHaveProperty('slug');
                    expect(topic).toHaveProperty('description')
                })
            })
        })
    })
})