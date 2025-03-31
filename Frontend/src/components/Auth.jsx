import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = ({ isLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const body = isLogin ? { email, password } : { email, password, role: "student" };
  
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      console.log("Login Response:", data);
  
      if (!response.ok) {
        throw new Error(data.message || data.error || "Authentication failed");
      }
  
      const userRole = data.user?.role || data.role;
      console.log("User Role:", userRole); 
  
      if (!userRole) {
        throw new Error("No role found in response");
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", userRole); 
  
      switch(userRole.toLowerCase()) {
        case "admin":
          navigate("/generate");
          break;
        case "superadmin":
          navigate("/superadmin/dashboard");
          break;
        default:
          navigate("/certificates");
      }
  
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default Auth;