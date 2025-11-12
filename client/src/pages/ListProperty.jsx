import React, { useState, useRef } from "react";

const BACKEND_URL = "http://localhost:3000";

export default function ListProperty() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    status: "Available",
    category: "Residential",
    locality: "",
    city: "",
    state: "",
    zipcode: "",
    images: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "zipcode") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!formData.title || !formData.description || !formData.price) {
      alert("Title, description and price are required");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("status", formData.status);
      fd.append("category", formData.category);
      fd.append("locality", formData.locality);
      fd.append("city", formData.city);
      fd.append("state", formData.state);
      fd.append("zipcode", formData.zipcode);

      const files = formData.images || [];
      for (let i = 0; i < files.length; i++) {
        fd.append("images", files[i]); // must match multer field name "images"
      }

      const res = await fetch(`${BACKEND_URL}/api/property`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = { success: false, message: text || "Unexpected response" };
      }

      console.log("ListProperty -> response:", res.status, data);

      if (!res.ok || !data.success) {
        const msg = data?.message || `status ${res.status}`;
        alert("Failed to list property: " + msg);
        setSubmitting(false);
        return;
      }

      alert("Property listed successfully!");
      setFormData({
        title: "",
        description: "",
        price: "",
        status: "Available",
        category: "Residential",
        locality: "",
        city: "",
        state: "",
        zipcode: "",
        images: [],
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Network/client error listing property:", err);
      alert("Error listing property: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-5 border rounded-xl shadow-md">
      <h1 className="text-3xl font-semibold text-center mb-5">List a Property</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border p-2 rounded-md"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          className="border p-2 rounded-md"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          className="border p-2 rounded-md"
          name="price"
          type="number"
          placeholder="Price (INR)"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border p-2 rounded-md"
        >
          <option value="Available">Available</option>
          <option value="Sold">Sold</option>
        </select>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded-md"
        >
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Land">Land</option>
        </select>
        <input
          className="border p-2 rounded-md"
          name="locality"
          placeholder="Locality"
          value={formData.locality}
          onChange={handleChange}
        />
        <input
          className="border p-2 rounded-md"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        <input
          className="border p-2 rounded-md"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />
        <input
          className="border p-2 rounded-md"
          name="zipcode"
          placeholder="Zipcode (6 digits)"
          value={formData.zipcode}
          onChange={handleChange}
          required
          maxLength={6}
          pattern="[0-9]{6}"
          title="Zipcode must be 6 digits"
        />
        <input
          name="images"
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-purple-400 hover:bg-purple-600 text-white p-3 rounded-md mt-3 disabled:opacity-60"
        >
          {submitting ? "Listing..." : "List Property"}
        </button>
      </form>
    </div>
  );
}
