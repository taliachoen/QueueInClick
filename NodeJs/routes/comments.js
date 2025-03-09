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


// Post a new comment for a professional
route.post('/', async (req, res) => {
    try {
        const { idCustomer, idProfessional, rating, text } = req.body;
        const existingComment = await getComment(idCustomer, idProfessional);

        if (existingComment) {
            return res.status(400).json({ message: "You have already commented on this professional" });
        }

        const newComment = await postComment(idCustomer, idProfessional, rating, text);
        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
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