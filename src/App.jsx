import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { SEOForm } from "./components/SEOForm";
import { SEOResult } from "./components/SEOResult";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./components/Login";
import { ChangePassword } from "./components/ChangePassword";
import { SEOContentList } from "./components/SEOContentList";
import "./App.css";

function App() {
  const [result, setResult] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("App component mounted");
    console.log("Session ID:", localStorage.getItem("sessionId"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sessionId");
    window.location.reload();
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">🎯 SEO Content Generator</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-sm"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => navigate("/saved-content")}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded text-sm"
                  >
                    View Saved Content
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <SEOForm />
              {showChangePassword && (
                <ChangePassword onClose={() => setShowChangePassword(false)} />
              )}
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-content"
        element={
          <ProtectedRoute>
            <div>
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">🎯 SEO Content Generator</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-sm"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => navigate("/saved-content")}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded text-sm"
                  >
                    View Saved Content
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <SEOContentList />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/result"
        element={
          <ProtectedRoute>
            <div>
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">🎯 SEO Content Generator</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-sm"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => navigate("/saved-content")}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded text-sm"
                  >
                    View Saved Content
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <SEOResult result={result} />
              {showChangePassword && (
                <ChangePassword onClose={() => setShowChangePassword(false)} />
              )}
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
