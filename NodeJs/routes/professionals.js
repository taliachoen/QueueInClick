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
} from '../database/professionalsdb.js';
import { postProfessionalService } from '../database/professional_servicesdb.js';
import { postSchedule } from '../database/scheduledb.js';
import { getCityById } from '../database/citiesdb.js';
import { getDomain } from '../database/domainsdb.js';
import pool from '../database/database.js';
import multer from 'multer';
import path from 'path';
// import { openInitialScheduleForNewProfessional } from '../index.js';

// פונקציות לעבודה עם תורים
export function calculateAvailableSlots(startTime, endTime, duration) {
    const slots = [];
    let currentSlot = startTime;

    while (currentSlot < endTime) {
        const nextSlot = addMinutesToTime(currentSlot, duration);
        if (nextSlot > endTime) break;
        slots.push({ start: currentSlot, end: nextSlot });
        currentSlot = nextSlot;
    }

    return slots;
}

export function addMinutesToTime(timeString, minutes) {
    const [hours, minutesPart] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutesPart + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

export function isSlotOverlapping(existingSlot, newSlot) {
    return (newSlot.start < existingSlot.end && newSlot.end > existingSlot.start);
}

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

// Register business with professional details and logo
// route.post('/registerBusiness', upload.single('logo'), async (req, res) => {
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

// try {
//     // הפעלת הפונקציה לפתיחה אוטומטית של חודש ראשון
//     await openInitialScheduleForNewProfessional(professionalId);
// } catch (error) {
//     res.status(500).json({ message: 'Error registering professional and opening schedule.', error: error.message });
// }



// Get all professionals
route.get('/', async (req, res) => {
    try {
        const professionals = await getAllProfessionals();
        res.json(professionals);
    } catch (error) {
        console.error("Error fetching all professionals:", error);
        res.status(500).json({ message: error.message });
    }
});

// Login professional
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
                business_name: user.business_name
            };
            res.status(200).json(userContextData);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).send('Error querying the database');
    }
});

// Get all business names
route.get('/business_name', async (req, res) => {
    try {
        const business_names = await getAllBuisnessNames();
        res.json(business_names);
    } catch (error) {
        console.error('Error fetching business names:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get professional data by userId
route.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [[professional]] = await pool.query(`
            SELECT idProfessional, firstName, lastName, cityCode, domainCode
            FROM professionals
            WHERE idProfessional = ?`, [userId]);

        if (!professional) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        const city = await getCityById(professional.cityCode);
        const domain = await getDomain(professional.domainCode);

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

// Get professionals by domain and type of service
route.get('/type_service/:searchField/:searchSecondaryField', async (req, res) => {
    try {
        const { searchField, searchSecondaryField } = req.params;
        const professionals = await getProfessionalsByDomainAndType(searchField, searchSecondaryField);
        res.json(professionals);
    } catch (error) {
        console.error('Error fetching professionals by domain and type:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get professional details by business name and service type
route.get('/details/ByNameAndService', async (req, res) => {
    try {
        const { businessName, serviceType } = req.query;
        const details = await getProfessionalDetails(businessName, serviceType);
        if (!details) {
            return res.status(404).json({ message: 'Details not found.' });
        }
        res.json(details);
    } catch (error) {
        console.error('Error fetching professional details:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get professional by business name
route.get('/name/:name', async (req, res) => {
    console.log("777");

    try {
        const { name } = req.params;
        const professional = await getProfessionalByName(name);
        if (!professional) {
            return res.status(404).json({ message: 'Professional not found.' });
        }
        res.json(professional);
    } catch (error) {
        console.error('Error fetching professional by business name:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update professional details
route.put('/:userId', async (req, res) => {
    console.log("888");
    console.log("Request body:", req.body);

    try {
        const { userId } = req.params;
        const updatedUser = await updateProfessional(userId, req.body);
        res.json(updatedUser);
    } catch (error) {
        console.error("❌ error in updating", error);
        res.status(400).json({ message: error.message });
    }
});

// Check if professional exists by ID
route.get('/id_check/:id', async (req, res) => {
    console.log("999");

    try {
        const { id } = req.params;
        const professional = await getProfessionalById(id);
        console.log("id", id, "did", professional);

        if (professional) {
            res.json(professional);
        } else {
            res.status(404).json({ message: 'Professional not found' });
        }
    } catch (error) {
        console.error('Error checking professional by ID:', error);
        res.status(500).json({ message: error.message });
    }
});

export default route;