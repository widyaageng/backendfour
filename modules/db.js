require('dotenv').config();

// -------------------- Database setup --------------------
var mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
    useUnifiedTopology: true
});

const { Schema } = mongoose;

const exerciseSchema = new Schema({
    description: String,
    duration: Number,
    date: String
})

const activitySchema = new Schema({
    username: String,
    count: Number,
    _id: String,
    log: [exerciseSchema]
});

let ActivityModel = mongoose.model('Activity', activitySchema);
let ExerciseModel = mongoose.model('Exercise', exerciseSchema);

const logKeys = ['description', 'duration', 'date'];
const typeValues = ['String', 'Number', 'String'];
// -------------------- End of Database setup --------------------

// -------------------- Util function --------------------
const generateId = () => {
    var idOut = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 32; i++)
        idOut += possible.charAt(Math.floor(Math.random() * possible.length));

    return idOut;
};

const checkActivityLog = (activityLog) => {
    let keyFlag = Object.keys(activityLog).every((item) => logKeys.includes(item));

    if (keyFlag) {
        let valueFlag = Object.values(activityLog).every((item) => typeValues.includes(item));

        if (logKeys) {
            return activityLog
        } else {
            throw new Error('activityLog value type doesnt match');
        }
    } else {
        throw new Error('activityLog key doesnt match');
    }
}
// -------------------- End of util function --------------------

//-------------------- Database function --------------------
// Create User
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

// Add activity: function(need user_id)
const addActivityArray = (id, activityJSON, done) => {
    checkActivityLog(activityJSON);

    let newExercise = new ExerciseModel(activityJSON);
    newExercise.save(function (err, data) {
        if (err) return done(err, null);
        ActivityModel.findOneAndUpdate(
            { _id: id },
            { $push: { log: newExercise } },
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
                    _id: data['log'].slice(-1)[0]['_id']
                }]);
            }
        );
    })
    // ExerciseModel
    // ActivityModel.findOneAndUpdate(
    //     { _id: id },
    //     { $push: { log: activityJSON } },
    //     {new: true},
    //     function (err, data) {
    //         if (err) return done(err, null);
    //         if (data == null) return done(new Error("Data is null!"), null);

    //         let reformattedDate = new Date(data['log'].slice(-1)[0]['date']);

    //         //This will generate ['Www', 'dd', 'Mmm', 'yyyy'] array
    //         reformattedDate = reformattedDate.toUTCString().split(' ').slice(0,4);
    //         //Reformat to be Www Mmm dd yyyy
    //         let formattedStringDate = `${reformattedDate[0].slice(0,-1)} ${reformattedDate[2]} ${reformattedDate[1]} ${reformattedDate[3]}`;

    //         done(null, [...data['log'], {
    //             username: data['username'],
    //             description: data['log'].slice(-1)[0]['description'],
    //             duration: parseInt(data['log'].slice(-1)[0]['duration']),
    //             date: formattedStringDate,
    //             _id: data['log'].slice(-1)[0]['_id']
    //         }]);
    //     }
    // )
};
// Find activity with time range
// Delete all activity documents
const deleteActivityPromise = (done) => {
    ActivityModel.deleteMany({}, function (err, data) {
        if (err) return done(err, null);
        done(null, data);
    });
}

// Delete all exercise documents
const deleteExcercisePromise = (done) => {
    ExerciseModel.deleteMany({}, function (err, data) {
        if (err) return done(err, null);
        done(null, data);
    });
}

//-------------------- End of Database function --------------------

// -------------------- exports --------------------------------
exports.ActivityModel = ActivityModel;
exports.createUser = createUser;
exports.addActivityArray = addActivityArray;
exports.deleteActivityPromise = deleteActivityPromise;
exports.deleteExcercisePromise = deleteExcercisePromise;