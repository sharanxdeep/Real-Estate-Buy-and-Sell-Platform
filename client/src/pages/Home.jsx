import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const query = params.get("query");

        let url = "http://localhost:3000/api/property";
        if (query) {
          url = `http://localhost:3000/api/property/search?query=${encodeURIComponent(query)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success && Array.isArray(data.properties)) {
          setProperties(data.properties);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location.search]);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-6">
      <section className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-purple-700">
          Find Your Dream Property
        </h1>
        <p className="text-gray-500">Search properties</p>
      </section>

      {loading ? (
        <p className="text-center text-gray-500">Loading properties...</p>
      ) : properties.length === 0 ? (
        <p className="text-center text-gray-500">No properties found.</p>
      ) : (
        <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.propertyId}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Property Image */}
              <img
                src={
                  property.images?.[0]?.imageUrl
                    ? `http://localhost:3000${property.images[0].imageUrl}`
                    : "https://via.placeholder.com/400x250?text=No+Image"
                }
                alt={property.title}
                className="object-cover w-full h-56"
              />

              {/* Property Details */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800">
                  {property.title}
                </h3>
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {property.description}
                </p>

                {property.address && (
                  <p className="text-gray-500 mt-2 text-sm">
                    {property.address.city}, {property.address.state}
                  </p>
                )}

                <div className="mt-3 font-bold text-purple-600 text-lg">
                  ₹{property.price}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
