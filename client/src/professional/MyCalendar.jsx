import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../userContex';
import axios from 'axios';
import Calendar from 'react-calendar';
import Swal from 'sweetalert2';
import '../css/MyCalendar.css';
import moment from 'moment-timezone';
import io from "socket.io-client";
const socket = io("http://localhost:8080");

const MyCalendar = () => {
  const { user } = useContext(UserContext);
  const [appointments, setAppointments] = useState({});
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [noAppointmentsMessage, setNoAppointmentsMessage] = useState('');
  const [date, setDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [freeDays, setFreeDays] = useState([]);
  const [choiceDay, setChoiceDay] = useState(selectedDay);
  const userId = user.id;

  useEffect(() => {
    // עדכון הודעת "אין תורים" אחרי שינוי בתאריך
    const filteredAppointments = appointments[selectedDay]?.filter(appointment => normalizeDate(appointment.Date) === selectedDay) || [];
    setSelectedDayAppointments(filteredAppointments);
    setNoAppointmentsMessage(filteredAppointments.length === 0 ? `No appointments for ${selectedDay}` : '');
  }, [selectedDay, appointments]); // התלויות ב-selectedDay ובappointments

  useEffect(() => {
    socket.on("appointmentAdd", (data) => {
      console.log("New appointment added:", data);
      fetchInitialAppointments();
    });

    return () => {
      socket.off("appointmentAdd");
    };
  }, []);

  useEffect(() => {
    socket.on("appointmentCancelled", (data) => {
      console.log("Appointment cancelled:", data);
      fetchInitialAppointments();
    });

    return () => {
      socket.off("appointmentCancelled");
    };
  }, []);

  useEffect(() => {
    socket.on("appointmentCancelledByBusiness", (data) => {
      console.log("appointment Cancelled By Business cancelled:", data);
      fetchInitialAppointments();
    });

    return () => {
      socket.off("appointmentCancelledByBusiness");
    };
  }, []);

  const normalizeDate = (date) => {
    // השתמש ב-moment כדי לוודא שהתאריך מחושב נכון
    const normalizedDate = moment(date).format('YYYY-MM-DD');
    if (!normalizedDate) {
      console.error("Invalid date format:", date);
      return null; // מחזיר null במקרה של תאריך לא תקני
    }
    return normalizedDate;  // מחזיר בפורמט YYYY-MM-DD
  };

  const isCancelableDay = () => {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');
    const selected = moment(choiceDay).startOf('day');

    return selected.isAfter(tomorrow);
  };


  // פונקציה להמיר תאריך ליום בשבוע
  const getDayName = (date) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getDay()];
  };
  const tileClassName = ({ date }) => {
    const normalized = normalizeDate(date);
    const dayName = getDayName(date);

    if (freeDays.includes(dayName)) {
      return 'no-workday';  // אם זה יום חופשי, הוא יקבל רקע אפור
    }
    if (selectedDay === normalized) {
      return 'selected-day'; // אם זה היום שנבחר, הוא יצבע באפור
    }
    if (normalizeDate(new Date()) === normalized) {
      return 'today'; // אם זה היום הנוכחי, הוא יצבע בכחול
    }
    return ''; // ברירת מחדל - ללא מחלקה מיוחדת
  };


  useEffect(() => {
    const fetchFreeDays = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/schedule/daysOfWeek/${userId}`);

        if (Array.isArray(response.data.daysOff)) {
          setFreeDays(response.data.daysOff);
        } else {
          console.error("Expected an array of free days, but got:", response.data);
        }
      } catch (error) {
        console.error('Error fetching free days:', error);
      }
    };

    fetchFreeDays();
  }, []);



  const adjustMonthYear = (month, year) => {
    if (month < 1) return { month: 12, year: year - 1 };
    if (month > 12) return { month: 1, year: year + 1 };
    return { month, year };
  };

  const fetchAppointmentsFromServer = async (year, month) => {
    try {
      const response = await axios.get(`http://localhost:8080/queues/allQueue/${month}/${year}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };


  const fetchInitialAppointments = async () => {
    const monthsToLoad = [
      adjustMonthYear(currentMonth - 1, currentYear),
      { month: currentMonth, year: currentYear },
      adjustMonthYear(currentMonth + 1, currentYear)
    ];
    const newAppointments = { ...appointments };
    for (const { month, year } of monthsToLoad) {
      const key = `${year}-${month}`;
      if (!newAppointments[key]) {
        const data = await fetchAppointmentsFromServer(year, month);
        if (data) newAppointments[key] = data;
      }
    }
    setAppointments(prev => ({ ...prev, ...newAppointments }));
  };

  const prefetchNextMonth = async () => {
    const { month: nextMonth, year: nextYear } = adjustMonthYear(currentMonth + 1, currentYear);
    const key = `${nextYear}-${nextMonth}`;
    if (!appointments[key]) {
      const data = await fetchAppointmentsFromServer(nextYear, nextMonth);
      if (data) {
        setAppointments(prev => ({ ...prev, [key]: data }));
      }
    }
  };

  useEffect(() => {
    fetchInitialAppointments();
    prefetchNextMonth();
  }, []);

  useEffect(() => {
    prefetchNextMonth();
  }, [currentMonth]);

  useEffect(() => {
    if (!appointments[`${currentYear}-${currentMonth + 1}`]) {
      prefetchNextMonth();
    }
  }, [currentMonth, currentYear]);

  const handleDaySelection = (day) => {
    // הפוך את היום שנבחר לפורמט תאריך סטנדרטי (YYYY-MM-DD)
    const selectedDate = normalizeDate(day);
    setChoiceDay(selectedDate);
    // המרת היום שנבחר לפורמט המתאים לאזור הזמן המקומי של המשתמש
    // const localSelectedDay = moment(selectedDate).tz(moment.tz.guess()).format('YYYY-MM-DD');
    // התאמת חודש ושנה שנבחרו
    const month = day.getMonth() + 1;
    const year = day.getFullYear();
    const key = `${year}-${month}`;
    // אם קיימים תורים לאותו חודש, נסה למצוא תורים לפי היום שנבחר
    if (appointments[key]) {
      const filteredAppointments = appointments[key].filter(appointment => {
        const appointmentDate = normalizeDate(appointment.Date);
        return appointmentDate === selectedDate;  // השוואת התאריכים
      });
      setSelectedDayAppointments(filteredAppointments);
      // הצגת הודעה אם אין תורים ביום שנבחר
      setNoAppointmentsMessage(filteredAppointments.length === 0 ? `No appointments for ${selectedDate}` : '');
    } else {
      setSelectedDayAppointments([]);
      setNoAppointmentsMessage(`No appointments for ${selectedDate}`);
    }
  };


  const cancelWorkday = async () => {
    if (selectedDayAppointments.length === 0) {
      Swal.fire('No Appointments', 'There are no appointments to cancel for this day.', 'info');
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will cancel all appointments for the selected day.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          var date = choiceDay;
          console.log(userId, 555, date, 555);
          await axios.put(`http://localhost:8080/queues/cancel/${date}/${userId}`);
          setSelectedDayAppointments([]);
          Swal.fire('Cancelled!', 'All appointments for the day have been cancelled.', 'success');
        } catch (error) {
          console.error('Error cancelling workday:', error);
          Swal.fire('Error', 'Failed to cancel the workday. Try again later.', 'error');
        }
      }
    });
  };

  const tileContent = ({ date }) => {
    const normalizedDate = normalizeDate(date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!appointments[key]) return null;
    const dailyAppointments = appointments[key].filter(appointment =>
      normalizeDate(appointment.Date) === normalizedDate
    );

    const firstThreeAppointments = dailyAppointments.slice(0, 3);
    if (firstThreeAppointments.length === 0) return null;

    return (
      <div className="tile-appointments-wrapper">
        <div className="tile-dot"></div>
        <div className="tile-appointments">
          {firstThreeAppointments.map((appointment, index) => (
            <div key={index} className="appointment-short">
              {appointment.Hour} - {appointment.customerFirstName}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="business-appointments-page">
      <div className="calendar-container">

        <Calendar
          onChange={setDate}
          value={date}
          onClickDay={handleDaySelection}
          locale="en-US"
          tileClassName={tileClassName}
          tileContent={tileContent}
        />
      </div>

      <div className="selected-day-appointments">
        {selectedDay && (
          <div>
            {isCancelableDay() ? (
              <button className="cancel-day-button" onClick={cancelWorkday}>
                Cancel Workday
              </button>
            ) : (
              <p style={{ color: 'gray', fontStyle: 'italic' }}>
                Workdays can only be canceled at least 2 days in advance.
              </p>
            )}

            <div className="appointments-list">
              {selectedDayAppointments.length > 0 ? (
                selectedDayAppointments.map((appointment, index) => (
                  <div key={index} className="appointment">
                    <p><strong>Time:</strong> {appointment.Hour}</p>
                    <p><strong>Customer:</strong> {appointment.customerFirstName} {appointment.customerLastName}</p>
                    <p><strong>Phone:</strong> {appointment.customerPhone}</p>
                    <p><strong>Service:</strong> {appointment.serviceTypeName}</p>
                  </div>
                ))
              ) : (
                <p>{noAppointmentsMessage}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCalendar;