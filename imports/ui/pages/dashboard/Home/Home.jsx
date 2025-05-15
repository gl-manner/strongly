// /imports/ui/pages/dashboard/Home/Home.jsx
import React, { useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import feather from 'feather-icons';
import './Home.scss';

export const Home = () => {
  const { user, loading } = useTracker(() => {
    const subscription = Meteor.subscribe('userData');
    return {
      user: Meteor.user(),
      loading: !subscription.ready()
    };
  });

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Welcome to Your Dashboard</h4>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-xl-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Dashboard Overview</h6>
              <p>Your personalized dashboard content will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
