import pool from './database.js'

export async function getCities() {
    const [cities] = await pool.query(`SELECT * FROM cities `);
    return cities;
}


export async function getCityById(id) {
    const [[city]] = await pool.query(`select cityName from cities where cityCode=?`, [id]);
    return city;
}

export async function postCity(cityName) {
    const [{ insertId }] = await pool.query(`insert into cities( cityName) VALUES (?)`, [cityName]);
    return await getCustomer(insertId);
}

export const updateCity = async (cityCode, cityData) => {
    const { cityName } = cityData;
    const query = 'UPDATE cities SET cityName = ? WHERE cityCode = ?';
    await pool.query(query, [cityName, cityCode]);
};

