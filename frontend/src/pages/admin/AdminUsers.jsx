import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { useEffect, useState } from "react";
import { Search, Trash2, Lock, Unlock } from "lucide-react";
import { adminService } from "@/services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const phone = user.phone ?? "";
      return (
        fullName.includes(lowercaseSearch) ||
        user.email.toLowerCase().includes(lowercaseSearch) ||
        phone.includes(searchTerm)
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminService.getCustomers();
      setUsers(response.data ?? []);
      setFilteredUsers(response.data ?? []);
    } catch (err) {
      setError("Failed to load customers.");
      console.error("Error fetching customers:", err);
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

  const handleBlockToggle = async (user) => {
    try {
      setActionLoading(user.id);
      const response = user.enabled
        ? await adminService.blockCustomer(user.id)
        : await adminService.unblockCustomer(user.id);
      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((item) => (item.id === updatedUser.id ? updatedUser : item))
      );
    } catch (err) {
      console.error("Error updating customer status:", err);
      alert("Failed to update customer status.");
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
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    if (!window.confirm(`Delete ${selectedUsers.size} selected customer(s)?`)) {
      return;
    }

    try {
      setActionLoading("bulk-delete");
      const ids = Array.from(selectedUsers);
      await Promise.all(ids.map((id) => adminService.deleteCustomer(id)));
      setUsers((prev) => prev.filter((user) => !selectedUsers.has(user.id)));
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("Error bulk deleting customers:", err);
      alert("Failed to delete one or more customers.");
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (enabled) => {
    if (enabled) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        BLOCKED
      </span>
    );
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Customer Management
            </h1>
            <p className="text-muted-foreground">
              Manage customer accounts from the Sanaru database.
            </p>
          </div>
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
                {actionLoading === "bulk-delete"
                  ? "Deleting..."
                  : `Delete (${selectedUsers.size})`}
              </button>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                Retry
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No customers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.size === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-muted transition"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">
                          {`${user.firstName} ${user.lastName}`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                          {user.phone || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.enabled)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleBlockToggle(user)}
                            disabled={actionLoading === user.id}
                            title={user.enabled ? "Block customer" : "Unblock customer"}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded transition disabled:opacity-50"
                          >
                            {user.enabled ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading === user.id}
                            title="Delete customer"
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
            <strong className="ml-4">Active:</strong>{" "}
            {users.filter((u) => u.enabled).length} |
            <strong className="ml-4">Blocked:</strong>{" "}
            {users.filter((u) => !u.enabled).length}
          </p>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
