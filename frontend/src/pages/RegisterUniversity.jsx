import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../store/authStore";

/**
 * RegisterUniversity Page
 * 
 * Features:
 * - First-time university registration
 * - Collects: University Name, Admin Name, Email, Password
 * - Auto-login after registration
 * - Redirects to Dashboard
 */
export default function RegisterUniversity() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    universityName: "",
    adminName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Register university
      await api.post("/auth/register-university", {
        name: formData.universityName,
        adminName: formData.adminName,
        email: formData.email,
        password: formData.password,
      });

      // Auto-login after registration
      const res = await login(formData.email, formData.password);
      if (res.success) {
        setSuccess("University registered successfully!");
        navigate("/dashboard");
      } else {
        setError("Registration succeeded but login failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register University</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="universityName"
            value={formData.universityName}
            onChange={handleChange}
            placeholder="University Name"
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="text"
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            placeholder="Admin Name"
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            {loading ? "Registering..." : "Register University"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
      </div>
    </div>
  );
}
