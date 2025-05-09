import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/InviteQueue.css';
import Swal from 'sweetalert2';

const InviteQueue = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchField, setSearchField] = useState('');
    const [searchSecondaryField, setSearchSecondaryField] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);
    const [fields, setFields] = useState([]);
    const [secondaryFields, setSecondaryFields] = useState([]);
    const [showPrompt, setShowPrompt] = useState(false);

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
        axios.get(`${apiUrl}/cities`)
            .then(response => {
                setCities(response.data);
            })
            .catch(error => {
                console.error('Error fetching cities:', error);
            });
    };

    const fetchFields = () => {
        axios.get(`${apiUrl}/domains/names`)
            .then(response => {
                setFields(response.data);
            })
            .catch(error => {
                console.error('Error fetching fields:', error);
            });
    };

    const fetchSecondaryFields = (domain) => {
        axios.get(`${apiUrl}/type_service/${domain}`)
            .then(response => {
                setSecondaryFields(response.data);
            })
            .catch(error => {
                console.error('Error fetching secondary fields:', error);
            });
    };

    const fetchBusinesses = () => {
        if (!searchField || !searchSecondaryField) {
            Swal.fire({
                icon: 'warning',
                title: 'please fill all the fields',
                text: 'add domain and sub-domain before the search!',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown' 
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp' 
                },
                confirmButtonText: 'Got it!',
                confirmButtonColor: '#3085d6'
            });
            setShowPrompt(true);
            return;
        } else {
            setShowPrompt(false);
        }

        setLoading(true);
        axios.get(`${apiUrl}/professionals/type_service/${searchField}/${searchSecondaryField}`, {})
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

                    {/* {showPrompt && <p className="prompt" style={{ color: 'red' }}>Please fill all the fields to search.</p>} */}

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
                <div className="image-with-text">
                    <h3 className="searching-text">Searching for you the best queue💫</h3>
                    <img src="/robot-searching.png" alt="Robot Searching" className="searching-image" />
                </div>
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
                                <td><button className="book-button" onClick={() => handleBookAppointment(business)}>Search a date</button></td>
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
