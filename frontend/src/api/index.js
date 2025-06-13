import axios from "axios";

axios.defaults.withCredentials = true;

// Instance Axios personnalisée
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default apiClient;

// Méthode pour récupérer les demandes d'un employé spécifique
export const fetchEmployeeDemands = async (employeeId) => {
  try {
    console.log(`Récupération des demandes pour l'employé ID: ${employeeId}`);
    const response = await apiClient.get(`/demands/employee/${employeeId}`);
    console.log(`${response.data.length} demandes récupérées pour l'employé`);
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de l'employé:",
      error
    );
    throw error;
  }
};
