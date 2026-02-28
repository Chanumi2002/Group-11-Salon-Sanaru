import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService } from "@/services/api";
import { useEffect, useState } from "react";
import { Search, Trash2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowercaseSearch) ||
        user.email.toLowerCase().includes(lowercaseSearch) ||
        user.phone.toLowerCase().includes(lowercaseSearch)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCustomers();
      const mappedUsers = (response.data || []).map((user) => ({
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        email: user.email || "",
        phone: user.phone || "-",
        status: user.enabled === false ? "BLOCKED" : "ACTIVE",
        role: user.role || "CUSTOMER",
        joinDate: user.createdAt || null,
      }));
      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleBlockUser = async (user) => {
    try {
      setActionLoading(user.id);

      const response =
        user.status === "BLOCKED"
          ? await adminService.unblockCustomer(user.id)
          : await adminService.blockCustomer(user.id);

      const updatedStatus = response.data?.enabled === false ? "BLOCKED" : "ACTIVE";

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? { ...u, status: updatedStatus } : u))
      );

      toast.success(updatedStatus === "BLOCKED" ? "Customer blocked" : "Customer unblocked");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error(error.response?.data?.message || "Failed to update customer status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      setActionLoading(userId);
      await adminService.deleteCustomer(userId);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setSelectedUsers((prevSelected) => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(userId);
        return newSelected;
      });

      toast.success("Customer deleted");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete customer");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    if (!window.confirm(`Delete ${selectedUsers.size} selected customer(s)?`)) return;

    try {
      setActionLoading("bulk-delete");
      const idsToDelete = Array.from(selectedUsers);
      await Promise.all(idsToDelete.map((userId) => adminService.deleteCustomer(userId)));

      setUsers((prevUsers) => prevUsers.filter((user) => !selectedUsers.has(user.id)));
      setSelectedUsers(new Set());
      toast.success("Selected customers deleted");
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      toast.error(error.response?.data?.message || "Failed to delete selected customers");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ACTIVE: "bg-green-100 text-green-800",
      BLOCKED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || statusClasses.ACTIVE}`}
      >
        {status}
      </span>
    );
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Management</h1>
          <p className="text-muted-foreground">Manage registered customers and account access.</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {selectedUsers.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading === "bulk-delete"}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {actionLoading === "bulk-delete" ? "Deleting..." : `Delete (${selectedUsers.size})`}
              </button>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Join Date</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleBlockUser(user)}
                            disabled={actionLoading === user.id || actionLoading === "bulk-delete"}
                            title={user.status === "BLOCKED" ? "Unblock user" : "Block user"}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded transition disabled:opacity-50"
                          >
                            {user.status === "BLOCKED" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id || actionLoading === "bulk-delete"}
                            title="Delete user"
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded transition disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Total Customers:</strong> {users.length} |
            <strong className="ml-4">Active:</strong> {users.filter((u) => u.status === "ACTIVE").length} |
            <strong className="ml-4">Blocked:</strong> {users.filter((u) => u.status === "BLOCKED").length}
          </p>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
