const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const patientHistorySchema = new Schema({
    date_time: { type: String, required: true },
    symptoms: { type: String, required: true },
    meds: { type: String }
});

const patientListingSchema = new Schema({
    patient: { type: String, required: true },
    doctor: { type: String },
    contact: { type: String },
    history: [patientHistorySchema]
});

patientListingSchema.methods.apiRepr = function () {
    return {
        patient_id: this._id,
        patient: this.patient,
        doctor: this.doctor,
        contact: this.contact
    };
}

patientHistorySchema.methods.apiRepr = function () {
    return {
        history_id: this._id,
        symptoms: this.symptoms,
        date_time: this.date_time,
        meds: this.meds
    };
}
const Patient = mongoose.model('Patient', patientListingSchema);
const History = mongoose.model('History', patientHistorySchema);

module.exports = { Patient, History };
