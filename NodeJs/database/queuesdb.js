
import pool from './database.js';
import { getDaysOff } from './scheduledb.js';
import { getProfessionalAllDetails } from './professionalsdb.js';
import { getServiceDuration } from '../routes/professional_services.js';
import swal from 'sweetalert';

export async function getQueues() {
    const [queues] = await pool.query(`
        SELECT * FROM queues
    `);
    return queues;
}

// פונקציה שתבדוק אם מועד פנוי או לא
export const checkSlotAvailability = (appointments, startTime, endTime) => {
    // בודקת אם הזמן המבוקש חופף עם כל פגישה קיימת
    for (const appointment of appointments) {
        const existingStartTime = new Date(appointment.startTime).getTime();
        const existingEndTime = new Date(appointment.endTime).getTime();

        // אם המועד המבוקש חופף עם פגישה קיימת, מחזירים false
        if (
            (startTime >= existingStartTime && startTime < existingEndTime) ||
            (endTime > existingStartTime && endTime <= existingEndTime) ||
            (startTime <= existingStartTime && endTime >= existingEndTime)
        ) {
            return false; // הזמן תפוס
        }
    }

    return true; // הזמן פנוי
};

// שליפת נתונים מהדאטהבייס
async function getAvailableDays(professionalBusinesName) {
    try {
        // Fetch professionalId based on business_name
        const [professionalData] = await pool.query(
            'SELECT idProfessional FROM professionals WHERE business_name = ?',
            [professionalBusinesName]
        );

        if (professionalData.length === 0) {
            throw new Error('Professional not found for the provided business name.');
        }

        const professionalId = professionalData[0].idProfessional;

        // Fetch available days for the professionalId
        const [availableDays] = await pool.query(
            'SELECT dayDate, isAvailable FROM available_days WHERE professionalId = ?',
            [professionalId]
        );
        return availableDays;
    } catch (error) {
        console.error('Error fetching available days:', error);
        throw new Error('Unable to fetch available days.');
    }
}

// פונקציה לקבלת שעות העבודה לפי שם העסק (בהתאם ל-ID של בעל המקצוע)
async function getWorkingHoursByBusinessName(businessName) {
    try {
        // שליפת מזהה בעל המקצוע לפי שם העסק (אני מניח שאתה מחפש את ה-professionalId לפי שם העסק)
        const [businessRows] = await pool.query(
            `SELECT idProfessional FROM professionals WHERE business_name = ?`, [businessName]
        );

        if (!businessRows.length) {
            throw new Error('Business not found');
        }

        const professionalId = businessRows[0].idProfessional;

        // שליפת שעות העבודה לפי professionalId מתוך טבלת schedules
        const [workingHoursRows] = await pool.query(
            `SELECT dayOfWeek, startTime, endTime FROM schedules WHERE professionalId = ? ORDER BY dayOfWeek`, [professionalId]
        );
        if (!workingHoursRows.length) {
            throw new Error('Working hours not found for this business');
        }

        // החזרת שעות העבודה
        return workingHoursRows;

    } catch (error) {
        console.error('Error in getWorkingHoursByBusinessName:', error);
        throw new Error('Unable to fetch working hours');
    }
}

async function getAppointmentsByBusinessAndDate(professionalId, selectedDate) {

    // שליפת קוד שירות של המקצוען לפי ה-professionalId
    const [rows] = await pool.query(`
        SELECT ProffServiceID FROM professional_services
        WHERE idProfessional = ?`, [professionalId]);

    // אם לא נמצאה תוצאה, מחזירים שגיאה
    if (rows.length === 0) {
        throw new Error('לא נמצאו שירותים עבור מקצוען זה');
    }

    const ProfessionalServiceCode = rows[0].ProffServiceID;

    // שליפת הפגישות עבור השירות והיום המבוקש
    const [appointments] = await pool.query(`
        SELECT * FROM queues
        WHERE ProfessionalServiceCode = ? AND date = ?`, [ProfessionalServiceCode, selectedDate]);
    return appointments;
}

async function getServiceDurationForAppointment(ProfessionalServiceCode) {
    const [duration] = await pool.query(`
    SELECT Duration FROM professional_services
    WHERE ProffServiceID = ?`, [ProfessionalServiceCode])
    return duration;
}

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
    q.Date, 
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

// פונקציה המחזירה את כל התורים של בעל מקצוע ספציפי
export async function getQueuesByProfessionalId(idProfessional) {
    const query = `
        SELECT q.QueueCode, q.Date, q.Hour, q.Status,
               c.idCustomer, c.firstName, c.lastName, c.phone,
               ps.ServiceTypeCode, st.typeName AS serviceTypeName
        FROM queues q
        JOIN customers c ON q.CustomerCode = c.idCustomer
        JOIN professional_services ps ON q.ProfessionalServiceCode  = ps.ProffServiceID
        JOIN type_service st ON ps.ServiceTypeCode = st.typeCode
        WHERE ps.idProfessional = ?
        ORDER BY q.Date, q.Hour
    `;

    try {
        const [queues] = await pool.query(query, [idProfessional]);
        return queues;
    } catch (error) {
        console.error('Error fetching queues by professional ID:', error);
        throw error;
    }
}

// פונקציה לבדוק האם לוח התורים לחודש הבא כבר פתוח לבעל עסק ספציפי
export async function isNextMonthAvailable(businessOwnerId) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const year = nextMonth.getFullYear();
    const month = nextMonth.getMonth() + 1; // חודשים ב-JavaScript הם מ-0 עד 11
    const query = `
    SELECT COUNT(*) AS count
    FROM queues q
    JOIN professional_services ps ON q.ProfessionalServiceCode = ps.ProffServiceID
    WHERE YEAR(q.Date) = ? AND MONTH(q.Date) = ? AND ps.idProfessional = ?
    `;

    try {
        // מבצע את השאילתא לבדיקת כמות התורים לחודש הבא עבור בעל עסק מסוים
        const [result] = await pool.query(query, [year, month, businessOwnerId]);
        const { count } = result[0];
        // אם יש לפחות תור אחד, הלוח פתוח
        return count <= 0;
    } catch (error) {
        console.error('Error checking next month availability:', error);
        throw error;
    }
}

//עידכון תור
export async function updateExistQueue(QueueCode, customerId, StatusQueue) {
    try {
        const query = 'UPDATE queues SET CustomerCode=?, Status=?  WHERE QueueCode = ?';
        // Execute the query
        await pool.query(query, [customerId, StatusQueue, QueueCode]);
        // Optionally return updated data or success message
        return { message: 'Queue updated successfully' };
    } catch (error) {
        throw new Error(`Could not update queue: ${error.message}`);
    }
}

// פונקציה לעדכון פרטי לקוח
export const updateQueue = async (queueID, queueData) => {
    const { professionalServiceCode, customerCode, date, hour, status } = queueData;
    const query = 'UPDATE queues SET professionalServiceCode = ?, customerCode = ?, date = ?,hour = ?, status=?  WHERE queueCode = ?';
    await pool.query(query, [professionalServiceCode, customerCode, date, hour, status, queueID]);
};

// פונקציה לעדכון מצב תור
export async function updateQueueStatus(queueCode, status) {
    const query = 'UPDATE queues SET Status = ? WHERE QueueCode = ?';
    await pool.query(query, [status, queueCode]);
}

export async function cancelQueueByCode(queueCode) {
    try {
        const query = `
            UPDATE queues
            SET Status = 'cancelled'
            WHERE QueueCode = ?
        `;
        const [result] = await pool.query(query, [queueCode]);
        return result;
    } catch (error) {
        console.error('Error cancelling queue by code:', error);
        throw error;
    }
}

// פונקציה למחיקת תור לפי מספר זיהוי
export async function deleteQueue(id) {
    await pool.query(`DELETE FROM queues WHERE QueueCode = ?`, [id]);
}

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      WHERE MONTH(q.Date) = ? AND YEAR(q.Date) = ? AND bo.idProfessional = ? AND q.Status IN ('waiting', 'finished', 'available', 'scheduled')
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

//החזרת כל התורים של בעל העסק לפי ת.ז ולפי חודש
export async function getAllQueuesByMonthAndBusinessOwner(date, businessOwnerName) {
    const query = `
        SELECT q.QueueCode, q.Date, q.Hour, q.Status, c.firstName AS customerFirstName, c.lastName AS customerLastName, c.phone AS customerPhone,
               st.typeName AS serviceTypeName
        FROM queues q
        JOIN customers c ON q.CustomerCode = c.idCustomer
        JOIN professional_services ps ON q.ProfessionalServiceCode = ps.ProffServiceID
        JOIN type_service st ON ps.ServiceTypeCode = st.typeCode
        JOIN professionals bo ON ps.idProfessional = bo.idProfessional
        WHERE MONTH(q.Date) = MONTH(?) AND YEAR(q.Date) = YEAR(?) 
          AND bo.firstName = ? 
          AND q.Status IN ('finished', 'available', 'waiting')
    `;

    try {
        const [queues] = await pool.query(query, [date, date, businessOwnerName]);
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

export const updateEndedAppointments = async () => {
    try {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = `
        UPDATE queues
        SET Status = 'Finish'
        WHERE Date = ? AND CONCAT(Date, ' ', Hour) <= ?
      `;
        await pool.query(query, [formattedDate, now]);
    } catch (error) {
        console.error('שגיאה בעדכון התורים שסיימו:', error);
        throw error;
    }
};

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


// פונקציה שתפתח את לוח הזמנים עבור היום הבא עבור כל בעל עסק
export async function openDaySchedule() {
    try {
        // שלב ראשון - קבלת כל בעלי העסקים מהטבלה professionals
        const professionalsResult = await pool.query('SELECT idProfessional FROM professionals');
        console.log(professionalsResult, "professionalsResult");

        // בדוק אם יש בעלי עסקים
        if (!professionalsResult || !professionalsResult[0] || professionalsResult[0].length === 0) {
            console.log('No professionals found.');
            return;
        }

        // עבור כל בעל עסק, בצע את הפעולה להוסיף את היום הבא בתור
        for (const professional of professionalsResult[0]) {  // גישה למערך הראשון
            const professionalId = professional.idProfessional;  // תוקן השם של השדה

            // שלב שני - קבלת היום האחרון שהוזן עבור בעל העסק
            const lastAvailableDayResult = await pool.query(
                'SELECT dayDate FROM available_days WHERE professionalId = ? ORDER BY dayDate DESC LIMIT 1',
                [professionalId]
            );

            console.log(lastAvailableDayResult, "lastAvailableDayResult");

            // אם יש ימי עבודה קודמים, בחר את היום האחרון
            if (lastAvailableDayResult && lastAvailableDayResult[0] && lastAvailableDayResult[0].length > 0) {
                const lastAvailableDay = new Date(lastAvailableDayResult[0][0].dayDate);
                const nextDay = new Date(lastAvailableDay.setDate(lastAvailableDay.getDate() + 1));
                const formattedNextDay = nextDay.toISOString().split('T')[0];  // הגדרה אחרי החישוב של nextDay

                console.log(`Next day calculated: ${formattedNextDay}`);

                // בדוק אם היום הבא כבר קיים בתור עבור בעל העסק
                const existingDay = await pool.query(
                    'SELECT * FROM available_days WHERE dayDate = ? AND professionalId = ?',
                    [formattedNextDay, professionalId]
                );

                console.log(existingDay, "existingDay");

                // אם היום הבא לא קיים בתור, הוסף אותו
                if (existingDay[0].length === 0) {
                    await pool.query(
                        'INSERT INTO available_days (dayDate, professionalId, isAvailable) VALUES (?, ?, true)',
                        [formattedNextDay, professionalId]
                    );
                    console.log(`Schedule for professional ${professionalId} opened for date ${formattedNextDay}`);
                } else {
                    console.log(`Schedule for professional ${professionalId} already exists for date ${formattedNextDay}`);
                }
            } else {
                console.log(`No available days found for professional ${professionalId}`);
            }
        }
    } catch (error) {
        console.error('Error opening day schedule:', error);
        throw new Error('Error opening day schedule');
    }
}








export async function getFilteredQueues(businessName, serviceTypeName, selectedDate) {
    // מערך שמות הימים בשבוע
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    try {
        // קבלת פרטי העסק
        const business = await getProfessionalAllDetails(businessName);
        if (!business) throw new Error('Business not found.');

        // קבלת משך זמן השירות
        const serviceDuration = await getServiceDuration(businessName, serviceTypeName);
        if (!serviceDuration) throw new Error('Service duration not found.');

        // קבלת ימי החופש של בעל העסק
        const daysOff = await getDaysOff(business.idProfessional);
        const selectedDayNum = new Date(selectedDate).getDay();
        const selectedDayName = dayNames[selectedDayNum];
        const daysOffLowerCase = daysOff.map(day => day.toLowerCase());
        if (daysOffLowerCase.includes(selectedDayName.toLowerCase())) {
            return { message: `The selected day is a free and meetings cannot be booked. my free days is: ${daysOff} We would be happy to meet you on another day😊`, type: 'warning' };
        }
        // לשנות לפונקציה השולחת את היום ואת ת.ז בעל העסק ובודקת אם זמין ומחזירה אמת או שקר
        const availableDays = await getAvailableDays(businessName);
        const formattedSelectedDate = new Date(selectedDate).toISOString().split('T')[0];
        const isDayAvailable = availableDays.some(day => day.isAvailable && new Date(day.dayDate).toISOString().split('T')[0] === formattedSelectedDate);

        // בדיקה אם היום פתוח להזמנות
        if (!isDayAvailable) {
            return { message: 'The selected day is not available for appointments.', type: 'warning' };
        }


        // קבלת שעות העבודה של העסק
        const workingHours = await getWorkingHoursByBusinessName(business.business_name);
        const appointments = await getAppointmentsByBusinessAndDate(business.idProfessional, selectedDate);

        // המרת משך זמן השירות לדקות
        const timeParts = serviceDuration.split(':').map(Number);
        const serviceDurationMinutes = (timeParts[0] * 60) + timeParts[1] + (timeParts[2] / 60);
        let availableSlots = [];

        // לולאה העוברת על שעות העבודה ומייצרת טווחי זמן פנויים
        // במקום לעבור על כל הימים, נבדוק את היום הספציפי שנבחר
        const workingDay = workingHours.find(({ dayOfWeek }) => dayOfWeek.toUpperCase() === dayNames[selectedDayNum]);

        if (!workingDay) {
            return { message: 'The selected day is a day off and no appointments can be booked.' };
        }

        // אם מצאנו יום עבודה תואם, נמשיך
        // הסרת ה-Z כדי למנוע בעיות אזור זמן
        let start = new Date(`${selectedDate}T${workingDay.startTime.slice(0, 5)}:00`);
        let end = new Date(`${selectedDate}T${workingDay.endTime.slice(0, 5)}:00`);

        // נקבל מראש את כל מידע הפגישות הקיימות לייעול
        const existingAppointmentsInfo = [];
        for (const appointment of appointments) {
            const { Date: existingDate, Hour: existingHour, ProfessionalServiceCode } = appointment;

            // ודא שהשדה קיים ולא ריק
            if (!existingDate || !existingHour) {
                continue;
            }

            try {
                // Format the date properly
                const formattedDate = formatDate(existingDate);

                // Format the hour properly - ensure it has seconds
                const formattedHour = formatTime(existingHour);

                // יצירת אובייקט Date עם תאריך ושעה מפורמטים
                const existingStart = new Date(`${formattedDate}T${formattedHour}`);

                // Check if date is valid
                if (isNaN(existingStart.getTime())) {
                    console.error(`Invalid date created with: ${formattedDate}T${formattedHour}`);
                    continue;
                }

                // קבלת משך זמן הטיפול - באופן סינכרוני לטובת המבנה הקיים
                const serviceDurationForAppointment = await getServiceDurationForAppointment(ProfessionalServiceCode);

                if (!serviceDurationForAppointment || !serviceDurationForAppointment[0]?.Duration) {
                    continue;
                }

                const serviceDurationForAppointmentTime = serviceDurationForAppointment[0].Duration.split(':').map(Number);
                const durationInMillis = (serviceDurationForAppointmentTime[0] * 60 * 60 +
                    serviceDurationForAppointmentTime[1] * 60 +
                    serviceDurationForAppointmentTime[2]) * 1000;

                const existingEnd = new Date(existingStart.getTime() + durationInMillis);

                existingAppointmentsInfo.push({
                    start: existingStart,
                    end: existingEnd
                });

            } catch (err) {
                console.error("Error processing appointment:", err, "Data:", existingDate, existingHour);
            }


            while (start.getTime() + serviceDurationMinutes * 60000 <= end.getTime()) {
                const slotEnd = new Date(start.getTime() + serviceDurationMinutes * 60000);

                // בדיקת זמינות ללא async בתוך some() שגורם לבעיות
                // const isAvailable = !existingAppointmentsInfo.some(appt => 
                //     start < appt.end && slotEnd > appt.start
                // );
                const isAvailable = existingAppointmentsInfo.every(appt =>
                    slotEnd <= appt.start || start >= appt.end
                );


                if (isAvailable) {
                    availableSlots.push({
                        start: new Date(start),
                        end: slotEnd,
                        // הוספת פורמט קריא של השעות
                        startTime: start.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
                        endTime: slotEnd.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
                    });
                }

                start = new Date(start.getTime() + serviceDurationMinutes * 60000);
            }

            if (availableSlots.length === 0) {
                return { message: 'No available appointments for the selected day.' };
            }

            return { availableSlots };
        }
    } catch (error) {
        console.error('Error in getFilteredQueues:', error);
        return { error: 'Unable to fetch filtered queues. Please try again later.' };
    }
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