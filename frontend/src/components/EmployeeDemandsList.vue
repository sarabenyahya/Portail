<template>
  <div class="employee-demands-list">
    <!-- Indicateur de chargement -->
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
      <p class="mt-2">Chargement des demandes...</p>
    </div>

    <!-- Message d'erreur -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Message de succès -->
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <!-- Aucune demande -->
    <div v-if="!loading && demands.length === 0" class="alert alert-info">
      Aucune demande trouvée pour cet employé.
    </div>

    <!-- Liste des demandes -->
    <div v-if="!loading && demands.length > 0">
      <Table :columns="columns" :data="paginatedDemands" class="table-hover">
        <!-- Template pour le statut -->
        <template #status="{ value }">
          <span :class="getStatusClass(value)" class="badge">
            {{ getStatusLabel(value) }}
          </span>
        </template>

        <!-- Template pour le type -->
        <template #type="{ value }">
          <span :class="getTypeClass(value)" class="badge">
            {{ getTypeLabel(value) }}
          </span>
        </template>

        <!-- Template pour les dates -->
        <template #dates="{ row }">
          <span v-if="row.type === 'CONGE' && row.startDate && row.endDate">
            {{ formatDate(row.startDate) }} - {{ formatDate(row.endDate) }}
          </span>
          <span v-else>-</span>
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
import { useRequestStore } from '../stores/requestStore';
import Table from './Table.vue';
import Pagination from './Pagination.vue';

export default {
  name: 'EmployeeDemandsList',
  components: {
    Table,
    Pagination
  },
  props: {
    employeeId: {
      type: String,
      required: false,
      default: null
    }
  },
  setup() {
    const requestStore = useRequestStore();
    return { requestStore };
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      successMessage: '',
      currentPage: 1,
      itemsPerPage: 5,
      columns: [
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Statut' },
        { key: 'dates', label: 'Dates' },
        { key: 'createdAt', label: 'Date de création', formatter: this.formatDate },
        { key: 'actions', label: 'Actions' }
      ],
      refreshInterval: null,
    };
  },
  computed: {
    paginatedDemands() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.demands.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.demands.length / this.itemsPerPage);
    },
    demands() {
      if (this.employeeId) {
        return this.requestStore.getRequestsByEmployeeId(this.employeeId);
      } else {
        return this.requestStore.getAllRequests;
      }
    },
  },
  created() {
    this.loadDemands();

    // Rafraîchir les données toutes les 5 minutes
    this.refreshInterval = setInterval(() => {
      this.loadDemands(true); // true = silencieux (pas d'indicateur de chargement)
    }, 5 * 60 * 1000);
  },
  beforeUnmount() {
    // Nettoyer l'intervalle lors de la destruction du composant
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async loadDemands(silent = false) {
      try {
        if (!silent) {
          this.loading = true;
        }
        this.errorMessage = '';

        // Vérifier si les données sont déjà fraîches
        if (this.employeeId && !this.requestStore.isDataFresh) {
          await this.requestStore.fetchEmployeeRequests(this.employeeId);
        } else if (!this.employeeId && !this.requestStore.isDataFresh) {
          await this.requestStore.fetchRequests();
        }

        console.log(`${this.demands.length} demandes chargées avec succès`);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        if (!silent) {
          this.errorMessage = 'Impossible de charger les demandes';
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },

    async deleteDemand(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
        return;
      }

      try {
        this.loading = true;

        // Utiliser le store pour supprimer la demande
        await this.requestStore.removeRequest(id);

        this.successMessage = 'Demande supprimée avec succès';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.errorMessage = 'Impossible de supprimer la demande';
      } finally {
        this.loading = false;
      }
    },

    async downloadPdf(id) {
      try {
        this.loading = true;
        const pdfBlob = await demandService.downloadDemandPdf(id);

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
      } catch (error) {
        console.error('Erreur lors du téléchargement du PDF:', error);
        this.errorMessage = 'Impossible de télécharger le PDF';
      } finally {
        this.loading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },

    getStatusClass(status) {
      const classes = {
        'EN_ATTENTE': 'bg-warning',
        'ACCEPTE': 'bg-success',
        'REFUSE': 'bg-danger'
      };
      return classes[status] || 'bg-secondary';
    },

    getStatusLabel(status) {
      const labels = {
        'EN_ATTENTE': 'En attente',
        'ACCEPTE': 'Accepté',
        'REFUSE': 'Refusé'
      };
      return labels[status] || status;
    },

    getTypeClass(type) {
      const classes = {
        'CONGE': 'bg-primary',
        'ATTESTATION': 'bg-info'
      };
      return classes[type] || 'bg-secondary';
    },

    getTypeLabel(type) {
      const labels = {
        'CONGE': 'Congé',
        'ATTESTATION': 'Attestation'
      };
      return labels[type] || type;
    }
  }
};
</script>
