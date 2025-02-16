import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../userContex';
import axios from 'axios';
import Calendar from 'react-calendar';
import Swal from 'sweetalert2';
import '../css/MyCalendar.css';

const MyCalendar = () => {
  const { user } = useContext(UserContext);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [nextMonthSchedule, setNextMonthSchedule] = useState([]);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelDayConfirmed, setCancelDayConfirmed] = useState(false);
  const [nextMonthAvailable, setNextMonthAvailable] = useState(false);
  const [date, setDate] = useState(new Date());
  const [noAppointmentsMessage, setNoAppointmentsMessage] = useState('');
  const [daysOff, setDaysOff] = useState([]);
  const [isDaySelected, setIsDaySelected] = useState(false);
  const userId = user.id;

  useEffect(() => {
    fetchWeekSchedule();
    checkNextMonthAvailability();
    fetchDayAppointments(new Date());
    fetchDaysOff();

    // הצגת ההודעה רק בהתחלה
    Swal.fire({
      icon: 'info',
      title: 'Click on a day to see the list of appointments',
      showConfirmButton: false,
      timer: 3000, // ההודעה תיסגר אחרי 3 שניות
    });
  }, []);

  const fetchWeekSchedule = () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // getMonth() returns 0-11
    const year = currentDate.getFullYear();
    axios.get(`http://localhost:8080/queues/allQueue/${month}/${year}/${userId}`)
      .then(response => {
        const data = response.data.map(item => ({
          ...item,
          Date: normalizeDate(item.Date)
        }));
        setWeekSchedule(data);
      })
      .catch(error => {
        console.error('Error fetching week schedule:', error);
      });

    // Fetch next month's schedule
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextMonthYear = month === 12 ? year + 1 : year;
    axios.get(`http://localhost:8080/queues/allQueue/${nextMonth}/${nextMonthYear}/${userId}`)
      .then(response => {
        const data = response.data.map(item => ({
          ...item,
          Date: normalizeDate(item.Date)
        }));
        setNextMonthSchedule(data);
      })
      .catch(error => {
        console.error('Error fetching next months schedule:', error);
      });
  };

  const fetchDaysOff = () => {
    axios.get(`http://localhost:8080/schedule/daysOfWeek/${userId}`)
      .then(response => {
        const { daysOff } = response.data;
        setDaysOff(daysOff);
      })
      .catch(error => {
        console.error('Error fetching days off:', error);
      });
  };

  const checkNextMonthAvailability = () => {
    axios.get(`http://localhost:8080/queues/isAvailable/nextMonth/${userId}`)
      .then(response => {
        setNextMonthAvailable(response.data.isNextMonthAvailable);
      })
      .catch(error => {
        console.error('Error checking next month availability:', error);
      });
  };

  const handleDaySelection = (day) => {
    const formattedDay = normalizeDate(day);

    if (formattedDay === selectedDay) {
      setIsDaySelected(false); // אם היום שנבחר כבר נבחר, מבטל את הבחירה
      setSelectedDay(null); // מבטל את הבחירה של היום
    } else {
      setSelectedDay(formattedDay); // בחר את היום החדש
      setIsDaySelected(true); // עדכן שהיום נבחר
    }
  };

  const fetchDayAppointments = (selectedDay) => {
    const formattedDay = normalizeDate(selectedDay);
    axios.get(`http://localhost:8080/queues/date/${formattedDay}/${userId}`)
      .then(response => {
        const appointments = response.data;
        setSelectedDayAppointments(appointments);
        if (appointments.length === 0) {
          setNoAppointmentsMessage(`No appointments for ${formattedDay}`);
        } else {
          setNoAppointmentsMessage('');
        }
      })
      .catch(error => {
        console.error('Error fetching day appointments:', error);
      });
  };

  const normalizeDate = (date) => {
    const localDate = new Date(date);
    localDate.setDate(localDate.getDate() + 1);
    localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
    return localDate.toISOString().split('T')[0];
  };

  const handleCancelDay = () => {
    // בדוק אם יש תורים באותו יום
    const appointmentsForSelectedDay = selectedDayAppointments.length;

    if (appointmentsForSelectedDay === 0) {
      // אם אין תורים, הצג הודעה מתוקה
      Swal.fire({
        icon: 'info',
        title: 'No appointments on this day',
        text: 'There are no appointments for this day, cancellation is not possible.',
        showConfirmButton: true,
      });
    } else {
      // אם יש תורים, תן למשתמש לאשר את הביטול
      setShowCancelConfirmation(true);
    }
  };

  const confirmCancelDay = () => {
    // הצגת הודעת Success אם הצליח הביטול
    axios.put(`http://localhost:8080/queues/cancel/${selectedDay}/${userId}`)
      .then(response => {
        setCancelDayConfirmed(true);
        setShowCancelConfirmation(false);
        fetchWeekSchedule();
        fetchDayAppointments(new Date(selectedDay));
        Swal.fire({
          icon: 'success',
          title: 'Day Cancelled',
          text: 'All appointments for the day have been cancelled',
          showConfirmButton: false,
          timer: 1500
        });
      })
      .catch(error => {
        console.error('Error canceling day:', error);
      });
  };

  const openNextMonthSchedule = () => {
    if (nextMonthAvailable) {
      Swal.fire({
        icon: 'info',
        title: 'Month Already Opened',
        text: 'The next month schedule has already been opened and set up.',
        showConfirmButton: false,
        timer: 1500
      });
    } else {
      axios.post(`http://localhost:8080/queues/openNextMonthSchedule/${userId}`)
        .then(response => {
          console.log('Next month schedule opened successfully');
          setNextMonthAvailable(true);
          Swal.fire({
            icon: 'success',
            title: 'Next Month Opened',
            text: 'The next month schedule has been opened successfully',
            showConfirmButton: false,
            timer: 1500
          });
        })
        .catch(error => {
          console.error('Error opening next month schedule:', error);
        });
    }
  };

  const tileClassName = ({ date }) => {
    const formattedDay = normalizeDate(date);
    if (formattedDay === selectedDay) {
      return 'selected-day'; // מחזיר את ה-class שמתאים ליום שנבחר
    }
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    return daysOff.includes(dayOfWeek) ? 'day-off' : ''; // לא משנה אם לא נבחר
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const day = normalizeDate(date);
      const appointments = [...weekSchedule, ...nextMonthSchedule].filter(appointment => appointment.Date === day); // Combine schedules
      const sortedAppointments = appointments.sort((a, b) => a.Hour.localeCompare(b.Hour));
      const limitedAppointments = sortedAppointments.slice(0, 3);
      return (
        <div>
          {limitedAppointments.map((appointment, index) => (
            <div key={index} className="calendar-appointment">
              <span className="appointment-time">{appointment.Hour}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const AppointmentDetails = ({ appointment }) => (
    appointment && (
      <div className="appointment-details">
        <p><strong>Time:</strong> {appointment.Hour}</p>
        <p><strong>Customer:</strong> {appointment.customerFirstName} {appointment.customerLastName}</p>
        <p><strong>Service:</strong> {appointment.serviceTypeName}</p>
      </div>
    )
  );

  return (
    <div className="business-appointments-page">
      <div className="calendar-container">
        <Calendar
          onChange={setDate}
          value={date}
          tileContent={tileContent}
          className="business-calendar"
          onClickDay={handleDaySelection}
          tileClassName={tileClassName}
          locale="en-US"
        />

        <div className="appointment-actions">
          {isDaySelected && (
            <button className="cancel-day-button" onClick={handleCancelDay}>
              Cancel Workday
            </button>
          )}
          {showCancelConfirmation && (
            <div className="cancel-confirmation">
              <p>Are you sure you want to cancel {selectedDay}?</p>
              <button onClick={confirmCancelDay}>Yes</button>
              <button onClick={() => setShowCancelConfirmation(false)}>No</button>
            </div>
          )}
          {cancelDayConfirmed && (
            <p>Day canceled successfully. Updated appointments list.</p>
          )}

          <button
            className="next-month-booking-button"
            onClick={openNextMonthSchedule}
            disabled={!isDaySelected}
          >
            Open Schedule for Next Month
          </button>
        </div>
      </div>

      <div className="selected-day-appointments">
        {selectedDay && (
          <div>
            <h3>Appointments for {selectedDay}</h3>
            <div className="appointments-list">
              {selectedDayAppointments.length > 0 ? (
                selectedDayAppointments.map((appointment, index) => (
                  <div key={index} className="appointment">
                    <AppointmentDetails appointment={appointment} />
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


// import React, { useState, useContext, useEffect } from 'react';
// import { UserContext } from '../userContex';
// import axios from 'axios';
// import Calendar from 'react-calendar';
// import Swal from 'sweetalert2';
// import '../css/MyCalendar.css';

// const MyCalendar = () => {
//   const { user } = useContext(UserContext);
//   const [weekSchedule, setWeekSchedule] = useState([]);
//   const [nextMonthSchedule, setNextMonthSchedule] = useState([]);
//   const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
//   const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
//   const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
//   const [cancelDayConfirmed, setCancelDayConfirmed] = useState(false);
//   const [nextMonthAvailable, setNextMonthAvailable] = useState(false);
//   const [date, setDate] = useState(new Date());
//   const [noAppointmentsMessage, setNoAppointmentsMessage] = useState('');
//   const [daysOff, setDaysOff] = useState([]);
//   const [isDaySelected, setIsDaySelected] = useState(false);
//   const userId = user.id;

//   useEffect(() => {
//     fetchWeekSchedule();
//     checkNextMonthAvailability();
//     fetchDayAppointments(new Date());
//     fetchDaysOff();
//   }, []);

//   const fetchWeekSchedule = () => {
//     const currentDate = new Date();
//     const month = currentDate.getMonth() + 1; // getMonth() returns 0-11
//     const year = currentDate.getFullYear();
//     axios.get(`http://localhost:8080/queues/allQueue/${month}/${year}/${userId}`)
//       .then(response => {
//         const data = response.data.map(item => ({
//           ...item,
//           Date: normalizeDate(item.Date)
//         }));
//         setWeekSchedule(data);
//       })
//       .catch(error => {
//         console.error('Error fetching week schedule:', error);
//       });

//     // Fetch next month's schedule
//     const nextMonth = month === 12 ? 1 : month + 1;
//     const nextMonthYear = month === 12 ? year + 1 : year;
//     axios.get(`http://localhost:8080/queues/allQueue/${nextMonth}/${nextMonthYear}/${userId}`)
//       .then(response => {
//         const data = response.data.map(item => ({
//           ...item,
//           Date: normalizeDate(item.Date)
//         }));
//         setNextMonthSchedule(data);
//       })
//       .catch(error => {
//         console.error('Error fetching next months schedule:', error);
//       });
//   };

//   const fetchDaysOff = () => {
//     axios.get(`http://localhost:8080/schedule/daysOfWeek/${userId}`)
//       .then(response => {
//         const { daysOff } = response.data;
//         setDaysOff(daysOff);
//       })
//       .catch(error => {
//         console.error('Error fetching days off:', error);
//       });
//   };

//   const checkNextMonthAvailability = () => {
//     axios.get(`http://localhost:8080/queues/isAvailable/nextMonth/${userId}`)
//       .then(response => {
//         setNextMonthAvailable(response.data.isNextMonthAvailable);
//       })
//       .catch(error => {
//         console.error('Error checking next month availability:', error);
//       });
//   };

//   const handleDaySelection = (day) => {
//     const formattedDay = normalizeDate(day);
//     setSelectedDay(formattedDay);
//     setIsDaySelected(true);
//     fetchDayAppointments(day);
//   };

//   const fetchDayAppointments = (selectedDay) => {
//     const formattedDay = normalizeDate(selectedDay);
//     axios.get(`http://localhost:8080/queues/date/${formattedDay}/${userId}`)
//       .then(response => {
//         const appointments = response.data;
//         setSelectedDayAppointments(appointments);
//         if (appointments.length === 0) {
//           setNoAppointmentsMessage(`No appointments for ${formattedDay}`);
//         } else {
//           setNoAppointmentsMessage('');
//         }
//       })
//       .catch(error => {
//         console.error('Error fetching day appointments:', error);
//       });
//   };

//   const normalizeDate = (date) => {
//     const localDate = new Date(date);
//     localDate.setDate(localDate.getDate() + 1);
//     localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
//     return localDate.toISOString().split('T')[0];
//   };

//   const handleCancelDay = () => {
//     setShowCancelConfirmation(true);
//   };

//   const confirmCancelDay = () => {
//     axios.put(`http://localhost:8080/queues/cancel/${selectedDay}/${userId}`)
//       .then(response => {
//         setCancelDayConfirmed(true);
//         setShowCancelConfirmation(false);
//         fetchWeekSchedule();
//         fetchDayAppointments(new Date(selectedDay));
//         Swal.fire({
//           icon: 'success',
//           title: 'Day Cancelled',
//           text: 'All appointments for the day have been cancelled',
//           showConfirmButton: false,
//           timer: 1500
//         });
//       })
//       .catch(error => {
//         console.error('Error canceling day:', error);
//       });
//   };

//   const openNextMonthSchedule = () => {
//     if (nextMonthAvailable) {
//       Swal.fire({
//         icon: 'info',
//         title: 'Month Already Opened',
//         text: 'The next month schedule has already been opened and set up.',
//         showConfirmButton: false,
//         timer: 1500
//       });
//     } else {
//       axios.post(`http://localhost:8080/queues/openNextMonthSchedule/${userId}`)
//         .then(response => {
//           console.log('Next month schedule opened successfully');
//           setNextMonthAvailable(true);
//           Swal.fire({
//             icon: 'success',
//             title: 'Next Month Opened',
//             text: 'The next month schedule has been opened successfully',
//             showConfirmButton: false,
//             timer: 1500
//           });
//         })
//         .catch(error => {
//           console.error('Error opening next month schedule:', error);
//         });
//     }
//   };

//   const tileClassName = ({ date }) => {
//     const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
//     return daysOff.includes(dayOfWeek) ? null : 'day-off';
//   };

//   const tileContent = ({ date, view }) => {
//     if (view === 'month') {
//       const day = normalizeDate(date);
//       const appointments = [...weekSchedule, ...nextMonthSchedule].filter(appointment => appointment.Date === day); // Combine schedules
//       const sortedAppointments = appointments.sort((a, b) => a.Hour.localeCompare(b.Hour));
//       const limitedAppointments = sortedAppointments.slice(0, 3);
//       return (
//         <div>
//           {limitedAppointments.map((appointment, index) => (
//             <div key={index} className="calendar-appointment">
//               <span className="appointment-time">{appointment.Hour}</span>
//             </div>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   const AppointmentDetails = ({ appointment }) => (
//     appointment && (
//       <div className="appointment-details">
//         <p><strong>Time:</strong> {appointment.Hour}</p>
//         <p><strong>Customer:</strong> {appointment.customerFirstName} {appointment.customerLastName}</p>
//         <p><strong>Service:</strong> {appointment.serviceTypeName}</p>
//       </div>
//     )
//   );

//   return (
//     <div className="business-appointments-page">
//       <div className="calendar-container">
//         <Calendar
//           onChange={setDate}
//           value={date}
//           tileContent={tileContent}
//           className="business-calendar"
//           onClickDay={handleDaySelection}
//           tileClassName={tileClassName}
//           locale="en-US"
//         />

//         <div className="appointment-actions">
//           {isDaySelected && (
//             <button className="cancel-day-button" onClick={handleCancelDay}>
//               Cancel Workday
//             </button>
//           )}
//           {showCancelConfirmation && (
//             <div className="cancel-confirmation">
//               <p>Are you sure you want to cancel {selectedDay}?</p>
//               <button onClick={confirmCancelDay}>Yes</button>
//               <button onClick={() => setShowCancelConfirmation(false)}>No</button>
//             </div>
//           )}
//           {cancelDayConfirmed && (
//             <p>Day canceled successfully. Updated appointments list.</p>
//           )}

//           <button
//             className="next-month-booking-button"
//             onClick={openNextMonthSchedule}
//             disabled={!isDaySelected}
//           >
//             Open Schedule for Next Month
//           </button>
//         </div>
//       </div>

//       <div className="selected-day-appointments">
//         {selectedDay && (
//           <div>
//             <h3>Appointments for {selectedDay}</h3>
//             <div className="appointments-list">
//               {selectedDayAppointments.length > (0) ? (selectedDayAppointments.map((appointment, index) => (
//                 <div key={index} className="appointment">
//                   <AppointmentDetails appointment={appointment} />
//                 </div>
//               ))
//               ) : (
//                 <p>{noAppointmentsMessage}</p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyCalendar;























