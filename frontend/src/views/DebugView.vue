<template>
  <div class="debug-container">
    <h1>Page de débogage</h1>

    <div v-if="loading" class="alert alert-info">
      Chargement des données...
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="debugData" class="debug-data">
      <h3>Informations de session</h3>
      <pre>{{ JSON.stringify(debugData.requestInfo, null, 2) }}</pre>

      <h3>Demandes de l'employé ({{ debugData.employeeDemandsCount }})</h3>
      <pre>{{ JSON.stringify(debugData.employeeDemands, null, 2) }}</pre>

      <p>Nombre total de demandes: {{ debugData.allDemandsCount }}</p>
    </div>

    <button @click="loadDebugData" class="btn btn-primary">
      Recharger les données
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      error: null,
      debugData: null
    };
  },

  mounted() {
    this.loadDebugData();
  },

  methods: {
    async loadDebugData() {
      try {
        this.loading = true;
        this.error = null;

        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:3000/api/demands/debug-frontend?_=${timestamp}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        this.debugData = await response.json();
        console.log("Données de débogage:", this.debugData);

      } catch (error) {
        console.error('Erreur:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.debug-container {
  padding: 20px;
}

.debug-data {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

pre {
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}
</style>