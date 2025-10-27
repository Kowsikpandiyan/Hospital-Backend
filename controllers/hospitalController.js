// backend/controllers/hospitalController.js
import hospitalModel from '../models/hospitalModel.js';
import doctorModel from '../models/doctorModel.js';
import { v2 as cloudinary } from 'cloudinary';

// Add new hospital
const addHospital = async (req, res) => {
    try {
        const { name, address, city, pincode, phone, email } = req.body;
        const imageFile = req.file;

        if (!name || !address || !city || !pincode || !phone || !email) {
            return res.json({ success: false, message: "All fields are required" });
        }

        let imageUrl = "";
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        }

        const hospitalData = {
            name,
            location: { address, city, pincode },
            contactInfo: { phone, email },
            image: imageUrl
        };

        const newHospital = new hospitalModel(hospitalData);
        await newHospital.save();

        res.json({ success: true, message: "Hospital added successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all hospitals
const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await hospitalModel.find({}).populate({
            path: 'doctors',
            select: 'name speciality image rating available'
        });
        res.json({ success: true, hospitals });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update hospital
const updateHospital = async (req, res) => {
    try {
        const { hospitalId, name, address, city, pincode, phone, email } = req.body;
        const imageFile = req.file;

        const updateData = {
            name,
            location: { address, city, pincode, state: "Tamil Nadu" },
            contactInfo: { phone, email }
        };

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        await hospitalModel.findByIdAndUpdate(hospitalId, updateData);
        res.json({ success: true, message: "Hospital updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete hospital
const deleteHospital = async (req, res) => {
    try {
        const { hospitalId } = req.body;
        
        // Remove hospital reference from all doctors
        await doctorModel.updateMany(
            { hospitalId: hospitalId },
            { $set: { hospitalId: null } }
        );
        
        await hospitalModel.findByIdAndDelete(hospitalId);
        res.json({ success: true, message: "Hospital deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get hospitals with doctors sorted by rating (for frontend) - UPDATED to show all doctors
const getHospitalsWithDoctors = async (req, res) => {
    try {
        const hospitals = await hospitalModel.find({ 'location.state': 'Tamil Nadu' });
        
        const hospitalsWithDoctors = await Promise.all(
            hospitals.map(async (hospital) => {
                const doctors = await doctorModel
                    .find({ hospitalId: hospital._id }) // Removed available: true filter
                    .select('name speciality image rating totalRatings fees experience address available')
                    .sort({ rating: -1, totalRatings: -1 });
                
                return {
                    ...hospital.toObject(),
                    doctors
                };
            })
        );
        
        res.json({ success: true, hospitals: hospitalsWithDoctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Add rating to doctor
const rateDoctorByPatient = async (req, res) => {
    try {
        const { doctorId, patientId, rating, review } = req.body;
        
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }
        
        // Check if patient already rated
        const existingReviewIndex = doctor.patientReviews.findIndex(
            r => r.patientId === patientId
        );
        
        if (existingReviewIndex !== -1) {
            // Update existing review
            doctor.patientReviews[existingReviewIndex] = {
                patientId,
                rating,
                review,
                date: new Date()
            };
        } else {
            // Add new review
            doctor.patientReviews.push({ patientId, rating, review });
            doctor.totalRatings += 1;
        }
        
        // Calculate new average rating
        const totalRating = doctor.patientReviews.reduce((sum, r) => sum + r.rating, 0);
        doctor.rating = totalRating / doctor.patientReviews.length;
        
        await doctor.save();
        res.json({ success: true, message: "Rating submitted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { 
    addHospital, 
    getAllHospitals, 
    updateHospital, 
    deleteHospital, 
    getHospitalsWithDoctors,
    rateDoctorByPatient 
};
