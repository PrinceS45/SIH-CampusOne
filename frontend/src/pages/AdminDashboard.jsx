import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import DashboardWidgets from "../components/DashboardWidgets";
import AdmissionForm from "../components/AdmissionForm";
import FeeForm from "../components/FeeForm";
import HostelForm from "../components/HostelForm";
import { FaUserGraduate, FaMoneyBillWave, FaHome } from "react-icons/fa";
import useAuthStore from "../store/authStore";
import socket, { joinUniversityRoom } from "../services/auth";
import api from "../services/api";

/**
 * AdminDashboard Page
 * 
 * Features:
 * - Displays Navbar with university info
 * - Real-time summary widgets: Total Students, Fees Collected, Hostel Occupancy
 * - Integrates AdmissionForm, FeeForm, HostelForm
 * - Real-time updates via Socket.IO
 */
export default function AdminDashboard() {
  const { user } = useAuthStore();

  // Dashboard state
  const [studentsCount, setStudentsCount] = useState(0);
  const [feesCollected, setFeesCollected] = useState(0);
  const [hostelOccupancy, setHostelOccupancy] = useState(0);

  // Fetch initial dashboard data
  const fetchDashboardData = async () => {
    try {
      const res = await api.get(`/dashboard/${user.domainId}`);
      setStudentsCount(res.data.studentsCount);
      setFeesCollected(res.data.feesCollected);
      setHostelOccupancy(res.data.hostelOccupancy);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Connect to Socket.IO and join university room
    joinUniversityRoom();

    // Listen for live updates
    socket.on("student_created", () => setStudentsCount((prev) => prev + 1));
    socket.on("fee_paid", (amount) => setFeesCollected((prev) => prev + amount));
    socket.on("hostel_update", (occupancy) => setHostelOccupancy(occupancy));

    // Cleanup
    return () => socket.disconnect();
  }, [user.domainId]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Widgets */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardWidgets
          icon={<FaUserGraduate />}
          title="Total Students"
          value={studentsCount}
          color="text-blue-600"
        />
        <DashboardWidgets
          icon={<FaMoneyBillWave />}
          title="Fees Collected"
          value={`₹ ${feesCollected}`}
          color="text-green-600"
        />
        <DashboardWidgets
          icon={<FaHome />}
          title="Hostel Occupancy"
          value={hostelOccupancy}
          color="text-yellow-600"
        />
      </div>

      {/* Forms Section */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdmissionForm />
        <FeeForm />
        <HostelForm />
      </div>
    </div>
  );
}
