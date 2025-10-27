// backend/models/hospitalModel.js
import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { 
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, default: "Tamil Nadu" },
        pincode: { type: String, required: true }
    },
    contactInfo: {
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    image: { type: String, default: "" },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'doctor' }],
    createdAt: { type: Date, default: Date.now }
});

const hospitalModel = mongoose.models.hospital || mongoose.model('hospital', hospitalSchema);

export default hospitalModel;
