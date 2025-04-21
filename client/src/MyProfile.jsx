import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './userContex';
import { ImProfile } from "react-icons/im";
import './css/MyProfile.css';
import axios from 'axios';
import moment from 'moment-timezone';
import swal from 'sweetalert';

const MyProfile = () => {
    const { user, setUser } = useContext(UserContext);
    const [editMode, setEditMode] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({ ...user });
    const [cities, setCities] = useState([]);

    // Fetch cities from the server
    useEffect(() => {
        axios.get('http://localhost:8080/cities')
            .then(response => {
                setCities(response.data);
            })
            .catch(error => {
                console.error('Error fetching cities:', error);
            });
    }, []);

    // Update updatedUser whenever the user changes
    useEffect(() => {
        if (user) {
            setUpdatedUser({ ...user });
        }
    }, [user]);




    useEffect(() => {
        const fetchProfessional = async () => {
            try {
                if (!user?.id) return;
                const response = await axios.get(`http://localhost:8080/${user.userType}/${user.id}`);
                console.log('Fetched user data:', response.data); // הוספתי הדפסה
                setUser(prevUser => ({
                    ...prevUser,
                    ...response.data, // מוסיף לעדכון את שם העיר והתחום
                }));
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchProfessional();
    }, [user?.id]); // יופעל כשמשתנה ה-user.id



    // Toggle edit mode and reset updatedUser to current user data
    const handleEditToggle = () => {
        setEditMode(!editMode);
        setUpdatedUser({ ...user });
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cityName') {
            const selectedCity = cities.find(city => city.CityName === value);  // חפש את העיר לפי שם העיר
            setUpdatedUser(prevUser => ({
                ...prevUser,
                [name]: value,  // נשמור את שם העיר
                cityCode: selectedCity?.CityCode || '',  // נשמור את קוד העיר
            }));
        } else {
            setUpdatedUser(prevUser => ({
                ...prevUser,
                [name]: value
            }));
        }
    };
    const handleUpdateProfile = async () => {
        try {

            console.log("Updated User Data:", updatedUser);  // הצגת הנתונים שנשלחים לשרת
            const userId = user.id;
            console.log("cityCode being sent:", updatedUser.cityCode);

            // לוודא ש-cityCode לא ריק לפני שליחה
            if (!updatedUser.cityCode) {
                swal("Error", "City code is required", "error");
                return;
            }
            const updatedUserData = {
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                domainCode: updatedUser.domainCode || null,
                startDate: updatedUser.startDate
                    ? moment(updatedUser.startDate).format('YYYY-MM-DD')
                    : null,
                address: updatedUser.address,
                cityCode: updatedUser.cityCode,
                email: updatedUser.email,
                business_name: updatedUser.business_name || null,
                phone: updatedUser.phone,
            };

            console.log("Data sent to backend:", updatedUserData);

            const response = await axios.put(`http://localhost:8080/${user.userType}/${userId}`, updatedUserData);
            swal("Success", "Profile updated successfully", "success");
            setEditMode(false);
            setUser(prevUser => ({
                ...prevUser,
                ...response.data,
            }));

        } catch (error) {
            console.error('Error updating profile:', error);
            swal("Error", "An error occurred while updating the profile", "error");
        }
    };

    // Cancel edit mode and restore the original user data
    const handleCancelEdit = () => {
        setUpdatedUser({ ...user });
        setEditMode(false);
    };

    // Loading state if no user is available
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
                        <div className="button-group">
                            <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                            <button className="update-button" onClick={handleUpdateProfile}>Update</button>
                        </div>
                        // <>
                        //     <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                        //     <button className="update-button" onClick={handleUpdateProfile}>Update</button>
                        // </>
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
                            <label htmlFor="address">Address:</label>
                            <input type="text" id="address" name="address" value={updatedUser.address} onChange={handleChange} />
                            <select
                                className='city-select'
                                name="cityCode"
                                value={updatedUser.cityCode}  // נשלח קוד העיר
                                onChange={handleChange}  // תעדכן את הערכים בהמשך
                            >
                                {cities.map((city) => (
                                    <option key={city.CityCode} value={city.CityCode}>  {/* העברת הערך של קוד העיר */}
                                        {city.CityName}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="phone">Phone:</label>
                            <input type="text" id="phone" name="phone" value={updatedUser.phone} onChange={handleChange} />
                            {user.userType === 'professionals' && (
                                <>
                                    <label htmlFor="startDate">Start Date:</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={updatedUser.startDate ? moment(updatedUser.startDate).format('YYYY-MM-DD') : ''}
                                        onChange={handleChange}
                                        readOnly={true}  // הוספת אטריבוט שימנע שינוי
                                    />
                                    <label htmlFor="business_name">Business Name:</label>
                                    <input type="text" id="business_name" name="business_name" value={updatedUser.business_name} onChange={handleChange} />
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