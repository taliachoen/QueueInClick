import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { UserContext } from '../userContex';
import { useNavigate } from 'react-router-dom'; // שימוש בנווט
import '../css/MyQueues.css';
import io from "socket.io-client";

const socket = io("http://localhost:8080");

function MyQueues() {
    const [queues, setQueues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();


    useEffect(() => {
        socket.on("appointmentCancelledByBusiness", (data) => {
            console.log("Appointment was canceled", data, user.id);
            setQueues(prevQueues =>
                prevQueues.filter(queue => queue.QueueCode !== data.queueCode)
            );
        });
        return () => {
            socket.off("appointmentCancelledByBusiness");
        };
    }, []);


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

    const handleMoreDetails = (businessName) => {
        navigate(`../searchBusinessOwner`, { replace: true, state: { businessName } });
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
            <h2>My Queues</h2>
            <ul className="queue-list">
                {queues.map(queue => (
                    <li key={queue.QueueCode} className="queue-item">
                        <span className="queue-info">
                            {new Date(queue.Date).toLocaleDateString()} | {queue.Hour} <br></br> {queue.serviceName}
                        </span>

                        <button
                            style={{
                                fontSize: '12px', // או '0.8rem'
                                padding: '6px 12px',
                                backgroundColor: '#f0f0f0',
                                color: '#333',
                                border: '1px solid #ccc',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                margin: '10px'
                            }}
                            onClick={() => handleMoreDetails(queue.businessName)}
                        >
                            More details <br></br> about the business
                        </button>


                        <button
                            className="cancel-button"
                            onClick={() => cancelQueue(queue.QueueCode)}
                        >
                            Cancel
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MyQueues;
