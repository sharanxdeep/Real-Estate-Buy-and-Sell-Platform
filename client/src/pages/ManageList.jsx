import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000";

export default function ManageList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const meRes = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        if (!meRes.ok || !meData.success) {
          if (mounted) {
            setProperties([]);
            setLoading(false);
          }
          return;
        }
        const userId = meData.user.userid;

        const res = await fetch(`${BACKEND_URL}/api/property`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          if (mounted) {
            setProperties([]);
            setLoading(false);
            setError(data.message || "Failed to fetch properties");
          }
          return;
        }

        const myProps = (data.properties || []).filter((p) => Number(p.ownerId) === Number(userId));
        if (mounted) {
          setProperties(myProps);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setProperties([]);
          setLoading(false);
          setError(err.message || "Network error");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const startEdit = (p) => {
    setEditingId(p.propertyId);
    setForm({
      title: p.title || "",
      description: p.description || "",
      price: String(p.price || ""),
      status: p.status || "Available",
      category: p.category || "",
      locality: p.address?.locality || "",
      city: p.address?.city || "",
      state: p.address?.state || "",
      zipcode: p.address?.zipcode || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (propertyId) => {
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        status: form.status,
        category: form.category,
        locality: form.locality,
        city: form.city,
        state: form.state,
        zipcode: form.zipcode,
      };

      const res = await fetch(`${BACKEND_URL}/api/property/${propertyId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Update failed");
        return;
      }

      setProperties((prev) =>
        prev.map((p) => (p.propertyId === propertyId ? data.property : p))
      );

      setEditingId(null);
      setForm({});
    } catch (err) {
      alert("Update error");
    }
  };

  const deleteProp = async (propertyId) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/property/${propertyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Delete failed");
        return;
      }
      setProperties((prev) => prev.filter((p) => p.propertyId !== propertyId));
    } catch (err) {
      alert("Delete error");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading your listings...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">

      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Manage Listings</h2>
        <button
          onClick={() => navigate("/list-property")}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          List Property
        </button>
      </div>

      
      {properties.length === 0 && (
        <div className="p-6 text-center bg-white rounded shadow">
          <p className="text-gray-600">You have no property listings yet.</p>
        </div>
      )}

      {properties.length > 0 && (
        <div className="flex flex-col gap-4">
          {properties.map((p) => (
            <div key={p.propertyId} className="bg-white p-4 rounded shadow flex flex-col">
              {editingId === p.propertyId ? (
                <>
                  <input name="title" value={form.title} onChange={handleChange} className="border p-2 rounded mb-2" />
                  <textarea name="description" value={form.description} onChange={handleChange} className="border p-2 rounded mb-2" />
                  <input name="price" value={form.price} onChange={handleChange} type="number" className="border p-2 rounded mb-2" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveEdit(p.propertyId)} className="px-3 py-2 bg-green-500 text-white rounded">Save</button>
                    <button onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{p.title}</h3>
                      <p className="text-sm text-gray-600">₹{p.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(p)} className="px-3 py-2 bg-yellow-400 rounded">Edit</button>
                      <button onClick={() => deleteProp(p.propertyId)} className="px-3 py-2 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">{p.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
