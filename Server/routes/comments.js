import express from 'express';
import {
    getComments,
    getAverageRating,
    getComment,
    postComment,
    deleteComment,
    updateComment,
    getCommentsByProfessional,
    checkLastCommentDate
} from '../database/commentsdb.js';

const route = express.Router();


// Add a route to check if the customer has commented on the professional
// בקשה לבדוק אם הלקוח כבר הגיב לעסק

route.get('/check', async (req, res) => {
    try {
        const { IdProfessional, IdCustomer } = req.query;
        const result = await checkLastCommentDate(IdProfessional, IdCustomer);
        console.log("result", result);
        return res.json(result);

    } catch (error) {
        console.error("Error checking comment restriction:", error);
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


        const newComment = await postComment(queueCode, idCustomer, idProfessional, rating, content, comments_date);

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


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