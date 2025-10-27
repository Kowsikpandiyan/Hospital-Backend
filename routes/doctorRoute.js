import express from 'express'
import { appointmentsDoctor, doctorList, loginDoctor,appointmentCancel ,appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, addPrescription, getPrescription} from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

const doctorRouter =express.Router()
doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)
doctorRouter.post('/add-prescription', authDoctor, addPrescription)
doctorRouter.post('/get-prescription', authDoctor, getPrescription)

export default doctorRouter
