import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContex';
import { useNavigate, Outlet } from 'react-router-dom';
import icon from '../image/logo.png';
import '../css/customerMenu.css';

const ProfessionalMenu = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [activeButton, setActiveButton] = useState('AppointmentsPage');

    useEffect(() => {
        navigate('AppointmentsPage');
    }, []); 
    
    const handleLogout = () => {
        localStorage.clear();
        navigate('/landingPage');
    };

    const handleNavigation = (page) => {
        setActiveButton(page);
        navigate(page);
    };

    return (
        <>
            <div className='sticky-menu'>
                <img src={icon} alt="Default Icon" className="user-icon" />
                <h2>Hi, {user ? user.firstName : 'Guest'}</h2>
                <button className={`btn ${activeButton === 'myProfile' ? 'active' : ''}`}
                    onClick={() => handleNavigation('myProfile')}>
                    My Profile
                </button>
                <button className={`btn ${activeButton === 'myCalendar' ? 'active' : ''}`}
                    onClick={() => handleNavigation('myCalendar')}>
                    My Calendar
                </button>
                <button className={`btn ${activeButton === 'AppointmentsPage' ? 'active' : ''}`}
                    onClick={() => handleNavigation('AppointmentsPage')}>
                    My Appointments
                </button>
                <button className={`btn ${activeButton === 'myRecommendations' ? 'active' : ''}`}
                    onClick={() => handleNavigation('myRecommendations')}>
                    My Recommendations
                </button>

                <button className="btn" onClick={handleLogout}>Logout</button>
            </div>
            <Outlet />
        </>
    );
};

export default ProfessionalMenu;



