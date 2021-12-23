require('dotenv').config();

// -------------------- Database setup --------------------
var mongooseHandler = require('mongoose');
const uri = process.env.MONGO_URI;

// mongooseHandler.connect("mongodb://localhost:27017/backendfour", {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// });
(async function () {
    await mongooseHandler.connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }).then(console.log("Database connected!"));
})();


const { Schema } = mongooseHandler;

const exerciseSchema = new Schema({
    description: String,
    userid: String,
    duration: Number,
    date: String
});

const activitySchema = new Schema({
    username: String,
    count: Number,
    _id: String,
    log: [exerciseSchema]
});

let ActivityModel = mongooseHandler.model('Activity', activitySchema);
let ExerciseModel = mongooseHandler.model('Exercise', exerciseSchema);

const logKeys = [':_id', 'description', 'duration', 'date'];
const typeValues = ['string', 'string', 'number', 'string'];
// -------------------- End of Database setup --------------------

// -------------------- Util function --------------------
const generateId = () => {
    var idOut = "";
    var possible = "0123456789abcdef";

    for (var i = 0; i < 24; i++)
        idOut += possible.charAt(Math.floor(Math.random() * possible.length));

    return idOut;
};

const checkActivityLog = (activityLog) => {
    let keyFlag = Object.keys(activityLog).every((item) => {
        return logKeys.includes(item);
    });

    if (keyFlag) {
        try {
            activityLog['duration'] = parseInt(activityLog['duration']);
        } catch (error) {
            throw new Error('activityLog value duration is not valid number');
        }

        let valueFlag = Object.values(activityLog).map((element, index) => {
            if ((index == Object.values(activityLog).length - 1)
                && (element === null || !String(element).match(/\d{4}-\d{2}-\d{2}/))) {
                activityLog.date = (new Date()).toISOString().split('T')[0];
                return true;
            }
            return typeValues[index] === typeof element;
        });

        if (valueFlag) {
            return activityLog
        } else {
            console.log(valueFlag);
            throw new Error('activityLog value type doesnt match');
        }
    } else {
        throw new Error('activityLog key doesnt match');
    }
}
// -------------------- End of util function --------------------

//-------------------- Database function --------------------
// Create User : function(username, callback)
const createUser = (user, done) => {
    let activityEntry = {
        username: user,
        count: 0,
        _id: generateId(),
        log: []
    }

    let newActivity = new ActivityModel(activityEntry);

    newActivity.save(function (err, data) {
        if (err) return done(err, null);
        done(null, data);
    })
};

// AllUser : function(username, callback)
const getAllUsers = (done) => {
    ActivityModel.find({}, {
        count: 0,
        log: 0,
        __v: 0
    }, function (err, allusers) {
        if (err) return done(err, null);
        done(null, allusers);
    });
};

// Add activity: function(userid, activity object, callback)
const addActivityArray = (id, activityJSON, done) => {
    try {
        checkActivityLog(activityJSON);
    } catch (error) {
        done(error, null);
    }

    let newExercise = new ExerciseModel({
        description: activityJSON.description,
        userid: id,
        duration: activityJSON.duration,
        date: activityJSON.date
    });

    newExercise.save(function (err, data) {
        if (err) return done(err, null);
        ActivityModel.findOneAndUpdate(
            { _id: id },
            { $push: { log: newExercise }, $inc: { count: 1 } },
            { new: true },
            function (err, data) {
                if (err) return done(err, null);
                if (data == null) return done(new Error("Data is null!"), null);

                let reformattedDate = new Date(data['log'].slice(-1)[0]['date']);

                //This will generate ['Www', 'dd', 'Mmm', 'yyyy'] array
                reformattedDate = reformattedDate.toUTCString().split(' ').slice(0, 4);

                //Reformat to be Www Mmm dd yyyy
                let formattedStringDate = `${reformattedDate[0].slice(0, -1)} ${reformattedDate[2]} ${reformattedDate[1]} ${reformattedDate[3]}`;

                done(null, [...data['log'], {
                    username: data['username'],
                    description: data['log'].slice(-1)[0]['description'],
                    duration: parseInt(data['log'].slice(-1)[0]['duration']),
                    date: formattedStringDate,
                    _id: data['log'].slice(-1)[0]['userid']
                }]);
            }
        );
    })
};

// Find activity with time range: function(start, end, limit, userid, callback)
const queryExerciseRange = (urlQueries, done) => {
    let docOut = {
        username: '',
        count: 0,
        _id: urlQueries.userid,
        log: []
    }

    ActivityModel.findById(urlQueries.userid, function (err, userdata) {
        if (err) return done(err);

        docOut.username = userdata.username;

        if (urlQueries.limit === 'all') {
            ExerciseModel.find({
                'userid': urlQueries.userid,
                'date': {
                    $gte: urlQueries.start,
                    $lte: urlQueries.end
                }
            }, { _id: 0, 'userid': 0, __v: 0 }, callback = function (err, exdata) {
                if (err) return done(err, null);
                docOut.count = exdata.length;

                let tempDate = null;
                let formattedData = exdata.map(item => {
                    tempDate = new Date(item['date']);
                    tempDate = tempDate.toUTCString().split(' ').slice(0, 4);
                    item['date'] = `${tempDate[0].slice(0, -1)} ${tempDate[2]} ${tempDate[1]} ${tempDate[3]}`;
                    return item;
                });

                docOut.log = formattedData;
                done(null, docOut);
            });
        } else {
            ExerciseModel.find({
                'userid': urlQueries.userid,
                'date': {
                    $gte: urlQueries.start,
                    $lte: urlQueries.end
                }
            }, {
                _id: 0,
                'userid': 0,
                __v: 0,
            }, {
                limit: parseInt(urlQueries.limit)
            }, callback = function (err, exdata) {
                if (err) return done(err, null);
                docOut.count = exdata.length;

                let tempDate = null;
                let formattedData = exdata.map(item => {
                    tempDate = new Date(item['date']);
                    tempDate = tempDate.toUTCString().split(' ').slice(0, 4);
                    item['date'] = `${tempDate[0].slice(0, -1)} ${tempDate[2]} ${tempDate[1]} ${tempDate[3]}`;
                    return item;
                });

                docOut.log = formattedData;
                done(null, docOut);
            })
        }
    })
};

// Delete all activity documents: function(callback)
const deleteActivityPromise = (done) => {
    ActivityModel.deleteMany({}, function (err, data) {
        if (err) return done(err, null);
        done(null, data);
    });
}

// Delete all exercise documents: function(callback)
const deleteExcercisePromise = (done) => {
    ExerciseModel.deleteMany({}, function (err, data) {
        if (err) return done(err, null);
        done(null, data);
    });
}

//-------------------- End of Database function --------------------

// -------------------- exports --------------------------------
exports.mongooseHandler = mongooseHandler;
exports.ActivityModel = ActivityModel;
exports.ExerciseModel = ExerciseModel;
exports.generateId = generateId;
exports.createUser = createUser;
exports.addActivityArray = addActivityArray;
exports.queryExerciseRange = queryExerciseRange;
exports.deleteActivityPromise = deleteActivityPromise;
exports.deleteExcercisePromise = deleteExcercisePromise;
exports.getAllUsers = getAllUsers;