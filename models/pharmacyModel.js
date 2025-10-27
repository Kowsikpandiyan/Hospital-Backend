// backend/models/pharmacyModel.js
import mongoose from "mongoose";

const pharmacySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    license: { type: String, required: true },
    address: { type: Object, required: true },
    image: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const pharmacyModel = mongoose.models.pharmacy || mongoose.model('pharmacy', pharmacySchema);

export default pharmacyModel;
