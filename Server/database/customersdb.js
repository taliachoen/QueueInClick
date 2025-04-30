import pool from './database.js'

//פונקציה המחזירה את כל לקוחות
export async function getCustomers() {
    const [customers] = await pool.query('select idCustomer, firstName,  lastName,  address,   cityCode,  email,phone from customers ');
    console.log(customers, "--", [customers], "---", pool)
    return customers;
}

//פונקציה המחזירה לקוח לפי מספר זהות
export async function getCustomer(id) {
    const [[customer]] = await pool.query(`SELECT * FROM customer_view where idCustomer=?`, [id]);
    return customer;
}

export const getCustomerByEmailAndPassword = async (email, password) => {
    try {
        const query = 'SELECT * FROM customer_view WHERE email = ? AND passwordCust = ?';
        const [rows] = await pool.execute(query, [email, password]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error fetching customer by email and password:', error);
        throw error; 
    }
};

//פונקציה המוסיפה לקוח חדשה
export async function postCustomer(idCustomer, firstName, lastName, address, cityCode, email, phone, passwordCust) {
    const [{ insertId }] = await pool.query(`insert into customers( idCustomer, firstName,  lastName,  address,   cityCode,  email ,phone, passwordCust) VALUES (?,?,?,?,?,?,?,?)`, [idCustomer, firstName, lastName, address, cityCode, email, phone, passwordCust]);
    return await getCustomer(insertId);
}

export async function updateCustomer(customerID, customerData) {
    const { firstName, lastName, address, cityCode, email, phone } = customerData;
    const query = 'UPDATE customers SET firstName = ?, lastName = ?, address = ?, cityCode = ?, email = ?, phone = ? WHERE idCustomer = ?';
    await pool.query(query, [firstName, lastName, address, cityCode, email, phone, customerID]);
    return await getCustomer(customerID);
}
