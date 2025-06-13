import { defineStore } from "pinia";
import { demandService } from "../services/demandService";

export const useRequestStore = defineStore("requests", {
  state: () => ({
    requests: [],
    employeeRequests: {}, // Stocke les demandes par ID d'employé
    loading: false,
    error: null,
    lastUpdated: null,
  }),

  getters: {
    // Récupère toutes les demandes
    getAllRequests: (state) => state.requests,

    // Récupère les demandes d'un employé spécifique
    getRequestsByEmployeeId: (state) => (employeeId) => {
      return state.employeeRequests[employeeId] || [];
    },

    // Récupère une demande par son ID
    getRequestById: (state) => (requestId) => {
      return state.requests.find((r) => r.id === requestId);
    },

    // Filtre les demandes par statut
    getRequestsByStatus: (state) => (status) => {
      return state.requests.filter((r) => r.status === status);
    },

    // Filtre les demandes par type
    getRequestsByType: (state) => (type) => {
      return state.requests.filter((r) => r.type === type);
    },

    // Compte les demandes par statut
    countByStatus: (state) => {
      const counts = { EN_ATTENTE: 0, ACCEPTE: 0, REFUSE: 0 };
      state.requests.forEach((r) => {
        if (counts[r.status] !== undefined) {
          counts[r.status]++;
        }
      });
      return counts;
    },

    // Vérifie si le store a été chargé récemment (moins de 5 minutes)
    isDataFresh: (state) => {
      if (!state.lastUpdated) return false;
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return state.lastUpdated > fiveMinutesAgo;
    },
  },

  actions: {
    // Met à jour toutes les demandes
    setRequests(requests) {
      console.log("Store: Mise à jour des demandes", requests);
      this.requests = requests;
      this.lastUpdated = new Date();
    },

    // Ajoute une demande
    addRequest(request) {
      console.log("Store: Ajout d'une demande", request);
      this.requests.push(request);

      // Mettre à jour également les demandes de l'employé si elles sont chargées
      if (request.employeeId && this.employeeRequests[request.employeeId]) {
        this.employeeRequests[request.employeeId].push(request);
      }

      this.lastUpdated = new Date();
    },

    // Met à jour une demande existante
    updateRequest(updatedRequest) {
      console.log("Store: Mise à jour d'une demande", updatedRequest);
      const index = this.requests.findIndex((r) => r.id === updatedRequest.id);
      if (index !== -1) {
        this.requests[index] = updatedRequest;
      }

      // Mettre à jour également dans les demandes de l'employé
      if (
        updatedRequest.employeeId &&
        this.employeeRequests[updatedRequest.employeeId]
      ) {
        const empIndex = this.employeeRequests[
          updatedRequest.employeeId
        ].findIndex((r) => r.id === updatedRequest.id);
        if (empIndex !== -1) {
          this.employeeRequests[updatedRequest.employeeId][empIndex] =
            updatedRequest;
        }
      }

      this.lastUpdated = new Date();
    },

    // Supprime une demande
    deleteRequest(requestId) {
      console.log("Store: Suppression d'une demande", requestId);

      // Trouver la demande pour obtenir l'ID de l'employé avant de la supprimer
      const request = this.requests.find((r) => r.id === requestId);

      // Supprimer de la liste principale
      this.requests = this.requests.filter((r) => r.id !== requestId);

      // Supprimer également des demandes de l'employé si elles sont chargées
      if (
        request &&
        request.employeeId &&
        this.employeeRequests[request.employeeId]
      ) {
        this.employeeRequests[request.employeeId] = this.employeeRequests[
          request.employeeId
        ].filter((r) => r.id !== requestId);
      }

      this.lastUpdated = new Date();
    },

    // Vide toutes les demandes
    clearRequests() {
      console.log("Store: Effacement de toutes les demandes");
      this.requests = [];
      this.employeeRequests = {};
      this.lastUpdated = new Date();
    },

    // Charge les demandes depuis l'API
    async fetchRequests() {
      try {
        console.log("Store: Chargement des demandes depuis l'API");
        this.loading = true;
        this.error = null;

        // Utiliser le service pour récupérer les demandes
        const requests = await demandService.getCurrentEmployeeDemands();
        this.setRequests(requests);

        console.log(`Store: ${requests.length} demandes chargées avec succès`);
        return requests;
      } catch (error) {
        console.error("Store: Erreur lors du chargement des demandes", error);
        this.error = error.message || "Erreur lors du chargement des demandes";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Charge les demandes d'un employé spécifique
    async fetchEmployeeRequests(employeeId) {
      try {
        console.log(
          `Store: Chargement des demandes pour l'employé ${employeeId}`
        );
        this.loading = true;
        this.error = null;

        // Utiliser le service pour récupérer les demandes de l'employé
        const requests = await demandService.getEmployeeDemands(employeeId);

        // Stocker les demandes dans le state
        this.employeeRequests[employeeId] = requests;

        console.log(
          `Store: ${requests.length} demandes chargées pour l'employé ${employeeId}`
        );
        return requests;
      } catch (error) {
        console.error(
          `Store: Erreur lors du chargement des demandes pour l'employé ${employeeId}`,
          error
        );
        this.error = error.message || "Erreur lors du chargement des demandes";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Crée une nouvelle demande
    async createRequest(requestData) {
      try {
        console.log("Store: Création d'une nouvelle demande", requestData);
        this.loading = true;
        this.error = null;

        // Utiliser le service pour créer la demande
        const newRequest = await demandService.createDemand(requestData);

        // Ajouter la nouvelle demande au store
        this.addRequest(newRequest);

        console.log("Store: Demande créée avec succès", newRequest);
        return newRequest;
      } catch (error) {
        console.error("Store: Erreur lors de la création de la demande", error);
        this.error =
          error.message || "Erreur lors de la création de la demande";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Supprime une demande via l'API
    async removeRequest(requestId) {
      try {
        console.log(`Store: Suppression de la demande ${requestId}`);
        this.loading = true;
        this.error = null;

        // Utiliser le service pour supprimer la demande
        await demandService.deleteDemand(requestId);

        // Supprimer la demande du store
        this.deleteRequest(requestId);

        console.log(`Store: Demande ${requestId} supprimée avec succès`);
      } catch (error) {
        console.error(
          `Store: Erreur lors de la suppression de la demande ${requestId}`,
          error
        );
        this.error =
          error.message || "Erreur lors de la suppression de la demande";
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
