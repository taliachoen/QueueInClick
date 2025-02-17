// import React, { useContext, useEffect, useState } from 'react';
// import { UserContext } from '../userContex';
// import { useNavigate, Outlet } from 'react-router-dom';
// import icon from '../image/logo.png';
// import '../css/customerMenu.css';


// // עכשיו ניתן להציג את התמונה


// const ProfessionalMenu = () => {
//     const navigate = useNavigate();
//     const { user } = useContext(UserContext);
//     const [activeButton, setActiveButton] = useState('AppointmentsPage');



//     useEffect(() => {
//         navigate('AppointmentsPage');
//         console.log("user.logo", user.logo, "user", user);

//     }, []);

//     const handleLogout = () => {
//         localStorage.clear();
//         navigate('/landingPage');
//     };

//     const handleNavigation = (page) => {
//         setActiveButton(page);
//         navigate(page);
//     };

//     return (
//         <>
//             <div className='sticky-menu'>
//                 <img id="logo" src={user.logo} alt="Business Logo" />
//                 <img src={dataUri} alt="Business Logo" className="user-icon" />
//                 {/* <img id="logo" src={process.env.PUBLIC_URL + user.logo} alt="Business Logo" /> */}
//                 <img src={icon} alt="Default Icon" className="user-icon" />
//                 <h2>Hi, {user ? user.firstName : 'Guest'}</h2>
//                 <button className={`btn ${activeButton === 'myProfile' ? 'active' : ''}`}
//                     onClick={() => handleNavigation('myProfile')}>
//                     My Profile
//                 </button>
//                 <button className={`btn ${activeButton === 'myCalendar' ? 'active' : ''}`}
//                     onClick={() => handleNavigation('myCalendar')}>
//                     My Calendar
//                 </button>
//                 <button className={`btn ${activeButton === 'AppointmentsPage' ? 'active' : ''}`}
//                     onClick={() => handleNavigation('AppointmentsPage')}>
//                     My Appointments
//                 </button>
//                 <button className={`btn ${activeButton === 'myRecommendations' ? 'active' : ''}`}
//                     onClick={() => handleNavigation('myRecommendations')}>
//                     My Recommendations
//                 </button>

//                 <button className="btn" onClick={handleLogout}>Logout</button>
//             </div>
//             <Outlet />
//         </>
//     );
// };

// export default ProfessionalMenu;


import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContex';
import { useNavigate, Outlet } from 'react-router-dom';
import icon from '../image/logo.png';

import axios from 'axios'; // ודא שהייבוא של axios קיים
import '../css/customerMenu.css';

const ProfessionalMenu = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [activeButton, setActiveButton] = useState('AppointmentsPage');
    const [base64Logo, setBase64Logo] = useState('');
    const [loading, setLoading] = useState(false);  // מצב טעינה

    useEffect(() => {
        navigate('myProfile'); // מנווט לדף ברירת המחדל בעת טעינה
    }, []); // רץ פעם אחת כשהקומפוננטה נטענת



    useEffect(() => {
        if (user && user.id) {
            fetchLogo();
        }
    }, [user]); // קורא לפונקציה כל פעם שהמשתמש משתנה


    const fetchLogo = async () => {
        try {
            setLoading(true);  // מצב טעינה מתחיל
            const userId = user.id;
            const response = await axios.get(`http://localhost:8080/professionals/getLogo/${userId}`);
            console.log('LogoHair@', response.data);
            setBase64Logo(response.data.logo); // עדכון הסטייט עם הלוגו שנשלף
            setLoading(false);  // מצב טעינה מסתיים
        } catch (error) {
            console.error('Error fetching logo:', error);
            setLoading(false);  // מצב טעינה מסתיים גם במקרה של שגיאה
        }
    };


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
                {/* אם יש לוגו, תראה אותו */}
                {base64Logo ? (
                    <img src="/images/alice_logo.png" alt="Alice Logo" className="logo-icon" />
                ) : (
                    <img src={base64Logo} alt="Business Logo" className="logo-icon" />
                )}
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



