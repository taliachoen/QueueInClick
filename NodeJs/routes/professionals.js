import express from 'express';
import {
    getAllProfessionals,
    postProfessional,
    getProfessionalByEmailAndPassword,
    getAllBuisnessNames,
    getProfessionalById,
    getProfessionalsByDomainAndType,
    getProfessionalByName,
    getProfessionalDetails,
    updateProfessional
}
    from '../database/professionalsdb.js';
import { postProfessionalService } from '../database/professional_servicesdb.js';
import { postSchedule } from '../database/scheduledb.js';
import { getCityById } from '../database/citiesdb.js';
import { getDomain } from '../database/domainsdb.js';
import { getCityById } from '../database/citiesdb.js';
import { getDomain } from '../database/domainsdb.js';
import pool from '../database/database.js';
import pool from '../database/database.js';
import multer from 'multer';
import path from 'path';

const route = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueFilename = Date.now() + path.extname(file.originalname);
        cb(null, uniqueFilename);
    }
});

const upload = multer({ storage: storage });

// נתיב שמחזיר את המידע של בעל המקצוע כולל העיר והתחום
route.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // שליפת בעל המקצוע מהטבלה
        const [[professional]] = await pool.query(`
            SELECT idProfessional, firstName, lastName, cityCode, domainCode
            FROM professionals
            WHERE idProfessional = ?`, [userId]);

        if (!professional) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        // שליפת שם העיר ושם התחום לפי הקודים
        const city = await getCityById(professional.cityCode);
        const domain = await getDomain(professional.domainCode);

        // החזרת המידע עם שמות במקום קודים
        res.json({
            ...professional,
            cityName: city?.cityName || "Unknown",
            domainName: domain?.domainName || "Unknown"
        });

    } catch (error) {
        console.error("Error fetching professional data:", error);
        res.status(500).json({ message: error.message });
    }
});


route.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`Fetching professional data for userId: ${userId}`);
        const [[professional]] = await pool.query(`
            SELECT idProfessional, firstName, lastName, cityCode, domainCode
            FROM professionals
            WHERE idProfessional = ?`, [userId]);

        if (!professional) {
            console.log(`Professional not found for userId: ${userId}`);
            return res.status(404).json({ message: 'Professional not found' });
        }

        const city = await getCityById(professional.cityCode);
        const domain = await getDomain(professional.domainCode);

        console.log('Returning professional data with city and domain names');
        res.json({
            ...professional,
            cityName: city?.cityName || "Unknown",
            domainName: domain?.domainName || "Unknown"
        });

    } catch (error) {
        console.error("Error fetching professional data:", error);
        res.status(500).json({ message: error.message });
    }
});

route.post('/registerBusiness', upload.single('logo'), async (req, res) => {
    try {
        const {
            step1: {
                idProfessional,
                firstName,
                lastName,
                domainCode,
                startDate,
                address,
                cityCode,
                email,
                business_name,
                phone,
                logo,
            },
            step2: { services },
            passwordProff,
            workingHours
        } = req.body;

        const professionalId = await postProfessional(
            idProfessional,
            firstName,
            lastName,
            domainCode,
            startDate,
            address,
            cityCode,
            email,
            passwordProff,
            business_name,
            phone,
            logo
        );

        for (const service of services) {
            await postProfessionalService(professionalId, service.serviceType, service.price, service.duration);
        }

        for (const dayOfWeek in workingHours) {
            if (workingHours[dayOfWeek].isWorking) {
                await postSchedule(professionalId, dayOfWeek, workingHours[dayOfWeek].start, workingHours[dayOfWeek].end);
            }
        }

        res.json({ ProfessionalId: professionalId, message: 'Business registered successfully' });
    } catch (error) {
        console.error('Error registering business:', error);
        res.status(500).json({ message: error.message });
    }
});

route.get('/', async (req, res) => {
    try {
        console.log("Fetching all professionals");
        const professionals = await getAllProfessionals();
        res.json(professionals);
    } catch (error) {
        console.error("Error fetching all professionals:", error);
        res.status(500).json({ message: error.message });
    }
});

route.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`Logging in with email: ${email}`);
        const user = await getProfessionalByEmailAndPassword(email, password);

        if (user) {
            const userContextData = {
                idProfessional: user.idProfessional,
                firstName: user.firstName,
                lastName: user.lastName,
                domainCode: user.domainCode,
                domainName: user.domainName,
                startDate: user.startDate,
                email: user.email,
                cityCode: user.cityCode,
                cityName: user.CityName,
                address: user.address,
                phone: user.phone,
                business_name: user.business_name,
                logo: user.logo
            };
            console.log(`Login successful for userId: ${user.idProfessional}`);
            res.status(200).json(userContextData);
        } else {
            console.log(`Invalid credentials for email: ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).send('Error querying the database');
    }
});

route.get('/business_name', async (req, res) => {
    try {
        console.log("Fetching all business names");
        const business_names = await getAllBuisnessNames();
        res.json(business_names);
    } catch (error) {
        console.error('Error fetching business names:', error);
        res.status(500).json({ message: error.message });
    }
});

route.get('/type_service', async (req, res) => {
    try {
        const { field, type } = req.query;
        console.log(`Fetching professionals for field: ${field}, type: ${type}`);
        const professionals = await getProfessionalsByDomainAndType(field, type);
        res.json(professionals);
    } catch (error) {
        console.error('Error fetching professionals by domain and type:', error);
        res.status(500).json({ message: error.message });
    }
});

route.get('/details', async (req, res) => {
    try {
        const { businessName, serviceType } = req.query;
        console.log(`Fetching details for businessName: ${businessName}, serviceType: ${serviceType}`);
        const details = await getProfessionalDetails(businessName, serviceType);
        if (!details) {
            console.log(`Details not found for businessName: ${businessName}, serviceType: ${serviceType}`);
            return res.status(404).json({ message: 'Details not found.' });
        }
        res.json(details);
    } catch (error) {
        console.error('Error fetching professional details:', error);
        res.status(500).json({ message: error.message });
    }
});

route.get('/:business_name', async (req, res) => {
    try {
        const { business_name } = req.params;
        console.log(`Fetching professional by business name: ${business_name}`);
        const professional = await getProfessionalByName(business_name);
        if (!professional) {
            console.log(`Professional not found for business_name: ${business_name}`);
            return res.status(404).json({ message: 'Professional not found.' });
        }
        res.json(professional);
    } catch (error) {
        console.error('Error fetching professional by business name:', error);
        res.status(500).json({ message: error.message });
    }
});

route.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("🔄 updating user", userId, req.body);

        const updatedUser = await updateProfessional(userId, req.body);
        console.log("✅ updated values that come back:", updatedUser);

        res.json(updatedUser);
    } catch (error) {
        console.error("❌ error in updating", error);
        res.status(400).json({ message: error.message });
    }
});

route.get('/id_check/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Checking if professional exists for ID: ${id}`);
        const professional = await getProfessionalById(id);
        if (professional) {
            console.log(`Professional exists for ID: ${id}`);
            res.json({ exists: true });
        } else {
            console.log(`Professional not found for ID: ${id}`);
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking professional ID:', error);
        res.status(500).json({ message: error.message });
    }
});

export default route;










// import express from 'express';
// import { getAllProfessionals, postProfessional, getProfessionalByEmailAndPassword, getAllBuisnessNames, getProfessionalById, getProfessionalsByDomainAndType, getProfessionalByName, getProfessionalDetails, updateProfessional } from '../database/professionalsdb.js';
// import { postProfessionalService } from '../database/professional_servicesdb.js';
// import { postSchedule } from '../database/scheduledb.js';



//





// // רישום עסק חדש
// route.post('/registerBusiness', async (req, res) => {
//     try {
//         const {
//             step1: {
//                 idProfessional,
//                 firstName,
//                 lastName,
//                 domainCode,
//                 startDate,
//                 address,
//                 cityCode,
//                 email,
//                 business_name,
//                 phone,
//                 logo,

//             },
//             step2: { services },
//             passwordProff,
//             workingHours
//         } = req.body;

//         console.log("000", idProfessional,
//             firstName,
//             lastName,
//             domainCode,
//             startDate,
//             address,
//             cityCode,
//             email,
//             passwordProff,
//             business_name,
//             phone,
//             logo,
//             services,
//             workingHours,);


//         // הוספת מקצוען חדש לטבלת professionals
//         const professionalId = await postProfessional(
//             idProfessional,
//             firstName,
//             lastName,
//             domainCode,
//             startDate,
//             address,
//             cityCode,
//             email,
//             passwordProff,
//             business_name,
//             phone,
//             logo
//         );

//         // הוספת שירותים לטבלת professional_services
//         for (const service of services) {
//             await postProfessionalService(professionalId, service.serviceType, service.price, service.duration);
//         }
//         // הוספת שעות עבודה לטבלת schedules
//         for (const dayOfWeek in workingHours) {
//             if (workingHours[dayOfWeek].isWorking) {
//                 await postSchedule(professionalId, dayOfWeek, workingHours[dayOfWeek].start, workingHours[dayOfWeek].end);
//             }
//         }
//         res.json({ ProfessionalId: professionalId, message: 'Business registered successfully' });
//     } catch (error) {
//         console.error('Error registering business:', error);
//         res.status(500).json({ message: error.message });
//     }
// });


// // קבלת כל המקצוענים
// route.get('/', async (req, res) => {
//     try {
//         const professionals = await getAllProfessionals();
//         res.json(professionals);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // הוספת מנהל קיים
// route.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await getProfessionalByEmailAndPassword(email, password);

//         if (user) {
//             const userContextData = {
//                 idProfessional: user.idProfessional,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 domainCode: user.domainCode,
//                 domainName: user.domainName,
//                 startDate: user.startDate,
//                 email: user.email,
//                 cityCode: user.cityCode,
//                 cityName: user.CityName,
//                 address: user.address,
//                 phone: user.phone,
//                 business_name: user.business_name,
//                 logo: user.logo // הוספת שדה הלוגו
//             };
//             res.status(200).json(userContextData);
//         } else {
//             res.status(401).json({ message: 'Invalid email or password' });
//         }
//     } catch (error) {
//         res.status(500).send('Error querying the database');
//         console.error('Error in login route:', error);
//     }
// });



// // קבלת כל שמות בעלי העסק הקיימים
// route.get('/business_name', async (req, res) => {
//     try {
//         const business_names = await getAllBuisnessNames();
//         res.json(business_names);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // קבלת מקצוענים לפי תחום וסוג שירות
// route.get('/type_service', async (req, res) => {
//     try {
//         const { field, type } = req.query;
//         const professionals = await getProfessionalsByDomainAndType(field, type);
//         res.json(professionals);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // קבלת פרטים של מקצוען לפי שם העסק וסוג השירות
// route.get('/details', async (req, res) => {
//     try {
//         const { businessName, serviceType } = req.query;
//         const details = await getProfessionalDetails(businessName, serviceType);
//         if (!details) {
//             return res.status(404).json({ message: 'Details not found.' });
//         }
//         res.json(details);
//     } catch (error) {
//         console.error("Details not found")
//         res.status(500).json({ message: error.message });
//     }
// });

// // קבלת מקצוען לפי שם העסק
// route.get('/:business_name', async (req, res) => {
//     try {
//         const { business_name } = req.params;
//         const professional = await getProfessionalByName(business_name);
//         if (!professional) {
//             return res.status(404).json({ message: 'Professional not found.' });
//         }
//         res.json(professional);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });





// export default route;