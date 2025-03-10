import express from 'express';
import {
    getComments,
    getAverageRating,
    getComment,
    postComment,
    deleteComment,
    updateComment,
    getCommentsByCustomerAndProfessional,
    getCommentsByProfessional
} from '../database/commentsdb.js';

const route = express.Router();


// Add a route to check if the customer has commented on the professional
// בקשה לבדוק אם הלקוח כבר הגיב לעסק
route.get('/check', async (req, res) => {
    try {
        const { businessId, customerId } = req.query;

        // לוודא שהפרמטרים קיימים בבקשה
        if (!businessId || !customerId) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        // השתמש בפונקציה החדשה כדי לבדוק אם יש תגובה לעסק הזה מהלקוח
        const hasCommented = await getCommentsByCustomerAndProfessional(customerId, businessId);

        if (hasCommented) {
            return res.json({ hasCommented: true });
        } else {
            return res.json({ hasCommented: false });
        }
    } catch (error) {
        console.error('Error in /check route:', error); // דפוק log נוסף כדי לבדוק שגיאות
        res.status(500).json({ message: error.message });
    }
});




// Get average rating of a professional
route.get('/rating/:idProfessional', async (req, res) => {
    try {
        const { idProfessional } = req.params;
        const averageRating = await getAverageRating(idProfessional);
        res.json({ averageRating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Get comments for a professional, customer, or all
route.get('/', async (req, res) => {
    try {
        const { idProfessional } = req.query;
        if (idProfessional) {
            const comments = await getCommentsByProfessional(idProfessional);
            return res.json(comments);
        } else {
            const comments = await getComments();
            return res.json(comments);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


route.post('/', async (req, res) => {
    try {
        const { queueCode, idCustomer, idProfessional, rating, content, comments_date } = req.body;

        // נוודא שכל השדות לא חסרים
        if (!idCustomer || !idProfessional || !rating || !content || !queueCode || !comments_date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingComment = await getComment(idCustomer, idProfessional);
        if (existingComment) {
            return res.status(400).json({ message: "You have already commented on this professional" });
        }

        const newComment = await postComment(queueCode, idCustomer, idProfessional, rating, content, comments_date);

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


// Delete a comment by ID
route.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedComment = await deleteComment(id);
        res.json(deletedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Update a comment by ID
route.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedComment = await updateComment(id, req.body);
        res.json(updatedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default route;