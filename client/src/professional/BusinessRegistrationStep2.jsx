import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/BusinessRegistrationStep2.css';
import { FormContext } from './FormProvider';

const BusinessRegistrationStep2 = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { step2, setStep2, step1 } = useContext(FormContext);
  const [formData, setFormData] = useState(step2);
  const [formDataStep1, setFormDataStep1] = useState(step1);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceData, setServiceData] = useState({ serviceType: '', price: '', duration: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newServiceType, setNewServiceType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServiceTypes();
  }, [formDataStep1.domainCode]);

  const fetchServiceTypes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/type_service/type/${formDataStep1.domainCode}`);
      if (response.data) {
        setServiceTypes(response.data);
      } else {
        console.error('No data returned for service types');
      }
    } catch (error) {
      console.error('Error fetching service types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceChange = (e) => {
    setServiceData({
      ...serviceData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddService = () => {
    if (!serviceData.serviceType || !serviceData.price || !serviceData.duration) {
      alert("Please fill in all service fields.");
      return;
    }

    // בדיקה אם השירות כבר קיים בטבלה
    if (formData.services.some(service => service.serviceType === serviceData.serviceType)) {
      alert("This service is already in the list.");
      return;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      services: [...prevFormData.services, serviceData],
    }));

    setServiceData({ serviceType: '', price: '', duration: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep2(formData);
    navigate('../Step3');
  };

  const handleNewServiceSubmit = async () => {
    if (!newServiceType) return;
    // בדיקה אם השירות כבר קיים
    if (serviceTypes.some(service => service.typeName === newServiceType)) {
      alert("This service type already exists.");
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/type_service`, {
        typeName: newServiceType,
        domainCode: formDataStep1.domainCode,
      });

      if (response.data && response.data.typeCode) {
        setServiceTypes(prevServiceTypes => [
          ...prevServiceTypes,
          { typeCode: response.data.typeCode, typeName: newServiceType },
        ]);
        setNewServiceType('');
        setIsModalOpen(false);
      } else {
        alert("Error: Service type was not added successfully.");
      }
    } catch (error) {
      console.error('Error adding new service type:', error);
    }
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
            <div className="service-type-container">
              <select name="serviceType" value={serviceData.serviceType} onChange={handleServiceChange} className="service-select">
                <option value="">Select a service type</option>
                {isLoading ? (
                  <option value="">Loading...</option>
                ) : (
                  serviceTypes.map((type) => (
                    <option key={type.typeCode} value={type.typeCode}>
                      {type.typeName}
                    </option>
                  ))
                )}
              </select>
              <button type="button" className="add-service-button" onClick={() => setIsModalOpen(true)}>+</button>
            </div>
          </div>

          <div className="service-form-group">
            <label className="service-label">Price in shekels:</label>
            <input type="text" name="price" value={serviceData.price} onChange={handleServiceChange} className="service-input" />
          </div>

          <div className="service-form-group">
            <label className="service-label">Duration in minutes:</label>
            <input type="text" name="duration" value={serviceData.duration} onChange={handleServiceChange} className="service-input" />
          </div>

          <button type="button" onClick={handleAddService} className="service-button">Add Service</button>
        </div>
        <table className="service-table">
          <thead>
            <tr>
              <th>Service Type</th>
              <th>Price in shekels</th>
              <th>Duration in minute</th>
            </tr>
          </thead>

          <tbody>
            {formData.services.map((service, index) => (
              <tr key={index}>
                <td>{serviceTypes.find(type => type.typeCode.toString() === service.serviceType.toString())?.typeName || 'Unknown Service'}</td>
                <td>{service.price}</td>
                <td>{service.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-buttons">
          <button type="submit" className="service-button">Next</button>
          <button type="button" onClick={() => navigate('../step1')} className="service-button back-button">Back</button>
        </div>
      </form>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Service Type</h3>
            <input
              type="text"
              placeholder="Enter new service type"
              value={newServiceType}
              onChange={(e) => setNewServiceType(e.target.value)}
              className="modal-input"
            />
            <button onClick={handleNewServiceSubmit} className="modal-button">Save</button>
            <button onClick={() => setIsModalOpen(false)} className="modal-button close-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessRegistrationStep2;