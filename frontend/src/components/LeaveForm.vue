<template>
  <div class="card shadow-sm mb-4 mx-auto" style="max-width: 500px;">
    <div class="card-body">
      <h3 class="card-title mb-4 text-primary text-center">Demande de congé</h3>
      <form @submit.prevent="submit" novalidate>
        <div class="mb-3">
          <label for="startDate" class="form-label fw-semibold">Date de début</label>
          <input id="startDate" type="date" v-model="startDate" class="form-control"
            :class="{ 'is-invalid': startDateError }" required />
          <div class="invalid-feedback" v-if="startDateError">{{ startDateError }}</div>
        </div>
        <div class="mb-4">
          <label for="endDate" class="form-label fw-semibold">Date de fin</label>
          <input id="endDate" type="date" v-model="endDate" class="form-control" :class="{ 'is-invalid': endDateError }"
            required />
          <div class="invalid-feedback" v-if="endDateError">{{ endDateError }}</div>
        </div>
        <div class="d-flex justify-content-between">
          <button type="submit" class="btn btn-primary px-4" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Envoyer
          </button>
          <button type="button" @click="$emit('close')" class="btn btn-outline-danger px-4">
            Annuler
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      startDate: '',
      endDate: ''
    };
  },
  methods: {
    async submit() {
      if (!this.startDate || !this.endDate) {
        alert('Veuillez remplir toutes les dates.');
        return;
      }
      await api.post('/demands', {
        type: 'CONGE',
        status: 'EN_ATTENTE',
        dateDebut: this.startDate,
        dateFin: this.endDate
      });
      this.$emit('submitted');
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.card {
  border-radius: 0.75rem;
}

.btn-primary {
  transition: background-color 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
}
</style>
