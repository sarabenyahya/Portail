<template>
  <div class="bg-light py-5 min-vh-100">
    <div class="container shadow rounded bg-white p-4 position-relative">

      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-semibold mb-0">Mes Demandes</h2>
        <button @click="logout" class="btn btn-outline-danger">Se déconnecter</button>
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
      <Table :headers="headers" :data="requestStore.requests" :showActions="true" @onEdit="editRequest"
        @onDelete="deleteRequest">
        <template #cell-dateDebut="{ row }">
          {{ formatDate(row.dateDebut) }}
        </template>

        <template #cell-dateFin="{ row }">
          {{ formatDate(row.dateFin) }}
        </template>

        <template #cell-status="{ row }">
          <span class="badge" :class="getStatusClass(row.status)">
            {{ getStatusLabel(row.status) }}
          </span>
        </template>

        <template #actions="{ row }">
          <button class="btn btn-sm btn-outline-primary me-2" @click="$emit('onEdit', row._id)">Modifier</button>
          <button class="btn btn-sm btn-outline-danger" @click="$emit('onDelete', row._id)">Supprimer</button>
        </template>
      </Table>

    </div>
  </div>
</template>

<script>
import api from '@/api';
import { useRequestStore } from '../stores/requestStore';
import LeaveForm from '../components/LeaveForm.vue';
import Table from '../components/Table.vue';
import Navbar from '../components/Navbar.vue';

export default {
  components: { LeaveForm, Table, Navbar },
  data() {
    return {
      showLeaveForm: false,
      requestStore: useRequestStore(),
      headers: [
        { label: 'Type', value: 'type' },
        { label: 'Début', value: 'dateDebut' },
        { label: 'Fin', value: 'dateFin' },
        { label: 'Statut', value: 'status' }
      ]
    };
  },
  async created() {
    try {
      await api.get('/auth/check-session');
      this.loadRequests();
    } catch {
      this.$router.push('/');
    }
  },
  methods: {
    async loadRequests() {
      const { data } = await api.get('/demands');
      this.requestStore.setRequests(data);
      this.showLeaveForm = false;  // Assure la fermeture après chargement
    },
    async requestCertificate() {
      await api.post('/demands', {
        type: 'ATTESTATION',
        status: 'EN_ATTENTE'
      });
      this.loadRequests();
    },
    async logout() {
      await api.post('/auth/logout');
      this.$router.push('/');
    },
    editRequest(id) {
      alert('Édition de la demande ' + id);
    },
    deleteRequest(id) {
      alert('Suppression de la demande ' + id);
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
    getStatusClass(status) {
      const statusClasses = {
        'EN_ATTENTE': 'bg-warning text-dark',
        'ACCEPTE': 'bg-success',
        'REFUSE': 'bg-danger'
      };
      return statusClasses[status] || 'bg-secondary';
    },
    getStatusLabel(status) {
      const statusLabels = {
        'EN_ATTENTE': 'En attente',
        'ACCEPTE': 'Accepté',
        'REFUSE': 'Refusé'
      };
      return statusLabels[status] || status;
    }
  }
};
</script>

<style scoped>
.leave-form-wrapper {
  max-width: 520px;
  margin: 0 auto 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  box-shadow: 0 0 12px rgb(0 0 0 / 0.1);
}

/* Simple transition fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
