"use client";

import React, { useState } from 'react';
import { useParentAuth } from '../../context/ParentAuthContext';
import { parentService } from '../../services/parentService';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Login({ onSuccess, onRegister, onLogin, onBack, onSwitchToRegister }) {
  const { login } = useParentAuth();
  const [email, setEmail] = useState('');
  const [studEnrollmentNo, setStudEnrollmentNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const auth = await parentService.loginParent({
        email: (email || '').trim(),
        studEnrollmentNo: (studEnrollmentNo || '').trim(),
        password: (password || '').trim(),
      });
      
      // Get the parentId from login response
      let parentId = auth?.parentId;
      let parentData = null;
      
      // Always fetch the complete parent details to get the name
      if (parentId) {
        try {
          // Fetch full parent details using the parentId from login response
          parentData = await parentService.getParentInfo(parentId);
        } catch (fetchError) {
          console.log('Failed to fetch parent details, trying fallback method');
          // Fallback: get all parents and find match
          const all = await parentService.getAllParents();
          const match = Array.isArray(all)
            ? all.find((p) => String(p.parentId || p.ParentId) === String(parentId))
            : null;
          parentData = match || { parentId: String(parentId), email };
        }
      } else {
        // If no parentId in response, find parent by email+enrollment
        const all = await parentService.getAllParents();
        const match = Array.isArray(all)
          ? all.find((p) =>
              String(p.email || p.Email || '').toLowerCase() === String(email).trim().toLowerCase() &&
              String(p.studEnrollmentNo || p.StudEnrollmentNo || '').toLowerCase() === String(studEnrollmentNo).trim().toLowerCase()
            )
          : null;
        if (!match) throw new Error('Invalid credentials');
        parentId = String(match.parentId || match.ParentId);
        parentData = match;
      }
      
      // Log the parent data for debugging
      console.log('Parent data fetched:', parentData);
      
      // Store complete parent information in auth context
      const authData = {
        parentId: String(parentId),
        email: parentData?.email || parentData?.Email || email,
        name: parentData?.name || parentData?.Name || null,
        studEnrollmentNo: parentData?.studEnrollmentNo || parentData?.StudEnrollmentNo || studEnrollmentNo
      };
      
      console.log('Storing auth data:', authData);
      login(authData);
      
      // Use the new onLogin prop if available, otherwise fall back to onSuccess
      if (onLogin) {
        onLogin({ ...authData, role: 'parent' });
      } else if (onSuccess) {
        onSuccess(authData);
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Parent Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your child's academic information
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            {/* Student Enrollment Number */}
            <div>
              <label htmlFor="studEnrollmentNo" className="block text-sm font-medium text-gray-700 mb-1">
                Student Enrollment Number
              </label>
              <input
                id="studEnrollmentNo"
                name="studEnrollmentNo"
                type="text"
                required
                value={studEnrollmentNo}
                onChange={(e) => setStudEnrollmentNo(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="e.g. EN202509"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
            
            {onRegister && (
              <button
                type="button"
                onClick={onRegister}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Account
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
