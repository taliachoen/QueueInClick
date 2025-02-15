

import express from 'express';
import { getAllProfessionals, postProfessional, getProfessionalByEmailAndPassword, getAllBuisnessNames, getProfessionalById, getProfessionalsByDomainAndType, getProfessionalByName, getProfessionalDetails, updateProfessional } from '../database/professionalsdb.js';
import { postProfessionalService } from '../database/professional_servicesdb.js';
import { postSchedule } from '../database/scheduledb.js';
import { getCityById } from '../database/citiesdb.js';
import { getDomain } from '../database/domainsdb.js';
import pool from '../database/database.js';


const route = express.Router();



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


// רישום עסק חדש
route.post('/registerBusiness', async (req, res) => {
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

        console.log("000", idProfessional,
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
            logo,
            services,
            workingHours,);


        // הוספת מקצוען חדש לטבלת professionals
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

        // הוספת שירותים לטבלת professional_services
        for (const service of services) {
            await postProfessionalService(professionalId, service.serviceType, service.price, service.duration);
        }
        // הוספת שעות עבודה לטבלת schedules
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

// // המסלול הנכון לקבלת בעל מקצוע לפי ID
// route.get('/:id', async (req, res) => {
//     console.log("shira")
//     try {
//         const { id } = req.params;  // הפוך את המפתח ל-idProfessional (לא id)
//         const professional = await getProfessionalById(id);

//         if (professional) {
//             return res.json(professional);  // החזר את המידע על בעל המקצוע
//         }
//         res.status(404).json({ message: 'Professional not found' });
//     } catch (error) {
//         console.error('Error checking ID existence:', error);
//         res.status(500).json({ message: error.message });
//     }
// });


// קבלת כל המקצוענים
route.get('/', async (req, res) => {
    try {
        const professionals = await getAllProfessionals();
        res.json(professionals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// הוספת מנהל קיים
route.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
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
                logo: user.logo // הוספת שדה הלוגו
            };
            res.status(200).json(userContextData);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).send('Error querying the database');
        console.error('Error in login route:', error);
    }
});



// קבלת כל שמות בעלי העסק הקיימים
route.get('/business_name', async (req, res) => {
    try {
        const business_names = await getAllBuisnessNames();
        res.json(business_names);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// קבלת מקצוענים לפי תחום וסוג שירות
route.get('/type_service', async (req, res) => {
    try {
        const { field, type } = req.query;
        const professionals = await getProfessionalsByDomainAndType(field, type);
        res.json(professionals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// קבלת פרטים של מקצוען לפי שם העסק וסוג השירות
route.get('/details', async (req, res) => {
    try {
        const { businessName, serviceType } = req.query;
        const details = await getProfessionalDetails(businessName, serviceType);
        if (!details) {
            return res.status(404).json({ message: 'Details not found.' });
        }
        res.json(details);
    } catch (error) {
        console.error("Details not found")
        res.status(500).json({ message: error.message });
    }
});

// קבלת מקצוען לפי שם העסק
route.get('/:business_name', async (req, res) => {
    try {
        const { business_name } = req.params;
        const professional = await getProfessionalByName(business_name);
        if (!professional) {
            return res.status(404).json({ message: 'Professional not found.' });
        }
        res.json(professional);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// עדכון פרטי מקצוען
// route.put('/:userId', async (req, res) => {
//     try {
//         const { userId } = req.params;
//         console.log("Updating user:", userId, req.body);
//         const updatedUser = await updateProfessional(userId, req.body);
//         console.log(updatedUser, "lala");
//         res.json(updatedUser, { message: 'Professional updated successfully' });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });
// route.put('/:userId', async (req, res) => {
//     try {
//         const { userId } = req.params; // הגדרת userId לפני השימוש בו
//         console.log("Updating user:", userId, req.body);

//         const updatedUser = await updateProfessional(userId, req.body);
//         console.log(updatedUser, "lala");

//         res.json({ updatedUser, message: 'Professional updated successfully' });
//     } catch (error) {
//         console.error("Error updating user:", error);
//         res.status(400).json({ message: error.message });
//     }
// });
route.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("🔄 עדכון בעל מקצוע:", userId, req.body);

        const updatedUser = await updateProfessional(userId, req.body);
        console.log("✅ נתונים מעודכנים שמוחזרים:", updatedUser);

        res.json(updatedUser);
    } catch (error) {
        console.error("❌ שגיאה בעדכון:", error);
        res.status(400).json({ message: error.message });
    }
});


route.get('/id_check/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professional = await getProfessionalById(id);

        if (professional) {
            return res.json({ exists: true });
        }
        res.json({ exists: false });
    } catch (error) {
        console.error('Error checking ID existence:', error);
        res.status(500).json({ message: error.message });
    }
});
export default route;
