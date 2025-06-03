import { defineStore } from "pinia";

export const useRequestStore = defineStore("requestStore", {
  state: () => ({
    requests: [],
  }),
  actions: {
    setRequests(requests) {
      this.requests = requests;
    },
    addRequest(req) {
      this.requests.push(req);
    },
    deleteRequest(id) {
      this.requests = this.requests.filter((req) => req._id !== id);
    },
  },
});
