// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';
// import '../css/InviteQueue.css';

// const InviteQueue = () => {
//     const [businesses, setBusinesses] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchField, setSearchField] = useState('');

//     const [searchSecondaryField, setSearchSecondaryField] = useState('');
//     const [selectedCity, setSelectedCity] = useState('');
//     const [cities, setCities] = useState([]);
//     const [fields, setFields] = useState([]);
//     const [secondaryFields, setSecondaryFields] = useState([]);
//     const [showPrompt, setShowPrompt] = useState(false);

//     const location = useLocation();

//     const navigate = useNavigate();

//     useEffect(() => {
//         fetchCities();
//         fetchFields();
//     }, []);

//     useEffect(() => {
//         if (location.state) {
//             const { domainName, cityName } = location.state;
//             if (domainName) {
//                 setSearchField(domainName);
//                 fetchSecondaryFields(domainName);
//                 fetchBusinesses(domainName, cityName);
//             }
//             if (cityName) {
//                 setSelectedCity(cityName);
//             }
//         }
//     }, [location.state]);


//     const fetchCities = () => {
//         axios.get('http://localhost:8080/cities')
//             .then(response => {
//                 setCities(response.data);
//             })
//             .catch(error => {
//                 console.error('Error fetching cities:', error);
//             });
//     };

//     const fetchFields = () => {
//         axios.get('http://localhost:8080/domains/names')
//             .then(response => {
//                 setFields(response.data);
//             })
//             .catch(error => {
//                 console.error('Error fetching fields:', error);
//             });
//     };

//     const fetchSecondaryFields = (domain) => {
//         axios.get(`http://localhost:8080/type_service/${domain}`)
//             .then(response => {
//                 setSecondaryFields(response.data);
//             })
//             .catch(error => {
//                 console.error('Error fetching secondary fields:', error);
//             });
//     };

//     const fetchBusinesses = () => {
//         if (!searchField || !searchSecondaryField) {
//             setShowPrompt(true);
//             return;
//         }

//         setLoading(true);
//         axios.get(`http://localhost:8080/professionals/type_service/${searchField}/${searchSecondaryField}/${selectedCity}`, {
//         }).then(response => {
//             setBusinesses(response.data);
//             setLoading(false);
//         })
//             .catch(error => {
//                 console.error('Error fetching business data:', error);
//                 setLoading(false);
//             });
//     };

//     const filteredBusinesses = businesses.filter(business => {
//         if (!selectedCity) {
//             return true;
//         } else {
//             return business.cityName === selectedCity;
//         }
//     });



//     const handleMoreDetails = (businessName) => {
//         navigate(`../searchBusinessOwner`, { replace: true, state: { name: businessName } });
//     };

//     const handleBookAppointment = (businessDetails) => {
//         navigate(`../InviteDate`, { replace: true, state: { businessDetails, type: searchSecondaryField } });
//     };

//     const handleFieldChange = (e) => {
//         const selectedField = e.target.value;
//         setSearchField(selectedField);
//         setSearchSecondaryField('');
//         fetchSecondaryFields(selectedField);
//     };



//     return (
//         <div id="invite-queue">
//             <div id="search-section">
//                 <div id="search-criteria">
//                     <p id="search12">Search for a business that suits you:</p>
//                     <input
//                         list="fields"
//                         placeholder="Field"
//                         value={searchField}
//                         onChange={handleFieldChange}
//                     />
//                     <datalist id="fields">
//                         {fields.map((field, index) => (
//                             <option key={index} value={field.domainName} />
//                         ))}
//                     </datalist>
//                     <input
//                         list="secondary-fields"
//                         placeholder="Secondary field"
//                         value={searchSecondaryField}
//                         onChange={(e) => setSearchSecondaryField(e.target.value)}
//                     />
//                     <datalist id="secondary-fields">
//                         {secondaryFields.map((field, index) => (
//                             <option key={index} value={field.typeName} />
//                         ))}
//                     </datalist>
//                     {showPrompt && <p className="prompt">Please fill both fields to search.</p>}
//                     <select
//                         value={selectedCity}
//                         onChange={(e) => setSelectedCity(e.target.value)}
//                     >
//                         <option value="">All Cities</option>
//                         {cities.map((city, index) => (
//                             <option key={index} value={city.CityName}>{city.CityName}</option>
//                         ))}
//                     </select>
//                     <button onClick={fetchBusinesses}>Search</button>
//                 </div>
//             </div>
//             <h2 id="list-title">List of relevant businesses:</h2>
//             {loading ? (
//                 <p>Loading...</p>
//             ) : filteredBusinesses.length > 0 ? (
//                 <table id="business-table">
//                     <thead>
//                         <tr>
//                             <th>Business Name</th>
//                             <th>Phone</th>
//                             <th>City</th>
//                             <th>More Details</th>
//                             <th>Book Appointment</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredBusinesses.map((business, index) => (
//                             <tr key={index}>
//                                 <td>{business.business_name}</td>
//                                 <td>{business.phone}</td>
//                                 <td>{business.cityName}</td>
//                                 <td><button className="details-button" onClick={() => handleMoreDetails(business.business_name)}>More Details</button></td>
//                                 <td><button className="book-button" onClick={() => handleBookAppointment(business)}>Save the date</button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             ) : (
//                 <p className="no-results">No businesses found for the selected criteria.</p>
//             )}
//         </div>
//     );
// };

// export default InviteQueue;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/InviteQueue.css';
import Swal from 'sweetalert2';

const InviteQueue = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchField, setSearchField] = useState('');
    const [searchSecondaryField, setSearchSecondaryField] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);
    const [fields, setFields] = useState([]);
    const [secondaryFields, setSecondaryFields] = useState([]);
    const [showPrompt, setShowPrompt] = useState(false); // For showing the sweet alert message

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCities();
        fetchFields();
    }, []);

    useEffect(() => {
        if (location.state) {
            const { domainName, cityName } = location.state;
            if (domainName) {
                setSearchField(domainName);
                fetchSecondaryFields(domainName);
                fetchBusinesses(domainName, cityName);
            }
            if (cityName) {
                setSelectedCity(cityName);
            }
        }
    }, [location.state]);

    const fetchCities = () => {
        axios.get('http://localhost:8080/cities')
            .then(response => {
                setCities(response.data);
            })
            .catch(error => {
                console.error('Error fetching cities:', error);
            });
    };

    const fetchFields = () => {
        axios.get('http://localhost:8080/domains/names')
            .then(response => {
                setFields(response.data);
            })
            .catch(error => {
                console.error('Error fetching fields:', error);
            });
    };

    const fetchSecondaryFields = (domain) => {
        axios.get(`http://localhost:8080/type_service/${domain}`)
            .then(response => {
                setSecondaryFields(response.data);
            })
            .catch(error => {
                console.error('Error fetching secondary fields:', error);
            });
    };

    const fetchBusinesses = () => {
        if (!searchField || !searchSecondaryField) {
            // הוספת התראה עם SweetAlert
            Swal.fire({
                icon: 'warning',
                title: 'נא למלא את כל השדות',
                text: 'הוסף תחום ותת-תחום לפני החיפוש!',
            });
            return;
        }

        setLoading(true);
        axios.get(`http://localhost:8080/professionals/type_service/${searchField}/${searchSecondaryField}/${selectedCity}`, {})
            .then(response => {
                setBusinesses(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching business data:', error);
                setLoading(false);
            });
    };


    const filteredBusinesses = businesses.filter(business => {
        if (!selectedCity) {
            return true;
        } else {
            return business.cityName === selectedCity;
        }
    });

    const handleMoreDetails = (businessName) => {
        navigate(`../searchBusinessOwner`, { replace: true, state: { businessName } });
    };

    const handleBookAppointment = (businessDetails) => {
        navigate(`../InviteDate`, { replace: true, state: { businessDetails, type: searchSecondaryField } });
    };

    const handleFieldChange = (e) => {
        const selectedField = e.target.value;
        setSearchField(selectedField);
        setSearchSecondaryField('');
        fetchSecondaryFields(selectedField);
    };

    return (
        <div id="invite-queue">
            <div id="search-section">
                <div id="search-criteria">
                    <p id="search12">Search for a business that suits you:</p>
                    <input
                        list="fields"
                        placeholder="Field"
                        value={searchField}
                        onChange={handleFieldChange}
                    />
                    <datalist id="fields">
                        {fields.map((field, index) => (
                            <option key={index} value={field.domainName} />
                        ))}
                    </datalist>
                    <input
                        list="secondary-fields"
                        placeholder="Secondary field"
                        value={searchSecondaryField}
                        onChange={(e) => setSearchSecondaryField(e.target.value)}
                    />
                    <datalist id="secondary-fields">
                        {secondaryFields.map((field, index) => (
                            <option key={index} value={field.typeName} />
                        ))}
                    </datalist>

                    {/* Show the sweet alert message if fields are not filled */}
                    {showPrompt && <p className="prompt" style={{ color: 'red' }}>Please fill all the fields to search.</p>}

                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        <option value="">All Cities</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city.CityName}>{city.CityName}</option>
                        ))}
                    </select>
                    <button onClick={fetchBusinesses}>Search</button>
                </div>
            </div>
            <h2 id="list-title">List of relevant businesses:</h2>
            {loading ? (
                <p></p>
            ) : filteredBusinesses.length > 0 ? (
                <table id="business-table">
                    <thead>
                        <tr>
                            <th>Business Name</th>
                            <th>Phone</th>
                            <th>City</th>
                            <th>More Details</th>
                            <th>Book Appointment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBusinesses.map((business, index) => (
                            <tr key={index}>
                                <td>{business.business_name}</td>
                                <td>{business.phone}</td>
                                <td>{business.cityName}</td>
                                <td><button className="details-button" onClick={() => handleMoreDetails(business.business_name)}>More Details</button></td>
                                <td><button className="book-button" onClick={() => handleBookAppointment(business)}>Save the date</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="no-results">No businesses found for the selected criteria.</p>
            )}
        </div>
    );
};

export default InviteQueue;
