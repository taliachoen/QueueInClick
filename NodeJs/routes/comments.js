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
        const { idProfessional, idCustomer } = req.query;

        if (idCustomer && idProfessional) {
            const comment = await getCommentsByCustomerAndProfessional(idCustomer, idProfessional);
            return res.json(comment);
        } else if (idProfessional) {
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





// import express from 'express';
// import { getComments, getAverageRating, getComment, postComment, deleteComment, updateComment, getCommentsByCustomerAndProfessional, getCommentsByProfessional } from '../database/commentsdb.js';

// const route = express.Router();

// route.get('/rating/:idProfessional', async (req, res) => {
//     try {
//         const { idProfessional } = req.params;
//         const averageRating = await getAverageRating(idProfessional);
//         res.json({ averageRating });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// });


// route.get('/', async (req, res) => {
//     try {
//         const { IdCustomer, IdProfessional } = req.query;
//         if (IdCustomer && IdProfessional) {
//             const comments = await getCommentsByCustomerAndProfessional(IdCustomer, IdProfessional);
//             res.json(comments);
//         } else if (IdProfessional) {
//             const comments = await getCommentsByProfessional(IdProfessional);
//             res.json(comments);
//         } else {
//             const comments = await getComments();
//             res.json(comments);
//         }
//     } catch (error) {
//         console.error(error);  // הוספת לוג לשגיאה
//         res.status(500).json({ message: error.message });
//     }
// });

// route.get('/:comment', async (req, res) => {
//     try {
//         const { comment } = req.params;
//         const commentData = await getComment(comment);
//         if (!commentData) {
//             return res.status(404).json({ message: 'Comment not found.' });
//         }
//         res.json(commentData);
//     } catch (error) {
//         console.error(error);  // הוספת לוג לשגיאה
//         res.status(500).json({ message: error.message });
//     }
// });

// route.post('/', async (req, res) => {
//     try {
//         const { queueCode, IdProfessional, IdCustomer, rating, content, comments_date } = req.body;
//         const comment = await postComment(queueCode, IdProfessional, IdCustomer, rating, content, comments_date);
//         res.json({ comment, message: 'Comment added successfully' });
//     } catch (error) {
//         console.error(error);  // הוספת לוג לשגיאה
//         res.status(500).json({ message: error.message });
//     }
// });

// route.put('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         await updateComment(id, req.body);
//         res.json({ message: 'Comment updated successfully' });
//     } catch (error) {
//         console.error(error);  // הוספת לוג לשגיאה
//         res.status(400).json({ message: error.message });
//     }
// });

// route.delete('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const comment = await deleteComment(id);
//         res.json({ comment, message: 'Comment deleted successfully' });
//     } catch (error) {
//         console.error(error);  // הוספת לוג לשגיאה
//         res.status(500).json({ message: error.message });
//     }
// });

// export default route;