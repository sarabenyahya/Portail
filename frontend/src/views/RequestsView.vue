<template>
  <div class="requests-container">
    <h1>Mes demandes</h1>

    <!-- Informations de débogage -->
    <div v-if="debug" class="debug-info">
      <h3>Informations de débogage</h3>
      <p>Nombre de demandes dans le store: {{ requestStore.requests.length }}</p>
      <p>Nombre de demandes filtrées: {{ filteredRequests.length }}</p>
      <p>Nombre de demandes paginées: {{ paginatedRequests.length }}</p>
      <button @click="forceReload" class="btn btn-warning">Forcer le rechargement</button>
    </div>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg professional-navbar shadow-sm">
      <div class="container-fluid">
        <!-- Logo/Brand -->
        <a class="navbar-brand d-flex align-items-center" href="#">
          <div>
            <router-link to="/" class="btn btn-ghost normal-case text-xl">
              <img src="@/assets/logo.png" alt="Company Logo" class="logo" />
            </router-link>
          </div>
          <span class="brand-text">Portail</span>
        </a>

        <!-- Toggle button for mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation items -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto ms-4">
            <li class="nav-item">
              <a class="nav-link active" href="#" @click.prevent="$router.push('/demands')">
                <i class="fas fa-file-alt me-1"></i>
                Mes Demandes
              </a>
            </li>
          </ul>

          <!-- User info and actions -->
          <div class="navbar-nav d-flex align-items-center">
            <!-- Logout Button -->
            <div class="nav-item me-3">
              <button class="btn btn-outline-danger btn-sm logout-btn" @click="logout">
                <i class="fas fa-sign-out-alt me-1"></i>
                Se déconnecter
              </button>
            </div>

            <!-- Notifications -->
            <div class="nav-item dropdown">
              <a class="nav-link position-relative" href="#" data-bs-toggle="dropdown" @click.prevent>
                <i class="fas fa-bell"></i>
                <span class="notification-badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end notifications-dropdown">
                <li class="dropdown-header">Notifications</li>
                <li v-if="notifications.length === 0" class="dropdown-item-text text-muted">
                  <small>Aucune notification</small>
                </li>
                <li v-for="notification in notifications" :key="notification.id" class="dropdown-item">
                  <div class="notification-item">
                    <small class="text-muted">{{ notification.message }}</small>
                    <br />
                    <small class="text-muted">{{ formatDate(notification.date) }}</small>
                  </div>
                </li>
              </ul>
            </div>

            <!-- User menu -->
            <div class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" data-bs-toggle="dropdown"
                @click.prevent>
                <div class="user-avatar me-2">
                  <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-info d-none d-md-block">
                  <div class="user-name">{{ userEmail }}</div>
                  <small class="user-role text-muted">Employé</small>
                </div>
              </a>
              <ul class="dropdown-menu dropdown-menu-end user-dropdown">
                <li class="dropdown-header">
                  <div class="user-email">{{ userEmail }}</div>
                </li>
                <li>
                  <hr class="dropdown-divider" />
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="$router.push('/profile')">
                    <i class="fas fa-user me-2"></i>Mon Profil
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="$router.push('/settings')">
                    <i class="fas fa-cog me-2"></i>Paramètres
                  </a>
                </li>
                <li>
                  <hr class="dropdown-divider" />
                </li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="logoutFromNavbar">
                    <i class="fas fa-sign-out-alt me-2"></i>Se déconnecter
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <div class="professional-bg min-vh-100">
      <div class="container shadow rounded bg-white-transparent p-4 position-relative" style="margin-top: 100px;">
        <!-- Header -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <h2 class="fw-semibold mb-0">Mes Demandes</h2>
              <div class="d-flex gap-2">
                <button @click="openLeaveForm" class="btn btn-primary">
                  <i class="fas fa-calendar-plus me-2"></i>Demande de congé
                </button>
                <button @click="requestCertificate" class="btn btn-outline-primary">
                  <i class="fas fa-file-alt me-2"></i>Attestation de travail
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
        </div>

        <!-- Message de succès -->
        <div v-if="successMessage" class="alert alert-success alert-dismissible fade show mb-4" role="alert">
          {{ successMessage }}
          <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
        </div>

        <!-- Filtres avec des listes déroulantes compactes et professionnelles -->
        <div class="row mb-4">
          <div class="col-md-4 mb-3 mb-md-0">
            <label for="statusFilter" class="form-label fw-bold small text-muted">STATUT</label>
            <select id="statusFilter" class="form-select form-select-sm shadow-sm" v-model="selectedStatus">
              <option value="">Tous les statuts</option>
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>
          <div class="col-md-4 mb-3 mb-md-0">
            <label for="typeFilter" class="form-label fw-bold small text-muted">TYPE</label>
            <select id="typeFilter" class="form-select form-select-sm shadow-sm" v-model="selectedType">
              <option value="">Tous les types</option>
              <option v-for="type in typeOptions" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

        </div>

        <!-- Formulaire -->
        <LeaveForm v-if="showLeaveForm" @close="closeLeaveForm" @submitted="handleLeaveSubmitted" />

        <!-- Tableau avec état de chargement -->
        <div class="position-relative">
          <div v-if="loading" class="loading-overlay">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>

          <div v-if="filteredRequests.length === 0" class="text-center py-5 bg-light rounded">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Aucune demande trouvée</h5>
            <p class="text-muted small">Utilisez les boutons ci-dessus pour créer une nouvelle demande</p>
          </div>

          <Table v-else :headers="headers" :data="paginatedRequests" :showActions="true" @onEdit="editRequest"
            @onDelete="deleteRequest">
            <!-- Correction des noms de champs -->
            <template #cell-dateDebut="{ row }">
              {{ formatDate(row.dateDebut || row.startDate) }}
            </template>

            <template #cell-dateFin="{ row }">
              {{ formatDate(row.dateFin || row.endDate) }}
            </template>

            <template #cell-status="{ row }">
              <span class="badge" :class="getStatusClass(row.status)">
                {{ getStatusLabel(row.status) }}
              </span>
            </template>

            <template #actions="{ row }">
              <div class="d-flex gap-2">
                <button v-if="row.status === 'ACCEPTE'" class="btn btn-sm btn-outline-success"
                  @click="downloadPdf(row._id)" title="Télécharger">
                  <i class="fas fa-download"></i>
                </button>
                <button v-if="row.status === 'EN_ATTENTE'" class="btn btn-sm btn-outline-danger"
                  @click="deleteRequest(row._id)" title="Supprimer">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </template>
          </Table>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-center mt-4">
          <Pagination v-if="totalPages > 1" :currentPage="currentPage" :totalPages="totalPages"
            @update:currentPage="currentPage = $event" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import { useRequestStore } from '../stores/requestStore';
import LeaveForm from '../components/LeaveForm.vue';
import Table from '../components/Table.vue';
import Pagination from '../components/Pagination.vue';
import { demandService } from '../services/demandService';

export default {
  components: { LeaveForm, Table, Pagination },
  data() {
    return {
      showLeaveForm: false,
      userEmail: '',
      notificationCount: 2, // Nombre de notifications non lues
      notifications: [
        { id: 1, message: 'Votre demande de congé a été approuvée', date: new Date() },
        { id: 2, message: 'Nouvelle politique RH disponible', date: new Date(Date.now() - 86400000) }
      ],
      headers: [
        { label: 'Type', value: 'type' },
        { label: 'Début', value: 'dateDebut' },
        { label: 'Fin', value: 'dateFin' },
        { label: 'Statut', value: 'status' }
      ],
      errorMessage: '',
      successMessage: '',
      currentPage: 1,
      itemsPerPage: 5,
      loading: false,

      // Filtres par liste déroulante (valeur unique)
      selectedStatus: '',
      selectedType: '',

      // Options pour les filtres
      statusOptions: [
        { value: 'EN_ATTENTE', label: 'En cours' },
        { value: 'ACCEPTE', label: 'Accepté' },
        { value: 'REFUSE', label: 'Refusé' }
      ],
      typeOptions: [
        { value: 'CONGE', label: 'Congé' },
        { value: 'ATTESTATION', label: 'Attestation' }
      ]
    };
  },
  setup() {
    const requestStore = useRequestStore();
    return { requestStore };
  },
  computed: {
    // Filtrer les demandes en fonction des filtres sélectionnés
    filteredRequests() {
      let requests = this.requestStore.requests;

      console.log("Filtrage des demandes:", requests);

      // Appliquer le filtre de statut
      if (this.selectedStatus) {
        requests = requests.filter(req => req.status === this.selectedStatus);
      }

      // Appliquer le filtre de type
      if (this.selectedType) {
        requests = requests.filter(req => req.type === this.selectedType);
      }

      // Appliquer le filtre de date
      if (this.selectedDateRange) {
        // Logique de filtrage par date
      }

      console.log("Demandes filtrées:", requests);
      return requests;
    },

    // Pagination
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRequests.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    }
  },
  async created() {
    try {
      this.loading = true;
      await api.get('/auth/check-session');
      await this.loadUserInfo();
      await this.loadRequests();
    } catch {
      this.$router.push('/');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    resetFilters() {
      this.selectedStatus = '';
      this.selectedType = '';
      this.currentPage = 1;
    },
    async loadUserInfo() {
      try {
        const response = await api.get('/auth/me');
        this.userEmail = response.data.email;
      } catch (error) {
        console.error('Erreur lors du chargement des informations utilisateur:', error);
      }
    },
    async loadRequests() {
      try {
        this.loading = true;
        this.errorMessage = '';
        console.log("Chargement des demandes...");

        // Utiliser le service pour récupérer les demandes
        const demands = await demandService.getCurrentEmployeeDemands();

        // Mettre à jour le store avec les demandes reçues
        this.requestStore.setRequests(demands);
        console.log(`${demands.length} demandes chargées avec succès`);

      } catch (error) {
        console.error('Erreur lors du chargement des demandes:', error);
        this.errorMessage = 'Impossible de charger les demandes';

        // Afficher plus de détails sur l'erreur
        if (error.response) {
          console.error('Détails de l\'erreur:', error.response.data);
          this.errorMessage += `: ${error.response.data.message || 'Erreur serveur'}`;
        } else if (error.request) {
          console.error('Pas de réponse du serveur');
          this.errorMessage += ': Le serveur ne répond pas';
        } else {
          console.error('Erreur de configuration de la requête:', error.message);
          this.errorMessage += `: ${error.message}`;
        }
      } finally {
        this.loading = false;
      }
    },
    async requestCertificate() {
      try {
        this.loading = true;
        // Utiliser le service pour créer une demande d'attestation
        await demandService.createDemand({
          type: 'ATTESTATION',
          status: 'EN_ATTENTE'
        });

        // Recharger les demandes
        await this.loadRequests();

        this.successMessage = "Demande d'attestation créée avec succès";
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        console.error('Erreur lors de la création de la demande:', error);
        this.errorMessage = "Impossible de créer la demande d'attestation de travail";
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout');
        this.$router.push('/');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    },
    async logoutFromNavbar() {
      await this.logout();
    },
    editRequest(id) {
      alert('Édition de la demande ' + id);
    },
    async deleteRequest(id) {
      // Confirmation avant suppression
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.')) {
        return;
      }

      try {
        this.loading = true;
        // Utiliser le service pour supprimer la demande
        await demandService.deleteDemand(id);

        // IMPORTANT: Mettre à jour le store Pinia
        this.requestStore.deleteRequest(id);

        // Gérer la pagination si la page actuelle devient vide
        if (this.paginatedRequests.length === 0 && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1;
        }

        // Message de succès
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
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR');
    },
    getStatusClass(status) {
      const statusClasses = {
        'EN_ATTENTE': 'bg-warning text-dark',
        'ACCEPTE': 'bg-success text-white',
        'REFUSE': 'bg-danger text-white'
      };
      return statusClasses[status] || 'bg-secondary text-white';
    },
    getStatusLabel(status) {
      const labels = {
        'EN_ATTENTE': 'En cours',
        'ACCEPTE': 'Accepté',
        'REFUSE': 'Refusé'
      };
      return labels[status] || status;
    },
    async downloadPdf(id) {
      try {
        // Vérifier d'abord l'état de la session
        try {
          await api.get('/auth/check-session');
        } catch (sessionError) {
          console.error('Session expirée:', sessionError);
          this.errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
          setTimeout(() => {
            this.$router.push('/');
          }, 2000);
          return;
        }

        // Afficher un indicateur de chargement
        this.loading = true;

        // Utiliser le service pour télécharger le PDF
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
        this.loading = false;

      } catch (error) {
        console.error('Erreur lors du téléchargement du PDF:', error);
        this.errorMessage = 'Impossible de télécharger le PDF de la demande';
        this.loading = false;

        // Effacer le message d'erreur après 3 secondes
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },
    openLeaveForm() {
      this.showLeaveForm = true;
    },
    closeLeaveForm() {
      this.showLeaveForm = false;
    },
    handleLeaveSubmitted() {
      this.loadRequests();
      this.successMessage = "Demande de congé créée avec succès";
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
      this.closeLeaveForm();
    },
    forceReload() {
      // Vider le store
      this.requestStore.clearRequests();
      // Recharger les demandes
      this.loadRequests();
    }
  }
};
</script>

<style scoped>
.professional-navbar {
  background-color: rgba(255, 255, 255, 0.85);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.professional-bg {
  background-color: transparent;
  padding-top: 20px;
  padding-bottom: 40px;
}

.bg-white-transparent {
  background-color: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(10px);
}

.card {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Styles pour le tableau avec fond transparent */
.requests-table :deep(table) {
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
}

.requests-table :deep(th) {
  background-color: rgba(248, 249, 250, 0.8);
  color: #495057;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 12px 15px;
  border-bottom: 2px solid rgba(222, 226, 230, 0.7);
}

.requests-table :deep(td) {
  padding: 12px 15px;
  vertical-align: middle;
  border-top: 1px solid rgba(222, 226, 230, 0.5);
}

.requests-table :deep(tr:hover) {
  background-color: rgba(0, 123, 255, 0.1);
}

/* Message vide avec fond transparent */
.text-center.py-5.bg-light {
  background-color: rgba(248, 249, 250, 0.7) !important;
  backdrop-filter: blur(5px);
}

.brand-text {
  margin-left: 0.5rem;
  font-weight: bold;
  color: #333;
}

.logo {
  height: 40px;
}

/* Styles pour les filtres */
.form-select {
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
}

.form-select-sm {
  height: 38px;
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
}

/* Styles pour les boutons d'action */
.btn {
  border-radius: 5px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-warning {
  background-color: #fd7e14;
  border-color: #fd7e14;
}

/* Styles pour les badges de statut */
.badge {
  padding: 0.5em 0.8em;
  font-weight: 500;
  border-radius: 4px;
}

/* Overlay de chargement */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

/* Styles pour les notifications */
.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 0.7rem;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
}

.notifications-dropdown {
  min-width: 280px;
  padding: 0;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 0.5rem;
}

.dropdown-header {
  background-color: #f8f9fa;
  font-weight: 600;
  padding: 0.75rem 1rem;
}

.notification-item {
  padding: 0.5rem 0;
}

/* Styles pour le menu utilisateur */
.user-avatar {
  font-size: 1.5rem;
  color: #6c757d;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
}

.user-dropdown {
  min-width: 220px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 0.5rem;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ajouter ces styles à la section style existante */
.btn-primary {
  background-color: #4361ee;
  border-color: #4361ee;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: #3a56d4;
  border-color: #3a56d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.2);
}

.btn-outline-primary {
  color: #4361ee;
  border-color: #4361ee;
  transition: all 0.2s ease;
}

.btn-outline-primary:hover {
  background-color: rgba(67, 97, 238, 0.1);
  color: #3a56d4;
  border-color: #3a56d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.1);
}

.card {
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-body {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .d-flex.gap-2 {
    flex-direction: column;
    width: 100%;
    margin-top: 1rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
