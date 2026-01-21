import { useState, useEffect } from 'react';
import { Mail, Phone, Briefcase, User, Save, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { employeeApi, authApi } from '../lib/api';

export default function UserDashboard() {
  const { employee } = useAuth();
  const [fullName, setFullName] = useState(employee?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(employee?.mobileNumber || '');
  const [profilePicture, setProfilePicture] = useState(employee?.profilePicture || '');
  const [position, setPosition] = useState(employee?.position || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName || '');
      setMobileNumber(employee.mobileNumber || '');
      setProfilePicture(employee.profilePicture || '');
      setPosition(employee.position || '');
      setAddress(employee.address || '');
    }
  }, [employee]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await employeeApi.update(employee!.id, {
        fullName,
        mobileNumber,
        profilePicture,
        position,
        address,
      });
      setMessage('Profile updated successfully! Refreshing...');

      // Reload to fetch fresh data from server
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters.');
      setPasswordLoading(false);
      return;
    }

    try {
      await authApi.changePassword(currentPassword, newPassword);
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      if (error instanceof Error) {
        setPasswordMessage(error.message);
      } else {
        setPasswordMessage('Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
              <img
                src={profilePicture || ''}
                alt={fullName}
                className={`w-full h-full object-cover ${!profilePicture ? 'hidden' : ''}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = document.getElementById('user-profile-placeholder');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = 'block';
                  const placeholder = document.getElementById('user-profile-placeholder');
                  if (placeholder) placeholder.style.display = 'none';
                }}
              />
              <div
                id="user-profile-placeholder"
                className={`w-full h-full flex items-center justify-center bg-slate-100 ${profilePicture ? 'hidden' : ''}`}
              >
                <User className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {employee.fullName}
              </h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  employee.role === 'admin'
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-700 text-white'
                }`}
              >
                {employee.role}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-slate-100 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Email</p>
                <p className="text-slate-900">{employee.email}</p>
              </div>
            </div>

            {employee.mobileNumber && (
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Mobile</p>
                  <p className="text-slate-900">{employee.mobileNumber}</p>
                </div>
              </div>
            )}

            {employee.position && (
              <div className="flex items-start gap-4">
                <div className="bg-slate-100 p-3 rounded-lg">
                  <Briefcase className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Position</p>
                  <p className="text-slate-900">{employee.position}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              Update Your Profile
            </h3>

            <form onSubmit={handleUpdate} className="space-y-6">
              {message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    message.includes('success')
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {message}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-slate-700 mb-2">
                  Position
                </label>
                <input
                  id="position"
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div>
                <label htmlFor="picture" className="block text-sm font-medium text-slate-700 mb-2">
                  Profile Picture URL
                </label>
                <input
                  id="picture"
                  type="url"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="https://example.com/profile.jpg"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Enter the URL of your profile picture
                </p>
                {profilePicture && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-600 mb-2">Preview:</p>
                    <img
                      src={profilePicture}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              Change Password
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-6">
              {passwordMessage && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    passwordMessage.includes('successfully')
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {passwordMessage}
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
