import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Auth = ({ isLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Clear any existing tokens on component mount
  useEffect(() => {
    if (!isLogin) {
      // Clear credentials when in register mode
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
  }, [isLogin]);

  const clearCredentials = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate email domain for registration
      if (!isLogin && !email.endsWith("@ves.ac.in")) {
        throw new Error("Email must be in the ves.ac.in domain");
      }

      const endpoint = isLogin ? "/api/login" : "/api/register";
      const body = isLogin
        ? { email, password }
        : { email, password, role: "student" };

      console.log(
        `Attempting to ${isLogin ? "login" : "register"} with email: ${email}`
      );

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Authentication Response:", data);

      if (!response.ok) {
        clearCredentials();
        throw new Error(data.message || data.error || "Authentication failed");
      }

      // Check if token exists in the response
      if (!data.token) {
        clearCredentials();
        throw new Error("No authentication token received");
      }

      // Get user role - handle both login and register response formats
      const userRole = data.user?.role || data.role;
      console.log("User Role:", userRole);

      if (!userRole) {
        clearCredentials();
        throw new Error("User role not found in response");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", userRole);

      console.log(`Successfully authenticated as ${userRole}`);

      switch (userRole.toLowerCase()) {
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
      console.error("Authentication Error:", err);
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-auth-page">
      <div className="simple-auth-container">
        <h2 className="simple-auth-title">{isLogin ? "Login" : "Register"}</h2>

        {error && <div className="simple-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="simple-auth-form">
          <div className="simple-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isLogin ? "Your email" : "yourname@ves.ac.in"}
              required
            />
            {!isLogin && (
              <small className="domain-note">
                Note: Only ves.ac.in email domains are allowed
              </small>
            )}
          </div>

          <div className="simple-form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle-simple"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="simple-auth-button"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>

          <p className="simple-auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <a href={isLogin ? "/" : "/login"}>
              {isLogin ? "Register" : "Login"}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
