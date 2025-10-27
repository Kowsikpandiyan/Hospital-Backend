// backend/routes/pharmacyRoute.js
import express from 'express';
import {
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
} from '../controllers/pharmacyController.js';
import authPharmacy from '../middlewares/authPharmacy.js';

const pharmacyRouter = express.Router();

// Auth routes
pharmacyRouter.post('/register', registerPharmacy);
pharmacyRouter.post('/login', loginPharmacy);

// Protected routes
pharmacyRouter.get('/profile', authPharmacy, getPharmacyProfile);
pharmacyRouter.post('/add-medicine', authPharmacy, addMedicine);
pharmacyRouter.get('/medicines', authPharmacy, getMedicines);
pharmacyRouter.post('/update-stock', authPharmacy, updateMedicineStock);
pharmacyRouter.post('/delete-medicine', authPharmacy, deleteMedicine);
pharmacyRouter.get('/prescriptions', authPharmacy, getAllPrescriptions);
pharmacyRouter.post('/check-availability', authPharmacy, checkPrescriptionAvailability);
pharmacyRouter.get('/dashboard', authPharmacy, getPharmacyDashboard);

export default pharmacyRouter;
