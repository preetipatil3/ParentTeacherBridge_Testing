"use client";

import React, { useState } from 'react';
import { parentService } from '../../services/parentService';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Register({ onBack, onSuccess, onRegister, onSwitchToLogin }) {
  const [form, setForm] = useState({
    Name: '',
    Email: '',
    Password: '',
    StudEnrollmentNo: '',
    Phone: '',
    Address: '',
    Gender: '',
    Occupation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name.trim()) return 'Name is required';
    if (!nameRegex.test(name)) return 'Name should only contain letters and spaces';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[0-9])/.test(password)) return 'Password must contain at least 1 number';
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return 'Password must contain at least 1 special character';
    return '';
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone.trim()) return 'Phone number is required';
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Phone number must be exactly 10 digits';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Filter input for specific fields
    let filteredValue = value;
    if (name === 'Phone') {
      // Only allow digits for phone number
      filteredValue = value.replace(/\D/g, '');
    } else if (name === 'Name') {
      // Only allow letters and spaces for name
      filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    
    // Real-time validation
    let error = '';
    switch (name) {
      case 'Name':
        error = validateName(filteredValue);
        break;
      case 'Email':
        error = validateEmail(filteredValue);
        break;
      case 'Password':
        error = validatePassword(filteredValue);
        break;
      case 'Phone':
        error = validatePhone(filteredValue);
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({ ...prev, [name]: error }));
    setForm((prev) => ({ ...prev, [name]: filteredValue }));
  };

  const validateAllFields = () => {
    const errors = {
      Name: validateName(form.Name),
      Email: validateEmail(form.Email),
      Password: validatePassword(form.Password),
      Phone: validatePhone(form.Phone),
    };

    // Check for required fields
    if (!form.StudEnrollmentNo.trim()) {
      errors.StudEnrollmentNo = 'Student Enrollment Number is required';
    }

    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.values(errors).every(error => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields before submission
    if (!validateAllFields()) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        Name: form.Name.trim(),
        Email: form.Email.trim(),
        Password: form.Password,
        StudEnrollmentNo: form.StudEnrollmentNo.trim(),
        Phone: form.Phone.replace(/\s/g, ''), // Remove any spaces
        Address: form.Address.trim(),
        Gender: form.Gender,
        Occupation: form.Occupation.trim(),
      };
      const created = await parentService.createParent(payload);
      setSuccess(true);
      // After successful register, call onRegister if provided, otherwise fall back to onSuccess
      setTimeout(() => {
        if (onRegister) {
          onRegister({ ...created, role: 'parent' });
        } else if (onSuccess) {
          onSuccess(created);
        }
      }, 800);
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your parent account has been created successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to role selection
            </button>
          )}
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Parent Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an account to access your child's academic information
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="Name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="Name"
                name="Name"
                type="text"
                required
                value={form.Name}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.Name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your full name"
              />
              {validationErrors.Name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.Name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="Email"
                name="Email"
                type="email"
                required
                value={form.Email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.Email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email"
              />
              {validationErrors.Email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.Email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="Password"
                  name="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.Password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    validationErrors.Password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {validationErrors.Password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.Password}</p>
              )}
            </div>

            {/* Student Enrollment Number */}
            <div>
              <label htmlFor="StudEnrollmentNo" className="block text-sm font-medium text-gray-700 mb-1">
                Student Enrollment Number *
              </label>
              <input
                id="StudEnrollmentNo"
                name="StudEnrollmentNo"
                type="text"
                required
                value={form.StudEnrollmentNo}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.StudEnrollmentNo ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter student enrollment number"
              />
              {validationErrors.StudEnrollmentNo && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.StudEnrollmentNo}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="Phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="Phone"
                name="Phone"
                type="tel"
                required
                value={form.Phone}
                onChange={handleChange}
                maxLength="10"
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  validationErrors.Phone ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Enter 10-digit phone number"
              />
              {validationErrors.Phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.Phone}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="Gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="Gender"
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="Address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="Address"
              name="Address"
              rows={3}
              value={form.Address}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your address"
            />
          </div>

          {/* Occupation */}
          <div>
            <label htmlFor="Occupation" className="block text-sm font-medium text-gray-700 mb-1">
              Occupation
            </label>
            <input
              id="Occupation"
              name="Occupation"
              type="text"
              value={form.Occupation}
              onChange={handleChange}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your occupation"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Login
              </button>
            )}
          </div>
        </form>

        {/* Already have an account link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <button
                onClick={onSwitchToLogin}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition-colors duration-200"
              >
                Login here
              </button>
            ) : (
              <span className="font-medium text-indigo-600">
                Login here
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
