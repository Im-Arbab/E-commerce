import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import { userAPI } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { formatDate } from "../../utils/format";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    userAPI
      .list({ page, keyword })
      .then(({ data }) => {
        setUsers(data.users);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [page, keyword]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleBlock = async (u) => {
    try {
      await userAPI.update(u._id, { isBlocked: !u.isBlocked });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isBlocked: !x.isBlocked } : x)));
      toast.success(u.isBlocked ? "User unblocked" : "User blocked");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    try {
      await userAPI.update(u._id, { role: newRole });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role: newRole } : x)));
      toast.success(`Role updated to ${newRole}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name}"?`)) return;
    try {
      await userAPI.remove(u._id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="relative max-w-sm mb-5">
        <input
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="input !pr-9"
        />
        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40" />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card border border-ink/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-ink/50 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-ink/60">{u.email}</td>
                  <td className="px-4 py-3 text-ink/60">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={u._id === currentUser._id}
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === "admin" ? "text-circuit-dark bg-circuit/10" : "text-ink/50 bg-ink/5"} disabled:opacity-50`}
                    >
                      {u.role}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBlock(u)}
                      disabled={u._id === currentUser._id}
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${u.isBlocked ? "text-red-600 bg-red-50" : "text-grade-a bg-grade-a/10"} disabled:opacity-50`}
                    >
                      {u.isBlocked ? "Blocked" : "Active"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={u._id === currentUser._id}
                      className="p-2 text-ink/60 hover:text-red-600 disabled:opacity-30"
                      aria-label="Delete user"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center py-10 text-ink/50 text-sm">No users found.</p>}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} />
    </div>
  );
}
