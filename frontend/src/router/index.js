import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RequestsView from "../views/RequestsView.vue";

const routes = [
  { path: "/", name: "Login", component: LoginView },
  { path: "/demands", name: "Requests", component: RequestsView },
  // Route pour les demandes d'un employé spécifique
  {
    path: "/employees/:id/demands",
    name: "EmployeeDemands",
    component: () => import("../views/EmployeeDemandsView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
