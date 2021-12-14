require('dotenv').config();

// -------------------- Database setup --------------------
var mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
    useUnifiedTopology: true
});

const { Schema } = mongoose;

const activitySchema = new Schema({
    username: String,
    count: Number,
    _id: String,
    log: [{
        description: String,
        duration: Number,
        date: String
    }]
});

let ActivityModel = mongoose.model('Activity', activitySchema);

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
    let acivityEntry = {
        username: user,
        count: 0,
        _id: generateId(),
        log: []
    }

    let newActivity = new ActivityModel(acivityEntry);

    newActivity.save(function (err, data) {
        if (err) return done(err, null);
        done(null, data);
    })
};

// Add activity: function(need user_id)
const addActivityArray = (id, activityJSON, done) => {
    ActivityModel.findOneAndUpdate(
        { _id: id },
        { $push: { log: activityJSON } },
        {new: true},
        function (err, data) {
            if (err) return done(err, null);
            if (data == null) return done(new Error("Data is null!"), null);

            done(null, [...data['log'], {
                username: data['username'],
                description: data['log'].slice(-1)[0]['description'],
                duration: parseInt(data['log'].slice(-1)[0]['duration']),
                date: data['log'].slice(-1)[0]['date'],
                _id: data['log'].slice(-1)[0]['_id']
            }]);
        }
    )
};
// Find activity with time range
// Delete all documents
const deleteActivityPromise = (done) => {
    ActivityModel.deleteMany({}, function (err, data) {
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