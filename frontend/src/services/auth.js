import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

/**
 * Socket.IO client for ERP frontend
 * - Connects to backend Socket.IO server
 * - Joins university room for real-time updates
 */

const SOCKET_URL = "http://localhost:5000"; // Backend server URL
const socket = io(SOCKET_URL, { autoConnect: false });

/**
 * Join university-specific room after login
 */
export const joinUniversityRoom = () => {
  const { user } = useAuthStore.getState();
  if (user?.domainId) {
    socket.connect();
    socket.emit("join_university", user.domainId);
    console.log(`Joined university room: ${user.domainId}`);
  }
};

export default socket;
