// import React, { useState, useContext } from 'react';
// import { UserContext } from '../App' ;
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import '../css/BusinessRegistrationStep3.css';

// const daysOfWeek = [
//   { name: 'Sunday', key: 'sunday' },
//   { name: 'Monday', key: 'monday' },
//   { name: 'Tuesday', key: 'tuesday' },
//   { name: 'Wednesday', key: 'wednesday' },
//   { name: 'Thursday', key: 'thursday' },
//   { name: 'Friday', key: 'friday' },
//   { name: 'Saturday', key: 'saturday' },
// ];

// const BusinessRegistrationStep3 = () => {
//   const navigate = useNavigate();
//   const userData = useContext(UserContext);

//   const [workingHours, setWorkingHours] = useState({
//     sunday: { start: '', end: '', isWorking: false },
//     monday: { start: '', end: '', isWorking: false },
//     tuesday: { start: '', end: '', isWorking: false },
//     wednesday: { start: '', end: '', isWorking: false },
//     thursday: { start: '', end: '', isWorking: false },
//     friday: { start: '', end: '', isWorking: false },
//     saturday: { start: '', end: '', isWorking: false },
//   });
//   const [passwordProff, setPasswordProff] = useState('');
//   const [formErrors, setFormErrors] = useState({
//     workingHours: {},
//     passwordProff: '',
//   });

//   const handleChange = (day, field, value) => {
//     setWorkingHours({
//       ...workingHours,
//       [day]: {
//         ...workingHours[day],
//         [field]: value,
//       },
//     });
//     // Clear error message when valid input is entered
//     if (formErrors.workingHours[day]) {
//       setFormErrors({
//         ...formErrors,
//         workingHours: {
//           ...formErrors.workingHours,
//           [day]: '',
//         },
//       });
//     }
//   };

//   const handleCheckboxChange = (day) => {
//     setWorkingHours({
//       ...workingHours,
//       [day]: {
//         ...workingHours[day],
//         isWorking: !workingHours[day].isWorking,
//       },
//     });
//   };

//   const handleChangePassword = (event) => {
//     setPasswordProff(event.target.value);
//     // Clear error message when valid input is entered
//     if (formErrors.passwordProff) {
//       setFormErrors({
//         ...formErrors,
//         passwordProff: '',
//       });
//     }
//   };

//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = { workingHours: {}, passwordProff: '' };

//     // Validate working hours
//     Object.keys(workingHours).forEach(day => {
//       if (workingHours[day].isWorking && (!workingHours[day].start || !workingHours[day].end)) {
//         newErrors.workingHours[day] = 'Start and end time are required';
//         isValid = false;
//       }
//     });

//     // Validate password
//     if (!passwordProff) {
//       newErrors.passwordProff = 'Please enter a password';
//       isValid = false;
//     }

//     setFormErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     try {
//       // Get all registration data from Local Storage
//       const formData = { ...userData, passwordProff, workingHours };

//       // Example: Sending formData to the server
//       const response = await axios.post('http://localhost:8080/professionals/registerBusiness', formData);
//       console.log('Registration successful:', response.data);
//       // Clear local storage after successful registration
//       Swal.fire({
//         icon: 'success',
//         title: 'Registration Successful',
//         text: `Welcome, ${formData.firstName} ${formData.lastName}!`,
//         showConfirmButton: false,
//         timer: 1500
//       });
//       navigate(`/professionalMenu/${formData.firstName}`);
//     } catch (error) {
//       console.error('Error registering business:', error);
//     }
//   };

//   return (
//     <div className="registration-step3-container">
//       <h2>Set Days and Hours of Operation</h2>
//       <form onSubmit={handleSubmit}>
//         {daysOfWeek.map((day) => (
//           <div key={day.key} className="form-group">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={workingHours[day.key].isWorking}
//                 onChange={() => handleCheckboxChange(day.key)}
//               />
//               {day.name}
//             </label>
//             {workingHours[day.key].isWorking && (
//               <div className="time-inputs">
//                 <input
//                   type="time"
//                   value={workingHours[day.key].start}
//                   onChange={(e) => handleChange(day.key, 'start', e.target.value)}
//                 />
//                 <input
//                   type="time"
//                   value={workingHours[day.key].end}
//                   onChange={(e) => handleChange(day.key, 'end', e.target.value)}
//                 />
//                 {formErrors.workingHours[day.key] && (
//                   <p className="error-message">{formErrors.workingHours[day.key]}</p>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//         <div className="form-group">
//           <p>Please enter your password to complete registration</p>
//           <label>Password:</label>
//           <input
//             type="password"
//             name="passwordProff"
//             value={passwordProff}
//             onChange={handleChangePassword}
//           />
//           {formErrors.passwordProff && (
//             <p className="error-message">{formErrors.passwordProff}</p>
//           )}
//         </div>
//         <div className="form-buttons">
//           <button className='btn' type="submit">Next</button>
//           <button className='btn' type="button" onClick={() => navigate('/BusinessRegistrationStep2')}>Back</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BusinessRegistrationStep3;



import React, { useState, useContext ,useEffect} from 'react';
// import { UserContext } from '../userContex';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../css/BusinessRegistrationStep3.css';
import { FormContext } from './FormProvider';

const daysOfWeek = [
  { name: 'Sunday', key: 'sunday' },
  { name: 'Monday', key: 'monday' },
  { name: 'Tuesday', key: 'tuesday' },
  { name: 'Wednesday', key: 'wednesday' },
  { name: 'Thursday', key: 'thursday' },
  { name: 'Friday', key: 'friday' },
  { name: 'Saturday', key: 'saturday' },
];

const BusinessRegistrationStep3 = () => {
  const navigate = useNavigate();
  const { step3, setStep3 } = useContext(FormContext)
  // const {user} = useContext(UserContext);
  // const [formData, setFormData] = useState(step3);
  const [workingHours, setWorkingHours] = useState({step3});
  const [passwordProff, setPasswordProff] = useState('');
  const [formErrors, setFormErrors] = useState({
    workingHours: {},
    passwordProff: '',
  });

  useEffect(() => {
    setWorkingHours(step3);
  }, []);


  const handleChange = (day, field, value) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    });
    // Clear error message when valid input is entered
    if (formErrors.workingHours[day]) {
      setFormErrors({
        ...formErrors,
        workingHours: {
          ...formErrors.workingHours,
          [day]: '',
        },
      });
    }
  };

  const handleCheckboxChange = (day) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        isWorking: !workingHours[day].isWorking,
      },
    });
  };

  const handleChangePassword = (event) => {
    setPasswordProff(event.target.value);
    // Clear error message when valid input is entered
    if (formErrors.passwordProff) {
      setFormErrors({
        ...formErrors,
        passwordProff: '',
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { workingHours: {}, passwordProff: '' };

    // Validate working hours
    Object.keys(workingHours).forEach(day => {
      if (workingHours[day].isWorking && (!workingHours[day].start || !workingHours[day].end)) {
        newErrors.workingHours[day] = 'Start and end time are required';
        isValid = false;
      }
    });

    // Validate password
    if (!passwordProff) {
      newErrors.passwordProff = 'Please enter a password';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Get all registration data from Local Storage
      const formData = { ...step3, passwordProff, workingHours };

      // Example: Sending formData to the server
      const response = await axios.post('http://localhost:8080/professionals/registerBusiness', formData);
      console.log('Registration successful:', response.data);
      // Clear local storage after successful registration
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: `Welcome, ${formData.firstName} ${formData.lastName}!`,
        showConfirmButton: false,
        timer: 1500
      });
      setStep3(workingHours);
      navigate(`/professionalMenu/${formData.firstName}`);
    } catch (error) {
      console.error('Error registering business:', error);
    }
  };

  return (
    <div id="registration-step3-container">
      <h2 id="registration-step3-title">Set Days and Hours of Operation</h2>
      <form onSubmit={handleSubmit}>
        {daysOfWeek.map((day) => (
          <div key={day.key} className="registration-step3-form-group">
            <label>
              <input
                type="checkbox"
                checked={workingHours[day.key].isWorking}
                onChange={() => handleCheckboxChange(day.key)}
                className="registration-step3-checkbox"
              />
              {day.name}
            </label>
            {workingHours[day.key].isWorking && (
              <div className="registration-step3-time-inputs">
                <input
                  type="time"
                  value={workingHours[day.key].start}
                  onChange={(e) => handleChange(day.key, 'start', e.target.value)}
                  className="registration-step3-time-input"
                />
                <input
                  type="time"
                  value={workingHours[day.key].end}
                  onChange={(e) => handleChange(day.key, 'end', e.target.value)}
                  className="registration-step3-time-input"
                />
                {formErrors.workingHours[day.key] && (
                  <p className="registration-step3-error-message">{formErrors.workingHours[day.key]}</p>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="registration-step3-form-group">
          <p>Please enter your password to complete registration</p>
          <label>Password:</label>
          <input
            type="password"
            name="passwordProff"
            value={passwordProff}
            onChange={handleChangePassword}
            className="registration-step3-password-input"
          />
          {formErrors.passwordProff && (
            <p className="registration-step3-error-message">{formErrors.passwordProff}</p>
          )}
        </div>
        <div className="registration-step3-form-buttons">
          <button className="registration-step3-btn back-button" type="button" onClick={() => navigate('/BusinessRegistrationStep2')}>Back</button>
          <button className="registration-step3-btn" type="submit">Next</button>
        </div>
      </form>
    </div>
  );
};

export default BusinessRegistrationStep3;