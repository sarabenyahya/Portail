import api from "../api";

/**
 * Service pour gérer les demandes des employés
 */
export const demandService = {
  /**
   * Récupère toutes les demandes d'un employé spécifique
   * @param {string} employeeId - L'ID de l'employé
   * @returns {Promise<Array>} - Les demandes de l'employé
   */
  async getEmployeeDemands(employeeId) {
    try {
      console.log(
        `Service: Récupération des demandes pour l'employé ID: ${employeeId}`
      );
      const response = await api.get(`/demands/employee/${employeeId}`);
      console.log(`Service: ${response.data.length} demandes récupérées`);
      return response.data;
    } catch (error) {
      console.error(
        "Service: Erreur lors de la récupération des demandes:",
        error
      );
      throw error;
    }
  },

  /**
   * Récupère les demandes de l'employé actuellement connecté
   * @returns {Promise<Array>} - Les demandes de l'employé connecté
   */
  async getCurrentEmployeeDemands() {
    try {
      // D'abord récupérer les informations de l'employé connecté
      const userInfo = await api.get("/auth/me");
      const employeeId = userInfo.data._id;

      console.log(
        `Service: Récupération des demandes pour l'employé connecté (ID: ${employeeId})`
      );
      return await this.getEmployeeDemands(employeeId);
    } catch (error) {
      console.error(
        "Service: Erreur lors de la récupération des demandes de l'employé connecté:",
        error
      );
      throw error;
    }
  },

  /**
   * Crée une nouvelle demande
   * @param {Object} demandData - Les données de la demande
   * @returns {Promise<Object>} - La demande créée
   */
  async createDemand(demandData) {
    try {
      console.log("Service: Création d'une nouvelle demande:", demandData);
      const response = await api.post("/demands", demandData);
      console.log("Service: Demande créée avec succès:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Service: Erreur lors de la création de la demande:",
        error
      );
      throw error;
    }
  },

  /**
   * Supprime une demande
   * @param {string} demandId - L'ID de la demande à supprimer
   * @returns {Promise<void>}
   */
  async deleteDemand(demandId) {
    try {
      console.log(`Service: Suppression de la demande ID: ${demandId}`);
      await api.delete(`/demands/${demandId}`);
      console.log("Service: Demande supprimée avec succès");
    } catch (error) {
      console.error(
        "Service: Erreur lors de la suppression de la demande:",
        error
      );
      throw error;
    }
  },

  /**
   * Télécharge le PDF d'une demande
   * @param {string} demandId - L'ID de la demande
   * @returns {Promise<Blob>} - Le fichier PDF
   */
  async downloadDemandPdf(demandId) {
    try {
      // Vérifier que l'ID est défini
      if (!demandId) {
        console.error("Service: ID de demande non défini");
        throw new Error(
          "L'ID de la demande est requis pour télécharger le PDF"
        );
      }

      console.log(
        `Service: Téléchargement du PDF pour la demande ID: ${demandId}`
      );

      // Utiliser responseType: 'blob' pour recevoir directement un blob
      const response = await api.get(`/demands/${demandId}/download`, {
        responseType: "blob",
        // Augmenter le timeout pour les opérations de génération de PDF qui peuvent prendre plus de temps
        timeout: 60000, // 60 secondes
        // Ajouter des en-têtes spécifiques si nécessaire
        headers: {
          Accept: "application/pdf",
        },
      });

      // Vérifier si la réponse contient un PDF valide
      const contentType = response.headers["content-type"];
      if (contentType && contentType.includes("application/pdf")) {
        console.log(
          `Service: PDF téléchargé avec succès, taille: ${response.data.size} octets`
        );
        return response.data;
      } else {
        console.error(
          `Service: Le serveur n'a pas renvoyé un PDF valide, type de contenu: ${contentType}`
        );
        throw new Error("Le serveur n'a pas renvoyé un PDF valide");
      }
    } catch (error) {
      console.error("Service: Erreur lors du téléchargement du PDF:", error);

      // Si l'erreur contient une réponse et que cette réponse est un blob,
      // essayer de lire le message d'erreur du serveur
      if (error.response && error.response.data instanceof Blob) {
        try {
          // Convertir le blob en texte pour lire le message d'erreur
          const errorText = await error.response.data.text();
          console.log("Service: Contenu de l'erreur:", errorText);

          try {
            const errorJson = JSON.parse(errorText);
            error.serverMessage = errorJson.message || errorText;
          } catch (jsonError) {
            error.serverMessage = errorText;
          }
        } catch (blobError) {
          console.error(
            "Service: Impossible de lire le message d'erreur du blob:",
            blobError
          );
        }
      }

      throw error;
    }
  },
};
