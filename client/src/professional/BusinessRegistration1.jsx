import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/BusinessRegistration.css';
import { FormContext } from './FormProvider';

// קומפוננטה להרשמת עסק
const BusinessRegistration1 = () => {
  const { step1, setStep1 } = useContext(FormContext);
  const [formData, setFormData] = useState(step1);
  const [cities, setCities] = useState([]);
  const [domains, setDomains] = useState([]);
  const [business_name, setBusinessName] = useState([]);
  const [logo, setLogo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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
  const fetchBuisnessName = async () => {
    try {
      const response = await axios.get('http://localhost:8080/professionals/business_name');
      setBusinessName(response.data);
    } catch (error) {
      console.error('Error fetching business names:', error);
    }
  };

  // פונקציה לבדוק אם תעודת הזהות קיימת
  const checkIfIdExists = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8080/professionals/id_check/${id}`);
      if (response.data.exists) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking ID existence:', error);
      return false;
    }
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
  // const handleLogoChange = (e) => {
  //   setLogo(e.target.files[0]);
  //   const { name, value } = e.target;
  //   let updatedFormData = { ...formData, [name]: value };
  //   setFormData(updatedFormData);
  // };

  // const handleLogoChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       setFormData({
  //         ...formData,
  //         logo: reader.result,
  //       });
  //     };
  //   }
  // };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData({
          ...formData,
          logo: reader.result,
        });
      };
    }
  };
  
  
  
  // טיפול בשליחת הטופס ובדיקת תקינות הנתונים
  const handleSubmit = async (e) => {
    e.preventDefault();

    // בדיקה אם תעודת הזהות קיימת
    const idExists = await checkIfIdExists(formData.idProfessional);
    if (idExists) {
      alert('This ID already exists. Please enter a different ID.');
      return; // עצירת התהליך
    }

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
      formDataToSend.append('logo', logo); // הוספת קובץ לוגו
    }

    setStep1(formData);
    navigate('../Step2', { relative: true });
  };


  const handleIdChange = async (e) => {
    const id = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: id
    });
    // בדיקה אם תעודת הזהות קיימת
    const idExists = await checkIfIdExists(id);
    console.log("idExiststt", idExists);
    if (idExists) {
      // לא מאפשר להמשיך אם תעודת הזהות קיימת
      return;
    }
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
              onChange={handleIdChange}
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
            <label htmlFor="city-select">City: </label>
            <select id="city-select" name="cityCode" value={formData.cityCode} onChange={handleChange}>
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.CityCode} value={city.CityCode}>
                  {city.CityName}
                </option>
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
              // value={formData.logo}
              onChange={handleLogoChange}
            />
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit" className="submit-btn">Next</button>
          <button type="button" onClick={() => navigate('/')}>
            Back to Main Page
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessRegistration1;

