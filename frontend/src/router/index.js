import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RequestsView from "../views/RequestsView.vue";

const routes = [
  { path: "/", name: "Login", component: LoginView },
  { path: "/demands", name: "Requests", component: RequestsView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
