import pool from './database.js';
import { getDaysOff } from './scheduledb.js';
import { getProfessionalAllDetails } from './professionalsdb.js';
import { getServiceDuration } from '../routes/professional_services.js';

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(timeString) {
    try {
        // If there's no timeString or it's invalid, return a default
        if (!timeString || typeof timeString !== 'string') {
            console.warn(`Invalid time format: ${timeString}`);
            return '00:00:00';
        }

        // If time is in format HH:MM, add seconds
        if (timeString.match(/^\d{1,2}:\d{2}$/)) {
            return `${timeString}:00`;
        }

        // If time already has seconds, return as is
        if (timeString.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
            return timeString;
        }

        // Try to parse the time from various formats
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
            const hours = timeParts[0].padStart(2, '0');
            const minutes = timeParts[1].padStart(2, '0');
            const seconds = timeParts[2] ? timeParts[2].padStart(2, '0') : '00';
            return `${hours}:${minutes}:${seconds}`;
        }

        console.warn(`Unrecognized time format: ${timeString}`);
        return timeString;
    } catch (error) {
        console.error(`Error formatting time ${timeString}:`, error);
        return timeString;
    }
}

// פונקציה לקבלת שעות העבודה לפי שם העסק 
async function getWorkingHoursByBusinessName(businessName) {
    try {
        const [businessRows] = await pool.query(
            `SELECT idProfessional FROM professionals WHERE business_name = ?`, [businessName]
        );

        if (!businessRows.length) {
            throw new Error('Business not found');
        }
        const professionalId = businessRows[0].idProfessional;

        const [workingHoursRows] = await pool.query(
            `SELECT dayOfWeek, startTime, endTime FROM schedules WHERE professionalId = ? ORDER BY dayOfWeek`, [professionalId]
        );
        if (!workingHoursRows.length) {
            throw new Error('Working hours not found for this business');
        }
        return workingHoursRows;
    } catch (error) {
        console.error('Error in getWorkingHoursByBusinessName:', error);
        throw new Error('Unable to fetch working hours');
    }
}
//קבלת פגישות קיימות לבעל עסק בתאריך מסוים
async function getAppointmentsByBusinessAndDate(professionalId, selectedDate) {
    // שליפת כל שירותי המקצוען
    const [rows] = await pool.query(`
        SELECT ProffServiceID FROM professional_services
        WHERE idProfessional = ?`, [professionalId]);

    if (rows.length === 0) {
        throw new Error('לא נמצאו שירותים עבור מקצוען זה');
    }

    // יצירת מערך של כל קודי השירות
    const serviceCodes = rows.map(row => row.ProffServiceID);

    // בניית placeholders לשאילתה (?,?,?... לפי אורך המערך)
    const placeholders = serviceCodes.map(() => '?').join(',');

    // שליפת התורים לכל הקודים שקשורים לתאריך
    const [appointments] = await pool.query(`
        SELECT * FROM queues
        WHERE ProfessionalServiceCode IN (${placeholders}) AND date = ? AND status = ?`,
        [...serviceCodes, selectedDate, 'scheduled']
    );
    return appointments;
}

// קבלת משך זמן הפגישה
async function getServiceDurationForAppointment(ProfessionalServiceCode) {
    const [duration] = await pool.query(`
    SELECT Duration FROM professional_services
    WHERE ProffServiceID = ?`, [ProfessionalServiceCode])
    return duration;
}

//קבלת תור ספציפי
export async function getQueueById(id) {
    const [[queue]] = await pool.query(`select * from queues where queueCode=?`, [id]);
    return queue;
}

//פונקציה המחזירה את כל התורים של לקוח ספיציפי
export async function getQueuesByCustomer(customerId) {
    try {
        const query = `
    SELECT 
    q.QueueCode, 
    q.ProfessionalServiceCode, 
    q.CustomerCode, 
    CONVERT_TZ(q.Date, '+00:00', '+03:00') AS Date,
    q.Hour, 
    q.Status, 
    c.idCustomer, 
    c.firstName, 
    c.lastName, 
    c.address, 
    c.cityCode, 
    c.email, 
    c.phone, 
    p.business_name AS businessName, 
    t.typeName AS serviceName
FROM queues q
JOIN customers c ON q.CustomerCode = c.idCustomer
JOIN professional_services ps ON q.ProfessionalServiceCode = ps.ProffServiceID
JOIN professionals p ON ps.idProfessional = p.idProfessional
JOIN  type_service t ON ps.ServiceTypeCode = t.typeCode
WHERE q.CustomerCode = ?
AND q.Status != 'cancelled';



        `;
        const [queues] = await pool.query(query, [customerId]);
        return queues;
    } catch (error) {
        console.error('Error fetching queues by customer ID:', error);
        throw error;
    }
}

//החזרת התורים של בעל העסק לפי ת.ז ולפי תאריך ולפי תורים תפוסים
export async function getQueuesByDateAndBusinessOwner(month, year, id) {
    const query = `
      SELECT q.QueueCode, q.Date, q.Hour, q.Status, c.firstName AS customerFirstName, c.lastName AS customerLastName, c.phone AS customerPhone,
             st.typeName AS serviceTypeName
      FROM queues q
      JOIN customers c ON q.CustomerCode = c.idCustomer
      JOIN professional_services ps ON q.ProfessionalServiceCode = ps.ProffServiceID
      JOIN type_service st ON ps.ServiceTypeCode = st.typeCode
      JOIN professionals bo ON ps.idProfessional = bo.idProfessional
      WHERE MONTH(q.Date) = ? AND YEAR(q.Date) = ? AND bo.idProfessional = ? AND q.Status IN ('finished', 'scheduled')
    `;

    try {
        const [queues] = await pool.query(query, [month, year, id]);
        // Convert UTC date to local time and format to YYYY-MM-DD
        const localQueues = queues.map(queue => {
            const localDate = new Date(queue.Date);
            queue.Date = formatDate(localDate); // format to YYYY-MM-DD
            return queue;
        });
        return localQueues;
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
}

// //החזרת תורים זמיניים לתאריך מסוים וע"פ כללים
// export async function getFilteredQueues(businessName, serviceTypeName, selectedDate) {
//     const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
//     try {
//         // קבלת ת.ז בעל העסק
//         const idProfessional = await getProfessionalAllDetails(businessName);
//         if (!idProfessional) throw new Error('Business not found.');

//         // קבלת משך זמן השירות
//         const serviceDuration = await getServiceDuration(businessName, serviceTypeName);
//         if (!serviceDuration) throw new Error('Service duration not found.');

//         // קבלת ימי החופש של בעל העסק
//         const daysOff = await getDaysOff(idProfessional.idProfessional);
//         const selectedDayNum = new Date(selectedDate).getDay();
//         const selectedDayName = dayNames[selectedDayNum];
//         const daysOffLowerCase = daysOff.map(day => day.toLowerCase());

//         if (daysOffLowerCase.includes(selectedDayName.toLowerCase())) {
//             return { message: `The selected day is a free day, meetings cannot be booked. My free days are: ${daysOff.join(", ")}. We would be happy to meet you on another day😊`, type: 'warning' };
//         }

//         // קבלת שעות העבודה של העסק
//         const workingHours = await getWorkingHoursByBusinessName(businessName);

//         //קבלת פגישות קיימות
//         const appointments = await getAppointmentsByBusinessAndDate(idProfessional.idProfessional, selectedDate);

//         // המרת משך זמן השירות לדקות
//         const timeParts = serviceDuration.split(':').map(Number);
//         const serviceDurationMinutes = (timeParts[0] * 60) + timeParts[1] + (timeParts[2] / 60);

//         let availableSlots = [];

//         // חיפוש יום העבודה המתאים - חופש
//         const workingDay = workingHours.find(({ dayOfWeek }) => dayOfWeek.toUpperCase() === dayNames[selectedDayNum]);
//         if (!workingDay) {
//             return { message: 'The selected day is a day off and no appointments can be booked.' };
//         }

//         let start = new Date(`${selectedDate}T${workingDay.startTime.slice(0, 5)}:00`);
//         let end = new Date(`${selectedDate}T${workingDay.endTime.slice(0, 5)}:00`);

//         // חישוב מידע קיים לפגישות
//         const existingAppointmentsInfo = [];

//         if (appointments) {
//             for (const appointment of appointments) {
//                 const { Date: existingDate, Hour: existingHour, ProfessionalServiceCode } = appointment;
//                 if (!existingDate || !existingHour) continue;
//                 console.log(111, existingDate, existingHour, ProfessionalServiceCode);

//                 try {
//                     // Format the date and hour properly
//                     const formattedDate = formatDate(existingDate);
//                     const formattedHour = formatTime(existingHour);
//                     // const existingStart = new Date(`${formattedDate}T${formattedHour}`);
//                     const baseDate = new Date(existingDate);
//                     const [hour, minute, second] = existingHour.split(':').map(Number);
//                     baseDate.setHours(hour, minute, second || 0, 0);
//                     const existingStart = new Date(baseDate);

//                     if (isNaN(existingStart.getTime())) continue;

//                     // קבלת משך זמן הפגישה
//                     const serviceDurationForAppointment = await getServiceDurationForAppointment(ProfessionalServiceCode);
//                     if (!serviceDurationForAppointment || !serviceDurationForAppointment[0]?.Duration) continue;

//                     const serviceDurationForAppointmentTime = serviceDurationForAppointment[0].Duration.split(':').map(Number);
//                     const durationInMillis = (serviceDurationForAppointmentTime[0] * 60 * 60 +
//                         serviceDurationForAppointmentTime[1] * 60 +
//                         serviceDurationForAppointmentTime[2]) * 1000;

//                     const existingEnd = new Date(existingStart.getTime() + durationInMillis);
//                     existingAppointmentsInfo.push({ start: existingStart, end: existingEnd });
//                 } catch (err) {
//                     console.error("Error processing appointment:", err);
//                 }
//             }

//             // יצירת טווחי זמן פנויים
//             while (start.getTime() + serviceDurationMinutes * 60000 <= end.getTime()) {
//                 const slotEnd = new Date(start.getTime() + serviceDurationMinutes * 60000);

//                 const isAvailable = existingAppointmentsInfo.every(appt =>
//                     slotEnd <= appt.start || start >= appt.end
//                 );

//                 if (isAvailable) {
//                     availableSlots.push({
//                         start: new Date(start),
//                         end: slotEnd,
//                         startTime: start.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
//                         endTime: slotEnd.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
//                     });
//                 }

//                 start = new Date(start.getTime() + serviceDurationMinutes * 60000);
//             }

//             if (availableSlots.length === 0) {
//                 return { message: 'No available appointments for the selected day.' };
//             }

//             return { availableSlots };

//         } else {
//             return { message: 'No appointments found for this day.' };
//         }

//     } catch (error) {
//         console.error('Error in getFilteredQueues:', error);
//         return { error: 'Unable to fetch filtered queues. Please try again later.' };
//     }
// }

//החזרת כל התורים של בעל העסק לפי ת.ז ולפי חודש

export async function cancelInAvailableDays(userId, date) {
    await pool.query(
        'INSERT IGNORE INTO unavailable_days (professional_id, date, reason) VALUES (?, ?, ?)',
        [userId, date, 'Canceled workday']
    );
}



export async function getFilteredQueues(businessName, serviceTypeName, selectedDate) {
    console.log("🔍 Starting getFilteredQueues...");
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    try {
        // קבלת ת.ז בעל העסק
        const idProfessional = await getProfessionalAllDetails(businessName);
        console.log("📌 idProfessional:", idProfessional);
        if (!idProfessional) throw new Error('Business not found.');

        // קבלת משך זמן השירות
        const serviceDuration = await getServiceDuration(businessName, serviceTypeName);
        console.log("📌 serviceDuration:", serviceDuration);
        if (!serviceDuration) throw new Error('Service duration not found.');

        // קבלת ימי החופש של בעל העסק
        const daysOff = await getDaysOff(idProfessional.idProfessional);
        console.log("📌 daysOff:", daysOff);
        const selectedDayNum = new Date(selectedDate).getDay();
        const selectedDayName = dayNames[selectedDayNum];
        const daysOffLowerCase = daysOff.map(day => day.toLowerCase());

        if (daysOffLowerCase.includes(selectedDayName.toLowerCase())) {
            console.log("⚠️ selected day is a day off.");
            return { message: `The selected day is a free day, meetings cannot be booked. My free days are: ${daysOff.join(", ")}. We would be happy to meet you on another day😊`, type: 'warning' };
        }

        // קבלת שעות העבודה
        const workingHours = await getWorkingHoursByBusinessName(businessName);
        console.log("📌 workingHours:", workingHours);

        // פגישות קיימות
        const appointments = await getAppointmentsByBusinessAndDate(idProfessional.idProfessional, selectedDate);
        console.log("📌 appointments:", appointments);

        const timeParts = serviceDuration.split(':').map(Number);
        const serviceDurationMinutes = (timeParts[0] * 60) + timeParts[1] + (timeParts[2] / 60);
        console.log("⏱️ serviceDurationMinutes:", serviceDurationMinutes);

        let availableSlots = [];

        const workingDay = workingHours.find(({ dayOfWeek }) => dayOfWeek.toUpperCase() === dayNames[selectedDayNum]);
        if (!workingDay) {
            console.log("❌ no working hours on this day");
            return { message: 'The selected day is a day off and no appointments can be booked.', type: 'warning' };
        }

        let start = new Date(`${selectedDate}T${workingDay.startTime.slice(0, 5)}:00`);
        let end = new Date(`${selectedDate}T${workingDay.endTime.slice(0, 5)}:00`);
        console.log("⏰ working time:", start.toISOString(), "-", end.toISOString());

        const [rows] = await pool.query(
            'SELECT * FROM unavailable_days WHERE professional_id = ? AND date = ?',
            [idProfessional.idProfessional, selectedDate]
        );
        console.log("📌 unavailable_days rows:", rows);

        if (rows.length > 0) {
            console.log("⚠️ day is unavailable due to special block");
            return {
                message: 'Cannot book on this date, professional is unavailable.',
                type: 'warning'
            };
        }

        const existingAppointmentsInfo = [];

        if (appointments) {
            for (const appointment of appointments) {
                const { Date: existingDate, Hour: existingHour, ProfessionalServiceCode } = appointment;
                if (!existingDate || !existingHour) continue;

                console.log("🗓️ Processing appointment:", existingDate, existingHour, ProfessionalServiceCode);

                try {
                    const baseDate = new Date(existingDate);
                    const [hour, minute, second] = existingHour.split(':').map(Number);
                    baseDate.setHours(hour, minute, second || 0, 0);
                    const existingStart = new Date(baseDate);

                    const serviceDurationForAppointment = await getServiceDurationForAppointment(ProfessionalServiceCode);
                    if (!serviceDurationForAppointment || !serviceDurationForAppointment[0]?.Duration) continue;

                    const serviceDurationForAppointmentTime = serviceDurationForAppointment[0].Duration.split(':').map(Number);
                    const durationInMillis = (serviceDurationForAppointmentTime[0] * 60 * 60 +
                        serviceDurationForAppointmentTime[1] * 60 +
                        serviceDurationForAppointmentTime[2]) * 1000;

                    const existingEnd = new Date(existingStart.getTime() + durationInMillis);
                    existingAppointmentsInfo.push({ start: existingStart, end: existingEnd });

                    console.log("📌 existing appointment time:", existingStart, "to", existingEnd);
                } catch (err) {
                    console.error("❗ Error processing appointment:", err);
                }
            }

            while (start.getTime() + serviceDurationMinutes * 60000 <= end.getTime()) {
                const slotEnd = new Date(start.getTime() + serviceDurationMinutes * 60000);

                const isAvailable = existingAppointmentsInfo.every(appt =>
                    slotEnd <= appt.start || start >= appt.end
                );

                if (isAvailable) {
                    availableSlots.push({
                        start: new Date(start),
                        end: slotEnd,
                        startTime: start.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
                        endTime: slotEnd.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                    });
                }

                start = new Date(start.getTime() + serviceDurationMinutes * 60000);
            }

            console.log("✅ availableSlots:", availableSlots);

            if (availableSlots.length === 0) {
                return { message: 'No available appointments for the selected day.' };
            }

            return { availableSlots };

        } else {
            console.log("❌ No appointments found at all");
            return { message: 'No appointments found for this day.' };
        }

    } catch (error) {
        console.error('❗ Error in getFilteredQueues:', error);
        return { error: 'Unable to fetch filtered queues. Please try again later.' };
    }
}


export async function getQueuesByFullDateAndBusinessOwner(fullDate, id) {
    const query = `
      SELECT q.QueueCode, q.Date, q.Hour, q.Status, c.firstName AS customerFirstName, c.lastName AS customerLastName, c.phone AS customerPhone,
             st.typeName AS serviceTypeName
      FROM queues q
      JOIN customers c ON q.CustomerCode = c.idCustomer
      JOIN professional_services ps ON q.ProfessionalServiceCode = ps.ProffServiceID
      JOIN type_service st ON ps.ServiceTypeCode = st.typeCode
      JOIN professionals bo ON ps.idProfessional = bo.idProfessional
      WHERE DATE(q.Date) = ? AND bo.idProfessional = ? AND q.Status IN ('waiting', 'finished', 'available', 'scheduled')
    `;
    try {
        const [queues] = await pool.query(query, [fullDate, id]);
        console.log("queues", queues);

        // Convert UTC date to local time and format to YYYY-MM-DD
        const localQueues = queues.map(queue => {
            const localDate = new Date(queue.Date);
            queue.Date = formatDate(localDate); // format to YYYY-MM-DD
            return queue;
        });
        return localQueues;
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
}

//הוספת תור חדש
export const postQueue = async (businessName, serviceType, customerId, date, startTime, status) => {
    try {
        // שלב 1: הבאת ID של בעל העסק לפי שם העסק
        const [professionalResult] = await pool.query(`
            SELECT idProfessional 
            FROM professionals 
            WHERE business_name =  ?`, [businessName]);

        if (professionalResult.length === 0) {
            throw new Error('Business not found');
        }

        const professionalId = professionalResult[0].idProfessional;
        const [serviceCode] = await pool.query(`
            SELECT typeCode 
            FROM type_service 
            WHERE typeName = ?`, [serviceType]);

        // שלב 2: הבאת קוד השירות מהטבלה professional_services לפי שם השירות ו-ID בעל העסק
        const [serviceResult] = await pool.query(`
            SELECT ProffServiceID 
            FROM professional_services 
            WHERE ServiceTypeCode = ? AND idProfessional = ?`, [serviceCode[0].typeCode, professionalId]);

        if (serviceResult.length === 0) {
            throw new Error('Service not found for this business');
        }

        if (!(startTime instanceof Date)) {
            startTime = new Date(startTime);  // Convert if necessary
        }

        const startFormatted = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}:00`;
        console.log(5454, serviceResult[0].ProffServiceID, customerId, date, startFormatted, status);

        // שלב 3: הכנסת התור לטבלה queues
        const [result] = await pool.query(`
            INSERT INTO queues (ProfessionalServiceCode, CustomerCode, Date, Hour, Status)
            VALUES (?, ?, ?, ?, ?)`, [serviceResult[0].ProffServiceID, customerId, date, startFormatted, status]);
        console.log(77);

        if (result.affectedRows === 0) {
            return null; // אם ההוספה נכשלה
        }
        console.log(88);

        return {
            QueueCode: result.insertId,
            ProfessionalServiceCode: serviceResult[0].ProffServiceID,
            CustomerCode: customerId,
            Date: date,
            StartTime: startFormatted,
            Status: status
        };

    } catch (error) {
        console.error('Error in postQueue:', error);
        throw error;
    }
}

//ביטול תור ספציפי
export async function cancelQueueByCode(queueCode) {
    try {
        const query = `
          UPDATE queues
          SET Status = 'cancelled', CustomerCode = NULL
          WHERE QueueCode = ?
        `;
        const [result] = await pool.query(query, [queueCode]);
        return result;
    } catch (error) {
        console.error('Error cancelling queue by code:', error);
        throw error;
    }
}

//עדכון סטטוס התור
export async function updateQueueStatus(queueCode, newStatus) {
    try {
        const query = `
            UPDATE queues
            SET Status = ?
            WHERE QueueCode = ?
        `;
        await pool.query(query, [newStatus, queueCode]);
    } catch (error) {
        console.error('Error updating queue status:', error);
        throw error;
    }
}
// פונקציה שמחזירה את התורים הקרובים של הלקוח
export async function getUpcomingQueuesForCustomer(customerId) {
    try {
        console.log("milk");
        const query = `
        SELECT 
        q.QueueCode, 
        q.Date, 
        q.Hour, 
        p.business_name AS businessName, 
        t.typeName AS serviceName
        FROM queues q
        JOIN professional_services ps ON q.ProfessionalServiceCode = ps.ProffServiceID
        JOIN professionals p ON ps.idProfessional = p.idProfessional
        JOIN type_service t ON ps.ServiceTypeCode = t.typeCode
        WHERE q.CustomerCode = ?
        AND q.Status != 'cancelled'
        AND DATEDIFF(q.Date, CURDATE()) BETWEEN 1 AND 3`;
        const [queues] = await pool.query(query, [customerId]);
        return queues;
    } catch (error) {
        console.error('Error fetching upcoming queues for customer:', error);
        throw error;
    }
}

