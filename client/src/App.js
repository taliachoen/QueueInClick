import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './Login';
import CustomerMenu from './customer/customerMenu';
import RegisterCustomer from './customer/RegisterCustomer';
import LandingPage from './LandingPage';
import SearchBusinessOwner from './customer/SearchBusinessOwner';
import MyQueues from './customer/MyQueues';
import MyProfile from './MyProfile';
import MyMessages from './customer/MyMessages';
import InviteQueue from './customer/InviteQueue';
import InviteDate from './customer/InviteDate';


import FormProvider from './professional/FormProvider'
import BusinessRegistration1 from './professional/BusinessRegistration1';
import BusinessRegistrationStep2 from './professional/BusinessRegistrationStep2';
import BusinessRegistrationStep3 from './professional/BusinessRegistrationStep3';
import ProfessionalMenu from './professional/professionalMenu';
import Recommendations from './professional/Recommendations';
import AppointmentsPage from './professional/AppointmentsPage';
import MyCalendar from './professional/MyCalendar';


import './style.css';
import { UserProvider } from './userContex';


function App() {

  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/landingPage" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registerCustomer" element={<RegisterCustomer />} />
          <Route path="/customerMenu/:userid" element={<CustomerMenu />}>
            <Route path="myProfile" element={<MyProfile />} />
            <Route path="searchBusinessOwner" element={<SearchBusinessOwner />} />
            <Route path="myQueues" element={<MyQueues />} />
            <Route path="myMessages" element={<MyMessages />} />
            <Route path="inviteQueue" element={<InviteQueue />} />
            <Route path="inviteDate" element={<InviteDate />} />
          </Route>

            <Route path="/BusinessRegistration" element={<FormProvider />} >
            <Route path="step1" element={<BusinessRegistration1 />} />
            <Route path="step2" element={<BusinessRegistrationStep2 />} />
            <Route path="step3" element={<BusinessRegistrationStep3 />} />
          </Route>
          <Route path="/professionalMenu/:userid" element={<ProfessionalMenu />}>
            <Route path="myProfile" element={<MyProfile />} />
            <Route path="AppointmentsPage" element={<AppointmentsPage />} />
            <Route path="myCalendar" element={<MyCalendar />} />
            <Route path="myRecommendations" element={<Recommendations />} />
          </Route>
          <Route path="*" element={<Navigate to="/landingPage" />} /> 
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;





