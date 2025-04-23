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
import {setupSocket} from './socket.js'
import { createServer } from 'http';  

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



setupSocket(server);
// שמירת ההגדרות של השרת
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

