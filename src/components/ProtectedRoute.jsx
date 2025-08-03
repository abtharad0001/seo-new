import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Login } from "./Login";

export const ProtectedRoute = ({ children }) => {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId"));
  
  useEffect(() => {
    const checkSession = () => {
      const currentSessionId = localStorage.getItem("sessionId");
      setSessionId(currentSessionId);
    };

    // Check session on mount
    checkSession();

    // Listen for storage changes
    window.addEventListener('storage', checkSession);
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(checkSession, 1000);

    return () => {
      window.removeEventListener('storage', checkSession);
      clearInterval(interval);
    };
  }, []);
  
  console.log("ProtectedRoute - sessionId:", sessionId);
  
  if (!sessionId) {
    console.log("ProtectedRoute - No session, showing login");
    return <Login />;
  }
  
  console.log("ProtectedRoute - Has session, showing children");
  return children;
}; 