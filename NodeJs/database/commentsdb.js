import pool from './database.js';

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

export async function getComment(id) {
    const [[comment]] = await pool.query(`
        SELECT queueCode, idProfessional, idCustomer, rating, content, comments_date 
        FROM comments 
        WHERE commentCode = ?
    `, [id]);
    return comment;
}

export async function postComment(queueCode, IdProfessional, IdCustomer, rating, content, comments_date) {
    const query = `
        INSERT INTO comments(queueCode, IdProfessional, IdCustomer, rating, content, comments_date) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await pool.query(query, [queueCode, IdProfessional, IdCustomer, rating, content, comments_date]);
    const insertId = result.insertId;
    return await getComment(insertId);
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

export async function getCommentsByCustomerAndProfessional(IdCustomer, IdProfessional) {
    const [comments] = await pool.query(`
        SELECT commentCode, queueCode, idProfessional, idCustomer, rating, content, comments_date 
        FROM comments 
        WHERE idCustomer = ? AND idProfessional = ?
    `, [IdCustomer, IdProfessional]);
    return comments;
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


















