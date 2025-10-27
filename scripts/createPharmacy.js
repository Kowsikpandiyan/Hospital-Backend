// backend/scripts/createPharmacy.js
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

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

const pharmacyModel = mongoose.model('pharmacy', pharmacySchema);

const createTestPharmacy = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Check if pharmacy already exists
        const exists = await pharmacyModel.findOne({ email: 'pharmacy@test.com' });
        if (exists) {
            console.log('Test pharmacy already exists!');
            console.log('Email: pharmacy@test.com');
            console.log('Password: pharmacy123');
            process.exit(0);
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('pharmacy123', salt);
        
        // Create pharmacy
        const pharmacyData = {
            name: "City Pharmacy",
            email: "pharmacy@test.com",
            password: hashedPassword,
            phone: "9876543210",
            license: "PH123456",
            address: {
                line1: "123 Main Street",
                line2: "Chennai, Tamil Nadu"
            }
        };
        
        const newPharmacy = new pharmacyModel(pharmacyData);
        await newPharmacy.save();
        
        console.log('Test pharmacy created successfully!');
        console.log('Email: pharmacy@test.com');
        console.log('Password: pharmacy123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating pharmacy:', error);
        process.exit(1);
    }
};

createTestPharmacy();
