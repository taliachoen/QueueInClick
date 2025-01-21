import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from '../userContex';
import '../css/InviteDate.css';
import swal from 'sweetalert';

const InviteDate = () => {
    const [queues, setQueues] = useState([]);
    const [filteredQueues, setFilteredQueues] = useState([]);
    const [business_Details, setBusiness_Details] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [filterTime, setFilterTime] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { state } = useLocation();
    const { businessDetails, type } = state || {};
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (businessDetails && type) {
            fetchBusinessDetails(businessDetails.business_name, type);
        }
        fetchQueueData(businessDetails.idProfessional, businessDetails.typeCode);
    }, [businessDetails, type]);

    useEffect(() => {
        applyFilters();
    }, [queues, selectedDate, filterTime]);

    const fetchQueueData = (idProfessional, serviceTypeCode) => {
        axios.get(`http://localhost:8080/queues/details`, {
            params: {
                idProfessional: idProfessional,
                serviceTypeCode: serviceTypeCode
            }
        })
            .then(response => {
                setQueues(response.data);
            })
            .catch(error => {
                swal("Error", "An error occurred while fetching queues details", "error");
                console.error('Error fetching business details:', error);
            });
    };

    const fetchBusinessDetails = (businessName, serviceType) => {
        axios.get('http://localhost:8080/professionals/details', {
            params: {
                businessName: businessName,
                serviceType: serviceType
            }
        })
            .then(response => {
                setBusiness_Details(response.data);
            })
            .catch(error => {
                swal("Error", "An error occurred while fetching business details", "error");
                console.error('Error fetching business details:', error);
            });
    };

    const handleConfirmQueue = (QueueCode) => {
        axios.put(`http://localhost:8080/queues/update/${QueueCode}`, {
            customerId: user.id,
            Status: 'waiting'
        })
            .then(response => {
                const updatedQueues = queues.filter(queue => queue.QueueCode !== QueueCode);
                setQueues(updatedQueues);
                swal("Success", "Queue booked successfully!", "success").then(() => {
                    navigate('../MyQueues'); 
                });
            })
            .catch(error => {
                console.error('Error updating queue:', error);
                swal("Error", "An error occurred while booking the queue", "error");
            });
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleFilterTimeChange = (e) => {
        setFilterTime(e.target.value);
    };

    const applyFilters = () => {
        let filtered = queues;

        if (selectedDate) {
            filtered = filtered.filter(queue => new Date(queue.Date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString());
        }

        if (filterTime) {
            filtered = filtered.filter(queue => {
                const hour = parseInt(queue.Hour.split(':')[0], 10);
                if (filterTime === 'morning') {
                    return hour >= 6 && hour < 12;
                } else if (filterTime === 'afternoon') {
                    return hour >= 12 && hour < 18;
                } else if (filterTime === 'evening') {
                    return hour >= 18 && hour < 24;
                }
                return true;
            });
        }

        setFilteredQueues(filtered);
        setCurrentPage(1); // Reset to first page when filters are applied
    };

    const handleLoadMore = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

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
                {business_Details && (
                    <div className="business-details">
                        <h3>Details:</h3>
                        <div className="details-grid">
                            <ul>
                                <li><strong>Business Name:</strong> {business_Details.business_name}</li>
                                <li><strong>Owner Name:</strong> {business_Details.firstName + " " + business_Details.lastName}</li>
                                <li><strong>Phone:</strong> {business_Details.phone}</li>
                                <li><strong>Address:</strong> {business_Details.address}</li>
                            </ul>
                            <ul>
                                <li><strong>City:</strong> {business_Details.cityName}</li>
                                <li><strong>Duration:</strong> {business_Details.Duration}</li>
                                <li><strong>Price:</strong> {business_Details.Price}</li>
                                <li><strong>Service Type:</strong> {type}</li>
                            </ul>
                        </div>
                    </div>
                )}
                <table id="queue-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Hour</th>
                            <th>Book Appointment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedQueues.map((queue, index) => (
                            <tr key={index}>
                                <td>{new Date(queue.Date).toLocaleDateString()}</td>
                                <td>{queue.Hour}</td>
                                <td><button
                                    className="book-button"
                                    onClick={() => handleConfirmQueue(queue.QueueCode)}
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































// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { UserContext } from '../userContex';
// import '../css/InviteDate.css';
// import swal from 'sweetalert';

// const InviteDate = () => {
//     const [queues, setQueues] = useState([]);
//     const [business_Details, setBusiness_Details] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedDate, setSelectedDate] = useState('');
//     const { state } = useLocation();
//     const { businessDetails, type } = state || {};
//     const {user} = useContext(UserContext);

//     // const navigate = useNavigate();

//     useEffect(() => {
//         console.log('Received state:', state);
//         if (businessDetails && type) {
//             fetchBusinessDetails(businessDetails.business_name, type);
//         }
//         fetchQueueData(businessDetails.idProfessional, businessDetails.typeCode);
//     }, [businessDetails, type]);

//     // קבלת כל התורים הרלוונטים
//     const fetchQueueData = (idProfessional, serviceTypeCode) => {
//         axios.get(`http://localhost:8080/queues/details`, {
//             params: {
//                 idProfessional: idProfessional,
//                 serviceTypeCode: serviceTypeCode
//             }
//         })
//             .then(response => {
//                 setQueues(response.data);
//             })
//             .catch(error => {
//                 swal("Error", "An error occurred while fetching queues details", "error");
//                 console.error('Error fetching business details:', error);
//             });
//     };


//     //נתונים על בעל עסק
//     const fetchBusinessDetails = (businessName, serviceType) => {
//         axios.get('http://localhost:8080/professionals/details', {
//             params: {
//                 businessName: businessName,
//                 serviceType: serviceType
//             }
//         })
//             .then(response => {
//                 setBusiness_Details(response.data);
//             })
//             .catch(error => {
//                 swal("Error", "An error occurred while fetching business details", "error");
//                 console.error('Error fetching business details:', error);
//             });
//     };


//     //עדכון תור -ת"ז של לקוח וכן שהתור ממתין
//     const handleConfirmQueue = (QueueCode) => {
//         console.log(user)
//         axios.put(`http://localhost:8080/queues/update/${QueueCode}`, {
//             customerId: user.id,
//             Status: 'waiting'
//         })
//             .then(response => {
//                 console.log('Queue updated successfully:', response.data);
//                 alert("queue upted succefuly");
//                 // Optionally update the local state to reflect the change immediately
//                 const updatedQueues = queues.filter(queue => queue.QueueCode !== QueueCode)
//                 setQueues(updatedQueues);
//             })
//             .catch(error => {
//                 console.error('Error updating queue:', error);
//             });
//     };

 

//     const handleDateChange = (e) => {
//         setSelectedDate(e.target.value);
//     };

//     // if (loading) {
//     //     return <div id="loading">Loading...</div>;
//     // }

//     return (
//         <div id="queue-list">
//             <h2 id="sort-title">Sort by Date:</h2>
//             <div className="date-filter">
//                 <label htmlFor="select-date">Search by Date:</label>
//                 <input
//                     type="date"
//                     id="select-date"
//                     value={selectedDate}
//                     onChange={handleDateChange}
//                 />
//             </div>
//             <div className="content-wrapper">
//                 {business_Details && (
//                     <div className="business-details">
//                         <h3>Details:</h3>
//                         <div className="details-grid">
//                             <ul>
//                                 <li><strong>Business Name:</strong> {business_Details.business_name}</li>
//                                 <li><strong>Owner Name:</strong> {business_Details.firstName + " " + business_Details.lastName}</li>
//                                 <li><strong>Phone:</strong> {business_Details.phone}</li>
//                                 <li><strong>Address:</strong> {business_Details.address}</li>
//                             </ul>
//                             <ul>
//                                 <li><strong>City:</strong> {business_Details.cityName}</li>
//                                 <li><strong>Duration:</strong> {business_Details.Duration}</li>
//                                 <li><strong>Price:</strong> {business_Details.Price}</li>
//                                 <li><strong>Service Type:</strong> {type}</li>
//                             </ul>
//                         </div>
//                     </div>
//                 )}
//                 <table id="queue-table">
//                     <thead>
//                         <tr>
//                             <th>Date</th>
//                             <th>Hour</th>
//                             <th>Book Appointment</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {queues.map((queue, index) => (
//                             <tr key={index}>
//                                 <td>{new Date(queue.Date).toLocaleDateString()}</td>
//                                 <td>{queue.Hour}</td>
//                                 <td>  <button
//                                     className="book-button"
//                                     onClick={() => handleConfirmQueue(queue.QueueCode)}
//                                 >
//                                     Confirm queue
//                                 </button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default InviteDate;



