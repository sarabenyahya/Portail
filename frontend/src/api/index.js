import axios from "axios";

axios.defaults.withCredentials = true;
// Create axios instance with base URL and credentials support
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true, // Important for sending/receiving cookies with requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default apiClient;
