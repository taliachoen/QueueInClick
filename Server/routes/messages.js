import express from 'express';
import { getMessages, getMessage, postMessage, deleteMessage, updateMessage, markMessageAsRead, getMessagesForCustomer } from '../database/messagesdb.js';

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



// Route to get messages for a specific customer
route.get('/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const messages = await getMessagesForCustomer(customerId);
        if (messages.length === 0) {
            return res.status(404).json({ message: 'No messages found for this customer.' });
        }
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// החזרת הערה לפי מספר 
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