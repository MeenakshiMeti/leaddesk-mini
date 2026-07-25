"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const statusStyles = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Closed: "bg-green-100 text-green-700",
};

export default function AdminPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLeads = useCallback(async (searchTerm) => {
    setLoading(true);
    setError("");
    try {
      const url = searchTerm
        ? `/api/leads?search=${encodeURIComponent(searchTerm)}`
        : "/api/leads";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load leads.");
        return;
      }

      setLeads(data.leads);
    } catch (err) {
      setError("Network error while loading leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads("");
  }, [fetchLeads]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, fetchLeads]);

  async function handleStatusChange(leadId, newStatus) {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update status.");
        return;
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      setError("Network error while updating status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Leads Admin
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Log out
          </button>
        </div>
        <p className="text-gray-500 mb-6">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} found
        </p>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm mb-6 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No leads found{search ? ` for "${search}"` : ""}.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.budgetRange}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {lead.message}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead._id}
                        onChange={(e) =>
                          handleStatusChange(lead._id, e.target.value)
                        }
                        className={`text-xs font-medium rounded-full px-3 py-1.5 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${
                          statusStyles[lead.status]
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}