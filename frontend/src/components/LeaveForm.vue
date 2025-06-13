<template>
  <div class="leave-form-container">
    <div class="leave-form-card">
      <div class="leave-form-header">
        <div>
          <h5 class="leave-form-title">Demande de congé</h5>
          <p class="leave-form-subtitle">Veuillez remplir les informations ci-dessous</p>
        </div>
        <button type="button" class="leave-form-close" @click="$emit('close')">×</button>
      </div>

      <div class="leave-form-body">
        <form @submit.prevent="submit" novalidate>
          <div class="form-group">
            <label for="startDate">Date de début</label>
            <input id="startDate" type="date" v-model="startDate" class="form-control"
              :class="{ 'is-invalid': startDateError }" required />
            <div class="invalid-feedback" v-if="startDateError">{{ startDateError }}</div>
          </div>

          <div class="form-group">
            <label for="endDate">Date de fin</label>
            <input id="endDate" type="date" v-model="endDate" class="form-control"
              :class="{ 'is-invalid': endDateError }" required />
            <div class="invalid-feedback" v-if="endDateError">{{ endDateError }}</div>
          </div>

          <div class="form-group">
            <label for="leaveType">Type de congé</label>
            <select id="leaveType" class="form-control" v-model="leaveType">
              <option value="CONGE_PAYE">Congé payé</option>
              <option value="CONGE_SANS_SOLDE">Congé sans solde</option>
              <option value="MALADIE">Congé maladie</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div class="form-group" v-if="leaveType === 'AUTRE'">
            <label for="leaveReason">Motif</label>
            <textarea id="leaveReason" class="form-control" v-model="leaveReason" rows="3"
              placeholder="Veuillez préciser le motif de votre demande"></textarea>
          </div>

          <div class="leave-form-info" v-if="calculateDays > 0">
            <i class="fas fa-info-circle"></i>
            Durée totale : <strong>{{ calculateDays }} jour(s)</strong>
          </div>
        </form>
      </div>

      <div class="leave-form-footer">
        <button type="button" class="btn-cancel" @click="$emit('close')">
          Annuler
        </button>
        <button type="button" class="btn-submit" @click="submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          Soumettre la demande
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      startDate: '',
      endDate: '',
      leaveType: 'CONGE_PAYE',
      leaveReason: '',
      startDateError: '',
      endDateError: '',
      loading: false
    };
  },
  computed: {
    calculateDays() {
      if (!this.startDate || !this.endDate) return 0;

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      if (start > end) return 0;

      // Calculer le nombre de jours ouvrables (lundi-vendredi)
      let days = 0;
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          days++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return days;
    }
  },
  methods: {
    validateDates() {
      let isValid = true;
      this.startDateError = '';
      this.endDateError = '';

      if (!this.startDate) {
        this.startDateError = 'La date de début est requise';
        isValid = false;
      }

      if (!this.endDate) {
        this.endDateError = 'La date de fin est requise';
        isValid = false;
      }

      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        if (start > end) {
          this.endDateError = 'La date de fin doit être postérieure à la date de début';
          isValid = false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (start < today) {
          this.startDateError = 'La date de début ne peut pas être dans le passé';
          isValid = false;
        }
      }

      return isValid;
    },
    async submit() {
      if (!this.validateDates()) {
        return;
      }

      try {
        this.loading = true;

        await api.post('/demands', {
          type: 'CONGE',
          subType: this.leaveType,
          status: 'EN_ATTENTE',
          dateDebut: this.startDate,
          dateFin: this.endDate,
          motif: this.leaveType === 'AUTRE' ? this.leaveReason : null
        });

        this.$emit('submitted');
        this.$emit('close');
      } catch (error) {
        console.error('Erreur lors de la création de la demande:', error);
        alert('Une erreur est survenue lors de la création de la demande.');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.leave-form-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.leave-form-card {
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.leave-form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.leave-form-title {
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem;
}

.leave-form-subtitle {
  color: #6c757d;
  margin: 5px 0 0;
  font-size: 0.875rem;
}

.leave-form-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #6c757d;
  cursor: pointer;
}

.leave-form-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  color: #495057;
}

.form-control {
  display: block;
  width: 100%;
  padding: 10px 12px;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 80%;
  color: #dc3545;
}

.leave-form-info {
  padding: 12px;
  margin-top: 10px;
  background-color: #e8f4fd;
  border-radius: 4px;
  color: #0c63e4;
  font-size: 0.875rem;
}

.leave-form-info i {
  margin-right: 8px;
}

.leave-form-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn-cancel {
  padding: 8px 16px;
  margin-right: 10px;
  background-color: #f8f9fa;
  border: 1px solid #6c757d;
  border-radius: 4px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  padding: 8px 16px;
  background-color: #0d6efd;
  border: 1px solid #0d6efd;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-submit:hover:not(:disabled) {
  background-color: #0b5ed7;
}

.btn-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 576px) {
  .leave-form-card {
    max-width: 95%;
    margin: 10px;
  }

  .leave-form-header,
  .leave-form-body,
  .leave-form-footer {
    padding: 15px;
  }
}
</style>
