import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertBox from "./AlertBox";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("error");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const getApiBase = () => {
        if (import.meta.env.DEV) {
          return `http://${window.location.hostname}:3000`;
        }
        return "";
      };
      const apiUrl = `${getApiBase()}/api/login`;
      console.log("Posting login to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("sessionId", data.sessionId);
        setAlertType("success");
        setAlertMessage("Login successful! Redirecting...");
        // Force a page reload to ensure the session is properly set
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        setAlertType("error");
        setAlertMessage(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
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

      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🔐 Login Required
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your credentials to access the SEO Generator
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Username:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
