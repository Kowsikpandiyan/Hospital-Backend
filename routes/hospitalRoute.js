// backend/routes/hospitalRoute.js
import express from 'express';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import authUser from '../middlewares/authUser.js';
import { 
    addHospital, 
    getAllHospitals, 
    updateHospital, 
    deleteHospital,
    getHospitalsWithDoctors,
    rateDoctorByPatient 
} from '../controllers/hospitalController.js';

const hospitalRouter = express.Router();

// Admin routes
hospitalRouter.post('/add', authAdmin, upload.single('image'), addHospital);
hospitalRouter.get('/all', authAdmin, getAllHospitals);
hospitalRouter.post('/update', authAdmin, upload.single('image'), updateHospital);
hospitalRouter.post('/delete', authAdmin, deleteHospital);

// Public routes
hospitalRouter.get('/list', getHospitalsWithDoctors);

// User routes
hospitalRouter.post('/rate-doctor', authUser, rateDoctorByPatient);

export default hospitalRouter;
