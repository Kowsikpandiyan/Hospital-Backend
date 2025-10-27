// backend/middlewares/authPharmacy.js
import jwt from 'jsonwebtoken';

const authPharmacy = async (req, res, next) => {
    try {
        const { ptoken } = req.headers;

        if (!ptoken) {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }
        
        const token_decode = jwt.verify(ptoken, process.env.JWT_SECRET);
        req.body.pharmacyId = token_decode.id;
        
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authPharmacy;
