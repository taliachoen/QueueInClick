import pool from './database.js';

// export async function checkLastCommentDate(IdProfessional, IdCustomer) {
//     const [rows] = await pool.query(
//         `SELECT comments_date 
//          FROM comments 
//          WHERE IdProfessional = ? AND IdCustomer = ? 
//          ORDER BY comments_date DESC 
//          LIMIT 1`,
//         [IdProfessional, IdCustomer]
//     );

//     if (rows.length === 0) {
//         console.log("🔵 No previous comments found - user is allowed to comment.");
//         return { canComment: true }; 
//     }

//     const lastCommentDate = new Date(rows[0].comments_date);
//     const now = new Date();
//     const nextAllowedDate = new Date(lastCommentDate);
//     nextAllowedDate.setDate(lastCommentDate.getDate() + 1); 

//     if (now >= nextAllowedDate) {
//         console.log("✅ User is allowed to comment.");
//         return { canComment: true }; 
//     } else {
//         console.log("❌ User must wait before commenting again.");
//         return {
//             canComment: false,
//             nextAllowedDate: nextAllowedDate.toISOString().split('T')[0]
//         };
//     }
// }

// Calculate average rating for a professional

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
        return { canComment: true }; 
    }

    const lastCommentDate = new Date(rows[0].comments_date);
    const now = new Date();

    // אפס את השעה לשם השוואה לפי תאריך בלבד
    lastCommentDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const nextAllowedDate = new Date(lastCommentDate);
    nextAllowedDate.setDate(lastCommentDate.getDate() + 1);

    if (now >= nextAllowedDate) {
        console.log("✅ User is allowed to comment.");
        return { canComment: true }; 
    } else {
        console.log("❌ User must wait before commenting again.");
        return {
            canComment: false,
            nextAllowedDate: nextAllowedDate.toISOString().split('T')[0]
        };
    }
}


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
