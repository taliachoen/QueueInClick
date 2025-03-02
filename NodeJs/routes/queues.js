import express from 'express';
import { postMessage } from '../database/messagesdb.js';  // ייבוא הפונקציה המתאימה להוספת הודעה
import {
    postQueue,
    getQueues,
    getQueueById,
    checkSlotAvailability,
    getQueuesByDateAndBusinessOwner,
    getQueuesByFullDateAndBusinessOwner,
    cancelQueueByCode,
    getFilteredQueues,
    getQueuesByCustomer,
    updateExistQueue,
    updateQueue,
    updateEndedAppointments,
    isNextMonthAvailable,
    updateQueueStatus
} from '../database/queuesdb.js';
import { calculateAvailableSlots, addMinutesToTime, isSlotOverlapping } from './professionals.js';  // קישור לפונקציות שהגדרת

const router = express.Router();


// הוספת פגישה חדשה
router.post('/addNewQueue', async (req, res) => {
    const { businessName, data, startTime, serviceType, customerId } = req.body;  // קבלת פרטי הפגישה
    console.log("addQueue", businessName, data, startTime, serviceType, customerId);
    try {
       
        const result = await postQueue( businessName, serviceType, customerId, data, startTime, 'scheduled'); // קריאה לפונקציה המוסיפה
       console.log("result" , result);
       
        if (result) {
            res.status(200).json({ message: 'Queue added successfully', queue: result });
        } else {
            res.status(400).json({ message: 'Failed to add queue' });
        }

       } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: error.message });
    }
});

// מבטל את כל הפגישות של יום מסוים
router.put('/cancel/:date/:userId', async (req, res) => {
    const { date, userId } = req.params;  // מקבל את התאריך ו-id של בעל העסק
    console.log("selectedDay", date, userId);
    try {
        const appointments = await getQueuesByFullDateAndBusinessOwner(date, userId);  // שואל את כל הפגישות של אותו יום

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for the given date.' });
        }

        // עבור כל פגישה ביום זה, עדכן את הסטטוס שלה ל- "בוטלה" ושלח הודעה ללקוח
        for (const appointment of appointments) {
            await updateQueueStatus(appointment.QueueCode, 'cancelled');
            const content = `Your appointment on ${appointment.date} at ${appointment.hour} has been canceled.`;  // תוכן ההודעה
            const title = 'Appointment Cancellation';  // כותרת ההודעה
            const queueCode = appointment.QueueCode;
            const isRead = false;
            await postMessage(queueCode, isRead, content, title, appointment.date);  // שלח את ההודעה
        }

        res.status(200).json({ message: 'All appointments for the day have been canceled and notifications sent.' });
    } catch (error) {
        console.error('Error canceling appointments:', error);
        res.status(500).json({ message: 'Error canceling appointments.' });
    }
});

// קבלת פגישות מסוננות על פי פרמטרים
router.get('/allAvailableQueue/byBusinessNameAndService', async (req, res) => {
    try {
        const { businessName, serviceTypeCode, selectedDate } = req.query;  // קבלת פרמטרים של מקצוע וסוג שירות
        console.log("idProfessional, serviceTypeCo77", businessName, serviceTypeCode, selectedDate);

        const details = await getFilteredQueues(businessName, serviceTypeCode, selectedDate);  // שלח לבסיס הנתונים את הבקשה לפגישות מסוננות

        if (!details) {
            return res.status(404).json({ message: 'Details not found.' });
        }
        res.json(details);
    } catch (error) {
        console.error('Error fetching queue data:', error);
        res.status(500).json({ message: error.message });
    }
});

// קבלת כל הפגישות של בעל עסק בתאריך מלא
router.get('/date/:formattedDate/:userid', async (req, res) => {
    const { formattedDate, userid } = req.params;  // קבלת תאריך בפורמט ו-id של בעל העסק
    try {
        const queues = await getQueuesByFullDateAndBusinessOwner(formattedDate, userid);  // שלח לבסיס הנתונים את הבקשה לפגישות בתאריך ובעל עסק
        res.json(queues);
    } catch (error) {
        console.error('Error fetching queues by date:', error);
        res.status(500).json({ message: error.message });
    }
});

// קבלת כל הפגישות בחודש ושנה מסוימים של בעל העסק
router.get('/allQueue/:month/:year/:userid', async (req, res) => {
    const { month, year, userid } = req.params;  // קבלת חודש, שנה ו-id של בעל העסק
    try {
        const queues = await getQueuesByDateAndBusinessOwner(month, year, userid);  // שלח לבסיס הנתונים את הבקשה לפגישות של חודש ושנה
        res.json(queues);
    } catch (error) {
        console.error('Error fetching queues by date:', error);
        res.status(500).json({ message: error.message });
    }
});

// קבלת פגישות של לקוח מסוים
router.get('/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;  // קבלת id של הלקוח
        const queues = await getQueuesByCustomer(customerId);  // שלח לבסיס הנתונים את הבקשה לפגישות של הלקוח
        res.json(queues);
    } catch (error) {
        console.error('Error fetching queues for customer:', error);
        res.status(500).json({ message: error.message });
    }
});



// עדכון פגישות שהסתיימו
router.put('/updateEndedAppointments', async (req, res) => {
    try {
        await updateEndedAppointments();  // עדכן פגישות שהסתיימו
        res.json({ message: 'Ended appointments updated successfully' });
    } catch (error) {
        console.error('Error updating ended appointments:', error);
        res.status(500).json({ message: error.message });
    }
});

// ביטול פגישה מסוימת לפי קוד
router.put('/cancel/:queueCode', async (req, res) => {
    try {
        const { queueCode } = req.params;  // קבלת קוד הפגישה
        const result = await cancelQueueByCode(queueCode);  // ביטול הפגישה
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Queue not found' });
        }
        res.status(200).json({ message: 'Queue cancelled successfully' });
    } catch (error) {
        console.error('Error canceling queue:', error);
        res.status(500).json({ message: error.message });
    }
});

// עדכון פגישה קיימת
router.put('/update/:QueueCode', async (req, res) => {
    try {
        const { QueueCode } = req.params;  // קבלת קוד הפגישה
        const { customerId, Status } = req.body;  // קבלת פרטי הלקוח וסטטוס הפגישה
        await updateExistQueue(QueueCode, customerId, Status);  // עדכון הפגישה
        res.json({ message: 'Queue updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// הוספת פגישה חדשה
router.post('/', async (req, res) => {
    try {
        const { professionalServiceCode, customerCode, date, hour, status } = req.body;  // קבלת פרטי הפגישה
        const Queue = await postQueue(professionalServiceCode, customerCode, date, hour, status);  // הוספת פגישה חדשה
        res.json({ Queue, message: 'Queue added successfully' });
    } catch (error) {
        res.status(201).json({ message: error.message });
    }
});

// מחיקת פגישה לפי מזהה
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;  // קבלת מזהה הפגישה
        const Queue = await deleteQueue(id);  // מחיקת הפגישה
        res.json({ Queue, message: 'Queue deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// פתיחת לוח זמנים ליום מסוים
router.post('/openDaySchedule/:formattedDate', async (req, res) => {
    const { formattedDate } = req.params;  // קבלת תאריך פתיחת הלוח
    try {
        await openDaySchedule(formattedDate);  // פתיחת לוח הזמנים עבור התאריך
        res.json({ message: `Day schedule for ${formattedDate} has been opened successfully.` });
    } catch (error) {
        console.error('Error opening day schedule:', error);
        res.status(500).json({ message: error.message });
    }
});


// קבלת כל הפגישות
router.get('/appointments', async (req, res) => {
    try {
        const appointments = await getQueues();  // קבלת כל הפגישות
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: error.message });
    }
});

// קבלת פגישות לפי מזהה מקצוען
router.get('/appointments/professional/:professionalId', async (req, res) => {
    const { professionalId } = req.params;  // קבלת מזהה המקצוען

    try {
        const appointments = await getQueueById(professionalId);  // קבלת הפגישות של המקצוען
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments for professional:', error);
        res.status(500).json({ message: error.message });
    }
});

// חישוב זמינות פגישות עבור יום מסוים
router.get('/appointments/available-slots/:professionalId/:date', async (req, res) => {
    const { professionalId, date } = req.params;  // קבלת מזהה המקצוען ותאריך

    try {
        const appointments = await getQueueById(professionalId);  // קבלת הפגישות של המקצוען
        const dayAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startTime);
            const targetDate = new Date(date);
            return appointmentDate.toDateString() === targetDate.toDateString();
        });

        const availableSlots = calculateAvailableSlots(dayAppointments, req.query.duration);  // חישוב הזמנים הפנויים

        res.json(availableSlots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: error.message });
    }
});

// חישוב זמינות פגישות עבור חודש הבא
router.get('/appointments/available-slots/nextMonth/:professionalId', async (req, res) => {
    const { professionalId } = req.params;  // קבלת מזהה המקצוען

    try {
        const appointments = await getQueueById(professionalId);  // קבלת הפגישות של המקצוען
        const nextMonthAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.startTime);
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return appointmentDate.getMonth() === nextMonth.getMonth();
        });

        const availableSlots = calculateAvailableSlots(nextMonthAppointments, req.query.duration);  // חישוב הזמנים הפנויים
        res.json(availableSlots);
    } catch (error) {
        console.error('Error fetching available slots for next month:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;

















     // const appointments = await getQueueByNameBusiness(businessName);  // קבלת כל הפגישות הקיימות של המקצוען
        // for (let appointment of appointments) {
        //     const existingSlot = { start: appointment.startTime, end: appointment.endTime };  // הגדרת שעות הפגישה הקיימת
        //     const newSlot = { start: startTime, end: endTime };  // הגדרת שעות הפגישה החדשה

        //     // בדיקת אם השעות מתנגשויות
        //     if (isSlotOverlapping(existingSlot, newSlot, data)) {
        //         return res.status(400).json({ message: 'The selected time slot is already taken.' });
        //     }
        // }

        // await postQueue(businessName, data, startTime, endTime, serviceType, customerId);  // הוספת הפגישה החדשה
        // res.status(200).json({ message: 'Appointment booked successfully' });



// const appointments = await getQueueByNameBusiness(businessName);  // קבלת כל הפגישות הקיימות של המקצוען
//         for (let appointment of appointments) {
//             const existingSlot = { start: appointment.startTime, end: appointment.endTime };  // הגדרת שעות הפגישה הקיימת
//             const newSlot = { start: startTime, end: endTime };  // הגדרת שעות הפגישה החדשה

//             // בדיקת אם השעות מתנגשויות
//             if (isSlotOverlapping(existingSlot, newSlot, data)) {
//                 return res.status(400).json({ message: 'The selected time slot is already taken.' });
//             }
//         }

//         await postQueue(businessName, data, startTime, endTime, serviceType, customerId);  // הוספת הפגישה החדשה
//         res.status(200).json({ message: 'Appointment booked successfully' });



// router.post('/addNewQueue', async (req, res) => {
//     try {
//       const { businessName, serviceType, customerId, data, time } = req.body; // קבלת הנתונים מהבקשה

//       const result = await postQueue(businessName, serviceType, customerId, data, time, 'scheduled'); // קריאה לפונקציה המוסיפה

//       if (result) {
//         res.status(200).json({ message: 'Queue added successfully', queue: result });
//       } else {
//         res.status(400).json({ message: 'Failed to add queue' });
//       }
//     } catch (error) {
//       console.error('Error adding queue:', error);
//       res.status(500).json({ message: error.message });
//     }
//   });



// בדיקת זמינות חודש הבא לביצוע הזמנות עבור בעל העסק
// router.get('/isAvailable/nextMonth/:businessOwnerId', async (req, res) => {
//     try {
//         const { businessOwnerId } = req.params;  // קבלת id של בעל העסק
//         const isAvailable = await isNextMonthAvailable(businessOwnerId);  // בדיקת הזמינות לחודש הבא
//         res.json({ isNextMonthAvailable: isAvailable });
//     } catch (error) {
//         console.error('Error checking next month availability:', error);
//         res.status(500).json({ message: error.message });
//     }
// });