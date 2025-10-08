import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    AssesseeName: {
      FirstName: '',
      MiddleName: '',
      SurNameOrOrgName: ''
    },
    PAN: '',
    Address: {
      ResidenceNo: '',
      ResidenceName: '',
      RoadOrStreet: '',
      LocalityOrArea: '',
      CityOrTownOrDistrict: '',
      StateCode: '',
      CountryCode: '91', // Default to India
      PinCode: '',
      ZipCode: '',
      Phone: {
        STDcode: 0,
        PhoneNo: '0'
      },
      CountryCodeMobile: 91,
      MobileNo: '',
      CountryCodeMobileNoSec: 91,
      MobileNoSec: '',
      EmailAddress: '',
      EmailAddressSec: ''
    },
    DOB: '',
    Status: 'I', // Default to Individual
    AadhaarCardNo: ''
  });
  const [errors, setErrors] = useState({});

  const stateOptions = [
    { value: '01', label: 'Andaman and Nicobar islands' },
    { value: '02', label: 'Andhra Pradesh' },
    { value: '03', label: 'Arunachal Pradesh' },
    { value: '04', label: 'Assam' },
    { value: '05', label: 'Bihar' },
    { value: '06', label: 'Chandigarh' },
    { value: '07', label: 'Dadra Nagar and Haveli' },
    { value: '08', label: 'Daman and Diu' },
    { value: '09', label: 'Delhi' },
    { value: '10', label: 'Goa' },
    { value: '11', label: 'Gujarat' },
    { value: '12', label: 'Haryana' },
    { value: '13', label: 'Himachal Pradesh' },
    { value: '14', label: 'Jammu and Kashmir' },
    { value: '15', label: 'Karnataka' },
    { value: '16', label: 'Kerala' },
    { value: '17', label: 'Lakshadweep' },
    { value: '18', label: 'Madhya Pradesh' },
    { value: '19', label: 'Maharashtra' },
    { value: '20', label: 'Manipur' },
    { value: '21', label: 'Meghalaya' },
    { value: '22', label: 'Mizoram' },
    { value: '23', label: 'Nagaland' },
    { value: '24', label: 'Odisha' },
    { value: '25', label: 'Puducherry' },
    { value: '26', label: 'Punjab' },
    { value: '27', label: 'Rajasthan' },
    { value: '28', label: 'Sikkim' },
    { value: '29', label: 'Tamil Nadu' },
    { value: '30', label: 'Tripura' },
    { value: '31', label: 'Uttar Pradesh' },
    { value: '32', label: 'West Bengal' },
    { value: '33', label: 'Chhattisgarh' },
    { value: '34', label: 'Uttarakhand' },
    { value: '35', label: 'Jharkhand' },
    { value: '36', label: 'Telangana' },
    { value: '37', label: 'Ladakh' },
    { value: '99', label: 'Foreign' }
  ];

  const statusOptions = [
    { value: 'I', label: 'Individual' },
    { value: 'H', label: 'HUF (Hindu Undivided Family)' }
  ];

  const validatePAN = (pan) => {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panPattern.test(pan);
  };

  const validateAadhaar = (aadhaar) => {
    const aadhaarPattern = /^[0-9]{12}$/;
    return aadhaarPattern.test(aadhaar);
  };

  const validateEmail = (email) => {
    const emailPattern = /^([\\.a-zA-Z0-9_\\-])+@([a-zA-Z0-9_\\-])+(([a-zA-Z0-9_\\-])*\\.([a-zA-Z0-9_\\-])+)+$/;
    return emailPattern.test(email);
  };

  const validateMobile = (mobile) => {
    const mobilePattern = /^[1-9]{1}[0-9]{9}$/;
    return mobilePattern.test(mobile);
  };

  const validatePinCode = (pinCode) => {
    const pinPattern = /^[1-9]{1}[0-9]{5}$/;
    return pinPattern.test(pinCode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      if (grandchild) {
        // Three levels deep (e.g., Address.Phone.STDcode)
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value
            }
          }
        }));
      } else {
        // Two levels deep (e.g., AssesseeName.FirstName)
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      // Single level (e.g., PAN)
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate AssesseeName
    if (!formData.AssesseeName.SurNameOrOrgName.trim()) {
      newErrors['AssesseeName.SurNameOrOrgName'] = 'Surname/Organization Name is required';
    }

    // Validate PAN
    if (!formData.PAN.trim()) {
      newErrors.PAN = 'PAN is required';
    } else if (!validatePAN(formData.PAN)) {
      newErrors.PAN = 'Invalid PAN format. Use format: ABCDE1234F';
    }

    // Validate Address fields
    if (!formData.Address.ResidenceNo.trim()) {
      newErrors['Address.ResidenceNo'] = 'Residence Number is required';
    }
    if (!formData.Address.LocalityOrArea.trim()) {
      newErrors['Address.LocalityOrArea'] = 'Locality/Area is required';
    }
    if (!formData.Address.CityOrTownOrDistrict.trim()) {
      newErrors['Address.CityOrTownOrDistrict'] = 'City/Town/District is required';
    }
    if (!formData.Address.StateCode) {
      newErrors['Address.StateCode'] = 'State is required';
    }
    if (!formData.Address.CountryCode) {
      newErrors['Address.CountryCode'] = 'Country is required';
    }
    if (!formData.Address.PinCode.trim()) {
      newErrors['Address.PinCode'] = 'Pin Code is required';
    } else if (!validatePinCode(formData.Address.PinCode)) {
      newErrors['Address.PinCode'] = 'Invalid Pin Code format';
    }

    // Validate Mobile
    if (!formData.Address.MobileNo.toString().trim()) {
      newErrors['Address.MobileNo'] = 'Mobile Number is required';
    } else if (!validateMobile(formData.Address.MobileNo.toString())) {
      newErrors['Address.MobileNo'] = 'Invalid Mobile Number format';
    }

    // Validate Email
    if (!formData.Address.EmailAddress.trim()) {
      newErrors['Address.EmailAddress'] = 'Email Address is required';
    } else if (!validateEmail(formData.Address.EmailAddress)) {
      newErrors['Address.EmailAddress'] = 'Invalid Email format';
    }

    // Validate DOB
    if (!formData.DOB) {
      newErrors.DOB = 'Date of Birth is required';
    }

    // Validate Status
    if (!formData.Status) {
      newErrors.Status = 'Status is required';
    }

    // Validate Aadhaar
    if (!formData.AadhaarCardNo.trim()) {
      newErrors.AadhaarCardNo = 'Aadhaar Card Number is required';
    } else if (!validateAadhaar(formData.AadhaarCardNo)) {
      newErrors.AadhaarCardNo = 'Invalid Aadhaar format. Must be 12 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:3500/update_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          ...formData
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Profile updated successfully
        alert('Profile updated successfully!');
        navigate('/dashboard');
      } else {
        alert(result.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />
      <main style={{ padding: '120px 2rem 80px', minHeight: '70vh' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ color: '#123458', marginBottom: '1rem', textAlign: 'center' }}>
            Complete Your Profile
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#030303', 
            opacity: 0.8, 
            textAlign: 'center',
            marginBottom: '3rem' 
          }}>
            Please provide the following details to complete your tax profile
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Assessee Name Section */}
            <div style={{ background: '#F1EFEC', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ color: '#123458', marginBottom: '1rem', marginTop: 0 }}>Assessee Name</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="AssesseeName.FirstName"
                    value={formData.AssesseeName.FirstName}
                    onChange={handleInputChange}
                    maxLength="25"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="AssesseeName.MiddleName"
                    value={formData.AssesseeName.MiddleName}
                    onChange={handleInputChange}
                    maxLength="25"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="Enter middle name"
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                  Surname/Organization Name *
                </label>
                <input
                  type="text"
                  name="AssesseeName.SurNameOrOrgName"
                  value={formData.AssesseeName.SurNameOrOrgName}
                  onChange={handleInputChange}
                  maxLength="75"
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: `2px solid ${errors['AssesseeName.SurNameOrOrgName'] ? '#FF4444' : '#D4C9BE'}`,
                    borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                  }}
                  placeholder="Enter surname or organization name"
                />
                {errors['AssesseeName.SurNameOrOrgName'] && (
                  <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors['AssesseeName.SurNameOrOrgName']}
                  </span>
                )}
              </div>
            </div>

            {/* PAN */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                PAN *
              </label>
              <input
                type="text"
                name="PAN"
                value={formData.PAN}
                onChange={handleInputChange}
                maxLength="10"
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `2px solid ${errors.PAN ? '#FF4444' : '#D4C9BE'}`,
                  borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none',
                  textTransform: 'uppercase'
                }}
                placeholder="ABCDE1234F"
              />
              {errors.PAN && (
                <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.PAN}
                </span>
              )}
            </div>

            {/* Address Section */}
            <div style={{ background: '#F1EFEC', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ color: '#123458', marginBottom: '1rem', marginTop: 0 }}>Address</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Residence Number *
                  </label>
                  <input
                    type="text"
                    name="Address.ResidenceNo"
                    value={formData.Address.ResidenceNo}
                    onChange={handleInputChange}
                    maxLength="50"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `2px solid ${errors['Address.ResidenceNo'] ? '#FF4444' : '#D4C9BE'}`,
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="House/Flat number"
                  />
                  {errors['Address.ResidenceNo'] && (
                    <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors['Address.ResidenceNo']}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Residence Name
                  </label>
                  <input
                    type="text"
                    name="Address.ResidenceName"
                    value={formData.Address.ResidenceName}
                    onChange={handleInputChange}
                    maxLength="50"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="Building/Society name"
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                  Road/Street
                </label>
                <input
                  type="text"
                  name="Address.RoadOrStreet"
                  value={formData.Address.RoadOrStreet}
                  onChange={handleInputChange}
                  maxLength="50"
                  style={{
                    width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                    borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                  }}
                  placeholder="Road or street name"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Locality/Area *
                  </label>
                  <input
                    type="text"
                    name="Address.LocalityOrArea"
                    value={formData.Address.LocalityOrArea}
                    onChange={handleInputChange}
                    maxLength="50"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `2px solid ${errors['Address.LocalityOrArea'] ? '#FF4444' : '#D4C9BE'}`,
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="Locality or area"
                  />
                  {errors['Address.LocalityOrArea'] && (
                    <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors['Address.LocalityOrArea']}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    City/Town/District *
                  </label>
                  <input
                    type="text"
                    name="Address.CityOrTownOrDistrict"
                    value={formData.Address.CityOrTownOrDistrict}
                    onChange={handleInputChange}
                    maxLength="50"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `2px solid ${errors['Address.CityOrTownOrDistrict'] ? '#FF4444' : '#D4C9BE'}`,
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="City, town, or district"
                  />
                  {errors['Address.CityOrTownOrDistrict'] && (
                    <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors['Address.CityOrTownOrDistrict']}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    State *
                  </label>
                  <select
                    name="Address.StateCode"
                    value={formData.Address.StateCode}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `2px solid ${errors['Address.StateCode'] ? '#FF4444' : '#D4C9BE'}`,
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                  >
                    <option value="">Select State</option>
                    {stateOptions.map(state => (
                      <option key={state.value} value={state.value}>{state.label}</option>
                    ))}
                  </select>
                  {errors['Address.StateCode'] && (
                    <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors['Address.StateCode']}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Country Code *
                  </label>
                  <input
                    type="text"
                    name="Address.CountryCode"
                    value={formData.Address.CountryCode}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `2px solid ${errors['Address.CountryCode'] ? '#FF4444' : '#D4C9BE'}`,
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="91 (India)"
                  />
                  {errors['Address.CountryCode'] && (
                    <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors['Address.CountryCode']}
                    </span>
                  )}
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Pin Code *
                  </label>
                  <input
                    type="text"
                    name="Address.PinCode"
                    value={formData.Address.PinCode}
                    onChange={handleInputChange}
                    maxLength="6"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `2px solid ${errors['Address.PinCode'] ? '#FF4444' : '#D4C9BE'}`,
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="123456"
                  />
                  {errors['Address.PinCode'] && (
                    <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors['Address.PinCode']}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                  Zip Code (For Foreign Address)
                </label>
                <input
                  type="text"
                  name="Address.ZipCode"
                  value={formData.Address.ZipCode}
                  onChange={handleInputChange}
                  maxLength="8"
                  style={{
                    width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                    borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                  }}
                  placeholder="Zip code for foreign addresses"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ background: '#F1EFEC', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ color: '#123458', marginBottom: '1rem', marginTop: 0 }}>Contact Information</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    STD Code
                  </label>
                  <input
                    type="number"
                    name="Address.Phone.STDcode"
                    value={formData.Address.Phone.STDcode}
                    onChange={handleInputChange}
                    min="0"
                    max="99999"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="STD Code"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="Address.Phone.PhoneNo"
                    value={formData.Address.Phone.PhoneNo}
                    onChange={handleInputChange}
                    maxLength="10"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Country Code *
                  </label>
                  <input
                    type="number"
                    name="Address.CountryCodeMobile"
                    value={formData.Address.CountryCodeMobile}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="91"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    name="Address.MobileNo"
                    value={formData.Address.MobileNo}
                    onChange={handleInputChange}
                    maxLength="10"
                    style={{
                      width: '100%', padding: '12px 16px',
                      border: `2px solid ${errors['Address.MobileNo'] ? '#FF4444' : '#D4C9BE'}`,
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="Mobile number"
                  />
                  {errors['Address.MobileNo'] && (
                    <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors['Address.MobileNo']}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Country Code (Secondary)
                  </label>
                  <input
                    type="number"
                    name="Address.CountryCodeMobileNoSec"
                    value={formData.Address.CountryCodeMobileNoSec}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="91"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                    Secondary Mobile Number
                  </label>
                  <input
                    type="text"
                    name="Address.MobileNoSec"
                    value={formData.Address.MobileNoSec}
                    onChange={handleInputChange}
                    maxLength="10"
                    style={{
                      width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                      borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                    }}
                    placeholder="Secondary mobile number"
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="Address.EmailAddress"
                  value={formData.Address.EmailAddress}
                  onChange={handleInputChange}
                  maxLength="125"
                  style={{
                    width: '100%', padding: '12px 16px',
                    border: `2px solid ${errors['Address.EmailAddress'] ? '#FF4444' : '#D4C9BE'}`,
                    borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                  }}
                  placeholder="Primary email address"
                />
                {errors['Address.EmailAddress'] && (
                  <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors['Address.EmailAddress']}
                  </span>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                  Secondary Email Address
                </label>
                <input
                  type="email"
                  name="Address.EmailAddressSec"
                  value={formData.Address.EmailAddressSec}
                  onChange={handleInputChange}
                  maxLength="125"
                  style={{
                    width: '100%', padding: '12px 16px', border: '2px solid #D4C9BE',
                    borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                  }}
                  placeholder="Secondary email address"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                Date of Birth *
              </label>
              <input
                type="date"
                name="DOB"
                value={formData.DOB}
                onChange={handleInputChange}
                max="2025-03-31"
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `2px solid ${errors.DOB ? '#FF4444' : '#D4C9BE'}`,
                  borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                }}
              />
              {errors.DOB && (
                <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.DOB}
                </span>
              )}
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                Status *
              </label>
              <select
                name="Status"
                value={formData.Status}
                onChange={handleInputChange}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `2px solid ${errors.Status ? '#FF4444' : '#D4C9BE'}`,
                  borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                }}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              {errors.Status && (
                <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.Status}
                </span>
              )}
            </div>

            {/* Aadhaar Card Number */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#123458', fontWeight: '500' }}>
                Aadhaar Card Number *
              </label>
              <input
                type="text"
                name="AadhaarCardNo"
                value={formData.AadhaarCardNo}
                onChange={handleInputChange}
                maxLength="12"
                style={{
                  width: '100%', padding: '12px 16px',
                  border: `2px solid ${errors.AadhaarCardNo ? '#FF4444' : '#D4C9BE'}`,
                  borderRadius: '8px', fontSize: '1rem', background: '#FFFFFF', outline: 'none'
                }}
                placeholder="123456789012"
              />
              {errors.AadhaarCardNo && (
                <span style={{ color: '#FF4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  {errors.AadhaarCardNo}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '16px',
                background: isLoading ? '#D4C9BE' : '#123458', color: '#FFFFFF',
                border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Updating Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;