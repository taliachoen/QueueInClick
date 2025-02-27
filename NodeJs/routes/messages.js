// import express from 'express'
// import { getMessages, getMessage, postMessage, deleteMessage, updateMessage } from '../database/messagesdb.js'

// const route = express.Router();
// // Route to get messages with specific details
// route.get('/', async (req, res) => {
//     try {
//         const messages = await getMessages();
//         res.json(messages);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // //החזרת הערות מבסיס הנתונים
// // route.get('/', async (req, res) => {
// //     try {
// //         const messages = await getMessages();
// //         res.json(messages);
// //     }
// //     catch (error) {
// //         res.status(500).json({ messege: error.messege })
// //     }
// // });

// //החזרת הערה לפי מספר זהות
// route.get('/:message', async (req, res) => {
//     try {
//         const { messageId } = req.params;
//         const message = await getMessage(messageId);
//         // Check if the post exists
//         if (!message) {
//             return res.status(404).json({ message: 'message not found.' });
//         }
//         res.json(message);
//     }
//     catch (error) {
//         res.status(500).json({ messege: error.messege })
//     }
// });


// //הכנסת משימה 
// route.post('/', async (req, res) => {
//     try {
//         const { queueCode, isRead, content, title } = req.body;
//         const comment = await postMessage(queueCode, isRead, content, title);
//         res.json({ comment, message: 'message added successfully' });
//     }
//     catch (error) {
//         res.status(201).json({ messege: error.messege })
//     }
// });

// //עדכון פרטי משימה
// route.put('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log(req.body)
//         await updateMessage(id, req.body);
//         res.json({ message: 'message updated successfully' });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // // מחיקת הערה לפי מספר זיהוי
// // route.delete('/:id', async (req, res) => {
// //     try {
// //         const { id } = req.params;
// //         const comment = await dele(id);
// //         res.json({ comment, message: 'comment deleted successfully' });
// //     } catch (error) {
// //         res.status(500).json({ message: error.message });
// //     }
// // });

// export default route;


import express from 'express';
import { getMessages, getMessage, postMessage, deleteMessage, updateMessage, markMessageAsRead } from '../database/messagesdb.js';

const route = express.Router();

// Route to get messages with specific details
route.get('/', async (req, res) => {
    try {
        const messages = await getMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// החזרת הערה לפי מספר זהות
route.get('/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await getMessage(messageId);
        // Check if the post exists
        if (!message) {
            return res.status(404).json({ message: 'message not found.' });
        }
        res.json(message);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// הכנסת משימה
route.post('/', async (req, res) => {
    try {
        const { queueCode, isRead, content, title } = req.body;
        const comment = await postMessage(queueCode, isRead, content, title);
        res.json({ comment, message: 'message added successfully' });
    }
    catch (error) {
        res.status(201).json({ message: error.message });
    }
});

// עדכון פרטי משימה
route.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await updateMessage(id, req.body);
        res.json({ message: 'message updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// מחיקת הערה לפי מספר זיהוי
route.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteMessage(id);
        res.json({ message: 'message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// נתיב חדש לעדכון מצב הודעה לנקראה
route.post('/:messageCode/markAsRead', async (req, res) => {
    try {
        const { messageCode } = req.params;
        await markMessageAsRead(messageCode);
        res.json({ message: 'message marked as read successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default route;