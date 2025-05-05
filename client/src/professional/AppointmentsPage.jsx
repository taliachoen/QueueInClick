import React, { useState, useEffect ,useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/AppointmentsPage.css';
import { UserContext } from '../userContex';

const AppointmentsPage = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [currentDate, setCurrentDate] = useState(new Date()); // Default to current date
  const [appointments, setAppointments] = useState([]); // Store appointments
  const [viewPastAppointments, setViewPastAppointments] = useState(false); // Store past appointments view state
  const userid=user?.id;
  
  useEffect(() => {
    fetchAppointments(); // Fetch appointments whenever currentDate or viewPastAppointments changes
  }, [currentDate, viewPastAppointments, userid]);

  useEffect(() => {
    const interval = setInterval(fetchAppointments, 60000); // Refresh appointments list every minute
    return () => clearInterval(interval); // Clear interval on component unmount
  }, [userid]);

  const fetchAppointments = async () => {
    try {
      const formattedDate = formatDate(currentDate); // Format the date for the server
      const response = await axios.get(`${apiUrl}/queues/date/${formattedDate}/${userid}`); // Fetch appointments from server
      const filteredAppointments = filterAppointments(response.data); // Filter appointments based on current time and viewPastAppointments state
      setAppointments(filteredAppointments); // Update appointments list
    } catch (error) {
      console.error('Error fetching appointments:', error); // Handle errors
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format date as 'YYYY-MM-DD'
  };

  const filterAppointments = (appointments) => {
    const now = new Date(); // Get current time
    return appointments.filter(appointment => {
      const datePart = appointment.Date.split('T')[0];
      const timePart = appointment.Hour;
      const appointmentDateTime = new Date(`${datePart}T${timePart}`); // Create Date object from appointment
      if (isToday(currentDate)) {
        if (viewPastAppointments) {
          const endOfDay = new Date(currentDate);
          endOfDay.setHours(23, 59, 59, 999); // Set end of the current day
          return appointmentDateTime <= endOfDay; // Show all appointments for the current day
        } else {
          const nowTime = now.getHours() * 60 + now.getMinutes(); // Calculate minutes since midnight for current time
          const appointmentTime = appointmentDateTime.getHours() * 60 + appointmentDateTime.getMinutes(); // Calculate minutes since midnight for appointment time
          return appointmentTime >= nowTime; // Show appointments that are after the current time
        }
      } else {
        return datePart === formatDate(currentDate); // Show all appointments for the selected day
      }
    });
  };

  const handlePreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1); // Set previous day
    setCurrentDate(previousDay); // Update current date
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1); // Set next day
    setCurrentDate(nextDay); // Update current date
  };

  const toggleViewPastAppointments = () => {
    setViewPastAppointments(!viewPastAppointments); // Toggle past appointments view state
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="appointments-page-container">
      <h2>Appointments</h2>
      <div className="navigation-buttons">
        <button onClick={handlePreviousDay}>&lt; Previous Day</button>
        <span>{formatDate(currentDate)}</span>
        <button onClick={handleNextDay}>Next Day &gt;</button>
      </div>
      {isToday(currentDate) && (
        <div className="view-options">
          <label>
            <input
              type="checkbox"
              checked={viewPastAppointments}
              onChange={toggleViewPastAppointments}
            />
            View Past Appointments
          </label>
        </div>
      )}
      <div className="appointments-list">
        {appointments.length === 0 ? (
          <p>No queues available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Time</th>
                <th>Service</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.QueueCode} >
                  <td>{appointment.customerFirstName} {appointment.customerLastName}</td>
                  <td>{appointment.Hour}</td>
                  <td>{appointment.serviceTypeName}</td>
                  <td>{appointment.customerPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
