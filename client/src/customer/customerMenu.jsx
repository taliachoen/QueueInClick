// import React, { useContext, useEffect } from 'react';
// import { UserContext } from '../userContex';
// import { useNavigate, Outlet } from 'react-router-dom';
// import icon from '../image/logo.png';
// import '../css/customerMenu.css';

// const CustomerMenu = () => {
//    const [activeButton, setActiveButton] = useState('AppointmentsPage');
//   const navigate = useNavigate();
//   const {user} = useContext(UserContext);

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/landingPage');
//   };
//   useEffect(() => {
//     navigate('myQueues');
//   }, []);

//   return <>
//     <div className='sticky-menu'>
//       <img src={icon} alt="User Icon" className="user-icon" />
//       <h2>Hi, {user ? user.firstName : 'Guest'}</h2>
//       <button className="btn" onClick={() => navigate('myProfile')}>My Profile</button>
//       <button className="btn" onClick={() => navigate('inviteQueue')}>Invite Queue</button>
//       <button className="btn" onClick={() => navigate('myMessages')}>My Messages</button>
//       <button className="btn" onClick={() => navigate('myQueues')}>My Queues</button>
//       <button className="btn" onClick={() => navigate('searchBusinessOwner')}>Search for Professional</button>
//       <button className="btn" onClick={handleLogout}>Logout</button>
//     </div>
//     <Outlet />
//   </>
// }

// export default CustomerMenu;
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../userContex';
import { useNavigate, Outlet } from 'react-router-dom';
import icon from '../image/logo.png';
import '../css/customerMenu.css';

const CustomerMenu = () => {
  const [activeButton, setActiveButton] = useState('AppointmentsPage');
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/landingPage');
  };

  const handleNavigation = (page) => {
    setActiveButton(page);
    navigate(page);
  };

  useEffect(() => {
    navigate('myQueues');
  }, []);

  return (
    <>
      <div className='sticky-menu'>
        <img src={icon} alt="User Icon" className="user-icon" />
        <h2>Hi, {user ? user.firstName : 'Guest'}</h2>
        <button
          className={`btn ${activeButton === 'myProfile' ? 'active' : ''}`}
          onClick={() => handleNavigation('myProfile')}>
          My Profile
        </button>
        <button
          className={`btn ${activeButton === 'inviteQueue' ? 'active' : ''}`}
          onClick={() => handleNavigation('inviteQueue')}>
          Invite Queue
        </button>
        <button
          className={`btn ${activeButton === 'myMessages' ? 'active' : ''}`}
          onClick={() => handleNavigation('myMessages')}>
          My Messages
        </button>
        <button
          className={`btn ${activeButton === 'myQueues' ? 'active' : ''}`}
          onClick={() => handleNavigation('myQueues')}>
          My Queues
        </button>
        <button
          className={`btn ${activeButton === 'searchBusinessOwner' ? 'active' : ''}`}
          onClick={() => handleNavigation('searchBusinessOwner')}>
          Search for Professional
        </button>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>
      <Outlet />
    </>
  );
};

export default CustomerMenu;
