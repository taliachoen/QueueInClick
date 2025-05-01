import express from 'express';
import { notifyAppointmentCancelled, notifyAppointmentAdd, notifyAppointmentCancelledByBusiness } from "../socket.js";
import { postMessage } from '../database/messagesdb.js';  // ייבוא הפונקציה המתאימה להוספת הודעה
import {
    postQueue,
    getQueuesByDateAndBusinessOwner,
    getQueuesByFullDateAndBusinessOwner,
    cancelQueueByCode,
    getFilteredQueues,
    getQueuesByCustomer,
    updateQueueStatus,
    getUpcomingQueuesForCustomer,
} from '../database/queuesdb.js';
import { getIidProfessionalByBusinessName, getProfessionalById } from '../database/professionalsdb.js';
const router = express.Router();

// קבלת פגישות מסוננות על פי פרמטרים
router.get('/allAvailableQueue/byBusinessNameAndService', async (req, res) => {
    try {
        const { businessName, serviceTypeCode, selectedDate } = req.query;
        const details = await getFilteredQueues(businessName, serviceTypeCode, selectedDate);
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

//מחזיר את כל התורים של לקוח ספציפי
router.get('/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        let queues = await getQueuesByCustomer(customerId);
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
        // עדכון תורים שעברו
        for (const queue of queues) {
            if (new Date(queue.Date) < new Date(todayDateString) && (queue.Status === "waiting" || queue.Status === "scheduled")) {
                await updateQueueStatus(queue.QueueCode, "finished");
                queue.Status = "finished"; // לעדכן בזיכרון המקומי מיד
            }
        }
        queues = queues.filter(queue => {
            const queueDateString = new Date(queue.Date).toISOString().split('T')[0];
            return (queue.Status === "waiting" || queue.Status === "scheduled") && queueDateString >= todayDateString;
        });

        res.json(queues);
    } catch (error) {
        console.error('Error fetching queues for customer:', error);
        res.status(500).json({ message: error.message });
    }
});

//קבלת כל התורים של לקוח שעברו
router.get('/past/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;

        const queues = await getQueuesByCustomer(customerId);
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const pastQueues = queues.filter(queue => {
            const queueDateString = new Date(queue.Date).toISOString().split('T')[0];
            return queue.Status === "waiting" || queue.Status === "scheduled" || queue.Status === "available" && queueDateString < todayDateString;
        });

        res.json(pastQueues);
    } catch (error) {
        console.error('Error fetching past queues for customer:', error);
        res.status(500).json({ message: error.message });
    }
});

// הוספת פגישה חדשה
router.post('/addNewQueue', async (req, res) => {
    const { businessName, data, startTime, serviceType, customerId } = req.body;  // קבלת פרטי הפגישה
    try {
        const result = await postQueue(businessName, serviceType, customerId, data, startTime, 'scheduled'); // קריאה לפונקציה המוסיפה

        if (result) {
            const idProfessional = await getIidProfessionalByBusinessName(businessName);
            notifyAppointmentAdd(result.QueueCode, idProfessional[0].idProfessional);
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
    const { date, userId } = req.params;
    try {
        const appointments = await getQueuesByFullDateAndBusinessOwner(date, userId);
        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for the given date.' });
        }
        const professional = await getProfessionalById(userId);
        for (const appointment of appointments) {
            await updateQueueStatus(appointment.QueueCode, 'cancelled');
            const content = `Your appointment on ${appointment.Date} at ${appointment.Hour} for ${professional.business_name} to ${appointment.serviceTypeName} has been canceled.`;
            const title = 'Appointment Cancellation';
            const queueCode = appointment.QueueCode;
            const isRead = false;
            const today = new Date();
            await postMessage(queueCode, isRead, content, title, today);
            notifyAppointmentCancelledByBusiness(userId, queueCode);
        }

        res.status(200).json({ message: 'All appointments for the day have been canceled and notifications sent.' });
    } catch (error) {
        console.error('Error canceling appointments:', error);
        res.status(500).json({ message: 'Error canceling appointments.' });
    }
});

//ביטול תור מסוים
router.put("/cancel/:queueCode", async (req, res) => {
    const { queueCode } = req.params;
    try {
        // שליפת כל התורים של הלקוח
        const queues = await getQueuesByCustomer(req.body.customerId);
        // חיפוש התור לפי קוד התור
        const appointment = queues.find(queue => queue.QueueCode == queueCode);
        const result = await cancelQueueByCode(queueCode);
        await updateQueueStatus(queueCode, 'cancelled');
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


// הוספת route בשרת שמחזיר את התורים הקרובים
// ודא שה-Route של ה-GET מוגדר כראוי בצד השרת
router.get('/upcoming/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        console.log("cow")
        // קריאה לפונקציה שתשיב את התורים הקרובים של הלקוח
        const upcomingQueues = await getUpcomingQueuesForCustomer(customerId);
        res.json(upcomingQueues);
    } catch (error) {
        console.error('Error fetching upcoming queues for customer:', error);
        res.status(500).json({ message: error.message });
    }
});



export default router;