// backend/models/medicineModel.js
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    genericName: { type: String },
    manufacturer: { type: String },
    category: { type: String }, // tablets, syrup, injection, etc.
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    batchNumber: { type: String },
    description: { type: String },
    available: { type: Boolean, default: true },
    minStockLevel: { type: Number, default: 10 },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'pharmacy' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto-update availability based on quantity
medicineSchema.pre('save', function(next) {
    this.available = this.quantity > 0;
    this.updatedAt = new Date();
    next();
});

const medicineModel = mongoose.models.medicine || mongoose.model('medicine', medicineSchema);

export default medicineModel;
