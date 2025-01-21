import express from 'express'
import { getSchedules, getDaysOff, getSchedule, postSchedule, deleteSchedule, updateSchedule } from '../database/scheduledb.js'

const route = express.Router();
//החזרת הערות מבסיס הנתונים
route.get('/', async (req, res) => {
    try {
        const schedules = await getSchedules();
        res.json(schedules);
    }
    catch (error) {
        res.status(500).json({ messege: error.messege })
    }
});
route.get('/daysOfWeek/:userId', async (req, res) => {
    const { userId } = req.params; // חילוץ userId מפרמטרי ה-URL
    try {
        // קריאה לפונקציה getDaysOff כדי לקבל את ימי החופש
        const daysOff = await getDaysOff(userId);
        // שליחת תגובת JSON עם מערך ה-daysOff
        res.json({ daysOff });
    } catch (error) {
        // טיפול בשגיאות שקורות
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//החזרת הערה לפי מספר זהות
route.get('/:schedule', async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const schedule = await getSchedule(scheduleId);
        // Check if the post exists
        if (!schedule) {
            return res.status(404).json({ message: 'schedule not found.' });
        }
        res.json(schedule);
    }
    catch (error) {
        res.status(500).json({ messege: error.messege })
    }
});

//הכנסת משימה 
route.post('/', async (req, res) => {
    try {
        const { professionalServiceCode, dayOfWeek, startTime, endTime } = req.body;
        const schedule = await postSchedule(professionalServiceCode, dayOfWeek, startTime, endTime);
        res.json({ schedule, message: 'schedule added successfully' });
    }
    catch (error) {
        res.status(201).json({ messege: error.messege })
    }
});

//עדכון פרטי משימה
route.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(req.body)
        await updateSchedule(id, req.body);
        res.json({ message: 'schedule updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// מחיקת הערה לפי מספר זיהוי
route.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const schedule = await deleteSchedule(id);
        res.json({ schedule, message: 'schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});





export default route;