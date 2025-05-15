// /imports/ui/pages/users/UserProfile/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import feather from 'feather-icons';
import './UserProfile.scss';

/**
 * UserProfile component using NobleUI styling
 * This component allows users to update their profile information
 */
export const UserProfile = () => {
  // Get current user
  const { currentUser, userLoading } = useTracker(() => {
    const userSubscription = Meteor.subscribe('userData');
    const user = Meteor.user();

    return {
      currentUser: user,
      userLoading: !userSubscription.ready()
    };
  }, []);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form with user data when loaded
  useEffect(() => {
    if (currentUser && currentUser.profile) {
      setName(currentUser.profile.name || '');
      setEmail(currentUser.emails?.[0]?.address || '');
      setPhone(currentUser.profile.phone || '');
      setBio(currentUser.profile.bio || '');
      setLocation(currentUser.profile.location || '');
      setWebsite(currentUser.profile.website || '');
    }
  }, [currentUser]);

  // Re-initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Save profile changes
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSaveSuccess(false);
    setLoading(true);

    const profile = {
      name,
      phone,
      bio,
      location,
      website
    };

    Meteor.call('users.updateProfile', profile, (err) => {
      setLoading(false);

      if (err) {
        setError(err.reason || 'Could not update profile. Please try again.');
      } else {
        setSaveSuccess(true);

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 5000);
      }
    });
  };

  // If user data is still loading, show a loading indicator
  if (userLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Calculate user initials for avatar if no profile image
  const getUserInitials = () => {
    if (!name) return 'U';

    const parts = name.split(' ');

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="profile-wrapper">
      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Profile Information</h6>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {saveSuccess && (
                <div className="alert alert-success" role="alert">
                  Profile updated successfully!
                </div>
              )}

              <form className="forms-sample" onSubmit={handleSubmit}>
                <div className="text-center mb-4">
                  <div className="profile-image-wrapper">
                    {currentUser?.profile?.avatar ? (
                      <img src={currentUser.profile.avatar} alt="profile" className="profile-image" />
                    ) : (
                      <div className="profile-image profile-initials">
                        {getUserInitials()}
                      </div>
                    )}
                    <div className="profile-image-edit">
                      <label htmlFor="profileImage" className="mb-0">
                        <i data-feather="edit-2"></i>
                      </label>
                      <input type="file" id="profileImage" className="visually-hidden" />
                    </div>
                  </div>
                  <h5 className="mt-3">{name}</h5>
                  <p className="text-muted">{email}</p>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="fullName" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="userEmail" className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="userEmail"
                      placeholder="Email"
                      value={email}
                      disabled
                    />
                    <small className="form-text text-muted">
                      Email address cannot be changed. Contact admin for assistance.
                    </small>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phoneNumber"
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="website" className="form-label">Website</label>
                  <div className="input-group">
                    <span className="input-group-text">https://</span>
                    <input
                      type="text"
                      className="form-control"
                      id="website"
                      placeholder="yourdomain.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    id="bio"
                    rows="5"
                    placeholder="Write something about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : 'Save Changes'}
                  </button>
                  <button type="reset" className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Change Password</h6>

              <form className="forms-sample">
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input type="password" className="form-control" id="currentPassword" placeholder="Enter current password" />
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input type="password" className="form-control" id="newPassword" placeholder="Enter new password" />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="confirmPassword" placeholder="Confirm new password" />
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary me-2">Change Password</button>
                  <button type="reset" className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this line to fix the import issue
export default UserProfile;
