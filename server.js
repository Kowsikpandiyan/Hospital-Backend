// backend/server.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import hospitalRouter from './routes/hospitalRoute.js'
import pharmacyRouter from './routes/pharmacyRoute.js'
import doctorModel from './models/doctorModel.js'
import pharmacyModel from './models/pharmacyModel.js'
import bcrypt from 'bcryptjs'

// app-config
const app = express()
const port = process.env.port || 5000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/hospital', hospitalRouter)
app.use('/api/pharmacy', pharmacyRouter)

app.get('/',(req,res)=>{
    res.send('API working')
})

// Temporary route to fix all doctors availability
app.get('/fix-doctors', async (req, res) => {
    try {
        await doctorModel.updateMany({}, { available: true });
        res.json({ success: true, message: "All doctors are now available" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// Create test pharmacy endpoint
app.get('/create-test-pharmacy', async (req, res) => {
    try {
        // Check if pharmacy already exists
        const exists = await pharmacyModel.findOne({ email: 'pharmacy@test.com' });
        if (exists) {
            return res.json({ 
                message: 'Test pharmacy already exists.',
                credentials: {
                    email: 'pharmacy@test.com',
                    password: 'pharmacy123'
                }
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('pharmacy123', salt);
        
        // Create pharmacy
        const pharmacyData = {
            name: "Test Pharmacy",
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
        
        res.json({ 
            success: true, 
            message: 'Test pharmacy created!',
            credentials: {
                email: 'pharmacy@test.com',
                password: 'pharmacy123'
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.listen(port, ()=> console.log("Server Started ",port))
