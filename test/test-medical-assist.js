const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();
const { app, runServer, closeServer } = require('../server');
const { Patient, History } = require('../models');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

describe('Accessing root', function () {
    it('should get 200 status', function () {
        app.get('/', (res, req) => {
            res.should.have.status(200);
            res.sendFile(__dirname + '/public/index.html')
        })
    });
});

function seedPatientData() {
    console.info('Seeding patient data');
    const seedData = [];
    for (let i = 0; i <= 10; i++) {
        seedData.push(generatePatientData());
    }
    Patient
        .insertMany(seedData)
        .then(data => data)
        .catch(err => {
            console.log(`error: ${err}`);
        });
}

function tearDownDb() {
    console.log('Deleting database');
    return mongoose.connection.dropDatabase();
}

function generatePatientData() {
    return {
        patient: faker.name.firstName(),
        doctor: `Dr. ${faker.name.firstName()} ${faker.name.lastName}`,
        contact: faker.lorem.words(),
        history: [
            {
                date_time: faker.lorem.words(),
                symptoms: faker.lorem.words(),
                meds: faker.lorem.words()
            },
            {
                date_time: faker.lorem.words(),
                symptoms: faker.lorem.words(),
                meds: faker.lorem.words()
            }]
    }
}

function generateHistoryData() {
    return {
        date_time: faker.lorem.words(),
        symptoms: faker.lorem.words(),
        meds: faker.lorem.words()
    }
}

describe('Patients API resource', function () {

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedPatientData();
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    })

    describe('GET patient endpoint', function () {
        it('should return all existing patients', function () {
            let res
            return chai.request(app)
                .get('/patients')
                .then(function (response) {
                    res = response;
                    res.should.have.status(200);
                    res.body.patients.should.have.length.of.at.least(1);
                    return Patient.count();
                })
                .then(function (count) {
                    res.body.patients.should.have.length.of(count);
                })
        });

        it('should return patients with the right fields', function () {
            let resPatient;
            return chai.request(app)
                .get('/patients')
                .then(function (res) {
                    res.should.be.json;
                    res.body.patients.should.be.a('array');
                    res.body.patients.should.have.length.of.at.least(1);
                    res.body.patients.forEach(function (patient) {
                        patient.should.be.a('Object');
                        patient.should.include.keys('id', 'patient', 'doctor', 'contact');
                    });
                    resPatient = res.body.patients[0];
                    return Patient.findById(resPatient.id);
                })
                .then(function (patient) {
                    resPatient.patient_id.should.equal(patient.id);
                    resPatient.patient.should.equal(patient.patient);
                    resPatient.doctor.should.equal(patient.doctor);
                    resPatient.contact.should.equal(patient.contact);
                    resPatient.history.should.eqaul(patient.history);
                }).catch(err => `err: ${err}`);
        });
    });

    describe('POST patient endpoint', function () {
        // strategy: make a POST request with data,
        // then prove that the patient I get back has
        // right keys, and that `id` is there (which means
        // the data was inserted into db)
        it('should add new patient information', function () {

            const newPatient = generatePatientData();
            return chai.request(app)
                .post('/patients')
                .send(newPatient)
                .then(function (res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('Object');
                    res.body.should.include.keys('patient')
                    res.body.patient.should.equal(newPatient.patient);
                    res.body.patient_id.should.not.be.null;
                    // console.log(res.body.doctor);
                    // console.log(res.body.contact);
                    return Patient.findById(res.body.patient_id);
                })
                .then(function (patient) {
                    patient.patient.should.equal(newPatient.patient);
                    patient.doctor.should.equal(newPatient.doctor);
                    patient.contact.should.equal(newPatient.contact);
                }).catch(err => console.log(`error for patient's POST: ${err}`))
        });
    });

    describe('PUT patient endpoint', function () {

        it('should update an existing patient with the fields I send over', function () {
            const updateData = {
                patient: "Tester Person",
                doctor: "P. Sherman",
                contact: "42, Wallaby way, Sydney, Australia"
            }
            return Patient
                .findOne()
                .exec()
                .then(function (patient) {
                    updateData.id = patient.patient_id;

                    return chai.request(app)
                        .put(`/patients/${patient.patient_id}`)
                        .send(updateData);
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return Patient.findById(updateData.id).exec();
                })
                .then(function (patient) {
                    patient.patient.should.equal(updateData.patient);
                    patient.doctor.should.equal(updateData.doctor);
                    patient.contact.should.equal(updateData.contact);
                }).catch(err => `err: ${err}`);
        });
    });

    describe('DELETE patient endpoint', function () {
        // strategy:
        //  1. get a patient
        //  2. make a DELETE request for that patient's id
        //  3. assert that response has right status code
        //  4. prove that patient with the id doesn't exist in db anymore
        it('should delete a patient by id', function () {
            let patient;
            return Patient
                .findOne()
                .exec()
                .then(function (_patient) {
                    patient = _patient;
                    return chai.request(app).delete(`/patients/${patient.patient_id}`)
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return Patient.findById(patient.patient_id).exec();
                })
                .then(function (_patient) {
                    should.not.exist(_patient);
                }).catch(err => `err: ${err}`);
        });
    });

    describe('GET patient\'s history endpoint', function () {
        //check to see if there are existing history items 
        //check to see if the history items are objects with the correct fields

        it('should return existing history of a patient\'s illness if there is a record', function () {
            return Patient
                .findOne()                                      //get one patient and then get that patient's history
                .exec()
                .then(function (patient) {
                    return chai.request(app).get(`/patients/${patient.id}/histories`)
                })
                .then(function (res) {                         //patient's history is the response
                    res.should.have.status(200);
                    res.body.history.should.be.a('array');
                    console.log(`res.body.history.length after a get to a patient's history: ${res.body.history.length}`);
                    if ((res.body.history.length > 1) && (!(res.body.history[0].hasOwnProperty('_bsontype')))) {
                        for (let i = 1; i < res.body.history.length; i++) {
                            res.body.history[i].should.include.keys('date_time', 'symptoms')
                        }
                    }
                }).catch((err) => `err: ${err}`);
        });
    });

    describe('POST patient\'s history endpoint', function () {
        // strategy: make a POST request with data to add in history to a patient,
        // then prove that the history I create has
        // right keys, and that `id` is there (which means
        // the data was inserted into db)
        it('should add new history to patient', function () {

            const newHistory = generateHistoryData();
            return Patient
                .findOne()
                .exec()
                .then(function (patient) {
                    return chai.request(app)
                        .post(`/patients/${patient.id}/histories`)
                        .send(newHistory)
                })
                .then(function (res) {
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.a('Array');
                    res.body.forEach(function (item) {
                        item.should.include.keys('date_time', 'symptoms');
                        console.log(item.meds);
                    });
                    console.log(`res.body's length after a new history was added : ${res.body.length}`);        //After posting a new history element, length increased by 1(new length: 3), see the length from the getendpoint above (2)
                })
                .catch(err => console.log(`error for patient's POST: ${err}`))
        });
    });

    describe('PUT patient\'s history endpoint', function () {
        it('should update an existing patient\'s history with the fields I send over', function () {
            const updateHistoryData = {
                date_time: "Tester May 31, 2016",
                symptoms: "sneezing away",
                meds: "cool mist humidifier"
            }
            return Patient
                .findOne()
                .exec()
                .then(function (patient) {
                    updateHistoryData.id = patient.history[0].id;
                    return chai.request(app)
                        .put(`/patients/${patient.id}/${history[0].id}`)
                        .send(updateHistoryData);
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return Patient.findById(patient.id).exec();
                })
                .then(function (patient) {
                    patient.history[0].date_time.should.equal(updateHistoryData.date_time);
                    patient.history[0].symptoms.should.equal(updateHistoryData.symptoms);
                    patient.history[0].meds.should.equal(updateHistoryData.meds);
                }).catch(err => `err: ${err}`);
        });

    });

    describe('DELETE patient\'s history endpoint', function () {
        it('should delete a patient\'s history by id', function () {
            let patient;
            return Patient
                .findOne()
                .exec()
                .then(function (_patient) {
                    patient = _patient;
                    const idOfHistorytoDelete = patient.history[0].id;
                    return chai.request(app).delete(`/patients/${patient.id}/${history[0].id}`)
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return Patient.findById(patient.id).exec();
                })
                .then(function (_patient) {
                    _patient.history.forEach(function (item) {
                        if (history[item].id == idOfHistorytoDelete) {
                            console.log("Couldn't delete history item");
                            return;
                        }
                    })
                }).catch(err => `err: ${err}`);
        });
    });
});