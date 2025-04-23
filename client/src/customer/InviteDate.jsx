import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../userContex';
import '../css/InviteDate.css';
import swal from 'sweetalert';
import io from "socket.io-client";
import { useRef } from 'react';

const InviteDate = () => {
    const [queues, setQueues] = useState([]);
    const [filteredQueues, setFilteredQueues] = useState([]);
    const [businessDetails, setBusinessDetails] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [filterTime, setFilterTime] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { state } = useLocation();
    const { businessDetails: businessDetailsFromState, type } = state || {};
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const socketRef = useRef(null);


    // Fetch business details if provided
    useEffect(() => {
        if (businessDetailsFromState && type) {
            fetchBusinessDetails(businessDetailsFromState.business_name, type);
        }
    }, [businessDetailsFromState, type]);



    // Fetch queues for the next day when component mounts
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]); // Set default date to tomorrow
    }, []);

    // Fetch queues when business details or selected date change
    useEffect(() => {
        if (businessDetails && selectedDate) {
            fetchQueueData(businessDetails.business_name, type, selectedDate);
        }
    }, [businessDetails, selectedDate]);

    // Apply filters when queues or filter time changes
    useEffect(() => {
        applyFilters();
    }, [queues, selectedDate, filterTime]);


    const fetchAvailableQueues = async () => {
        try {
            fetchQueueData(businessDetails.business_name, type, selectedDate);
        } catch (error) {
            console.error("Error fetching available queues", error);
        }
    };

    useEffect(() => {
        socketRef.current = io("http://localhost:8080");

        socketRef.current.on("refreshAvailableQueues", () => {
            console.log("Received refreshAvailableQueues from server");
            fetchAvailableQueues();
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [fetchAvailableQueues]);

    // Fetch queue data from the server
    const fetchQueueData = async (businessName, serviceTypeCode, selectedDate) => {
        try {
            const response = await axios.get('http://localhost:8080/queues/allAvailableQueue/byBusinessNameAndService', {
                params: { businessName, serviceTypeCode, selectedDate }
            });

            if (response.data && response.data.message) {
                const { message, type } = response.data;
                setTimeout(() => {
                    swal(message, "", type);
                }, 2000);
            }
            // If response contains availableSlots, set them
            if (response.data && Array.isArray(response.data.availableSlots)) {
                setQueues(response.data.availableSlots);
            } else {
                console.warn("Fetched queue data is not in the expected format:", response.data);
                setQueues([]);
            }
        } catch (error) {
            setTimeout(() => {
                swal("Error", "An error occurred while fetching queues details", "error");
            }, 1000);
            console.error('Error fetching queue data:', error);
            setQueues([]);
        }
    };

    // Fetch business details
    const fetchBusinessDetails = async (businessName, serviceType) => {
        try {
            const response = await axios.get('http://localhost:8080/professionals/details/ByNameAndService', {
                params: { businessName, serviceType }
            });
            setBusinessDetails(response.data);
        } catch (error) {
            setTimeout(() => {
                swal("Error", "An error occurred while fetching business details", "error");
            }, 1000);
            console.error('Error fetching business details:', error);
        }
    };

    // Confirm queue booking
    const handleConfirmQueue = async (QueueNumber) => {
        try {
            const response = await axios.post(`http://localhost:8080/queues/addNewQueue`, {
                businessName: businessDetails.business_name,
                data: selectedDate,
                startTime: displayedQueues[QueueNumber].start,
                serviceType: type,
                customerId: user.id,
            });

            socketRef.current.emit("newAppointment", response.data);

            swal("Success", "Queue booked successfully!", "success").then(() => {
                navigate('../MyQueues');
            });
        } catch (error) {
            setTimeout(() => {
                swal("Error", "An error occurred while booking the queue", "error");
            }, 1000);
            console.error('Error updating queue:', error);
        }
    };

    // Handle date change
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Handle time filter change
    const handleFilterTimeChange = (e) => {
        setFilterTime(e.target.value);
    };

    // Apply filters based on selected date and time
    const applyFilters = useCallback(() => {
        let filtered = queues;

        // Apply time filter if specified
        if (filterTime) {
            filtered = filtered.filter(queue => {
                const queueTime = new Date(queue.start).getHours();
                if (filterTime === 'morning') return queueTime >= 6 && queueTime < 12;
                if (filterTime === 'afternoon') return queueTime >= 12 && queueTime < 18;
                if (filterTime === 'evening') return queueTime >= 18 && queueTime < 24;
                return true;
            });
        }
        setFilteredQueues(filtered);
        setCurrentPage(1);
    }, [queues, filterTime]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);



    // Load more queues
    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    // Navigate to previous page
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    // Display queues on the current page
    const displayedQueues = filteredQueues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div id="queue-list">
            <button id='back-button' onClick={() =>
                navigate('../inviteQueue')
            }>
                ← Back to Businesses
            </button>
            <h2 id="sort-title">Sort by Date:</h2>
            <div className="date-filter">
                <label htmlFor="select-date">Search by Date:</label>
                <input
                    type="date"
                    id="select-date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                <label htmlFor="select-time">Filter by Time:</label>
                <select id="select-time" value={filterTime} onChange={handleFilterTimeChange}>
                    <option value="">All</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                </select>
            </div>
            <div className="content-wrapper">
                {businessDetails && (
                    <div className="business-details">
                        <h3>Details:</h3>
                        <div className="details-grid">
                            <ul>
                                <li><strong>Business Name:</strong> {businessDetails.business_name}</li>
                                <li><strong>Owner Name:</strong> {businessDetails.firstName + " " + businessDetails.lastName}</li>
                                <li><strong>Phone:</strong> {businessDetails.phone}</li>
                                <li><strong>Address:</strong> {businessDetails.address}</li>
                            </ul>
                        </div>
                    </div>
                )}
                <table id="queue-table">
                    <thead>
                        <tr>
                            <th>Hour</th>
                            <th>Book Appointment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedQueues.length > 0 ? (
                            displayedQueues.map((queue, index) => (
                                <tr key={index}>
                                    <td>{new Date(queue.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                                    <td>
                                        <button className="book-button" onClick={() => handleConfirmQueue(index)}>Confirm queue</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: '#000' }}>
                                    No Available queues in this day
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>


                {currentPage > 1 && (
                    <button className="load-more-button" onClick={handlePreviousPage}>Previous</button>
                )}

                {currentPage * itemsPerPage < filteredQueues.length && (
                    <button className="load-more-button" onClick={handleLoadMore}>Load More</button>
                )}
            </div>
        </div>
    );
};

export default InviteDate;














