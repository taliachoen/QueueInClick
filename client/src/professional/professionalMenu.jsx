import React, { useContext, useEffect } from 'react';
import { UserContext } from '../userContex';
import { useNavigate, Outlet } from 'react-router-dom';
import icon from '../image/logo.png';
import '../css/customerMenu.css';

const ProfessionalMenu = () => {
    const navigate = useNavigate();
    const {user} = useContext(UserContext);
    // const location = useLocation();
    // // const { user } = location.state || {}; // Get user from state
    // // console.log(user);
    useEffect(() => {
        navigate('AppointmentsPage');
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/landingPage');
    };

    return <>
        <div className='sticky-menu'>
            <img src={icon} alt="User Icon" className="user-icon" />
            <h2>Hi, {user ? user.firstName : 'Guest'}</h2>
            <button className="btn" onClick={() => navigate('myProfile')}>My Profile</button>
            <button className="btn" onClick={() => navigate('myCalendar')}>My Calendar</button>
            <button className="btn" onClick={() => navigate('AppointmentsPage')}>My Appointments</button>
            <button className="btn" onClick={() => navigate('myRecommendations')}>My Recommendations</button>

            <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
        <Outlet />
    </>
}

export default ProfessionalMenu;
