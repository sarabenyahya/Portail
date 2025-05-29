<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="w-100" style="max-width: 400px;">
      <FormBase :fields="loginFields"
                :buttonText="'Se connecter'"
                @onSubmit="handleLogin" />
    </div>
  </div>
</template>
<script>
import api from '@/api'
import FormBase from '@/components/Form.vue'
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
          placeholder: 'Entrez votre email'
        },
        {
          name: 'password',
          label: 'Mot de passe',
          type: 'password',
          placeholder: 'Entrez votre mot de passe'
        }
      ]
    }
  },
  methods: {
    async handleLogin(formData) {
      try {
        await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        }, { withCredentials: true });
        
        this.$router.push('/demands')
      } catch (error) {
        alert('Échec de la connexion')
      }
    }
  }
}
</script>
  