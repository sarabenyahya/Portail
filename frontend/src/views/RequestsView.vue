<template>
  <div>
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
      <div class="container shadow rounded bg-white p-4 position-relative" style="margin-top: 100px;">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-semibold mb-0">Mes Demandes</h2>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
        </div>

        <!-- Actions -->
        <div class="mb-4 d-flex flex-wrap gap-3">
          <button @click="showLeaveForm = true" class="btn btn-success" :disabled="showLeaveForm">
            Demande de congé
          </button>
          <button @click="requestCertificate" class="btn btn-warning text-white" :disabled="showLeaveForm">
            Demande d'attestation
          </button>
        </div>

        <!-- Formulaire -->
        <transition name="fade">
          <div v-if="showLeaveForm" class="leave-form-wrapper">
            <LeaveForm @close="showLeaveForm = false" @submitted="loadRequests" />
          </div>
        </transition>

        <!-- Tableau -->
        <Table :headers="headers" :data="paginatedRequests" :showActions="true" @onEdit="editRequest"
          @onDelete="deleteRequest">
          <template #cell-startDate="{ row }">
            {{ formatDate(row.startDate) }}
          </template>

          <template #cell-endDate="{ row }">
            {{ formatDate(row.endDate) }}
          </template>

          <template #cell-status="{ row }">
            <span class="badge" :class="getStatusClass(row.status)">
              {{ getStatusLabel(row.status) }}
            </span>
          </template>

          <template #actions="{ row }">
            <button class="btn btn-sm btn-outline-primary me-2" @click="editRequest(row._id)">Modifier</button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteRequest(row._id)">Supprimer</button>
          </template>
        </Table>

        <!-- Pagination -->
        <Pagination v-if="totalPages > 1" :currentPage="currentPage" :totalPages="totalPages"
          @update:currentPage="currentPage = $event" />
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

export default {
  components: { LeaveForm, Table, Pagination },
  data() {
    return {
      showLeaveForm: false,
      userEmail: '',
      notificationCount: 0,
      notifications: [
        { id: 1, message: 'Votre demande de congé a été approuvée', date: new Date() },
        { id: 2, message: 'Nouvelle politique RH disponible', date: new Date(Date.now() - 86400000) }
      ],
      headers: [
        { label: 'Type', value: 'type' },
        { label: 'début', value: 'dateDebut' },
        { label: 'fin', value: 'dateFin' },
        { label: 'Statut', value: 'status' }
      ],
      errorMessage: '',
      currentPage: 1,
      itemsPerPage: 5 // Nombre d'éléments par page
    };
  },
  setup() {
    const requestStore = useRequestStore();
    return { requestStore };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.requestStore.requests.length / this.itemsPerPage);
    },
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.requestStore.requests.slice(start, end);
    }
  },
  async created() {
    try {
      await api.get('/auth/check-session');
      await this.loadUserInfo();
      await this.loadRequests();
    } catch {
      this.$router.push('/');
    }
  },
  methods: {
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
        const response = await api.get('/demands');
        this.requestStore.setRequests(response.data);
        // Réinitialiser à la première page si nécessaire
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = 1;
        }
      } catch (error) {
        console.error('Erreur API:', error);
        this.errorMessage = 'Impossible de charger les demandes';
      }
    },
    async requestCertificate() {
      try {
        const response = await api.post('/demands', {
          type: 'ATTESTATION',
          status: 'EN_ATTENTE'
        });
        console.log('Demande créée:', response.data);
        await this.loadRequests();
      } catch (error) {
        console.error('Erreur lors de la création de la demande:', error);
        this.errorMessage = "Impossible de créer la demande d'attestation de travail";
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
        await api.delete(`/demands/${id}`);
        console.log('Demande supprimée avec succès');

        // Recharger la liste des demandes
        await this.loadRequests();

        // Gérer la pagination si la page actuelle devient vide
        if (this.paginatedRequests.length === 0 && this.currentPage > 1) {
          this.currentPage = this.currentPage - 1;
        }

      } catch (error) {
        console.error('Erreur lors de la suppression de la demande:', error);
        this.errorMessage = 'Impossible de supprimer la demande. Veuillez réessayer.';

        // Afficher l'erreur pendant 5 secondes
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    },
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString();
    },
    getStatusClass(status) {
      const statusClasses = {
        'EN_ATTENTE': 'bg-warning text-dark',
        'accepte': 'bg-success text-white',
        'refuse': 'bg-danger text-white'
      };
      return statusClasses[status] || 'bg-secondary text-white';
    },
    getStatusLabel(status) {
      const labels = {
        'EN_ATTENTE': 'En cours',
        'accepte': 'Accepté',
        'refuse': 'Refusé'
      };
      return labels[status] || status;
    }
  }
};
</script>

<style scoped>
.professional-navbar {
  background-color: #fff;
}

.brand-text {
  margin-left: 0.5rem;
  font-weight: bold;
}

.logo {
  height: 40px;
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 0.7rem;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
}

.leave-form-wrapper {
  margin-bottom: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>