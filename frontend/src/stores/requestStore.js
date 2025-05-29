import { defineStore } from "pinia";

export const useRequestStore = defineStore("requestStore", {
  state: () => ({
    requests: [],
  }),
  actions: {
    setRequests(data) {
      this.requests = data;
    },
    addRequest(req) {
      this.requests.push(req);
    },
  },
});
