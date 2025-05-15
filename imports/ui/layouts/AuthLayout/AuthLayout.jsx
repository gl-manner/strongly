// /imports/ui/layouts/AuthLayout/AuthLayout.jsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import feather from 'feather-icons';
import './AuthLayout.scss';

/**
 * AuthLayout component for login, register, and other authentication pages
 * This layout provides a clean, minimal interface for authentication
 */
export const AuthLayout = () => {
  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="row g-0">
            <div className="col-md-4">
              <div className="auth-side-wrapper fractal-background">
                {/* Animated circles for the fractal background */}
                <div className="circle circle1"></div>
                <div className="circle circle2"></div>
                <div className="circle circle3"></div>
                <div className="circle circle4"></div>
                <div className="circle circle5"></div>

              </div>
            </div>
            <div className="col-md-8">
              <div className="auth-form-wrapper">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
