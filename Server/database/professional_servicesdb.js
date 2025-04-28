import pool from './database.js';

// Function to get all professional services
export async function getProfessionalServices() {
    const [professionalServices] = await pool.query(`
        SELECT * FROM professional_services
        where 
    `);
    return professionalServices;
}

// Function to get a professional service by ID
export async function getProfessionalServicesById(businessName, serviceTypeName) {
    const query = `
        SELECT ps.ProffServiceID, ps.ServiceTypeCode, ps.idProfessional, ps.Price, ps.Duration
        FROM professional_services ps
        JOIN professionals p ON p.idProfessional = ps.idProfessional  -- Assuming there's a relationship with idProfessional
        JOIN type_service st ON st.typeCode = ps.ServiceTypeCode  -- Assuming ServiceTypeCode links both
        WHERE p.business_name = ? AND st.typeName = ?
    `;

    try {
        const [profService] = await pool.query(query, [businessName, serviceTypeName]);

        return profService;
    } catch (error) {
        console.error('Error fetching professional services:', error);
        throw error;  // Rethrow or handle the error as needed
    }
}

// Function to update an existing professional service
export const updateProfessionalService = async (profServiceID, profServiceData) => {
    const { serviceTypeCode, idProfessional, price, duration } = profServiceData;
    const query = `
        UPDATE professional_services 
        SET serviceTypeCode = ?, idProfessional = ?, price = ?, duration = ? 
        WHERE ProffServiceID = ?
    `;
    await pool.query(query, [serviceTypeCode, idProfessional, price, duration, profServiceID]);
};


export async function getProffServiceID(idProfessional, serviceTypeCode) {
    const query = `
        SELECT ProffServiceID
        FROM professional_services
        WHERE idProfessional = ?
        AND ServiceTypeCode = ?
    `;
    const [[result]] = await pool.query(query, [idProfessional, serviceTypeCode]);
    return result ? result.ProffServiceID : null;
}

export async function postProfessionalService(idProfessional, typeName, Price, Duration) {
    try {
        const durationInSeconds = Duration * 60;
        const [result] = await pool.query(
            `INSERT INTO professional_services (idProfessional, ServiceTypeCode, Price, Duration) 
         VALUES (?, ?, ?, ?)`,
            [idProfessional, typeName, Price, durationInSeconds]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Error inserting professional service: ${error.message}`);
    }
}