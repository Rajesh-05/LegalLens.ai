import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Personal Info, Step 2: Refund Details
  
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
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
      CountryCode: '91',
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
    Status: 'I',
    AadhaarCardNo: ''
  });

  // Refund Information State
  const [refundInfo, setRefundInfo] = useState({
    BankAccountDtls: {
      AddtnlBankDetails: [
        {
          IFSCCode: '',
          BankName: '',
          BankAccountNo: '',
          AccountType: 'SB',
          UseForRefund: 'true'
        }
      ]
    }
  });

  const [errors, setErrors] = useState({});

  const accountTypeOptions = [
    { value: 'SB', label: 'Savings Account' },
    { value: 'CA', label: 'Current Account' },
    { value: 'CC', label: 'Cash Credit Account' },
    { value: 'OD', label: 'Over Draft Account' },
    { value: 'NRO', label: 'Non Resident Account' },
    { value: 'OTH', label: 'Other' }
  ];

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

  // Validation functions
  const validatePAN = (pan) => {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panPattern.test(pan);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[\w\-.]+@[\w\-]+\.[\w\-.]+$/;
    return emailPattern.test(email);
  };

  const validateMobile = (mobile) => {
    const mobilePattern = /^[1-9][0-9]{9}$/;
    return mobilePattern.test(mobile);
  };

  const validatePinCode = (pinCode) => {
    const pinPattern = /^[1-9]{1}[0-9]{5}$/;
    return pinPattern.test(pinCode);
  };

  // Input change handlers
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      if (grandchild) {
        setPersonalInfo(prev => ({
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
        setPersonalInfo(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setPersonalInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRefundInfoChange = (e, index = 0) => {
    const { name, value } = e.target;
    
    setRefundInfo(prev => ({
      ...prev,
      BankAccountDtls: {
        ...prev.BankAccountDtls,
        AddtnlBankDetails: prev.BankAccountDtls.AddtnlBankDetails.map((bank, i) => 
          i === index ? { ...bank, [name]: value } : bank
        )
      }
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation functions
  const validatePersonalInfo = () => {
    const newErrors = {};

    if (!personalInfo.AssesseeName.SurNameOrOrgName.trim()) {
      newErrors['AssesseeName.SurNameOrOrgName'] = 'Surname/Organization name is required';
    }
    if (!personalInfo.PAN.trim()) {
      newErrors.PAN = 'PAN is required';
    } else if (!validatePAN(personalInfo.PAN)) {
      newErrors.PAN = 'Invalid PAN format (e.g., ABCDE1234F)';
    }
    if (!personalInfo.Address.ResidenceNo.trim()) {
      newErrors['Address.ResidenceNo'] = 'Residence number is required';
    }
    if (!personalInfo.Address.LocalityOrArea.trim()) {
      newErrors['Address.LocalityOrArea'] = 'Locality/Area is required';
    }
    if (!personalInfo.Address.CityOrTownOrDistrict.trim()) {
      newErrors['Address.CityOrTownOrDistrict'] = 'City/Town/District is required';
    }
    if (!personalInfo.Address.StateCode) {
      newErrors['Address.StateCode'] = 'State is required';
    }
    if (!personalInfo.Address.CountryCode) {
      newErrors['Address.CountryCode'] = 'Country code is required';
    }
    if (!personalInfo.Address.MobileNo.toString().trim()) {
      newErrors['Address.MobileNo'] = 'Mobile number is required';
    } else if (!validateMobile(personalInfo.Address.MobileNo.toString())) {
      newErrors['Address.MobileNo'] = 'Invalid mobile number';
    }
    if (!personalInfo.Address.EmailAddress.trim()) {
      newErrors['Address.EmailAddress'] = 'Email address is required';
    } else if (!validateEmail(personalInfo.Address.EmailAddress)) {
      newErrors['Address.EmailAddress'] = 'Invalid email format';
    }
    if (!personalInfo.DOB) {
      newErrors.DOB = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRefundInfo = () => {
    const newErrors = {};
    const bank = refundInfo.BankAccountDtls.AddtnlBankDetails[0];

    if (!bank.IFSCCode.trim()) {
      newErrors.IFSCCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}[0][A-Z0-9]{6}$/.test(bank.IFSCCode)) {
      newErrors.IFSCCode = 'Invalid IFSC code format';
    }
    if (!bank.BankName.trim()) {
      newErrors.BankName = 'Bank name is required';
    }
    if (!bank.BankAccountNo.trim()) {
      newErrors.BankAccountNo = 'Bank account number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step navigation handlers
  const handleContinueToRefund = (e) => {
    e.preventDefault();
    if (validatePersonalInfo()) {
      setCurrentStep(2);
      setErrors({}); // Clear any previous errors
    }
  };

  const handleBackToPersonal = () => {
    setCurrentStep(1);
    setErrors({}); // Clear any previous errors
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRefundInfo()) {
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
          PersonalInfo: personalInfo,
          Refund: refundInfo
        }),
      });

      const result = await response.json();

      if (response.ok) {
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

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid #D4C9BE',
    borderRadius: '8px',
    fontSize: '1rem',
    backgroundColor: '#F1EFEC',
    color: '#030303',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  const errorStyle = {
    color: '#e74c3c',
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  };

  const buttonStyle = {
    padding: '12px 30px',
    borderRadius: '25px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#123458',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#D4C9BE',
    color: '#030303'
  };

  // Render Personal Information Form
  const renderPersonalInfoForm = () => (
    <form onSubmit={handleContinueToRefund} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Step Indicator */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#F1EFEC',
        borderRadius: '10px'
      }}>
      </div>

      {/* Assessee Name */}
      <div>
        <h3 style={{ color: '#123458', marginBottom: '1rem' }}>Assessee Name</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              First Name
            </label>
            <input
              type="text"
              name="AssesseeName.FirstName"
              value={personalInfo.AssesseeName.FirstName}
              onChange={handlePersonalInfoChange}
              style={inputStyle}
              maxLength={25}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Middle Name
            </label>
            <input
              type="text"
              name="AssesseeName.MiddleName"
              value={personalInfo.AssesseeName.MiddleName}
              onChange={handlePersonalInfoChange}
              style={inputStyle}
              maxLength={25}
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
            Surname/Organization Name *
          </label>
          <input
            type="text"
            name="AssesseeName.SurNameOrOrgName"
            value={personalInfo.AssesseeName.SurNameOrOrgName}
            onChange={handlePersonalInfoChange}
            style={{...inputStyle, borderColor: errors['AssesseeName.SurNameOrOrgName'] ? '#e74c3c' : '#D4C9BE'}}
            maxLength={75}
            required
          />
          {errors['AssesseeName.SurNameOrOrgName'] && <div style={errorStyle}>{errors['AssesseeName.SurNameOrOrgName']}</div>}
        </div>
      </div>

      {/* PAN */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
          PAN *
        </label>
        <input
          type="text"
          name="PAN"
          value={personalInfo.PAN}
          onChange={handlePersonalInfoChange}
          style={{...inputStyle, borderColor: errors.PAN ? '#e74c3c' : '#D4C9BE'}}
          placeholder="ABCDE1234F"
          maxLength={10}
          required
        />
        {errors.PAN && <div style={errorStyle}>{errors.PAN}</div>}
      </div>

      {/* Address */}
      <div>
        <h3 style={{ color: '#123458', marginBottom: '1rem' }}>Address Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Residence No *
            </label>
            <input
              type="text"
              name="Address.ResidenceNo"
              value={personalInfo.Address.ResidenceNo}
              onChange={handlePersonalInfoChange}
              style={{...inputStyle, borderColor: errors['Address.ResidenceNo'] ? '#e74c3c' : '#D4C9BE'}}
              maxLength={50}
              required
            />
            {errors['Address.ResidenceNo'] && <div style={errorStyle}>{errors['Address.ResidenceNo']}</div>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Residence Name
            </label>
            <input
              type="text"
              name="Address.ResidenceName"
              value={personalInfo.Address.ResidenceName}
              onChange={handlePersonalInfoChange}
              style={inputStyle}
              maxLength={50}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
            Road/Street
          </label>
          <input
            type="text"
            name="Address.RoadOrStreet"
            value={personalInfo.Address.RoadOrStreet}
            onChange={handlePersonalInfoChange}
            style={inputStyle}
            maxLength={50}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Locality/Area *
            </label>
            <input
              type="text"
              name="Address.LocalityOrArea"
              value={personalInfo.Address.LocalityOrArea}
              onChange={handlePersonalInfoChange}
              style={{...inputStyle, borderColor: errors['Address.LocalityOrArea'] ? '#e74c3c' : '#D4C9BE'}}
              maxLength={50}
              required
            />
            {errors['Address.LocalityOrArea'] && <div style={errorStyle}>{errors['Address.LocalityOrArea']}</div>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              City/Town/District *
            </label>
            <input
              type="text"
              name="Address.CityOrTownOrDistrict"
              value={personalInfo.Address.CityOrTownOrDistrict}
              onChange={handlePersonalInfoChange}
              style={{...inputStyle, borderColor: errors['Address.CityOrTownOrDistrict'] ? '#e74c3c' : '#D4C9BE'}}
              maxLength={50}
              required
            />
            {errors['Address.CityOrTownOrDistrict'] && <div style={errorStyle}>{errors['Address.CityOrTownOrDistrict']}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              State *
            </label>
            <select
              name="Address.StateCode"
              value={personalInfo.Address.StateCode}
              onChange={handlePersonalInfoChange}
              style={{...inputStyle, borderColor: errors['Address.StateCode'] ? '#e74c3c' : '#D4C9BE'}}
              required
            >
              <option value="">Select State</option>
              {stateOptions.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {errors['Address.StateCode'] && <div style={errorStyle}>{errors['Address.StateCode']}</div>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Pin Code
            </label>
            <input
              type="text"
              name="Address.PinCode"
              value={personalInfo.Address.PinCode}
              onChange={handlePersonalInfoChange}
              style={inputStyle}
              maxLength={6}
              placeholder="110001"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Country Code *
            </label>
            <input
              type="number"
              name="Address.CountryCodeMobile"
              value={personalInfo.Address.CountryCodeMobile}
              onChange={handlePersonalInfoChange}
              style={{...inputStyle, borderColor: errors['Address.CountryCode'] ? '#e74c3c' : '#D4C9BE'}}
              required
            />
            {errors['Address.CountryCode'] && <div style={errorStyle}>{errors['Address.CountryCode']}</div>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Mobile Number *
            </label>
            <input
              type="tel"
              name="Address.MobileNo"
              value={personalInfo.Address.MobileNo}
              onChange={handlePersonalInfoChange}
              style={{...inputStyle, borderColor: errors['Address.MobileNo'] ? '#e74c3c' : '#D4C9BE'}}
              placeholder="9876543210"
              required
            />
            {errors['Address.MobileNo'] && <div style={errorStyle}>{errors['Address.MobileNo']}</div>}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
            Email Address *
          </label>
          <input
            type="email"
            name="Address.EmailAddress"
            value={personalInfo.Address.EmailAddress}
            onChange={handlePersonalInfoChange}
            style={{...inputStyle, borderColor: errors['Address.EmailAddress'] ? '#e74c3c' : '#D4C9BE'}}
            maxLength={125}
            required
          />
          {errors['Address.EmailAddress'] && <div style={errorStyle}>{errors['Address.EmailAddress']}</div>}
        </div>
      </div>

      {/* Other Details */}
      <div>
        <h3 style={{ color: '#123458', marginBottom: '1rem' }}>Other Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Date of Birth *
            </label>
            <input
              type="date"
              name="DOB"
              value={personalInfo.DOB}
              onChange={handlePersonalInfoChange}
              style={{...inputStyle, borderColor: errors.DOB ? '#e74c3c' : '#D4C9BE'}}
              max="2025-03-31"
              required
            />
            {errors.DOB && <div style={errorStyle}>{errors.DOB}</div>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Status *
            </label>
            <select
              name="Status"
              value={personalInfo.Status}
              onChange={handlePersonalInfoChange}
              style={inputStyle}
              required
            >
              <option value="I">Individual</option>
              <option value="H">HUF</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
            Aadhaar Card Number
          </label>
          <input
            type="text"
            name="AadhaarCardNo"
            value={personalInfo.AadhaarCardNo}
            onChange={handlePersonalInfoChange}
            style={inputStyle}
            maxLength={12}
            placeholder="123456789012"
          />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          type="submit"
          style={primaryButtonStyle}
          disabled={isLoading}
        >
          Continue to Bank Details
        </button>
      </div>
    </form>
  );

  // Render Refund Information Form
  const renderRefundInfoForm = () => {
    const bank = refundInfo.BankAccountDtls.AddtnlBankDetails[0];
    
    return (
      <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Step Indicator */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#F1EFEC',
          borderRadius: '10px'
        }}>
        </div>

        {/* Bank Details */}
        <div>
          <h3 style={{ color: '#123458', marginBottom: '1rem' }}>Bank Account Information</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              IFSC Code *
            </label>
            <input
              type="text"
              name="IFSCCode"
              value={bank.IFSCCode}
              onChange={(e) => handleRefundInfoChange(e, 0)}
              style={{...inputStyle, borderColor: errors.IFSCCode ? '#e74c3c' : '#D4C9BE'}}
              placeholder="SBIN0001234"
              maxLength={11}
              required
            />
            {errors.IFSCCode && <div style={errorStyle}>{errors.IFSCCode}</div>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Bank Name *
            </label>
            <input
              type="text"
              name="BankName"
              value={bank.BankName}
              onChange={(e) => handleRefundInfoChange(e, 0)}
              style={{...inputStyle, borderColor: errors.BankName ? '#e74c3c' : '#D4C9BE'}}
              maxLength={125}
              required
            />
            {errors.BankName && <div style={errorStyle}>{errors.BankName}</div>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Bank Account Number *
            </label>
            <input
              type="text"
              name="BankAccountNo"
              value={bank.BankAccountNo}
              onChange={(e) => handleRefundInfoChange(e, 0)}
              style={{...inputStyle, borderColor: errors.BankAccountNo ? '#e74c3c' : '#D4C9BE'}}
              maxLength={20}
              required
            />
            {errors.BankAccountNo && <div style={errorStyle}>{errors.BankAccountNo}</div>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#030303' }}>
              Account Type *
            </label>
            <select
              name="AccountType"
              value={bank.AccountType}
              onChange={(e) => handleRefundInfoChange(e, 0)}
              style={inputStyle}
              required
            >
              {accountTypeOptions.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={handleBackToPersonal}
            style={secondaryButtonStyle}
          >
            Back to Personal Info
          </button>
          <button
            type="submit"
            style={primaryButtonStyle}
            disabled={isLoading}
          >
            {isLoading ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </div>
      </form>
    );
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
            textAlign: 'center', 
            marginBottom: '2rem' 
          }}>
            Please provide your personal information and bank details for tax filing and refund processing.
          </p>

          {currentStep === 1 ? renderPersonalInfoForm() : renderRefundInfoForm()}
        </div>
      </main>
    </div>
  );
};

export default Profile;