<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h2 class="mb-0">Demandes de l'employé</h2>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="goBack">
                <i class="fas fa-arrow-left"></i> Retour
              </button>
              <button class="btn btn-primary" @click="loadDemands">
                <i class="fas fa-sync-alt"></i> Actualiser
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center my-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
              </div>
            </div>

            <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <div v-else>
              <div class="employee-info mb-4" v-if="employee">
                <h3>{{ employee.firstName }} {{ employee.lastName }}</h3>
                <p><strong>Email:</strong> {{ employee.email }}</p>
                <p v-if="employee.department"><strong>Département:</strong> {{ employee.department }}</p>
              </div>

              <EmployeeDemandsList :employeeId="employeeId" ref="demandsList" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmployeeDemandsList from '../components/EmployeeDemandsList.vue';
import api from '../api';

export default {
  name: 'EmployeeDemandsView',
  components: {
    EmployeeDemandsList
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const errorMessage = ref('');
    const employee = ref(null);
    const demandsList = ref(null);

    // Récupérer l'ID de l'employé depuis les paramètres de route
    const employeeId = route.params.id;

    // Charger les informations de l'employé
    const loadEmployeeInfo = async () => {
      try {
        loading.value = true;
        errorMessage.value = '';

        const response = await api.get(`/employees/${employeeId}`);
        employee.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des informations de l\'employé:', error);
        errorMessage.value = 'Impossible de charger les informations de l\'employé';
      } finally {
        loading.value = false;
      }
    };

    // Charger les demandes
    const loadDemands = () => {
      if (demandsList.value) {
        demandsList.value.loadDemands();
      }
    };

    // Retourner à la page précédente
    const goBack = () => {
      router.back();
    };

    // Charger les informations au montage du composant
    onMounted(() => {
      loadEmployeeInfo();
    });

    return {
      loading,
      errorMessage,
      employee,
      employeeId,
      demandsList,
      loadDemands,
      goBack
    };
  }
};
</script>