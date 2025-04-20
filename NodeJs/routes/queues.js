import express from 'express';
import { notifyAppointmentCancelled , notifyAppointmentAdd } from "../socket.js";
import { postMessage } from '../database/messagesdb.js';  // ייבוא הפונקציה המתאימה להוספת הודעה
import {
    postQueue,
    getQueues,
    getQueueById,
    getQueuesByDateAndBusinessOwner,
    getQueuesByFullDateAndBusinessOwner,
    cancelQueueByCode,
    getFilteredQueues,
    getQueuesByCustomer,
    updateExistQueue,
    updateEndedAppointments,
    updateQueueStatus,
    openDaySchedule
} from '../database/queuesdb.js';
import { calculateAvailableSlots  } from './professionals.js';
import {  getIidProfessionalByBusinessName } from '../database/professionalsdb.js';
// import { io } from '../socket.js';
const router = express.Router();

// הוספת פגישה חדשה
router.post('/addNewQueue', async (req, res) => {
    const { businessName, data, startTime, serviceType, customerId } = req.body;  // קבלת פרטי הפגישה
    try {

        const result = await postQueue(businessName, serviceType, customerId, data, startTime, 'scheduled'); // קריאה לפונקציה המוסיפה

        if (result) {
            const idProfessional = await getIidProfessionalByBusinessName(businessName);
            notifyAppointmentAdd(result.QueueCode, idProfessional[0].idProfessional);
            // io.emit("newAppointment", result);
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

router.put("/cancel/:queueCode", async (req, res) => {
    const { queueCode } = req.params;
    try {
        // שליפת כל התורים של הלקוח
        const queues = await getQueuesByCustomer(req.body.customerId);
        // חיפוש התור לפי קוד התור
        const appointment = queues.find(queue => queue.QueueCode == queueCode);
        const result = await cancelQueueByCode(queueCode);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Queue not found" });
        }

        // שליחת הודעת הצלחה ללקוח
        res.json({ message: "Appointment cancelled successfully" });
        const idProfessional = await getIidProfessionalByBusinessName(appointment.businessName);
        // שליחת הודעה על ביטול התור למערכת - לאחר שליחת התשובה ללקוח
        notifyAppointmentCancelled(queueCode, idProfessional[0].idProfessional);
    } catch (error) {
        console.error(error);
        // ודא שלא נשלחת תשובה לפני כן
        if (!res.headersSent) {
            res.status(500).json({ message: "Error cancelling appointment" });
        }
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
router.post('/openDaySchedule', async (req, res) => {
    try {
        await openDaySchedule();  // פתיחת לוח הזמנים עבור התאריך
        res.json({ message: `Day schedule has been opened successfully.` });
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