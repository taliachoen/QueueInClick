import pool from './database.js'

//פונקציה המחזירה את כל לקוחות
export async function getCustomers() {
    const [customers] = await pool.query('select idCustomer, firstName,  lastName,  address,   cityCode,  email,phone from customers ');
    console.log(customers, "--", [customers], "---", pool)
    return customers;
    // 
}

//פונקציה המחזירה לקוח לפי מספר זהות
export async function getCustomer(id) {
    const [[customer]] = await pool.query(`SELECT * FROM customer_view where idCustomer=?`, [id]);
    return customer;
}
//התחברות לקוח

export const getCustomerByEmailAndPassword = async (email, password) => {
    try {
        const query = 'SELECT * FROM customer_view WHERE email = ? AND passwordCust = ?';
        const [rows] = await pool.execute(query, [email, password]);
        if (rows.length > 0) {
            return rows[0]; // Return the first matching customer
        } else {
            return null; // No customer found
        }
    } catch (error) {
        console.error('Error fetching customer by email and password:', error);
        // throw error; // Re-throw the error to handle it in the calling function
    }
};


//פונקציה המוסיפה לקוח חדשה
export async function postCustomer(idCustomer, firstName, lastName, address, cityCode, email, phone, passwordCust) {
    const [{ insertId }] = await pool.query(`insert into customers( idCustomer, firstName,  lastName,  address,   cityCode,  email ,phone, passwordCust) VALUES (?,?,?,?,?,?,?,?)`, [idCustomer, firstName, lastName, address, cityCode, email, phone, passwordCust]);
    return await getCustomer(insertId);
}


//פונקציה לעדכון פרטי לקוח
// export async function updateCustomer(customerID, customerData){
//     const { firstName, lastName, address, cityCode, email, phone } = customerData;
//     const query = 'UPDATE customers SET  firstName = ?, lastName = ?,address = ?, cityCode=? , email =?,phone=? WHERE idCustomer = ?';
//     await pool.query(query, [ firstName, lastName, address, cityCode, email, phone, customerID]);
//     return await getCustomer(customerID);
// };
export async function updateCustomer(customerID, customerData) {
    const { firstName, lastName, address, cityCode, email, phone } = customerData;
    const query = 'UPDATE customers SET firstName = ?, lastName = ?, address = ?, cityCode = ?, email = ?, phone = ? WHERE idCustomer = ?';
    await pool.query(query, [firstName, lastName, address, cityCode, email, phone, customerID]);
    return await getCustomer(customerID); // Return the updated customer data
}
