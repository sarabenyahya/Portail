<template>
  <nav aria-label="Navigation des pages" class="d-flex justify-content-center mt-4">
    <ul class="pagination pagination-lg shadow-sm">
      <!-- Bouton Précédent -->
      <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
        <button 
          class="page-link border-0 text-primary fw-medium"
          :disabled="currentPage === 1"
          @click="$emit('update:currentPage', currentPage - 1)"
          :tabindex="currentPage === 1 ? -1 : 0"
        >
          <i class="fas fa-chevron-left me-1"></i>
          Précédent
        </button>
      </li>

      <!-- Première page (si pas visible dans la plage) -->
      <li v-if="startPage > 1" class="page-item">
        <button class="page-link border-0 text-dark" @click="$emit('update:currentPage', 1)">
          1
        </button>
      </li>

      <!-- Points de suspension au début -->
      <li v-if="startPage > 2" class="page-item disabled">
        <span class="page-link border-0 text-muted">...</span>
      </li>

      <!-- Pages visibles -->
      <li 
        v-for="page in visiblePages" 
        :key="page" 
        class="page-item"
        :class="{ 'active': page === currentPage }"
      >
        <button 
          class="page-link border-0 fw-medium"
          :class="{
            'bg-primary text-white shadow-sm': page === currentPage,
            'text-dark hover-primary': page !== currentPage
          }"
          @click="$emit('update:currentPage', page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- Points de suspension à la fin -->
      <li v-if="endPage < totalPages - 1" class="page-item disabled">
        <span class="page-link border-0 text-muted">...</span>
      </li>

      <!-- Dernière page (si pas visible dans la plage) -->
      <li v-if="endPage < totalPages" class="page-item">
        <button class="page-link border-0 text-dark" @click="$emit('update:currentPage', totalPages)">
          {{ totalPages }}
        </button>
      </li>

      <!-- Bouton Suivant -->
      <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
        <button 
          class="page-link border-0 text-primary fw-medium"
          :disabled="currentPage === totalPages"
          @click="$emit('update:currentPage', currentPage + 1)"
          :tabindex="currentPage === totalPages ? -1 : 0"
        >
          Suivant
          <i class="fas fa-chevron-right ms-1"></i>
        </button>
      </li>
    </ul>
  </nav>

  <!-- Informations sur la pagination -->
  <div class="d-flex justify-content-center mt-2">
    <small class="text-muted fw-medium">
      Page {{ currentPage }} sur {{ totalPages }}
    </small>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    maxVisiblePages: {
      type: Number,
      default: 5
    }
  },
  computed: {
    startPage() {
      // Calculer la première page visible
      const start = Math.max(1, this.currentPage - Math.floor(this.maxVisiblePages / 2));
      return Math.min(start, Math.max(1, this.totalPages - this.maxVisiblePages + 1));
    },
    endPage() {
      // Calculer la dernière page visible
      return Math.min(this.totalPages, this.startPage + this.maxVisiblePages - 1);
    },
    visiblePages() {
      // Générer la liste des pages visibles
      const pages = [];
      for (let i = this.startPage; i <= this.endPage; i++) {
        pages.push(i);
      }
      return pages;
    }
  }
};
</script>

<style scoped>
.pagination {
  --bs-pagination-padding-x: 0.875rem;
  --bs-pagination-padding-y: 0.5rem;
  --bs-pagination-font-size: 0.95rem;
  --bs-pagination-border-radius: 0.5rem;
}

.page-link {
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  min-width: 2.5rem;
  text-align: center;
}

.page-link:not(.disabled):hover {
  background-color: #f8f9fa;
  color: #0d6efd !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
}

.page-item.disabled .page-link {
  background-color: transparent;
  border-color: transparent;
  color: #6c757d;
  cursor: not-allowed;
}

.hover-primary:hover {
  color: #0d6efd !important;
  background-color: rgba(13, 110, 253, 0.1);
}

/* Animation pour les boutons actifs */
.page-item.active .page-link {
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Responsive design */
@media (max-width: 576px) {
  .pagination {
    --bs-pagination-padding-x: 0.5rem;
    --bs-pagination-padding-y: 0.375rem;
    --bs-pagination-font-size: 0.875rem;
  }
  
  .page-link {
    min-width: 2rem;
  }
  
  /* Cache les numéros sur mobile, garde seulement les flèches */
  .page-item:not(:first-child):not(:last-child) {
    display: none;
  }
}

/* Style pour les points de suspension */
.page-item.disabled .page-link {
  pointer-events: none;
}

/* Amélioration de l'accessibilité */
.page-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  outline: none;
}
</style>