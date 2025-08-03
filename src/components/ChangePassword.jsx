import React, { useState } from "react";
import AlertBox from "./AlertBox";

export const ChangePassword = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setAlertType("error");
      setAlertMessage("New passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setAlertType("error");
      setAlertMessage("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const isDev = import.meta.env.DEV;
      const apiUrl = isDev ? "http://localhost:3000/api/change-password" : "/api/change-password";

      const sessionId = localStorage.getItem("sessionId");

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionId}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAlertType("success");
        setAlertMessage("Password changed successfully!");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setAlertType("error");
        setAlertMessage(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setAlertType("error");
      setAlertMessage("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {alertMessage && (
        <AlertBox
          type={alertType}
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🔐 Change Password
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your current password and choose a new one
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Current Password:
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                New Password:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Confirm New Password:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2 bg-gray-500 text-white font-semibold rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}; 