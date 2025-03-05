import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../userContex';
import '../css/InviteDate.css';
import swal from 'sweetalert';

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


    // useEffect(() => {
    //     console.log("Queues:", queues);
    //     console.log("Filtered Queues:", filteredQueues);
    // }, [queues, filteredQueues]);


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
            console.log("Sending request with params:", {
                businessName: businessDetails.business_name,
                serviceTypeCode: type,
                selectedDate
            });
            fetchQueueData(businessDetails.business_name, type, selectedDate);
        }
    }, [businessDetails, selectedDate]);

    // useEffect(() => {
    //     if (businessDetails && selectedDate) {
    //         fetchQueueData(businessDetails.business_name, type, selectedDate);
    //     }
    // }, [businessDetails, selectedDate]);

    // Apply filters when queues or filter time changes
    useEffect(() => {
        applyFilters();
    }, [queues, selectedDate, filterTime]);

    // Fetch queue data from the server
    const fetchQueueData = async (businessName, serviceTypeCode, selectedDate) => {
        try {
            const response = await axios.get('http://localhost:8080/queues/allAvailableQueue/byBusinessNameAndService', {
                params: { businessName, serviceTypeCode, selectedDate }
            });

            // אם response.data מכיל את המפתח availableSlots, אז יש לו מערך
            if (response.data && Array.isArray(response.data.availableSlots)) {
                setQueues(response.data.availableSlots);
                // console.log("response.data.availableSlots", response.data.availableSlots);
            } else {
                // אם הנתונים לא במבנה הנכון, נשאיר את התורים כפי שהם או נאפס את התור
                console.warn("Fetched queue data is not in the expected format:", response.data);
                setQueues([]);  // או להשאיר את התורים כמו שהם, תלוי בצורך
            }
        } catch (error) {
            swal("Error", "An error occurred while fetching queues details", "error");
            console.error('Error fetching queue data:', error);
            setQueues([]); // במקרה של שגיאת רשת או כשל אחר, מאתחלים לריק
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
            swal("Error", "An error occurred while fetching business details", "error");
            console.error('Error fetching business details:', error);
        }
    };

    // Confirm queue booking
    const handleConfirmQueue = async (QueueNumber) => {
        try {
            await axios.post(`http://localhost:8080/queues/addNewQueue`, {
                businessName: businessDetails.business_name,
                data: selectedDate,
                startTime: displayedQueues[QueueNumber].start,
                serviceType: type,
                customerId: user.id,

            });

            swal("Success", "Queue booked successfully!", "success").then(() => {
                navigate('../MyQueues');
            });
        } catch (error) {
            swal("Error", "An error occurred while booking the queue", "error");
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
    const applyFilters = () => {
        let filtered = queues;
        setFilteredQueues(filtered);
        setCurrentPage(1);
    };


    // Load more queues
    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    // Display queues on the current page
    const displayedQueues = filteredQueues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div id="queue-list">
            <h2 id="sort-title">Sort by Date:</h2>
            <div className="date-filter">
                <label htmlFor="select-date">Search by Date:</label>
                <input
                    type="date"
                    id="select-date"
                    value={selectedDate}
                    onChange={handleDateChange}
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
                            <ul>
                                <li><strong>City:</strong> {businessDetails.cityName}</li>
                                <li><strong>Duration:</strong> {businessDetails.Duration}</li>
                                <li><strong>Price:</strong> {businessDetails.Price}</li>
                                <li><strong>Service Type:</strong> {type}</li>
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
                        {displayedQueues.map((queue, index) => (
                            <tr key={index}>
                                {/* <td>{new Date(queue.Date).toLocaleDateString()}</td> */}
                                <td>{new Date(queue.start).toLocaleString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}</td>
                                <td><button
                                    className="book-button"
                                    onClick={() => handleConfirmQueue(index)}
                                >
                                    Confirm queue
                                </button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {currentPage * itemsPerPage < filteredQueues.length && (
                    <button className="load-more-button" onClick={handleLoadMore}>Load More</button>
                )}
            </div>
        </div>
    );
};

export default InviteDate;

