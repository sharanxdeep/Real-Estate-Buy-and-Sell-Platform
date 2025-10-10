import React, { useState } from "react";

const BACKEND_URL = "http://localhost:3000";

export default function ListProperty() {
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
    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("status", formData.status);
      form.append("category", formData.category);
      form.append("locality", formData.locality);
      form.append("city", formData.city);
      form.append("state", formData.state);
      form.append("zipcode", formData.zipcode);
      for (let i = 0; i < formData.images.length; i++) {
        form.append("images", formData.images[i]);
      }

      const res = await fetch(`${BACKEND_URL}/api/properties/list`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to list property");

      const data = await res.json();
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
    } catch (err) {
      console.error(err);
      alert("Error listing property");
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-5 border rounded-xl shadow-md">
      <h1 className="text-3xl font-semibold text-center mb-5">
        List a Property
      </h1>
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
          type="file"
          multiple
          onChange={handleFileChange}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-purple-400 hover:bg-purple-600 text-white p-3 rounded-md mt-3"
        >
          List Property
        </button>
      </form>
    </div>
  );
}
