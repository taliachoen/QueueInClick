import pool from './database.js'

//פונקציה המחזירה את כל לקוחות
export async function getSchedules() {
  const [schedules] = await pool.query(`
        SELECT scheduleCode, professionalServiceCode, dayOfWeek, startTime, endTime FROM schedules
    `);
  return schedules;
}


export async function getDaysOff(userId) {
  try {
    console.log("userID", userId);
    
    // שאילתת SQL כדי לשלוף את ימי השבוע שבהם המקצוען עובד
    const [rows] = await pool.query(`
      SELECT dayOfWeek
      FROM schedules
      WHERE professionalId = ?
    `, [userId]);
    
    // מערך שמקשר בין שמות הימים למספרים
    const dayMap = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    
    // מערך שמקשר בין מספרים לשמות הימים
    const reverseDayMap = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    };
    
    // מערך של כל ימות השבוע (במספרים)
    const allDays = [0, 1, 2, 3, 4, 5, 6];
    
    // ממפה את השורות כדי לחלץ את הימים בשמות, וממיר אותם למספרים
    const workDays = rows.map(row => dayMap[row.dayOfWeek]);
    console.log("rows", rows);
    console.log("workDays", workDays);
    
    // מחסיר את ימי העבודה מימות השבוע ומחזיר את ימי החופש
    const daysOffNumbers = allDays.filter(day => !workDays.includes(day));
    
    // ממיר את ימי החופש בחזרה לשמות ימים
    const daysOff = daysOffNumbers.map(day => reverseDayMap[day]);
    console.log("daysOff", daysOff);
    
    // מחזיר את המערך daysOff
    return daysOff;
  } catch (error) {
    // טיפול בשגיאות שקורות במהלך השאילתה למסד הנתונים
    console.error('Error fetching schedule:', error);
    throw new Error('Internal server error');
  }
}

//פונקציה המחזירה לקוח לפי מספר זהות
export async function getSchedule(id) {
  const [[schedule]] = await pool.query(`scheduleCode, professionalServiceCode, dayOfWeek, startTime, endTime FROM schedules where scheduleCode=?`, [id]);
  return schedule;
}

// פונקציה למחיקת משימה לפי מספר זיהוי
export async function deleteSchedule(scheduleCode) {
  await pool.query(`DELETE FROM schedules WHERE scheduleCode = ?`, [scheduleCode]);
}

//פונקציה לעדכון פרטי לקוח
export const updateSchedule = async (scheduleCode, scheduleData) => {
  const { professionalServiceCode, dayOfWeek, startTime, endTime } = scheduleData;
  const query = 'UPDATE schedules SET scheduleCode = ?, professionalServiceCode = ?, dayOfWeek = ?,startTime = ?, endTime=? WHERE scheduleCode = ?';
  await pool.query(query, [scheduleCode, professionalServiceCode, dayOfWeek, startTime, endTime]);
};


export async function postSchedule(professionalId, dayOfWeek, startTime, endTime) {
  try {
    const [result] = await pool.query(
      `INSERT INTO schedules (professionalId, dayOfWeek, startTime, endTime) 
         VALUES (?, ?, ?, ?)`,

      [professionalId, dayOfWeek, startTime, endTime]
    );
    return result.insertId;
  } catch (error) {
    throw new Error(`Error inserting schedule: ${error.message}`);
  }
}

// פונקציה להחזרת schedules לפי professionalId ולפי serviceTypeCode
export async function getSchedulesByProfessionalIdAndServiceType(professionalId, serviceTypeCode) {
  try {
    const [rows] = await pool.query(
      `SELECT startTime, endTime 
       FROM schedules 
       WHERE professionalId = ? AND service_typeCode = ?`,
      [professionalId, serviceTypeCode]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching schedules by professionalId and serviceTypeCode:', error);
    throw new Error('Internal server error');
  }
}