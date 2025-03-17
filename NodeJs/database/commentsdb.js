import pool from './database.js';

// פונקציה חדשה כדי לבדוק אם יש תגובה עבור לקוח ועסק
// פונקציה ב-DB כדי לבדוק אם יש תגובה עבור לקוח ועסק
// export const getCommentsByCustomerAndProfessional = async (idCustomer, idProfessional) => {
//     try {
//         const [rows] = await pool.query(`
//             SELECT COUNT(*) AS commentCount
//             FROM comments
//             WHERE idCustomer = ? AND idProfessional = ?
//         `, [idCustomer, idProfessional]);
//         console.log('Rows from DB:', rows); // להוסיף בדיקה כאן
//         return rows[0].commentCount > 0; // מחזיר true אם יש תגובה
//     } catch (error) {
//         console.error('Database error:', error); // הוספת log בשגיאה
//         throw new Error('Error checking comment: ' + error.message);
//     }
// };

export async function checkLastCommentDate(IdProfessional, IdCustomer) {
    const [rows] = await pool.query(
        `SELECT comments_date 
         FROM comments 
         WHERE IdProfessional = ? AND IdCustomer = ? 
         ORDER BY comments_date DESC 
         LIMIT 1`,
        [IdProfessional, IdCustomer]
    );

    if (rows.length === 0) {
        console.log("🔵 No previous comments found - user is allowed to comment.");
        return { canComment: true }; // לא הגיב אף פעם - מותר להגיב
    }

    const lastCommentDate = new Date(rows[0].comments_date);
    const now = new Date();
    const nextAllowedDate = new Date(lastCommentDate);
    nextAllowedDate.setDate(lastCommentDate.getDate() + 2); // הוספת יומיים

    console.log("🔵 Last comment date:", lastCommentDate);
    console.log("🔵 Current date:", now);
    console.log("🔵 Next allowed date:", nextAllowedDate);

    if (now >= nextAllowedDate) {
        console.log("✅ User is allowed to comment.");
        return { canComment: true }; // מותר להגיב
    } else {
        console.log("❌ User must wait before commenting again.");
        return {
            canComment: false, // אסור להגיב
            nextAllowedDate: nextAllowedDate.toISOString().split('T')[0]
        };
    }
}






// Calculate average rating for a professional
export async function getAverageRating(IdProfessional) {
    const [rows] = await pool.query(`
        SELECT SUM(rating) / COUNT(rating) as averageRating
        FROM comments
        WHERE IdProfessional = ?
    `, [IdProfessional]);

    return rows[0].averageRating || 0;
}

export async function getComments() {
    const [comments] = await pool.query(`
        SELECT commentCode, queueCode, idProfessional, idCustomer, rating, content, comments_date 
        FROM comments
    `);
    return comments;
}

// export async function getComment(id) {
//     const [[comment]] = await pool.query(`
//         SELECT queueCode, idProfessional, idCustomer, rating, content, comments_date 
//         FROM comments 
//         WHERE commentCode = ?
//     `, [id]);
//     return comment;
// }

// export async function postComment(queueCode, IdProfessional, IdCustomer, rating, content, comments_date) {
//     const query = `
//         INSERT INTO comments(queueCode, IdProfessional, IdCustomer, rating, content, comments_date) 
//         VALUES (?, ?, ?, ?, ?, ?)
//     `;
//     const result = await pool.query(query, [queueCode, IdProfessional, IdCustomer, rating, content, comments_date]);
//     const insertId = result.insertId;
//     return await getComment(insertId);
// }
export async function getComment(idCustomer, idProfessional) {
    const [[comment]] = await pool.query(`
        SELECT queueCode, idProfessional, idCustomer, rating, content, comments_date 
        FROM comments 
        WHERE idCustomer = ? AND idProfessional = ?
    `, [idCustomer, idProfessional]);
    return comment;
}

export async function postComment(queueCode, idCustomer, idProfessional, rating, content, comments_date) {
    const query = `
        INSERT INTO comments(queueCode, idProfessional, idCustomer, rating, content, comments_date) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [queueCode, idProfessional, idCustomer, rating, content, comments_date]);
    return await getComment(idCustomer, idProfessional);
}
export async function deleteComment(commentCode) {
    await pool.query(`DELETE FROM comments WHERE commentCode = ?`, [commentCode]);
}

export const updateComment = async (commentCode, commentData) => {
    const { queueCode, idProfessional, idCustomer, rating, content, comments_date } = commentData;
    const query = `
        UPDATE comments 
        SET queueCode = ?, IdProfessional = ?, IdCustomer = ?, rating = ?, content = ?, comments_date = ? 
        WHERE commentCode = ?
    `;
    await pool.query(query, [queueCode, idProfessional, idCustomer, rating, content, comments_date, commentCode]);
}

// export async function getCommentsByCustomerAndProfessional(IdCustomer, IdProfessional) {
//     const [comments] = await pool.query(`
//         SELECT commentCode, queueCode, idProfessional, idCustomer, rating, content, comments_date 
//         FROM comments 
//         WHERE idCustomer = ? AND idProfessional = ?
//     `, [IdCustomer, IdProfessional]);
//     return comments;
// }

export async function getCommentsByProfessional(IdProfessional) {
    const [comments] = await pool.query(`
        SELECT comments.commentCode, comments.queueCode, comments.idProfessional, comments.idCustomer, 
               comments.rating, comments.content, comments.comments_date, 
               COALESCE(customers.firstName, 'Unknown') AS firstName, 
               COALESCE(customers.lastName, 'Customer') AS lastName 
        FROM comments
        LEFT JOIN customers ON comments.idCustomer = customers.idCustomer
        WHERE comments.idProfessional = ?
    `, [IdProfessional]);
    return comments;
}
