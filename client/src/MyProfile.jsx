import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './userContex';
import { ImProfile } from "react-icons/im";
import './css/MyProfile.css';
import axios from 'axios';
import swal from 'sweetalert';

const MyProfile = () => {
    const { user, setUser } = useContext(UserContext);
    const [editMode, setEditMode] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({ ...user }); // Initialize with current user data
    const [cities, setCities] = useState([]);

    useEffect(() => {
        // Fetch cities from the server
        axios.get('http://localhost:8080/cities')
            .then(response => {
                setCities(response.data);
                console.log(response.data)
            })
            .catch(error => {
                console.error('Error fetching cities:', error);
            });
    }, []);


    const handleEditToggle = () => {
        setEditMode(!editMode);
        setUpdatedUser({ ...user }); // Reset updatedUser to current user data when entering edit mode
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleUpdateProfile = () => {
        const userId = user.id;
        axios.put(`http://localhost:8080/${user.userType}/${userId}`, updatedUser)
            .then(response => {
                console.log('Profile updated successfully:', response.data);
                swal("Success", "Profile updated successfully", "success");
                setEditMode(false);
                setUser(response.data);
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                swal("Error", "An error occurred while updating the profile", "error");
            });
    };

    const handleCancelEdit = () => {
        // Reset updatedUser to original user data
        setUpdatedUser({ ...user });
        setEditMode(false);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className={`profile-card ${editMode ? 'edit-mode' : ''}`}>
                <div className="profile-header">
                    <h1><ImProfile /> {user.firstName} {user.lastName}</h1>
                    {!editMode && <button className="edit-button" onClick={handleEditToggle}>Edit</button>}
                    {editMode && (
                        <>
                            <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                            <button className="update-button" onClick={handleUpdateProfile}>Update</button>
                        </>
                    )}
                </div>
                <div className="profile-body">
                    {editMode ? (
                        <>
                            <label htmlFor="firstName">First Name:</label>
                            <input type="text" id="firstName" name="firstName" value={updatedUser.firstName} onChange={handleChange} />
                            <label htmlFor="lastName">Last Name:</label>
                            <input type="text" id="lastName" name="lastName" value={updatedUser.lastName} onChange={handleChange} />
                            <p><strong>Email:</strong> {user.email}</p>
                            {/* <input type="text" id="email" name="email" value={updatedUser.email} onChange={handleChange} /> */}
                            <label htmlFor="address">Address:</label>
                            <input type="text" id="address" name="address" value={updatedUser.address} onChange={handleChange} />
                            <select className='city-select' name="cityName" value={updatedUser.cityName} onChange={handleChange}>
                                {cities.map((city) => (
                                    <option key={city.CityCode} value={city.CityName}>
                                        {city.CityName}
                                    </option>
                                ))}
                            </select>
                            <label htmlFor="phone">Phone:</label>
                            <input type="text" id="phone" name="phone" value={updatedUser.phone} onChange={handleChange} />
                            {user.userType === 'professionals' && (
                                <>
                                    <label htmlFor="startDate">Start Date:</label>
                                    <input type="date" id="startDate" name="startDate" value={updatedUser.startDate} onChange={handleChange} />
                                    <label htmlFor="business_name">Business Name:</label>
                                    <input type="text" id="business_name" name="business_name" value={updatedUser.business_name} onChange={handleChange} />
                                    {/* Add more professional-specific fields as needed */}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Address:</strong> {user.address}</p>
                            <p><strong>City:</strong> {user.cityName}</p>
                            <p><strong>Phone:</strong> {user.phone}</p>
                            {user.userType === 'professionals' && (
                                <>
                                    <p><strong>Domain Name:</strong> {user.domainName}</p>
                                    <p><strong>Start Date:</strong> {new Date(user.startDate).toLocaleDateString()}</p>
                                    <p><strong>Name of business:</strong> {user.business_name}</p>
                                    {/* Add more professional-specific fields as needed */}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProfile;



