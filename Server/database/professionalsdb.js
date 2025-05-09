import pool from './database.js';


export async function postProfessional(idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, passwordProff, business_name, phone) {
    try {
        const [result] = await pool.query(
            `INSERT INTO professionals (idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, passwordProff, business_name, phone) 
             VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idProfessional,
                firstName,
                lastName,
                domainCode,
                startDate,
                address,
                cityCode,
                email,
                passwordProff,
                business_name,
                phone
            ]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Error inserting professional: ${error.message}`);
    }
}


export async function postUser(userId, fullName, email, userType, password, userName, isActive) {
    try {
        console.log("נכנסתי להוספה")
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)
        console.log(userId, fullName, email, userType, password, userName, isActive)
        const [insertid] = await pool.query(`insert into user (userId, fullName, email, userType, password, userName, isActive) VALUES(?, ?, ?, ?, ?, ?, 1)
        `, [userId, fullName, email, userType, hashedPassword, userName, isActive]);
        console.log(insertid)
        return await getUser(insertid);
    } catch (error) {
        throw error;
    }
}


export const getProfessionalByEmailAndPassword = async (email, password) => {
    try {
        const query = 'SELECT * FROM professionals WHERE email = ? AND passwordProff = ?';
        const [rows] = await pool.execute(query, [email, password]);
        if (rows.length > 0) {
            return rows[0]; // Return the first matching customer
        } else {
            return null; // No customer found
        }
    } catch (error) {
        console.error('Error fetching customer by email and password:', error);
    }
};

export async function getProfessionalsByDomainAndType(field, type) {
    const query = `
                SELECT p.business_name, p.phone, c.cityName, t.typeName, p.idProfessional
FROM professionals p
JOIN professional_services ps ON p.idProfessional = ps.idProfessional
JOIN type_service t ON ps.ServiceTypeCode = t.typeCode
JOIN domains d ON t.domainCode = d.idDomain
JOIN cities c ON p.cityCode = c.cityCode
WHERE d.domainName LIKE ?
AND t.typeName LIKE ?
    `;
    const [professionals] = await pool.query(query, [`%${field}%`, `%${type}%`]);
    return professionals;
}

export async function getAllProfessionals() {
    const [professionals] = await pool.query(`
         SELECT idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, business_name, phone 
         FROM professionals
    `);
    return professionals;
}

export async function getAllBuisnessNames() {
    const [business_names] = await pool.query(`
         SELECT business_name
         FROM professionals
    `);
    return business_names;
}

export async function getIidProfessionalByBusinessName(business_name) {
    const [idProfessional] = await pool.query(`
         SELECT idProfessional
         FROM professionals
         where business_name = ? 
    `, [business_name]);
    return idProfessional;
}

export async function getProfessionalByName(name) {
    const [[professional]] = await pool.query(`
        SELECT p.idProfessional, p.firstName, p.lastName, p.domainCode, d.domainName,
        p.startDate, p.address, p.cityCode, p.email, p.business_name, p.phone, c.cityName
        FROM professionals p
        JOIN cities c ON p.cityCode = c.cityCode
        JOIN domains d ON p.domainCode = d.idDomain
        WHERE p.business_name = ?
    `, [name]);
    return professional;
}

export async function getProfessionalDetails(businessName, serviceType) {
    const query = `
        SELECT p.business_name, p.firstName, p.lastName, p.phone, p.address, p.cityCode, c.cityName, ps.Duration, ps.Price
        FROM professionals p
        JOIN professional_services ps ON p.idProfessional = ps.idProfessional
        JOIN type_service ts ON ps.ServiceTypeCode = ts.typeCode
        JOIN cities c ON p.cityCode = c.cityCode
        WHERE p.business_name = ? AND ts.typeName = ?
    `;
    const [[details]] = await pool.query(query, [businessName, serviceType]);
    return details;
}

export async function getProfessionalAllDetails(businessName) {
    const query = `
        SELECT p.idProfessional
        FROM professionals p
        JOIN professional_services ps ON p.idProfessional = ps.idProfessional
        JOIN type_service ts ON ps.ServiceTypeCode = ts.typeCode
        JOIN cities c ON p.cityCode = c.cityCode
        WHERE p.business_name = ? 
    `;
    const [[details]] = await pool.query(query, [businessName]);
    return details;
}

export async function getProfessionalById(id) {
    const query = `
        SELECT 
            p.idProfessional, 
            p.firstName, 
            p.lastName, 
            p.startDate, 
            p.address, 
            p.email, 
            p.phone, 
            p.business_name, 
            p.cityCode, 
            c.cityName,  -- מצרפים את שם העיר לפי ה-cityCode
            p.domainCode, 
            d.domainName  -- מצרפים את שם התחום לפי ה-domainCode
        FROM professionals p
        LEFT JOIN cities c ON p.cityCode = c.cityCode
        LEFT JOIN domains d ON p.domainCode = d.idDomain
        WHERE p.idProfessional = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows.length ? rows[0] : null;
}


import moment from 'moment';

export async function updateProfessional(professionalID, professionalData) {
    try {
        console.log("yosi");
        console.log("Updating professional:", professionalID, professionalData);

        const { firstName, lastName, domainCode, startDate, address, cityCode, email, business_name, phone } = professionalData;
        // אם startDate קיים, להמיר לפורמט הנכון
        const formattedDate = startDate ? moment(startDate).format('YYYY-MM-DD') : null;
        const query = `UPDATE professionals SET firstName = ?, lastName = ?, domainCode = ?, startDate = ?, address = ?, cityCode = ?, email = ?, business_name = ?, phone = ? WHERE idProfessional = ?`;
        const [result] = await pool.query(query, [firstName, lastName, domainCode, formattedDate, address, cityCode, email, business_name, phone, professionalID]);
        if (result.affectedRows === 0) {
            throw new Error(`Update failed: No professional found with ID ${professionalID}`);
        }

        return await getProfessionalById(professionalID);
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.response) {
            console.error("Server response:", error.response.data);
            swal("Error", error.response.data.message || "An error occurred while updating the profile", "error");
        } else {
            swal("Error", "An error occurred while updating the profile", "error");
        }
    }

};

export async function getProfessionalServiceCode(professionalId, serviceTypeCode) {
    const [rows] = await pool.query(`
        SELECT ProffServiceID
        FROM professional_services
        WHERE idProfessional = ? AND ServiceTypeCode = ?
    `, [professionalId, serviceTypeCode]);
    // בדיקה אם יש תוצאה לפני החילוץ
    if (rows.length > 0) {
        const { ProffServiceID } = rows[0];
        return ProffServiceID;
    } else {
        return null;
    }
}