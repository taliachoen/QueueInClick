import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContex';
import axios from 'axios';
import Calendar from 'react-calendar';
import Swal from 'sweetalert2';
import '../css/MyCalendar.css';

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

  const userId = user.id;

  useEffect(() => {
    if (!localStorage.getItem("swalShown")) {
      Swal.fire({
        icon: 'info',
        title: 'Click on a day to see the list of appointments',
        showConfirmButton: false,
        timer: 3000,
      });
      localStorage.setItem("swalShown", "true");
    }
  }, []);

  const normalizeDate = (date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate.toISOString().split('T')[0];
  };

  // פונקציה להמיר תאריך ליום בשבוע
  const getDayName = (date) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getDay()];
  };


  // פונקציה להמיר תאריך ליום בשבוע
  const tileClassName = ({ date }) => {
    const normalized = normalizeDate(date);
    const dayName = getDayName(date);
    console.log("dayName", freeDays.includes(dayName));
    console.log(" dayName", dayName);
    console.log(`Checking date: ${normalized}, Day: ${dayName}, FreeDays:`, freeDays);

    if (freeDays.includes(dayName)) {
      return 'no-workday';  // אם זה יום חופשי, הוא יקבל רקע אפור
    }
    if (selectedDay === normalized) {
      return 'selected-day'; // אם זה היום שנבחר, הוא יצבע בכחול
    }
    return ''; // ברירת מחדל - ללא מחלקה מיוחדת
  };


  useEffect(() => {
    const fetchFreeDays = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/schedule/daysOfWeek/${userId}`);
        console.log("Free days from server:", response.data.daysOff);
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
      return response.data || [];
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

  const handleDaySelection = async (day) => {
    const selectedDate = normalizeDate(day); // השתמש בפונקציה לנרמל את התאריך

    setSelectedDay(selectedDate);

    try {
      const response = await axios.get(`http://localhost:8080/queues/date/${selectedDate}/${userId}`);
      setSelectedDayAppointments(response.data);
      setNoAppointmentsMessage(response.data.length === 0 ? `No appointments for ${selectedDate}` : '');
    } catch (error) {
      console.error('Error fetching day appointments:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error fetching appointments',
        text: 'Please try again later.',
      });
    }
  };



  const cancelWorkday = async () => {
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
          var date = selectedDay;
          await axios.put(`http://localhost:8080/queues/cancel/${date}/${userId}`);
          console.log("selectedDay000", date, userId);
          setSelectedDayAppointments([]);
          Swal.fire('Cancelled!', 'All appointments for the day have been cancelled.', 'success');
        } catch (error) {
          console.error('Error cancelling workday:', error);
          Swal.fire('Error', 'Failed to cancel the workday. Try again later.', 'error');
        }
      }
    });
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
        />

      </div>



      <div className="selected-day-appointments">
        {selectedDay && (
          <div>
            <h3>Appointments for {selectedDay}</h3>
            <button onClick={cancelWorkday} className="cancel-workday-button">Cancel Workday</button>
            <div className="appointments-list">
              {selectedDayAppointments.length > 0 ? (
                selectedDayAppointments.map((appointment, index) => (
                  <div key={index} className="appointment">
                    <p><strong>Time:</strong> {appointment.Hour}</p>
                    <p><strong>Customer:</strong> {appointment.customerFirstName} {appointment.customerLastName}</p>
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