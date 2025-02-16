import pool from './database.js';


export async function postProfessional(idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, passwordProff, business_name, phone, logo) {
    try {
        const [result] = await pool.query(
            `INSERT INTO professionals (idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, passwordProff, business_name, phone, logo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                phone,
                logo
            ]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Error inserting professional: ${error.message}`);
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
        SELECT p.business_name, p.phone, c.cityName,t.typeCode,p.idProfessional
        FROM professionals p
        JOIN domains d ON p.domainCode = d.idDomain
        JOIN type_service t ON d.idDomain = t.domainCode
        JOIN cities c ON p.cityCode = c.cityCode
        WHERE d.domainName LIKE ?
        AND t.typeName LIKE ?
    `;
    const [professionals] = await pool.query(query, [`%${field}%`, `%${type}%`]);
    return professionals;
}

export async function getAllProfessionals() {
    const [professionals] = await pool.query(`
         SELECT idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, business_name, phone ,logo
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
export async function getProfessionalById(id) {
    console.log("shirshir")
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

    console.log("Executing query:", query, "with ID:", id);

    const [rows] = await pool.query(query, [id]);

    console.log("Query result:", rows);

    return rows.length ? rows[0] : null;
}


import moment from 'moment';

export async function updateProfessional(professionalID, professionalData) {
    try {

        console.log("Updating professional:", professionalID, professionalData);

        const { firstName, lastName, domainCode, startDate, address, cityCode, email, business_name, phone, logo } = professionalData;

        // אם startDate קיים, להמיר לפורמט הנכון
        const formattedDate = startDate ? moment(startDate).format('YYYY-MM-DD HH:mm:ss') : null;

        const query = `UPDATE professionals SET firstName = ?, lastName = ?, domainCode = ?, startDate = ?, address = ?, cityCode = ?, email = ?, business_name = ?, phone = ?, logo = ? WHERE idProfessional = ?`;

        const [result] = await pool.query(query, [firstName, lastName, domainCode, formattedDate, address, cityCode, email, business_name, phone, logo, professionalID]);

        if (result.affectedRows === 0) {
            throw new Error(`Update failed: No professional found with ID ${professionalID}`);
        }

        return await getProfessionalById(professionalID);
    } catch (error) {
        console.error("Error updating professional:", error);
        throw error;
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
        console.log(ProffServiceID, 44444);
        return ProffServiceID;
    } else {
        return null;
    }
}




// import pool from './database.js';


// export async function postProfessional(idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, passwordProff, business_name, phone, logo) {
//     try {
//         const [result] = await pool.query(
//             `INSERT INTO professionals (idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, passwordProff, business_name, phone, logo)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//                 idProfessional,
//                 firstName,
//                 lastName,
//                 domainCode,
//                 startDate,
//                 address,
//                 cityCode,
//                 email,
//                 passwordProff,
//                 business_name,
//                 phone,
//                 logo
//             ]
//         );
//         return result.insertId;
//     } catch (error) {
//         throw new Error(`Error inserting professional: ${error.message}`);
//     }
// }

// //התחברות לבעל מקצוע
// export const getProfessionalByEmailAndPassword = async (email, password) => {
//     try {
//         const query = 'SELECT * FROM professionals WHERE email = ? AND passwordProff = ?';
//         const [rows] = await pool.execute(query, [email, password]);
//         if (rows.length > 0) {
//             return rows[0]; // Return the first matching customer
//         } else {
//             return null; // No customer found
//         }
//     } catch (error) {
//         console.error('Error fetching customer by email and password:', error);
//     }
// };

// //Function to get professionals based on domainCode and type
// export async function getProfessionalsByDomainAndType(field, type) {
//     const query = `
//         SELECT p.business_name, p.phone, c.cityName,t.typeCode,p.idProfessional
//         FROM professionals p
//         JOIN domains d ON p.domainCode = d.idDomain
//         JOIN type_service t ON d.idDomain = t.domainCode
//         JOIN cities c ON p.cityCode = c.cityCode
//         WHERE d.domainName LIKE ?
//         AND t.typeName LIKE ?
//     `;
//     const [professionals] = await pool.query(query, [`%${field}%`, `%${type}%`]);
//     return professionals;
// }

// export async function getAllProfessionals() {
//     const [professionals] = await pool.query(`
//          SELECT idProfessional, firstName, lastName, domainCode, startDate, address, cityCode, email, business_name, phone ,logo
//          FROM professionals
//     `);
//     return professionals;
// }


// export async function getAllBuisnessNames() {
//     const [business_names] = await pool.query(`
//          SELECT business_name
//          FROM professionals
//     `);
//     return business_names;
// }

// export async function getProfessionalByName(name) {
//     const [[professional]] = await pool.query(`
//         SELECT p.idProfessional, p.firstName, p.lastName, p.domainCode, d.domainName,
//         p.startDate, p.address, p.cityCode, p.email, p.business_name, p.phone, c.cityName
//         FROM professionals p
//         JOIN cities c ON p.cityCode = c.cityCode
//         JOIN domains d ON p.domainCode = d.idDomain
//         WHERE p.business_name = ?
//     `, [name]);
//     return professional;
// }


// export async function getProfessionalDetails(businessName, serviceType) {
//     const query = `
//         SELECT p.business_name, p.firstName, p.lastName, p.phone, p.address, p.cityCode, c.cityName, ps.Duration, ps.Price
//         FROM professionals p
//         JOIN professional_services ps ON p.idProfessional = ps.idProfessional
//         JOIN type_service ts ON ps.ServiceTypeCode = ts.typeCode
//         JOIN cities c ON p.cityCode = c.cityCode
//         WHERE p.business_name = ? AND ts.typeName = ?
//     `;
//     const [[details]] = await pool.query(query, [businessName, serviceType]);
//     return details;
// }






// // פונקציה לשליפת ProfessionalServiceCode לפי serviceTypeCode ו-professionalId
// export async function getProfessionalServiceCode(professionalId, serviceTypeCode) {
//     const [rows] = await pool.query(`
//         SELECT ProffServiceID
//         FROM professional_services
//         WHERE idProfessional = ? AND ServiceTypeCode = ?
//     `, [professionalId, serviceTypeCode]);
//     // בדיקה אם יש תוצאה לפני החילוץ
//     if (rows.length > 0) {
//         const { ProffServiceID } = rows[0];
//         console.log(ProffServiceID, 44444);
//         return ProffServiceID;
//     } else {
//         return null; // במידה ואין תוצאה
//     }
// }
