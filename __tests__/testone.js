const server = require('../server.js').app;
const serverlistener = require('../server.js').listener;
const supertest = require('supertest');
const requestWithSupertest = supertest(serverlistener);
const mongooseHandler = require('../modules/db.js').mongooseHandler;

describe('User Endpoints', () => {
    test('GET / server alive', async () => {
        const res = await requestWithSupertest.get('/');
        expect(res.status).toEqual(200);
    });
});

afterAll(async() => {
    await mongooseHandler.disconnect().then(console.log("Database disconnected!"));
    try {
        serverlistener.close();
        console.log("App closed!");
    } catch (error) {
        console.log(error);
    }
});