import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const adminService = {
  getCustomerCount: async () => api.get("/admin/customers/count"),
  getCustomers: async () => api.get("/admin/customers"),
  blockCustomer: async (customerId) =>
    api.put(`/admin/customers/${customerId}/block`),
  unblockCustomer: async (customerId) =>
    api.put(`/admin/customers/${customerId}/unblock`),
  deleteCustomer: async (customerId) =>
    api.delete(`/admin/customers/${customerId}`),
};

export default api;
