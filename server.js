const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const cfg = require('./config');

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var opts = {}
opts.tokenBodyField = "id";
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = cfg.JWT.jwtSecret;
opts.issuer = "localhost";
opts.audience = "localhost";
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log(jwt_payload);
    
    User.findOne({id: jwt_payload.sub}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account 
        }
    });
}));

const {usersRouter} = require('./users');

mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT, AUTH_DATABASE_URL } = require('./config');
const { Patient, History } = require('./models');

app.use(express.static('public'));
app.use(bodyParser.json());

//logging and passport
app.use(morgan('common'));

app.use('/users', usersRouter);


//Return a list of all existing patients
app.get('/patients', passport.authenticate("jwt", {session: false}), (req, res) => {
    Patient
        .find()
        .exec()
        .then(patients => {
            res.json({
                patients: patients.map((patient) => patient.apiRepr())
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" })
        });
});

//Get a patient
app.get('/patients/:id', (req, res) => {
    Patient
        .findById(req.params.id)
        .exec()
        .then(patient => res.json(patient.apiRepr())
        ).catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        });
});

//Create a new patient's entry
app.post('/patients', (req, res) => {
    const requiredField = 'patient';
    if (!(requiredField in req.body)) {
        const message = `Missing \`${requiredField}\` name in request body`;
        console.error(message);
        return res.status(400).send(message);
    }

    Patient
        .create(
        {
            patient: req.body.patient,
            doctor: req.body.doctor,
            contact: req.body.contact
        }
        )
        .then(patient => res.status(201).json(patient.apiRepr()))
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        });
});

//Update the patient's entry
app.put('/patients/:id', (req, res) => {
    Patient
        .findByIdAndUpdate(req.params.id, { $set: req.body })
        .exec()
        .then(patient => res.status(204).end())
        .catch(err => res.status(400).json({ message: 'Internal server error' }));
});

//Delete the patient's entry
app.delete('/patients/:id', (req, res) => {
    Patient
        .findByIdAndRemove(req.params.id)
        .exec()
        .then(blog => res.status(204).end())
        .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

//Getting the entire history of a patient
app.get('/patients/:patient_id/histories', (req, res) => {
    Patient
        .findById(req.params.patient_id)
        .exec()
        .then(patient => res.json({ history: patient.history.map(history => history) }))
        // .then(patient => res.send(patient.history))
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "Internal server error" });
        });
});

//Create a new entry in the patient's illness history
app.post('/patients/:patient_id/histories', (req, res) => {

    //Checking to make sure that all the required fields are entered to create a history
    const requiredField = ['date_time', 'symptoms'];
    for (let i = 0; i < requiredField.length; i++) {
        const field = requiredField[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} field in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    //Finding a specific patient by id, and then creating a medical history document
    Patient
        .findById(req.params.patient_id)
        .populate({ path: 'history' })
        .then(patient => {
            patient.history.push({
                date_time: req.body.date_time,
                symptoms: req.body.symptoms,
                meds: req.body.meds
            })
            patient.save()
                .then(patient => res.status(201).json(patient.history))
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ message: "inner post catch: Internal server error" });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: "outer post catch: Internal server error" });
        });

});

//Update entry in the patient's illness history
app.put('/patients/:patient_id/:histories_id', (req, res) => {
    Patient
        .findById(req.params.patient_id)
        .exec()
        .then(patient => {
            history = patient.history.id(req.params.histories_id);
            if (history) {
                for (let prop in req.body.history) {
                    history[prop] = req.body.history[prop];
                }
                patient.save()
                    .then(() => res.status(200).json(history))
            }
            else {
                return res.status(200).json({ message: 'No medical history for this patient was found' });
            }
        })
        .catch(err => res.status(400).json({ message: err.message }))
});

//Delete entry in the patient's illness history
app.delete('/patients/:patient_id/:history_id', (req, res) => {
    Patient
        .findById(req.params.patient_id)
        .exec()
        .then(patient => {
            let arr = patient.history;
            //check if the history id in the url matches any of the ids of history objects in patients.history array
            for (let i = 0; i < arr.length; i++) {
                if (arr[i]._id == req.params.history_id) {               
                    arr.splice(i, 1);
                }
                patient.history = arr;
            }
            patient.save()
                .then(() => res.status(200).json({ message: 'Patient\'s selected history item is now deleted!' }))
                .catch(err => res.status(400).json({ message: err.message }))
        })
        .catch(err => res.status(400).json({ message: err.message }))
});


//To deal with any other path, return a 404-error
app.use('*', function (req, res) {
    res.status(404).json({ message: 'Not Found' });
});


let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`App is listening at port ${port}`);
                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log(`Closing server`);
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};


module.exports = { app, runServer, closeServer };
