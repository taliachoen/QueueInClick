
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UserContext } from '../userContex';
import { useNavigate } from 'react-router-dom';
import '../css/MyQueues.css';
import io from "socket.io-client";

const socket = io("http://localhost:8080");

function MyQueues() {
    const [queues, setQueues] = useState([]);
    const [pastQueues, setPastQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPastQueues, setShowPastQueues] = useState(false);
    const [visiblePastQueues, setVisiblePastQueues] = useState(10);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("appointmentCancelledByBusiness", (data) => {
            setQueues(prevQueues =>
                prevQueues.filter(queue => queue.QueueCode !== data.queueCode)
            );
        });
        return () => {
            socket.off("appointmentCancelledByBusiness");
        };
    }, [user.id]);

    useEffect(() => {
        axios.get(`http://localhost:8080/queues/${user.id}`)
            .then(response => {
                setQueues(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('There was an error fetching the queues!');
                setLoading(false);
            });
    }, [user.id]);

    const fetchPastQueues = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/queues/past/${user.id}`);
            setPastQueues(response.data);
            setShowPastQueues(true);
        } catch (error) {
            console.error('Error fetching past queues:', error);
            Swal.fire('Error', 'Could not fetch past appointments.', 'error');
        }
    };

    const loadMorePastQueues = () => {
        setVisiblePastQueues(prev => prev + 10);
    };

    const handleMoreDetails = (businessName) => {
        navigate(`../searchBusinessOwner`, { replace: true, state: { businessName } });
    };

    const handleAddToCalendar = (queue) => {
        const calendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(queue.serviceName)}&dates=${formatDateForCalendar(queue.Date, queue.Hour)}&details=${encodeURIComponent('Appointment with ' + queue.businessName)}`;
        window.open(calendarUrl, '_blank');
    };

    const formatDateForCalendar = (date, time) => {
        const [hours, minutes] = time.split(':');
        const appointmentDate = new Date(date);
        appointmentDate.setHours(hours);
        appointmentDate.setMinutes(minutes);
        const start = appointmentDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // +1 hour
        const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        return `${start}/${end}`;
    };

    const cancelQueue = (queueCode) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to cancel this appointment?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`http://localhost:8080/queues/cancel/${queueCode}`, {
                    customerId: user.id
                })
                    .then(response => {
                        setQueues(queues.filter(queue => queue.QueueCode !== queueCode));
                        socket.emit("cancelAppointment", { queueCode });

                        Swal.fire({
                            title: "Cancelled!",
                            text: "Your appointment was successfully canceled.",
                            icon: "success",
                            confirmButtonText: "OK"
                        });
                    })
                    .catch(error => {
                        setError('There was an error cancelling the queue!');
                    });
            }
        });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="my-queues">
            {showPastQueues && <div className="blur-background" onClick={() => setShowPastQueues(false)} />}

            <h2>My Queues</h2>

            <button
                className="show-past-queues-button"
                onClick={fetchPastQueues}
            >
                Show Past Appointments
            </button>

            {/* <ul className="queue-list">
                {queues.map(queue => (
                    <li key={queue.QueueCode} className="queue-item">
                        <span className="queue-info">
                            {new Date(queue.Date).toLocaleDateString()} | {queue.Hour} <br /> {queue.serviceName}
                        </span>

                        <div className="button-group">
                            <button
                                className="details-button"
                                onClick={() => handleMoreDetails(queue.businessName)}
                            >
                                More Details
                            </button>

                            {new Date(queue.Date) >= new Date() && (
                                <button
                                    className="calendar-button"
                                    onClick={() => handleAddToCalendar(queue)}
                                >
                                    Add to Google Calendar
                                </button>
                            )}

                            <button
                                className="cancel-button"
                                onClick={() => cancelQueue(queue.QueueCode)}
                            >
                                Cancel
                            </button>
                        </div>
                    </li>
                ))}
            </ul> */}
            {queues.length === 0 ? (
                <div className="image-with-text">
                    <h3 className="searching-text">No upcoming queues yet! 💫</h3>
                    <img src="/robot-searching.png" alt="Robot Searching" className="searching-image" />
                </div>
            ) : (
                <ul className="queue-list">
                    {queues.map(queue => (
                        <li key={queue.QueueCode} className="queue-item">
                            <span className="queue-info">
                                {new Date(queue.Date).toLocaleDateString()} | {queue.Hour} <br /> {queue.serviceName}
                            </span>

                            <div className="button-group">
                                <button
                                    className="details-button"
                                    onClick={() => handleMoreDetails(queue.businessName)}
                                >
                                    More Details
                                </button>

                                {new Date(queue.Date) >= new Date() && (
                                    <button
                                        className="calendar-button"
                                        onClick={() => handleAddToCalendar(queue)}
                                    >
                                        Add to Google Calendar
                                    </button>
                                )}

                                <button
                                    className="cancel-button"
                                    onClick={() => cancelQueue(queue.QueueCode)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Drawer for Past Queues */}
            <div className={`drawer ${showPastQueues ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3>Past Appointments</h3>
                    <button className="close-button" onClick={() => setShowPastQueues(false)}>
                        &times;
                    </button>
                </div>
                <ul className="queue-list">
                    {pastQueues.slice(0, visiblePastQueues).map(queue => (
                        <li key={queue.QueueCode} className="queue-item">
                            <span className="queue-info">
                                {new Date(queue.Date).toLocaleDateString()} | {queue.Hour} <br /> {queue.serviceName}
                            </span>

                            <div className="button-group">
                                <button
                                    className="details-button"
                                    onClick={() => handleMoreDetails(queue.businessName)}
                                >
                                    More Details
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                {visiblePastQueues < pastQueues.length && (
                    <button
                        className="load-more-button"
                        onClick={loadMorePastQueues}
                    >
                        Load More
                    </button>
                )}
            </div>
        </div>
    );
}

export default MyQueues;

