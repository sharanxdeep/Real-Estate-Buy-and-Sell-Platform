import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";

  const fetchProperties = async () => {
    try {
      const endpoint = query
        ? `http://localhost:3000/api/property/search?query=${encodeURIComponent(query)}`
        : `http://localhost:3000/api/property`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.success) {
        setProperties(data.properties);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [query]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <section className="max-w-6xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-purple-700">
          Find Your Dream Property
        </h1>
      </section>

      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.length === 0 ? (
          <p className="text-center text-gray-500 col-span-full">
            No properties found.
          </p>
        ) : (
          properties.map((property) => (
            <div
              key={property.propertyId}
              className="rounded-lg overflow-hidden shadow-lg bg-white flex flex-col hover:shadow-2xl transition duration-300"
            >
              {/* Main Image */}
              <img
                src={
                  property.images?.[0]?.imageUrl
                    ? `http://localhost:3000${property.images[0].imageUrl}`
                    : "https://via.placeholder.com/400x250?text=No+Image"
                }
                alt={property.title}
                className="object-cover w-full h-56"
              />

              {/* Property Info */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {property.title}
                </h3>

                <p className="text-gray-600 mb-3">{property.description}</p>

                {property.address && (
                  <p className="text-gray-600 mb-2">
                    📍 {property.address.locality}, {property.address.city},{" "}
                    {property.address.state}
                  </p>
                )}

                <div className="font-bold text-purple-600 text-xl mb-4">
                  ₹{property.price}
                </div>

                {/* Additional Images */}
                {property.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {property.images.slice(1).map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:3000${img.imageUrl}`}
                        alt={`Property image ${idx + 1}`}
                        className="h-40 w-60 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {/* Owner Info */}
                <p className="mt-3 text-gray-800 font-semibold">
                  Uploaded by:{" "}
                  <span className="text-purple-600">
                    {property.owner
                      ? `${property.owner.firstName} ${property.owner.lastName}`
                      : "Unknown"}
                  </span>
                </p>

                <button
                  onClick={() => alert("Chat feature coming soon!")}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Chat with Owner
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
