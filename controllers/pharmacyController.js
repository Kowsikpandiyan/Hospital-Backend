// backend/controllers/pharmacyController.js
import pharmacyModel from '../models/pharmacyModel.js';
import medicineModel from '../models/medicineModel.js';
import appointmentModel from '../models/appointmentModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Pharmacy Registration
const registerPharmacy = async (req, res) => {
    try {
        const { name, email, password, phone, license, address } = req.body;

        // Check if pharmacy already exists
        const exists = await pharmacyModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Pharmacy already registered" });
        }

        // Validate
        if (!name || !email || !password || !phone || !license) {
            return res.json({ success: false, message: "All fields are required" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const pharmacyData = {
            name,
            email,
            password: hashedPassword,
            phone,
            license,
            address: JSON.parse(address)
        };

        const newPharmacy = new pharmacyModel(pharmacyData);
        await newPharmacy.save();

        res.json({ success: true, message: "Pharmacy registered successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Pharmacy Login
const loginPharmacy = async (req, res) => {
    try {
        const { email, password } = req.body;
        const pharmacy = await pharmacyModel.findOne({ email });

        if (!pharmacy) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, pharmacy.password);
        if (isMatch) {
            const token = jwt.sign({ id: pharmacy._id }, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Pharmacy Profile
const getPharmacyProfile = async (req, res) => {
    try {
        const { pharmacyId } = req.body;
        const pharmacy = await pharmacyModel.findById(pharmacyId).select('-password');
        res.json({ success: true, pharmacy });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add Medicine to Inventory
const addMedicine = async (req, res) => {
    try {
        const { 
            name, genericName, manufacturer, category, 
            quantity, price, expiryDate, batchNumber, 
            description, minStockLevel, pharmacyId 
        } = req.body;

        if (!name || !quantity || !price || !expiryDate) {
            return res.json({ success: false, message: "Required fields missing" });
        }

        const medicineData = {
            name,
            genericName,
            manufacturer,
            category,
            quantity: Number(quantity),
            price: Number(price),
            expiryDate,
            batchNumber,
            description,
            minStockLevel: Number(minStockLevel) || 10,
            pharmacyId
        };

        const newMedicine = new medicineModel(medicineData);
        await newMedicine.save();

        res.json({ success: true, message: "Medicine added successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get All Medicines
const getMedicines = async (req, res) => {
    try {
        const { pharmacyId } = req.body;
        const medicines = await medicineModel.find({ pharmacyId }).sort({ name: 1 });
        res.json({ success: true, medicines });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Medicine Stock
const updateMedicineStock = async (req, res) => {
    try {
        const { medicineId, quantity, pharmacyId } = req.body;
        
        const medicine = await medicineModel.findOne({ _id: medicineId, pharmacyId });
        if (!medicine) {
            return res.json({ success: false, message: "Medicine not found" });
        }

        medicine.quantity = Number(quantity);
        await medicine.save();

        res.json({ success: true, message: "Stock updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete Medicine
const deleteMedicine = async (req, res) => {
    try {
        const { medicineId, pharmacyId } = req.body;
        
        await medicineModel.findOneAndDelete({ _id: medicineId, pharmacyId });
        res.json({ success: true, message: "Medicine deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get All Prescriptions
const getAllPrescriptions = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({
            prescription: { $exists: true },
            isCompleted: true
        }).populate('docData userData').sort({ date: -1 });

        const prescriptions = appointments.filter(app => app.prescription && app.prescription.medicines);
        
        res.json({ success: true, prescriptions });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Check Medicine Availability for Prescription
const checkPrescriptionAvailability = async (req, res) => {
    try {
        const { prescriptionId, pharmacyId } = req.body;
        
        const appointment = await appointmentModel.findById(prescriptionId);
        if (!appointment || !appointment.prescription) {
            return res.json({ success: false, message: "Prescription not found" });
        }

        const medicines = appointment.prescription.medicines;
        const availabilityStatus = [];

        for (const medicine of medicines) {
            const medicineInStock = await medicineModel.findOne({
                pharmacyId,
                name: { $regex: medicine.name, $options: 'i' },
                available: true
            });

            availabilityStatus.push({
                medicineName: medicine.name,
                prescribed: true,
                available: !!medicineInStock,
                inStock: medicineInStock ? medicineInStock.quantity : 0,
                price: medicineInStock ? medicineInStock.price : null
            });
        }

        res.json({ success: true, availabilityStatus });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Dashboard Stats
const getPharmacyDashboard = async (req, res) => {
    try {
        const { pharmacyId } = req.body;
        
        const totalMedicines = await medicineModel.countDocuments({ pharmacyId });
        const availableMedicines = await medicineModel.countDocuments({ pharmacyId, available: true });
        const lowStockMedicines = await medicineModel.find({ 
            pharmacyId, 
            $expr: { $lte: ['$quantity', '$minStockLevel'] } 
        });
        const expiredMedicines = await medicineModel.countDocuments({ 
            pharmacyId, 
            expiryDate: { $lt: new Date() } 
        });

        const dashData = {
            totalMedicines,
            availableMedicines,
            lowStockCount: lowStockMedicines.length,
            expiredCount: expiredMedicines,
            lowStockMedicines: lowStockMedicines.slice(0, 5)
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    registerPharmacy,
    loginPharmacy,
    getPharmacyProfile,
    addMedicine,
    getMedicines,
    updateMedicineStock,
    deleteMedicine,
    getAllPrescriptions,
    checkPrescriptionAvailability,
    getPharmacyDashboard
};
