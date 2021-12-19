const server = require('../server.js').app;
const serverlistener = require('../server.js').listener;
const mongooseHandler = require('../modules/db.js').mongoose;
const ActivityModel = require('../modules/db.js').ActivityModel;
const ExerciseModel = require('../modules/db.js').ExerciseModel;
const generateId = require('../modules/db').generateId;
const supertest = require('supertest');
const requestWithSupertest = supertest(server);

// -------------------- util function --------------------

// ---------------- end util function --------------------


describe('User Endpoints', () => {

    it('POST /api/users; Task: Create new user', async () => {
        const userEntry = {
            username: 'Widya',
            count: 0,
            _id: generateId(),
            log: []
        };

        try {
            // check count, post, check count
            const count = await ActivityModel.count();
            await requestWithSupertest.post('/api/users').send(userEntry);

            const newCount = await ActivityModel.count();
            expect(newCount).toBe(count + 1);

            // checking the added username and get the id
            const firstEntry = await ActivityModel.find({ 'username': 'Widya' });
            expect(firstEntry[0]['username']).toEqual('Widya');

        } catch (err) {
            console.log(`Error ${err}`)
        }
    });

    it('POST /users/:_id/exercises; Task: Create new exercises', async () => {

        try {
            // get test username and get the id
            const firstEntry = await ActivityModel.find({ 'username': 'Widya' });
            const testUserId = firstEntry[0]['_id'];

            const exerciseEntries = [
                {
                    description: 'Eat',
                    userid: testUserId,
                    duration: 20,
                    date: new Date('2021-12-17')
                },
                {
                    description: 'Work',
                    userid: testUserId,
                    duration: 480,
                    date: new Date('2021-12-18')
                },
                {
                    description: 'Code',
                    userid: testUserId,
                    duration: 600,
                    date: new Date('2021-12-19')
                }
            ]

            // create exercises
            // exerciseEntries.forEach(async function (item) {
            //     await requestWithSupertest.post(`/api/${testUserId}/exercises`)
            //         .send(item);
            // })

            await requestWithSupertest.post(`/api/users/${testUserId}/exercises`)
                .send(exerciseEntries[0]);

            // await requestWithSupertest.post(`/api/users/${testUserId}/exercises`)
            //     .send(exerciseEntries[1]);

            // await requestWithSupertest.post(`/api/users/${testUserId}/exercises`)
            //     .send(exerciseEntries[2]);

            // console.log(testUserId);
            // const exerciseCount = await ExerciseModel.find({ 'userid': new mongooseHandler.Types.ObjectId(testUserId) }).count();
            // console.log(exerciseCount);
            // expect(exerciseCount).toEqual(exerciseEntries.length);

        } catch (err) {
            console.log(`Error ${err}`)
        }
    });



    // it('GET /api/deleteall; Task: Delete all documents', async () => {
    //     const res = await requestWithSupertest.get('/api/deleteall');
    //     expect(res.status).toEqual(200);
    // });
});

afterAll(() => {
    // const res = await requestWithSupertest.get('/api/deleteall');
    // mongooseHandler.connection.db.dropCollection('backendfour', function (req, res) { });
    mongooseHandler.disconnect();
    serverlistener.close();
});