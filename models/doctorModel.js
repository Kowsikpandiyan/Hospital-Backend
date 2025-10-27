// backend/models/doctorModel.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    image: {type:String, required:true},
    speciality: {type:String, required:true},
    degree: {type:String, required:true},
    experience: {type:String, required:true},
    about: {type:String, required:true},
    available: {type:Boolean, default:true}, 
    fees: {type:Number, required:true},
    address: {type:Object, required:true},
    date: {type:Number, required:true},
    slots_booked: {type:Object, default:{}},
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'hospital', default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    patientReviews: [{
        patientId: { type: String },
        rating: { type: Number },
        review: { type: String },
        date: { type: Date, default: Date.now }
    }]
},{minimize:false})

const doctorModel = mongoose.models.doctor || mongoose.model('doctor',doctorSchema)

export default doctorModel
