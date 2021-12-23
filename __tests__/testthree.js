const server = require('../server.js').app;
const serverlistener = require('../server.js').listener;
const generateId = require('../modules/db').generateId;
const supertest = require('supertest');
const requestWithSupertest = supertest(serverlistener);
const mongooseHandler = require('../modules/db.js').mongooseHandler;
const ActivityModel = require('../modules/db.js').ActivityModel;
const ExerciseModel = require('../modules/db.js').ExerciseModel;

// -------------------- util function --------------------

// ---------------- end util function --------------------


describe('User Endpoints', () => {
    // create exercises for first user
    var userEntry = {
        username: 'Widya',
        count: 0,
        _id: generateId(),
        log: []
    };

    var exerciseEntries = [
        {
            description: 'Eat',
            duration: 20,
            date: '2021-12-17'
        },
        {
            description: 'Work',
            duration: 480,
            date: '2021-12-18'
        },
        {
            description: 'Code',
            duration: 600,
            date: '2021-12-19'
        }
    ]

    it('GET /api/deleteall; Task: Delete all documents', async () => {
        const res = await requestWithSupertest.get('/api/deleteall');
        expect(res.status).toEqual(200);
    });


    it('POST /api/users; Task: Create two new user and query all without url params', async () => {

        // push first user to database
        await requestWithSupertest.post('/api/users').send(userEntry);
        let userNameEntry = await ActivityModel.find({ 'username': userEntry['username'] });
        let userIdEntry = userNameEntry[0]['_id'];

        let resSupertest = null;
        for (const entry of exerciseEntries) {
            resSupertest = await requestWithSupertest.post(`/api/users/${userIdEntry}/exercises`)
                .send(entry);
        }


        userEntry = {
            username: 'Testuser',
            count: 0,
            _id: generateId(),
            log: []
        };

        // push second user to database
        await requestWithSupertest.post('/api/users').send(userEntry);
        userNameEntry = await ActivityModel.find({ 'username': userEntry['username'] });
        userIdEntry = userNameEntry[0]['_id'];

        // create exercises for first user
        exerciseEntries = [
            {
                description: 'Run',
                duration: 60,
                date: '2021-12-21'
            },
            {
                description: 'Gym',
                duration: 120,
                date: '2021-12-22'
            }
        ]

        // checking format return
        let reformattedDate = new Date(exerciseEntries.slice(-1)[0]['date']);
        //This will generate ['Www', 'dd', 'Mmm', 'yyyy'] array
        reformattedDate = reformattedDate.toUTCString().split(' ').slice(0, 4);
        //Reformat to be Www Mmm dd yyyy
        let formattedStringDate = `${reformattedDate[0].slice(0, -1)} ${reformattedDate[2]} ${reformattedDate[1]} ${reformattedDate[3]}`;

        for (const entry of exerciseEntries) {
            resSupertest = await requestWithSupertest.post(`/api/users/${userIdEntry}/exercises`)
                .send(entry);
        }

        const res = await requestWithSupertest.get(`/api/users/${userIdEntry}/logs`);
        expect(res.status).toEqual(200);
        expect(res.body['log'][0]['description']).toEqual(exerciseEntries[0]['description']);
        expect(res.body['log'].slice(-1)[0]['date']).toEqual(formattedStringDate);
    });

    it('POST /users/:_id/exercises; Task: query exercises with url param', async () => {
        // get test username and get the id
        const firstEntry = await ActivityModel.find({ 'username': userEntry['username'] });
        const testUserId = firstEntry[0]['_id'];

        const res = await requestWithSupertest.get(`/api/users/${testUserId}/logs?from=&to=&limit=1`);

        // checking format return
        let reformattedDate = new Date(exerciseEntries.slice(0, 1)[0]['date']);
        //This will generate ['Www', 'dd', 'Mmm', 'yyyy'] array
        reformattedDate = reformattedDate.toUTCString().split(' ').slice(0, 4);
        //Reformat to be Www Mmm dd yyyy
        let formattedStringDate = `${reformattedDate[0].slice(0, -1)} ${reformattedDate[2]} ${reformattedDate[1]} ${reformattedDate[3]}`;

        expect(res.status).toEqual(200);
        expect(res.body['log'][0]['description']).toEqual(exerciseEntries[0]['description']);
        expect(res.body['log'].slice(-1)[0]['date']).toEqual(formattedStringDate);
    });



    it('GET /api/deleteall; Task: Delete all documents', async () => {
        const res = await requestWithSupertest.get('/api/deleteall');
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