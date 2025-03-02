// FormProvider.jsx
import React, { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export const FormContext = createContext();


const FormProvider = () => {
  const [step1, setStep1] = useState({
    idProfessional: '',
    firstName: '',
    lastName: '',
    domainCode: '',
    domainName: '',
    startDate: '',
    address: '',
    cityCode: '',
    cityName: '',
    email: '',
    passwordProff: '',
    business_name: '',
    phone: '',
    logo: '',
    useType: 'professionals'
  });
  const [step2, setStep2] = useState({
    services: []
  });
  const [step3, setStep3] = useState({
    workingHours: {
      Sunday: { start: '', end: '', isWorking: false },
      Monday: { start: '', end: '', isWorking: false },
      Tuesday: { start: '', end: '', isWorking: false },
      Wednesday: { start: '', end: '', isWorking: false },
      Thursday: { start: '', end: '', isWorking: false },
      Friday: { start: '', end: '', isWorking: false },
      Saturday: { start: '', end: '', isWorking: false },
    }
  });
  
  const data = {
    step1,
    step2,
    step3,
    setStep1,
    setStep2,
    setStep3,

    fullData: {
      ...step1,
      ...step2,
      ...step3
    }
  };

  return (
    <FormContext.Provider value={data}>
      <Outlet />
    </FormContext.Provider>
  );
};

export default FormProvider;
