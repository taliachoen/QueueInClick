// import express from 'express'
// import { getComments, getComment, postComment, deleteComment, updateComment } from '../database/commentsdb.js'

// const route = express.Router();
// //החזרת הערות מבסיס הנתונים
// route.get('/', async (req, res) => {
//     try {
//         const comments = await getComments();
//         res.json(comments);
//     }
//     catch (error) {
//         res.status(500).json({ messege: error.messege })
//     }
// });

// //החזרת הערה לפי מספר זהות
// route.get('/:comment', async (req, res) => {
//     try {
//         const { commentId } = req.params;
//         const comment = await getComments(commentId);
//         // Check if the post exists
//         if (!comment) {
//             return res.status(404).json({ message: 'Comment not found.' });
//         }
//         res.json(comment);
//     }
//     catch (error) {
//         res.status(500).json({ messege: error.messege })
//     }
// });

// //הכנסת משימה 
// route.post('/', async (req, res) => {
//     try {
//         const { queueCode, IdProfessional, IdCustomer, rating, content } = req.body;
//         const comment = await postComment(queueCode, IdProfessional, IdCustomer, rating, content);
//         res.json({ comment, message: 'comment added successfully' });
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
//         await updateComment(id, req.body);
//         res.json({ message: 'comment updated successfully' });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// // מחיקת הערה לפי מספר זיהוי
// route.delete('/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const comment = await deleteComment(id);
//         res.json({ comment, message: 'comment deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// export default route;

import express from 'express';
import { getComments, getAverageRating, getComment, postComment, deleteComment, updateComment, getCommentsByCustomerAndProfessional, getCommentsByProfessional } from '../database/commentsdb.js';

const route = express.Router();


// New endpoint for average rating
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


route.get('/', async (req, res) => {
    try {
        const { IdCustomer, IdProfessional } = req.query;
        if (IdCustomer && IdProfessional) {
            const comments = await getCommentsByCustomerAndProfessional(IdCustomer, IdProfessional);
            res.json(comments);
        } else if (IdProfessional) {
            const comments = await getCommentsByProfessional(IdProfessional);
            res.json(comments);
        } else {
            const comments = await getComments();
            res.json(comments);
        }
    } catch (error) {
        console.error(error);  // הוספת לוג לשגיאה
        res.status(500).json({ message: error.message });
    }
});


// route.get('/:idProfessional', async (req, res) => {
//     try {
//         const { idProfessional } = req.params;
//         const comments= await getCommentByIdProfeesional(idProfessional );
//         if (!comments) {
//             return res.status(404).json({ message: 'comments not found.' });
//         }
//         res.json(comments);
//     } catch (error) {
//         console.error(error);  // הוספת לוג לשגיאה
//         res.status(500).json({ message: error.message });
//     }
// });

route.get('/:comment', async (req, res) => {
    try {
        const { comment } = req.params;
        const commentData = await getComment(comment);
        if (!commentData) {
            return res.status(404).json({ message: 'Comment not found.' });
        }
        res.json(commentData);
    } catch (error) {
        console.error(error);  // הוספת לוג לשגיאה
        res.status(500).json({ message: error.message });
    }
});

route.post('/', async (req, res) => {
    try {
        const { queueCode, IdProfessional, IdCustomer, rating, content, comments_date } = req.body;
        const comment = await postComment(queueCode, IdProfessional, IdCustomer, rating, content, comments_date);
        res.json({ comment, message: 'Comment added successfully' });
    } catch (error) {
        console.error(error);  // הוספת לוג לשגיאה
        res.status(500).json({ message: error.message });
    }
});

route.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await updateComment(id, req.body);
        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error(error);  // הוספת לוג לשגיאה
        res.status(400).json({ message: error.message });
    }
});

route.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await deleteComment(id);
        res.json({ comment, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);  // הוספת לוג לשגיאה
        res.status(500).json({ message: error.message });
    }
});

export default route;