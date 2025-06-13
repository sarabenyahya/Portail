<template>
  <div class="employee-details">
    <h2>Détails de l'employé</h2>

    <!-- Informations de l'employé -->
    <div v-if="employee" class="card mb-4">
      <div class="card-body">
        <h3>{{ employee.firstName }} {{ employee.lastName }}</h3>
        <p><strong>Email:</strong> {{ employee.email }}</p>
        <p><strong>Département:</strong> {{ employee.department || 'Non spécifié' }}</p>
      </div>
    </div>

    <!-- Liste des demandes de l'employé -->
    <div class="card">
      <div class="card-header">
        <h4>Demandes de l'employé</h4>
      </div>
      <div class="card-body">
        <EmployeeDemandsList :employeeId="employeeId" />
      </div>
    </div>
  </div>
</template>

<script>
import EmployeeDemandsList from '../components/EmployeeDemandsList.vue';
import api from '../api';

export default {
  name: 'EmployeeDetailsView',
  components: {
    EmployeeDemandsList
  },
  data() {
    return {
      employeeId: null,
      employee: null,
      loading: false,
      error: null
    };
  },
  created() {
    // Récupérer l'ID de l'employé depuis les paramètres de l'URL
    this.employeeId = this.$route.params.id;
    this.loadEmployeeDetails();
  },
  methods: {
    async loadEmployeeDetails() {
      try {
        this.loading = true;
        const response = await api.get(`/employees/${this.employeeId}`);
        this.employee = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des détails de l\'employé:', error);
        this.error = 'Impossible de charger les détails de l\'employé';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>