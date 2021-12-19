const server = require('../server.js').app;
const serverlistener = require('../server.js').listener;
const mongooseHandler = require('../modules/db.js').mongoose;
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

describe('User Endpoints', () => {

    it('GET / get homepage ok', async () => {
        const res = await requestWithSupertest.get('/');
        expect(res.status).toEqual(200);
        // expect(res.type).toEqual(expect.stringContaining('json'));
        // expect(res.body).toHaveProperty('users')
    });
});

afterAll(() => {
    mongooseHandler.disconnect();
    serverlistener.close();
});