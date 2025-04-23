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
<<<<<<< HEAD
import cron from 'node-cron';
import axios from 'axios';
import { setupSocket } from './socket.js'
import { createServer } from 'http';
import pool from './database/database.js'
=======
import {setupSocket} from './socket.js'
import { createServer } from 'http';  

>>>>>>> 646eccb23bbb20f9e385c24cb077e8c832f21c87
const app = express();
const server = createServer(app);
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
<<<<<<< HEAD
=======



setupSocket(server);
// שמירת ההגדרות של השרת
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});











// import pool from './database/database.js'
>>>>>>> 646eccb23bbb20f9e385c24cb077e8c832f21c87



<<<<<<< HEAD
export async function openInitialScheduleForNewProfessional(professionalId) {
    const today = new Date(); // התאריך הנוכחי
    const daysInMonth = 30; // מספר הימים (הגדרנו חודש של 30 ימים)
    const lastAvailableDate = new Date(today);
    lastAvailableDate.setDate(today.getDate() + daysInMonth); // תאריך עד 30 ימים קדימה
=======
// export async function openInitialScheduleForNewProfessional(professionalId) {
//     const today = new Date(); // התאריך הנוכחי
//     const daysInMonth = 30; // מספר הימים (הגדרנו חודש של 30 ימים)
//     const lastAvailableDate = new Date(today); 
//     lastAvailableDate.setDate(today.getDate() + daysInMonth); // תאריך עד 30 ימים קדימה
>>>>>>> 646eccb23bbb20f9e385c24cb077e8c832f21c87

//     // יצירת מערך של תאריכים מהיום ועד לתאריך של 30 ימים קדימה
//     const dates = [];
//     let currentDate = today;
//     while (currentDate <= lastAvailableDate) {
//         dates.push(currentDate.toISOString().split('T')[0]);
//         currentDate.setDate(currentDate.getDate() + 1); // עובר ליום הבא
//     }

//     try {
//         const values = dates.map(date => `('${date}', ?, true)`).join(', ');
//         await pool.query(
//             `INSERT INTO available_days (dayDate, professionalId, isAvailable) VALUES ${values}`,
//             Array(dates.length).fill(professionalId)
//         );
//         console.log(`Schedule opened from ${dates[0]} to ${dates[dates.length - 1]} for professional ${professionalId}`);
//     } catch (error) {
//         console.error('Error opening initial schedule:', error);
//     }
// };



// // משימה מתוזמנת שתרוץ כל יום ב-00:00
// cron.schedule('52 13 * * *', () => {
//     console.log('Job triggered at 00:00!');
//     openNextDaySchedule();
// });



<<<<<<< HEAD
// פונקציה שפותחת את היום הבא
const openNextDaySchedule = () => {
    const currentDate = new Date();
    const nextDay = new Date(currentDate.setDate(currentDate.getDate() + 1));
    const formattedDate = nextDay.toISOString().split('T')[0];

    axios.post(`http://localhost:8080/queues/openDaySchedule`)
        .then(response => {
            console.log('Day schedule opened:', response.data);
            console.log(`Schedule for ${formattedDate} opened successfully`);
        })
        .catch(error => {
            console.error('Error opening next day schedule:', error);
        });
};
setupSocket(server);
// שמירת ההגדרות של השרת
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
=======
// // פונקציה שפותחת את היום הבא
// const openNextDaySchedule = () => {
//     const currentDate = new Date();
//     const nextDay = new Date(currentDate.setDate(currentDate.getDate() + 1));
//     const formattedDate = nextDay.toISOString().split('T')[0];
    
//     axios.post(`http://localhost:8080/queues/openDaySchedule`)
//     .then(response => {
//         console.log('Day schedule opened:', response.data);
//         console.log(`Schedule for ${formattedDate} opened successfully`);
//     })
//     .catch(error => {
//         console.error('Error opening next day schedule:', error);
//     });
// };

>>>>>>> 646eccb23bbb20f9e385c24cb077e8c832f21c87



