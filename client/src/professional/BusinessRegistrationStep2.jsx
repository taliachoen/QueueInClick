import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../userContex';
import { useNavigate } from 'react-router-dom';
import '../css/BusinessRegistrationStep2.css';
import axios from 'axios';
import { FormContext } from './FormProvider';

const BusinessRegistrationStep2 = () => {
  const navigate = useNavigate();
  const { step2, setStep2 } = useContext(FormContext);

  const [formData, setFormData] = useState(step2);

  const [serviceData, setServiceData] = useState({
    serviceType: '',
    price: '',
    duration: '',
  });

  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    fetchServiceTypes();
  }, [formData.domainCode]);

  const fetchServiceTypes = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/type_service/type/${formData.domainCode}`);
      setServiceTypes(response.data);
    } catch (error) {
      console.error('Error fetching service types:', error);
    }
  };
  const handleServiceChange = (e) => {
    // if ( name == 'serviceType') {
    //   const selectServiceType = services.find(service => service.typeCode === parseInt(value));
    //   if (selectServiceType) {
    //     formData.typeName = selectServiceType.typeCode;
    //   }
    // }
    setServiceData({
      ...serviceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddService = async () => {
    try {
      setFormData({
        ...formData,
        services: [...formData.services, serviceData],
      });

      setServiceData({ serviceType: '', price: '', duration: '' });
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep2(formData);
    navigate('../Step3', { relative: true });
  };

  return (
    <div id="registration-step2-container">
      <h2 id="registration-step2-title">Welcome</h2>
      <p id="registration-step2-description">Just a moment, and you are with us! Some more details about you:</p>
      <form onSubmit={handleSubmit}>
        <div className="service-section">
          <h3>Add Service</h3>
          <div className="service-form-group">
            <label className="service-label">Service Type:</label>
            <select
              name="serviceType"
              value={serviceData.serviceType}
              onChange={handleServiceChange}
              className="service-select"
            >
              <option value="">Select a service type</option>
              {serviceTypes.map((type) => (
                <option key={type.typeCode} value={type.typeCode}>{type.typeName}</option>
              ))}
            </select>
          </div>
          <div className="service-form-group">
            <label className="service-label">Price:</label>
            <input
              type="text"
              name="price"
              value={serviceData.price}
              onChange={handleServiceChange}
              className="service-input"
            />
          </div>
          <div className="service-form-group">
            <label className="service-label">Duration:</label>
            <input
              type="text"
              name="duration"
              value={serviceData.duration}
              onChange={handleServiceChange}
              className="service-input"
            />
          </div>
          <button type="button" onClick={handleAddService} className="service-button">Add Service</button>
          <ul className="service-list">
            {formData.services.map((service, index) => (
              <li key={index} className="service-list-item">
                {service.serviceType} - {service.price} - {service.duration}
              </li>
            ))}
          </ul>
        </div>
        <div className="form-buttons">
          <button type="submit" className="service-button">Next</button>
          <button type="button" onClick={() => navigate('../step1', { relative: true })} className="service-button back-button">Back</button>
        </div>
      </form>
    </div>
  );
};

export default BusinessRegistrationStep2;