<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="login-card">
      <div class="text-center mb-4">
        <img src="@/assets/logo.png" alt="Logo" class="login-logo mb-3" />
        <h2 class="login-title">Portail EMS</h2>
        <p class="login-subtitle">Connectez-vous pour accéder à votre espace personnel</p>
      </div>

      <FormBase :fields="loginFields" :buttonText="'Se connecter'" @onSubmit="handleLogin" class="login-form" />

      <div class="text-center mt-4">
        <p class="login-help">Vous n'avez pas de compte? Contactez votre administrateur. </p>
      </div>
    </div>
  </div>
</template>
<script>
import api from '@/api';
import FormBase from '@/components/Form.vue';
export default {
  components: {
    FormBase
  },
  data() {
    return {
      loginFields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'Entrez votre email',
          icon: 'envelope'
        },
        {
          name: 'password',
          label: 'Mot de passe',
          type: 'password',
          placeholder: 'Entrez votre mot de passe',
          icon: 'lock'
        }
      ]
    };
  },
  methods: {
    async handleLogin(formData) {
      try {
        await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        }, { withCredentials: true });

        this.$router.push('/demands');
      } catch (error) {
        alert('Échec de la connexion');
      }
    }
  }
};
</script>
<style scoped>
.login-card {
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-logo {
  height: 70px;
  width: auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.login-title {
  color: #333;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
}

.login-subtitle {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.login-form :deep(.form-label) {
  font-weight: 600;
  font-size: 0.9rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

.login-form :deep(.form-control) {
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  background-color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.login-form :deep(.form-control:focus) {
  border-color: #4361ee;
  box-shadow: 0 0 0 0.25rem rgba(67, 97, 238, 0.15);
}

.login-form :deep(.submit-button) {
  background-color: #4361ee;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.login-form :deep(.submit-button:hover) {
  background-color: #3a56d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.2);
}

.login-help {
  color: #6c757d;
  font-size: 0.9rem;
}

.login-link {
  color: #4361ee;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.login-link:hover {
  color: #3a56d4;
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .login-card {
    padding: 2rem;
    margin: 1rem;
  }

  .login-logo {
    height: 60px;
  }
}
</style>
