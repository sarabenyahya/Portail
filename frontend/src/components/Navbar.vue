<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div class="container-fluid">
            <!-- Logo/Brand -->
            <router-link to="/" class="navbar-brand d-flex align-items-center">
                <img src="@/assets/logo.png" alt="Company Logo" class="logo" />
            </router-link>

            <!-- Toggle button for mobile -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Navbar content -->
            <div class="collapse navbar-collapse" id="navbarNav">
                <!-- Navigation links -->
                <ul class="navbar-nav me-auto ms-4">
                    <li class="nav-item">
                        <router-link class="nav-link active" to="/demands">
                            <i class="fas fa-file-alt me-1"></i>
                            Mes Demandes
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/profile">
                            <i class="fas fa-user me-1"></i>
                            Mon Profil
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/calendar">
                            <i class="fas fa-calendar me-1"></i>
                            Calendrier
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/documents">
                            <i class="fas fa-folder me-1"></i>
                            Documents
                        </router-link>
                    </li>
                </ul>

                <!-- User info and actions -->
                <ul class="navbar-nav">
                    <!-- Logout button -->
                    <li class="nav-item d-flex align-items-center">
                        <button class="btn btn-outline-danger btn-sm" @click="logout">
                            <i class="fas fa-sign-out-alt me-1"></i>
                            Se déconnecter
                        </button>
                    </li>
                    <!-- Notifications -->
                    <li class="nav-item dropdown">
                        <a class="nav-link position-relative" href="#" role="button" data-bs-toggle="dropdown">
                            <i class="fas fa-bell"></i>
                            <span v-if="notifications > 0"
                                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {{ notifications }}
                            </span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <h6 class="dropdown-header">Notifications</h6>
                            </li>
                            <li><a class="dropdown-item" href="#">Demande de congé approuvée</a></li>
                            <li><a class="dropdown-item" href="#">Nouvelle attestation disponible</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item text-center small" href="#">Voir toutes</a></li>
                        </ul>
                    </li>

                    <!-- User menu -->
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                            data-bs-toggle="dropdown">
                            <div class="user-avatar me-2">
                                <i class="fas fa-user-circle fa-lg"></i>
                            </div>
                            <!-- Affichage du nom de l'employé -->
                            <span class="d-none d-md-inline">{{ employeeName || userEmail }}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <!-- Header avec nom et email -->
                                <div class="dropdown-header">
                                    <div class="fw-bold">{{ employeeName || 'Employé' }}</div>
                                    <small class="text-muted">{{ userEmail }}</small>
                                </div>
                            </li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li>
                                <router-link class="dropdown-item" to="/profile">
                                    <i class="fas fa-user me-2"></i>Mon Profil
                                </router-link>
                            </li>
                            <li>
                                <router-link class="dropdown-item" to="/settings">
                                    <i class="fas fa-cog me-2"></i>Paramètres
                                </router-link>
                            </li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li>
                                <a class="dropdown-item text-danger" href="#" @click="logout">
                                    <i class="fas fa-sign-out-alt me-2"></i>Se déconnecter
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import api from '@/api';

export default {
    name: 'ProfessionalNavbar',
    data() {
        return {
            userEmail: '',
            employeeName: '', // Nouveau champ pour le nom de l'employé
            notifications: 2, // Exemple de notifications
        };
    },
    async created() {
        await this.loadUserInfo();
    },
    methods: {
        async loadUserInfo() {
            try {
                const { data } = await api.get('/auth/me'); // Endpoint pour récupérer les infos utilisateur
                this.userEmail = data.email;
                this.employeeName = data.name; // Récupération du nom de l'employé
            } catch (error) {
                console.error('Erreur lors du chargement des infos utilisateur:', error);
                // Fallback si pas d'endpoint /me
                this.userEmail = localStorage.getItem('userEmail') || 'utilisateur@example.com';
                this.employeeName = localStorage.getItem('employeeName') || '';
            }
        },
        async logout() {
            try {
                await api.post('/auth/logout');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('employeeName'); // Nettoyage du nom
                this.$router.push('/');
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                this.$router.push('/');
            }
        }
    }
};
</script>

<style scoped>
.navbar {
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.navbar-brand {
    font-size: 1.5rem;
    color: #ffffff !important;
    text-decoration: none;
}

/* Styles pour le logo */
.logo {
    height: 40px;
    /* Ajustez cette valeur selon vos besoins */
    width: auto;
    /* Maintient les proportions */
    max-width: 150px;
    /* Largeur maximale */
    object-fit: contain;
    /* Maintient les proportions sans déformation */
}

/* Version responsive du logo */
@media (max-width: 768px) {
    .logo {
        height: 35px;
        /* Plus petit sur mobile */
        max-width: 120px;
    }
}

.nav-link {
    transition: all 0.3s ease;
    border-radius: 0.375rem;
    margin: 0 0.25rem;
    padding: 0.5rem 0.75rem !important;
}

.nav-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
}

.nav-link.active {
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: 600;
}

.user-avatar {
    color: #ffffff;
}

.dropdown-menu {
    border: none;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    min-width: 200px;
}

.dropdown-header {
    padding: 0.5rem 1rem;
    margin-bottom: 0;
    font-size: 0.875rem;
    color: #6c757d;
    white-space: nowrap;
    border-bottom: 1px solid #dee2e6;
}

.dropdown-item {
    transition: all 0.2s ease;
    border-radius: 0.25rem;
    margin: 0.125rem 0.5rem;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
    transform: translateX(5px);
}

.badge {
    font-size: 0.6rem;
}

@media (max-width: 768px) {
    .navbar-nav {
        text-align: center;
    }

    .dropdown-menu {
        position: static !important;
        float: none;
        width: 100%;
        margin-top: 0;
        border: none;
        box-shadow: none;
    }
}
</style>