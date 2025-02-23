import pool from './database.js'
import {getCustomer} from './customersdb.js'

export async function getMessages() {
    try {
        const query = `
            SELECT
                m.messageCode,
                m.message_date,
                CONCAT(c.firstName, ' ', c.lastName) AS customer_name,
                p.business_name,
                CONCAT(p.firstName, ' ', p.lastName) AS professional_name,
                m.content,
                m.title,
                m.isRead
            FROM
                messages m
            JOIN
                queues q ON m.queueCode = q.QueueCode
            JOIN
                customers c ON q.CustomerCode = c.idCustomer
            JOIN
                Professional_Services ps ON q.ProfessionalServiceCode = ps.ProffServiceID
            JOIN
                professionals p ON ps.idProfessional = p.idProfessional;
        `;
        const [messages] = await pool.query(query);
        return messages;
    } catch (error) {
        throw new Error(`Error fetching messages: ${error.message}`);
    }
}


//פונקציה המחזירה לקוח לפי מספר זהות
export async function getMessage(id) {
    const [[message]] = await pool.query(`select  queueCode,  isRead,  content,   title,message_date from messages where messageCode=?`, [id]);
    return message;
}

export async function postMessage(queueCode, isRead, content, title, message_date) {
    const [{ insertId }] = await pool.query(`insert into messages( queueCode,  isRead,  content, title , message_date) VALUES (?,?,?,?,?)`, [queueCode, isRead, content, title, message_date]);
    return await getCustomer(insertId);
}


// פונקציה למחיקת משימה לפי מספר זיהוי
export async function deleteMessage(id) {
    await pool.query(`DELETE FROM messages WHERE messageCode = ?`, [id]);
}

//פונקציה לעדכון פרטי לקוח
export const updateMessage = async (messageID, messageData) => {
    const { queueCode, isRead, content, title, message_date } = messageData;
    const query = 'UPDATE messages SET queueCode = ?, isRead = ?, content = ?, title = ? ,message_date = ? WHERE  messageCode= ?';
    await pool.query(query, [queueCode, isRead, content, title, message_date, messageID]);
};

// פונקציה לעדכון מצב הודעה לנקראה
export const markMessageAsRead = async (messageCode) => {
    const query = 'UPDATE messages SET isRead = 1 WHERE messageCode = ?';
    await pool.query(query, [messageCode]);
};

