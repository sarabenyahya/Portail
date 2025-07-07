<template>
  <div class="employee-demands-container">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>

    <div v-else>
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <div v-if="demands.length === 0" class="alert alert-info" role="alert">
        Aucune demande trouvée pour cet employé.
      </div>

      <Table v-else :items="paginatedDemands" :fields="fields" striped hover responsive>
        <!-- Template pour le statut -->
        <template #cell(status)="{ value }">
          <span :class="getStatusBadgeClass(value)">{{ getStatusLabel(value) }}</span>
        </template>

        <!-- Template pour le type -->
        <template #cell(type)="{ value }">
          <span :class="getTypeBadgeClass(value)">{{ getTypeLabel(value) }}</span>
        </template>

        <!-- Template pour les dates -->
        <template #cell(startDate)="{ value }">
          {{ value ? formatDate(value) : '-' }}
        </template>

        <template #cell(endDate)="{ value }">
          {{ value ? formatDate(value) : '-' }}
        </template>

        <!-- Template pour les actions -->
        <template #actions="{ row }">
          <div class="d-flex gap-2">
            <button v-if="row.status === 'ACCEPTE'" class="btn btn-sm btn-outline-success" @click="downloadPdf(row.id)"
              title="Télécharger">
              <i class="fas fa-download"></i>
            </button>
            <button v-if="row.status === 'EN_ATTENTE'" class="btn btn-sm btn-outline-danger"
              @click="deleteDemand(row.id)" title="Supprimer">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </template>
      </Table>

      <!-- Pagination -->
      <div class="d-flex justify-content-center mt-4">
        <Pagination v-if="totalPages > 1" :currentPage="currentPage" :totalPages="totalPages"
          @update:currentPage="currentPage = $event" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRequestStore } from '../stores/requestStore';
import { demandService } from '../services/demandService';
import Table from './ui/Table.vue';
import Pagination from './ui/Pagination.vue';

export default {
  name: 'EmployeeDemandsList',
  components: {
    Table,
    Pagination
  },
  props: {
    employeeId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const requestStore = useRequestStore();
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    let refreshInterval = null;

    // Définir les champs du tableau
    const fields = [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'status', label: 'Statut', sortable: true },
      { key: 'startDate', label: 'Date de début', sortable: true },
      { key: 'endDate', label: 'Date de fin', sortable: true },
      { key: 'createdAt', label: 'Date de création', sortable: true },
      { key: 'actions', label: 'Actions' }
    ];

    // Calculer les demandes paginées
    const paginatedDemands = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return demands.value.slice(start, end);
    });

    // Calculer le nombre total de pages
    const totalPages = computed(() => {
      return Math.ceil(demands.value.length / itemsPerPage);
    });

    // Récupérer les demandes depuis le store
    const demands = computed(() => {
      if (props.employeeId) {
        return requestStore.getRequestsByEmployeeId(props.employeeId);
      } else {
        return [];
      }
    });

    // Charger les demandes
    const loadDemands = async (silent = false) => {
      try {
        if (!silent) {
          loading.value = true;
        }
        errorMessage.value = '';

        // Vérifier si les données sont déjà fraîches
        if (props.employeeId && !requestStore.isDataFresh) {
          await requestStore.fetchEmployeeRequests(props.employeeId);
        }

        console.log(`${demands.value.length} demandes chargées avec succès`);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        if (!silent) {
          errorMessage.value = 'Impossible de charger les demandes';
        }
      } finally {
        if (!silent) {
          loading.value = false;
        }
      }
    };

    // Formater les dates
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    };

    // Obtenir la classe CSS pour le badge de statut
    const getStatusBadgeClass = (status) => {
      const baseClass = 'badge ';
      switch (status) {
        case 'ACCEPTE':
          return baseClass + 'bg-success';
        case 'REFUSE':
          return baseClass + 'bg-danger';
        case 'EN_ATTENTE':
        default:
          return baseClass + 'bg-warning';
      }
    };

    // Obtenir le libellé du statut
    const getStatusLabel = (status) => {
      switch (status) {
        case 'ACCEPTE':
          return 'Accepté';
        case 'REFUSE':
          return 'Refusé';
        case 'EN_ATTENTE':
        default:
          return 'En attente';
      }
    };

    // Obtenir la classe CSS pour le badge de type
    const getTypeBadgeClass = (type) => {
      const baseClass = 'badge ';
      switch (type) {
        case 'CONGE':
          return baseClass + 'bg-primary';
        case 'ATTESTATION DE TRAVAIL':
          return baseClass + 'bg-info';
        default:
          return baseClass + 'bg-secondary';
      }
    };

    // Obtenir le libellé du type
    const getTypeLabel = (type) => {
      switch (type) {
        case 'CONGE':
          return 'Congé';
        case 'ATTESTATION DE TRAVAIL':
          return 'Attestation de travail';
        default:
          return type;
      }
    };

    // Télécharger le PDF d'une demande
    const downloadPdf = async (id) => {
      try {
        // Vérifier que l'ID est défini
        if (!id) {
          console.error('ID de demande non défini');
          errorMessage.value = 'Impossible de télécharger le PDF: ID de demande manquant';
          setTimeout(() => {
            errorMessage.value = '';
          }, 5000);
          return;
        }

        loading.value = true;
        errorMessage.value = '';
        console.log(`Tentative de téléchargement du PDF pour la demande ID: ${id}`);

        // Utiliser le service pour télécharger le PDF
        const pdfBlob = await demandService.downloadDemandPdf(id);

        // Vérifier si le blob est valide
        if (!pdfBlob || pdfBlob.size === 0) {
          throw new Error('Le PDF téléchargé est vide ou invalide');
        }

        console.log(`PDF téléchargé avec succès, taille: ${pdfBlob.size} octets`);

        // Créer un URL pour le blob
        const url = window.URL.createObjectURL(pdfBlob);

        // Créer un lien temporaire et déclencher le téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `demande-${id}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Nettoyer
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        console.log('Téléchargement du PDF terminé');

        // Afficher un message de succès
        successMessage.value = 'PDF téléchargé avec succès';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } catch (error) {
        console.error('Erreur lors du téléchargement du PDF:', error);

        // Message d'erreur plus détaillé
        if (error.response) {
          if (error.response.status === 500) {
            errorMessage.value = error.serverMessage ||
              'Erreur serveur lors de la génération du PDF. Veuillez réessayer plus tard.';
          } else if (error.response.status === 404) {
            errorMessage.value = 'La demande n\'a pas été trouvée ou le PDF n\'est pas disponible.';
          } else {
            errorMessage.value = `Erreur ${error.response.status}: Impossible de télécharger le PDF`;
          }
        } else {
          errorMessage.value = `Impossible de télécharger le PDF: ${error.message}`;
        }
      } finally {
        loading.value = false;
      }
    };

    // Supprimer une demande
    const deleteDemand = async (id) => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
        return;
      }

      try {
        loading.value = true;
        errorMessage.value = '';

        // Utiliser le service pour supprimer la demande
        await demandService.deleteDemand(id);

        // Recharger les demandes
        await loadDemands();

        // Afficher un message de succès
        successMessage.value = 'Demande supprimée avec succès';
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de la suppression de la demande:', error);
        errorMessage.value = 'Impossible de supprimer la demande';
      } finally {
        loading.value = false;
      }
    };

    // Charger les demandes au montage du composant
    onMounted(() => {
      loadDemands();

      // Rafraîchir les données toutes les 5 minutes
      refreshInterval = setInterval(() => {
        loadDemands(true); // true = silencieux (pas d'indicateur de chargement)
      }, 5 * 60 * 1000);
    });

    // Nettoyer l'intervalle avant de démonter le composant
    onBeforeUnmount(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });

    return {
      loading,
      errorMessage,
      successMessage,
      currentPage,
      fields,
      paginatedDemands,
      totalPages,
      demands,
      formatDate,
      getStatusBadgeClass,
      getStatusLabel,
      getTypeBadgeClass,
      getTypeLabel,
      downloadPdf,
      deleteDemand,
      loadDemands
    };
  }
};
</script>

<style scoped>
.employee-demands-container {
  margin-top: 20px;
}
</style>
