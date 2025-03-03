
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../css/BusinessRegistrationStep3.css';
import { FormContext } from './FormProvider';
// import { UserContext } from '../userContex';

const daysOfWeek = [
  { name: 'Sunday', key: 'Sunday' },
  { name: 'Monday', key: 'Monday' },
  { name: 'Tuesday', key: 'Tuesday' },
  { name: 'Wednesday', key: 'Wednesday' },
  { name: 'Thursday', key: 'Thursday' },
  { name: 'Friday', key: 'Friday' },
  { name: 'Saturday', key: 'Saturday' },
];


const BusinessRegistrationStep3 = () => {
  const navigate = useNavigate();
  const { step3, setStep3, step1, step2 } = useContext(FormContext);
  const [workingHours, setWorkingHours] = useState(step3.workingHours);
  const [passwordProff, setPasswordProff] = useState('');
  const [formErrors, setFormErrors] = useState({
    workingHours: {},
    passwordProff: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);  // משתנה לשמירת מצב של שליחה

  useEffect(() => {
    setWorkingHours(step3.workingHours);
  }, [step3]);

  const handleChange = (day, field, value) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    });
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
        isWorking: !workingHours[day]?.isWorking,
      },
    });
  };

  const handleChangePassword = (event) => {
    setPasswordProff(event.target.value);
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

    Object.keys(workingHours).forEach(day => {
      if (workingHours[day]?.isWorking && (!workingHours[day].start || !workingHours[day].end)) {
        newErrors.workingHours[day] = 'Start and end time are required';
        isValid = false;
      }
    });

    if (!passwordProff) {
      newErrors.passwordProff = 'Please enter a password';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formattedWorkingHours = {};
      daysOfWeek.forEach(day => {
        formattedWorkingHours[day.key] = {
          isWorking: workingHours[day.key]?.isWorking || false,
          start: workingHours[day.key]?.isWorking ? workingHours[day.key].start : null,
          end: workingHours[day.key]?.isWorking ? workingHours[day.key].end : null
        };
      });

      const formData = { step1, step2, passwordProff, workingHours: formattedWorkingHours };
      console.log("Submitting Data:", formData);

      const response = await axios.post('http://localhost:8080/professionals/registerBusiness', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful',
        text: `Welcome, ${step1.firstName}!`,
        showConfirmButton: false,
        timer: 1500
      });

      setStep3(prev => ({ ...prev, workingHours: formattedWorkingHours }));
      navigate(`/login?type=professional`);
    } catch (error) {
      console.error('Error registering business:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div id="registration-step3-container">
      <h2 id="registration-step3-title">Set Days and Hours of Operation</h2>
      <form onSubmit={handleSubmit}>
        {daysOfWeek.map((day) => {
          const dayData = workingHours[day.key];
          return (
            <div key={day.key} className="registration-step3-form-group">
              <label>
                <input
                  type="checkbox"
                  checked={dayData.isWorking}
                  onChange={() => handleCheckboxChange(day.key)}
                  className="registration-step3-checkbox"
                />
                {day.name}
              </label>
              {dayData.isWorking && (
                <div className="registration-step3-time-inputs">
                  <input
                    type="time"
                    value={dayData.start}
                    onChange={(e) => handleChange(day.key, 'start', e.target.value)}
                    className="registration-step3-time-input"
                  />
                  <input
                    type="time"
                    value={dayData.end}
                    onChange={(e) => handleChange(day.key, 'end', e.target.value)}
                    className="registration-step3-time-input"
                  />
                  {formErrors.workingHours[day.key] && (
                    <p className="registration-step3-error-message">{formErrors.workingHours[day.key]}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

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
          <button className="registration-step3-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessRegistrationStep3;










// import React, { useState, useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import '../css/BusinessRegistrationStep3.css';
// import { FormContext } from './FormProvider';
// // import { UserContext } from '../userContex';

// const daysOfWeek = [
//   { name: 'Sunday', key: 'Sunday' },
//   { name: 'Monday', key: 'Monday' },
//   { name: 'Tuesday', key: 'Tuesday' },
//   { name: 'Wednesday', key: 'Wednesday' },
//   { name: 'Thursday', key: 'Thursday' },
//   { name: 'Friday', key: 'Friday' },
//   { name: 'Saturday', key: 'Saturday' },
// ];


// const BusinessRegistrationStep3 = () => {
//   const navigate = useNavigate();
//   const { step3, setStep3, step1, step2 } = useContext(FormContext);
//   const [workingHours, setWorkingHours] = useState(step3.workingHours || {});  // אתחול עם אובייקט ריק אם אין נתונים
//   const [passwordProff, setPasswordProff] = useState('');
//   const [formErrors, setFormErrors] = useState({
//     workingHours: {},
//     passwordProff: '',
//   });

//   useEffect(() => {
//     // לוודא שכל יום ב- workingHours מוגדר לפני הגישה אליו
//     const updatedWorkingHours = { ...step3.workingHours };
//     daysOfWeek.forEach(day => {
//       if (!updatedWorkingHours[day.key]) {
//         updatedWorkingHours[day.key] = { isWorking: false, start: '', end: '' };
//       }
//     });
//     setWorkingHours(updatedWorkingHours);
//   }, [step3]);

//   const handleChange = (day, field, value) => {
//     setWorkingHours({
//       ...workingHours,
//       [day]: {
//         ...workingHours[day],
//         [field]: value,
//       },
//     });
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

//     Object.keys(workingHours).forEach(day => {
//       if (workingHours[day].isWorking && (!workingHours[day].start || !workingHours[day].end)) {
//         newErrors.workingHours[day] = 'Start and end time are required';
//         isValid = false;
//       }
//     });

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
//       const formData = { step1, step2, passwordProff, workingHours };
//       const response = await axios.post('http://localhost:8080/professionals/registerBusiness', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//       console.log('Registration successful:', response.data);
//       const user = response.data;

//       Swal.fire({
//         icon: 'success',
//         title: 'Registration Successful',
//         text: `Welcome, ${user.firstName}!`,
//         showConfirmButton: false,
//         timer: 1500
//       });

//       setStep3({ ...step3, workingHours });
//       console.log("step3step3" , step3);

//       navigate(`/login?type=professional`);

//     } catch (error) {
//       console.error('Error registering business:', error);
//     }
//   };

//   return (
//     <div id="registration-step3-container">
//       <h2 id="registration-step3-title">Set Days and Hours of Operation</h2>
//       <form onSubmit={handleSubmit}>
//         {daysOfWeek.map((day) => {
//           const dayData = workingHours[day.key] || { isWorking: false, start: '', end: '' };  // ערכים ברירת מחדל
//           return (
//             <div key={day.key} className="registration-step3-form-group">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={dayData.isWorking}
//                   onChange={() => handleCheckboxChange(day.key)}
//                   className="registration-step3-checkbox"
//                 />
//                 {day.name}
//               </label>
//               {dayData.isWorking && (
//                 <div className="registration-step3-time-inputs">
//                   <input
//                     type="time"
//                     value={dayData.start}
//                     onChange={(e) => handleChange(day.key, 'start', e.target.value)}
//                     className="registration-step3-time-input"
//                   />
//                   <input
//                     type="time"
//                     value={dayData.end}
//                     onChange={(e) => handleChange(day.key, 'end', e.target.value)}
//                     className="registration-step3-time-input"
//                   />
//                   {formErrors.workingHours[day.key] && (
//                     <p className="registration-step3-error-message">{formErrors.workingHours[day.key]}</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         <div className="registration-step3-form-group">
//           <p>Please enter your password to complete registration</p>
//           <label>Password:</label>
//           <input
//             type="password"
//             name="passwordProff"
//             value={passwordProff}
//             onChange={handleChangePassword}
//             className="registration-step3-password-input"
//           />
//           {formErrors.passwordProff && (
//             <p className="registration-step3-error-message">{formErrors.passwordProff}</p>
//           )}
//         </div>
//         <div className="registration-step3-form-buttons">
//           <button className="registration-step3-btn" type="submit">Save</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BusinessRegistrationStep3;





// import React, { useState, useContext, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import '../css/BusinessRegistrationStep3.css';
// import { FormContext } from './FormProvider';
// // import { UserContext } from '../userContex';

// const daysOfWeek = [
//   { name: 'Sunday', key: 'Sunday' },
//   { name: 'Monday', key: 'Monday' },
//   { name: 'Tuesday', key: 'Tuesday' },
//   { name: 'Wednesday', key: 'Wednesday' },
//   { name: 'Thursday', key: 'Thursday' },
//   { name: 'Friday', key: 'Friday' },
//   { name: 'Saturday', key: 'Saturday' },
// ];

// const BusinessRegistrationStep3 = () => {
//   // const { setUser } = useContext(UserContext);
//   const navigate = useNavigate();
//   const { step3, setStep3, step1, step2 } = useContext(FormContext);
//   const [workingHours, setWorkingHours] = useState(step3.workingHours);
//   const [passwordProff, setPasswordProff] = useState('');
//   const [formErrors, setFormErrors] = useState({
//     workingHours: {},
//     passwordProff: '',
//   });

//   useEffect(() => {
//     setWorkingHours(step3.workingHours);
//   }, [step3]);

//   const handleChange = (day, field, value) => {
//     setWorkingHours({
//       ...workingHours,
//       [day]: {
//         ...workingHours[day],
//         [field]: value,
//       },
//     });
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

//     Object.keys(workingHours).forEach(day => {
//       if (workingHours[day].isWorking && (!workingHours[day].start || !workingHours[day].end)) {
//         newErrors.workingHours[day] = 'Start and end time are required';
//         isValid = false;
//       }
//     });

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
//       const formData = { step1, step2, passwordProff, workingHours };
//       const response = await axios.post('http://localhost:8080/professionals/registerBusiness', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//       console.log('Registration successful:', response.data);
//       const user = response.data;

//       Swal.fire({
//         icon: 'success',
//         title: 'Registration Successful',
//         text: `Welcome, ${user.firstName}!`,
//         showConfirmButton: false,
//         timer: 1500
//       });

//       setStep3({ ...step3, workingHours });
//       console.log("step3step3" , step3);

//       navigate(`/login?type=professional`);

//     } catch (error) {
//       console.error('Error registering business:', error);
//     }
//   };


//   return (
//     <div id="registration-step3-container">
//       <h2 id="registration-step3-title">Set Days and Hours of Operation</h2>
//       <form onSubmit={handleSubmit}>
//         {daysOfWeek.map((day) => {
//           const dayData = workingHours[day.key];
//           return (
//             <div key={day.key} className="registration-step3-form-group">
//               <label>
//                 <input
//                   type="checkbox"
//                   checked={dayData.isWorking}
//                   onChange={() => handleCheckboxChange(day.key)}
//                   className="registration-step3-checkbox"
//                 />
//                 {day.name}
//               </label>
//               {dayData.isWorking && (
//                 <div className="registration-step3-time-inputs">
//                   <input
//                     type="time"
//                     value={dayData.start}
//                     onChange={(e) => handleChange(day.key, 'start', e.target.value)}
//                     className="registration-step3-time-input"
//                   />
//                   <input
//                     type="time"
//                     value={dayData.end}
//                     onChange={(e) => handleChange(day.key, 'end', e.target.value)}
//                     className="registration-step3-time-input"
//                   />
//                   {formErrors.workingHours[day.key] && (
//                     <p className="registration-step3-error-message">{formErrors.workingHours[day.key]}</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         <div className="registration-step3-form-group">
//           <p>Please enter your password to complete registration</p>
//           <label>Password:</label>
//           <input
//             type="password"
//             name="passwordProff"
//             value={passwordProff}
//             onChange={handleChangePassword}
//             className="registration-step3-password-input"
//           />
//           {formErrors.passwordProff && (
//             <p className="registration-step3-error-message">{formErrors.passwordProff}</p>
//           )}
//         </div>
//         <div className="registration-step3-form-buttons">
//           <button className="registration-step3-btn" type="submit">Save</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BusinessRegistrationStep3;