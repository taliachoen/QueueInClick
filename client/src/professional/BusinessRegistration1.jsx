import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/BusinessRegistration.css';
import { FormContext } from './FormProvider';

// קומפוננטה להרשמת עסק
const BusinessRegistration1 = () => {
  // שימוש בקונטקסט לנהל את המידע של טופס ההרשמה
  const { step1, setStep1 } = useContext(FormContext);

  // סטייט למידע מהטופס
  const [formData, setFormData] = useState(step1);

  // סטייט לרשימת ערים, תחומים, שמות עסקים, לוגו והודעות שגיאה
  const [cities, setCities] = useState([]);
  const [domains, setDomains] = useState([]);
  const [business_name, setBusinessName] = useState([]);
  const [logo, setLogo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // שימוש ב-useEffect לטעינת הנתונים
  useEffect(() => {
    setFormData(step1);
    fetchBuisnessName();
    fetchCities();
    fetchDomains();
  }, []);

  // פונקציה לטעינת רשימת הערים
  const fetchCities = async () => {
    try {
      const response = await axios.get('http://localhost:8080/cities');
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // פונקציה לטעינת רשימת התחומים
  const fetchDomains = async () => {
    try {
      const response = await axios.get('http://localhost:8080/domains');
      setDomains(response.data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  // פונקציה לטעינת שמות העסקים הקיימים
  const fetchBuisnessName = () => {
    axios.get('http://localhost:8080/professionals/business_name')
      .then(response => {
        setBusinessName(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching fields:', error);
      });
  };

  // טיפול בשינוי בשם העסק ובדיקת ייחודיות השם
  const handleBusinessNameChange = (e) => {
    const name = e.target.value;
    const isDuplicate = business_name.some((business) => business.business_name === name);

    if (isDuplicate) {
      setErrorMessage('The business name already exists.');
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      setErrorMessage('');
    }
  };

  // טיפול בשינוי ערכי הטופס ועדכון הסטייט
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'cityCode') {
      const selectedCity = cities.find(city => city.CityCode === parseInt(value));
      if (selectedCity) {
        updatedFormData.cityName = selectedCity.CityName;
      }
    }

    if (name === 'domainCode') {
      const selectedDomain = domains.find(domain => domain.idDomain === parseInt(value));
      if (selectedDomain) {
        updatedFormData.domainName = selectedDomain.domainName;
      }
    }

    setFormData(updatedFormData);
  };

  // טיפול בשינוי קובץ הלוגו
  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

// טיפול בשליחת הטופס ובדיקת תקינות הנתונים
const handleSubmit = (e) => {
  e.preventDefault();

  // בדיקת מילוי שדות חובה
  if (!formData.idProfessional ||
    !formData.firstName ||
    !formData.lastName ||
    !formData.domainCode ||
    !formData.startDate ||
    !formData.address ||
    !formData.cityCode ||
    !formData.email ||
    !formData.business_name ||
    !formData.phone) {
    alert('Please fill in all required fields.');
    return;
  }

  // בדיקת ייחודיות שם העסק
  const isDuplicate = business_name.some((business) => business.business_name === formData.business_name);
  if (isDuplicate) {
    alert('The business name already exists.');
    return;
  }

  // בדיקת תקינות כתובת האימייל
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // בדיקת תאריך התחלה שלא נמצא בעתיד
  const currentDate = new Date().toISOString().split('T')[0];
  if (formData.startDate > currentDate) {
    alert('Start date cannot be in the future.');
    return;
  }

  // יצירת נתוני הטופס לשליחה כולל הלוגו
  const formDataToSend = new FormData();
  formDataToSend.append('formData', JSON.stringify(formData));
  if (logo) {
    formDataToSend.append('logo', logo); // Add logo file to formData
  }

  // Update local state with form data
  setStep1(formData);

  // Navigate to the next step
  navigate('../Step2', { relative: true });

  // Optional: Send formDataToSend to server if needed
  // Note: Since you prefer not to upload the logo separately, handle formDataToSend as needed locally.
};


  return (
    <div id="registration-container">
      <h2 id="registration-title">Welcome</h2>
      <p id="registration-description">Just a moment, and you are with us! Some details about you:</p>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="idProfessional">ID Number:</label>
            <input
              type="text"
              id="idProfessional"
              name="idProfessional"
              value={formData.idProfessional}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Domain Name :</label>
            <select
              name="domainCode"
              value={formData.domainCode}
              onChange={handleChange}
            >
              <option value="">Select a domain</option>
              {domains.map((domain) => (
                <option key={domain.idDomain} value={domain.idDomain}>{domain.domainName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>City: </label>
            <select name="cityCode"
              value={formData.cityCode}
              onChange={handleChange}>
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.CityCode} value={city.CityCode}>{city.CityName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Business Name:</label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleBusinessNameChange}
            />
            {errorMessage && <p className="error">{errorMessage}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="logo">Logo:</label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn">Next</button>
          <button type="button" className="btn back-btn" onClick={() => navigate('/')}>
            Back to Main Page
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessRegistration1;


















// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../css/BusinessRegistration.css';
// import { FormContext } from './FormProvider';

// const BusinessRegistration1 = () => {
//   const { step1,setStep1 } = useContext(FormContext)

//   const [formData, setFormData] = useState(step1);


//   const [cities, setCities] = useState([]);
//   const [domains, setDomains] = useState([]);
//   const [business_name, setBusinessName] = useState([]);
//   const [errorMessage, setErrorMessage] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     setFormData(step1);

//     fetchBuisnessName();
//     fetchCities();
//     fetchDomains();
//   }, []);


//   const fetchCities = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/cities');
//       setCities(response.data);
//     } catch (error) {
//       console.error('Error fetching cities:', error);
//     }
//   };

//   const fetchDomains = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/domains');
//       setDomains(response.data);
//     } catch (error) {
//       console.error('Error fetching domains:', error);
//     }
//   };

//   const fetchBuisnessName = () => {
//     axios.get('http://localhost:8080/professionals/business_name')
//       .then(response => {
//         setBusinessName(response.data);
//         console.log(response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching fields:', error);
//       });
//   };

//   const handleBusinessNameChange = (e) => {
//     const name = e.target.value;
//     const isDuplicate = business_name.some((business) => business.business_name === name);

//     if (isDuplicate) {
//       setErrorMessage('The business name already exists.');
//     } else {
//       setFormData({
//         ...formData,
//         [e.target.name]: e.target.value,
//       });
//       setErrorMessage('');
//     }
//   };

//   // const handleCityChange = (event) => {
//   //   const selectedCity = cities.find(city => city.CityCode === parseInt(event.target.value));
//   //   setFormData((prevUser) => ({
//   //     ...prevUser,
//   //     city: {
//   //       cityCode: selectedCity.CityCode,
//   //       cityName: selectedCity.CityName
//   //     }
//   //   }));
//   // };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     let updatedFormData = { ...formData, [name]: value };

//     if (name === 'cityCode') {
//       const selectedCity = cities.find(city => city.CityCode === parseInt(value));
//       if (selectedCity) {
//         updatedFormData.cityName = selectedCity.CityName;
//       }
//     }

//     if (name === 'domainCode') {
//       const selectedDomain = domains.find(domain => domain.idDomain === parseInt(value));
//       if (selectedDomain) {
//         updatedFormData.domainName = selectedDomain.domainName;
//       }
//     }

//     setFormData(updatedFormData);
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Basic form validation
//     if (!formData.idProfessional ||
//       !formData.firstName ||
//       !formData.lastName ||
//       !formData.domainCode ||
//       !formData.startDate ||
//       !formData.address ||
//       !formData.cityCode ||
//       !formData.email ||
//       // !formData.passwordProff ||
//       !formData.business_name ||
//       !formData.phone) {
//       alert('Please fill in all required fields.');
//       return;
//     }


//     // Check for duplicate business name
//     const isDuplicate = business_name.some((business) => business.business_name === formData.business_name);
//     if (isDuplicate) {
//       alert('The business name already exists.');
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email)) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     const currentDate = new Date().toISOString().split('T')[0];
//     if (formData.startDate > currentDate) {
//       alert('Start date cannot be in the future.');
//       return;
//     }

//     setStep1(formData);
//     navigate('../Step2', { relative: true });
//   };

//   return (
//     <div id="registration-container">
//       <h2 id="registration-title">Welcome</h2>
//       <p id="registration-description">Just a moment, and you are with us! Some details about you:</p>
//       <form onSubmit={handleSubmit}>
//         <div className="form-grid">
//           <div className="form-group">
//             <label htmlFor="idProfessional">ID Number:</label>
//             <input
//               type="text"
//               id="idProfessional"
//               name="idProfessional"
//               value={formData.idProfessional}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="firstName">First Name:</label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="lastName">Last Name:</label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label>Domain Name :</label>
//             <select
//               name="domainCode"
//               value={formData.domainCode}
//               onChange={handleChange}
//             >
//               <option value="">Select a domain</option>
//               {domains.map((domain) => (
//                 <option key={domain.idDomain} value={domain.idDomain}>{domain.domainName}</option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label htmlFor="startDate">Start Date:</label>
//             <input
//               type="date"
//               id="startDate"
//               name="startDate"
//               value={formData.startDate}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="address">Address:</label>
//             <input
//               type="text"
//               id="address"
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label>City: </label>
//             <select name="cityCode"
//               value={formData.cityCode}
//               onChange={handleChange}>
//               <option value="">Select City</option>
//               {cities.map((city) => (
//                 <option key={city.CityCode} value={city.CityCode}>{city.CityName}</option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label htmlFor="email">Email:</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <label>Business Name:</label>
//             <input
//               type="text"
//               name="business_name"
//               value={formData.business_name}
//               onChange={handleBusinessNameChange}
//             />
//             {errorMessage && <p className="error">{errorMessage}</p>}
//           </div>
//           <div className="form-group">
//             <label htmlFor="phone">Phone:</label>
//             <input
//               type="text"
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//             />
//           </div>
//         </div>
//         <div className="form-buttons">
//           <button type="submit" className="submit-btn">Next</button>
//           <button type="button" className="btn back-btn" onClick={() => navigate('/')}>
//             Back to Main Page
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BusinessRegistration1;
