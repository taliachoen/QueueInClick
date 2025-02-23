import express from "express";
import customers from './routes/customers.js';
import professionals from './routes/professionals.js';
import professional_services from './routes/professional_services.js';
import comments from './routes/comments.js';
import messages from './routes/messages.js';
import cities from './routes/cities.js';
import queues from './routes/queues.js';
import type_services from './routes/type_services.js';
import schedule from './routes/schedules.js';
import domains from './routes/domains.js';
import cors from 'cors';
import cron from 'node-cron';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());

app.use('/customers', customers);
app.use('/professionals', professionals);
app.use('/professional_services', professional_services);
app.use('/comments', comments);
app.use('/messages', messages);
app.use('/cities', cities);
app.use('/queues', queues);
app.use('/type_service', type_services);
app.use('/schedule', schedule);
app.use('/domains', domains);

// משימה מתוזמנת שתרוץ כל יום ב-00:00
cron.schedule('0 0 * * *', () => {
    console.log('Opening schedule for next day...');
    openNextDaySchedule();
});

// פונקציה שפותחת את היום הבא
const openNextDaySchedule = () => {
    const currentDate = new Date();
    const nextDay = new Date(currentDate.setDate(currentDate.getDate() + 1)); // קובעת את התאריך של היום הבא
    const formattedDate = nextDay.toISOString().split('T')[0];
    
    axios.post(`http://localhost:8080/queues/openDaySchedule/${formattedDate}`)
    .then(response => {
        console.log('Day schedule opened:', response.data);
        console.log(`Schedule for ${formattedDate} opened successfully`);
    })
    .catch(error => {
        console.error('Error opening next day schedule:', error);
    });
};

// שמירת ההגדרות של השרת
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
