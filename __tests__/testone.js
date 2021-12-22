const server = require('../server.js').app;
const serverlistener = require('../server.js').listener;
const mongooseHandler = require('../modules/db.js').mongoose;
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe('User Endpoints', () => {

    it('GET / server alive', async () => {
        const res = await requestWithSupertest.get('/');
        expect(res.status).toEqual(200);
    });
});

afterAll(() => {
    mongooseHandler.disconnect();
    serverlistener.close();
});