<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-primary text-white px-4">
        <div class="container-fluid">
            <a class="navbar-brand text-white" href="#">
                Bienvenue, {{ userEmail || 'Utilisateur' }}
            </a>
        </div>
    </nav>
</template>

<script>
import api from '@/api';

export default {
    data() {
        return {
            userEmail: ''
        };
    },
    async created() {
        try {
            // Appel vers l'API pour récupérer l'utilisateur connecté
            const { data } = await api.get('/auth/me');
            this.userEmail = data.email;
        } catch {
            this.userEmail = 'Utilisateur';
        }
    }
};
</script>

<style scoped>
.navbar {
    font-weight: 600;
    font-size: 1.2rem;
}
</style>