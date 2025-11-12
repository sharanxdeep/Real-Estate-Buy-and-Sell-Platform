import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";

  useEffect(() => {
    checkAuth();
    fetchProperties();
  }, [query]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" });
      const data = await res.json();
      setIsLoggedIn(res.ok && data?.success && !!data.user);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const endpoint = query
        ? `${BACKEND_URL}/api/property/search?query=${encodeURIComponent(query)}`
        : `${BACKEND_URL}/api/property`;
      const res = await fetch(endpoint, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties || []);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    }
  };

  const handleChat = async (property) => {
    if (!property?.propertyId) {
      alert("Property id missing");
      return;
    }

    if (!isLoggedIn) {
      alert("You need to log in first to start a chat");
      navigate("/login");
      return;
    }

    const ownerId = property.ownerId ?? (property.owner && property.owner.userid) ?? null;
    if (!ownerId) {
      alert("Owner id not available for this property");
      return;
    }

    const payload = {
      propertyId: Number(property.propertyId),
      ownerId: Number(ownerId),
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/conversations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Chat create failed:", res.status, text);
        if (res.status === 401) {
          alert("Please log in to start a conversation");
          setIsLoggedIn(false);
          navigate("/login");
          return;
        }
        alert("Unable to start chat");
        return;
      }

      const data = await res.json();
      if (data.success && data.conversation) {
        const id = data.conversation.id;
        navigate(`/chat/${id}`);
        return;
      }

      console.error("Could not create/get conversation", data);
      alert("Unable to start chat");
    } catch (err) {
      console.error("handleChat error:", err);
      alert("Unable to start chat");
    }
  };

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
            <PropertyCard
              key={property.propertyId}
              property={property}
              onChat={() => handleChat(property)}
            />
          ))
        )}
      </section>
    </div>
  );
}

function PropertyCard({ property, onChat }) {
  const images = (property.images || []).map((img) => (img && img.imageUrl ? `http://localhost:3000${img.imageUrl}` : null));
  const mainFallback = "https://via.placeholder.com/400x250?text=No+Image";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [property.propertyId]);

  const total = images.length > 0 ? images.length : 1;
  const currentSrc = images.length > 0 && images[index] ? images[index] : mainFallback;

  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + total) % total);
  };

  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % total);
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-lg bg-white flex flex-col hover:shadow-2xl transition duration-300">
      <div className="relative w-full h-56 bg-gray-100">
        <img src={currentSrc} alt={property.title} className="object-cover w-full h-full" />

        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 focus:outline-none"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 focus:outline-none"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs rounded-full px-3 py-1">
              {index + 1}/{total}
            </div>
          </>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {property.title}
        </h3>

        <p className="text-gray-600 mb-3">{property.description}</p>

        {property.address && (
          <p className="text-gray-600 mb-2">
            📍 {property.address.locality}, {property.address.city}, {property.address.state}
          </p>
        )}

        <div className="font-bold text-purple-600 text-xl mb-4">
          ₹{property.price}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(0, 3).map((src, idx) => (
              <img key={idx} src={src} alt={`thumb ${idx}`} className="h-20 w-28 object-cover rounded-lg" />
            ))}
          </div>
        )}

        <p className="mt-3 text-gray-800 font-semibold">
          Uploaded by:{" "}
          <span className="text-purple-600">
            {property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : "Unknown"}
          </span>
        </p>

        <button
          onClick={onChat}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Chat with Owner
        </button>
      </div>
    </div>
  );
}
