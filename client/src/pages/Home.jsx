import React, { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:3000";

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/properties`);
        const data = await res.json();
        if (!data.success)
          throw new Error(data.message || "Failed to fetch properties");
        setProperties(data.properties);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading)
    return <div className="text-center py-20">Loading properties...</div>;

  return (
    <div className="bg-gray-50 min-h-screen relative overflow-x-hidden">
      <section
        className="relative py-24 px-6 text-center flex flex-col items-center justify-center bg-cover bg-center min-h-[350px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gray-100 bg-opacity-80 mix-blend-multiply"></div>
        <div className="relative z-10 max-w-4xl p-10 rounded-lg bg-white bg-opacity-80 shadow-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 font-serif">
            SafeRoof: Your Dream Home Awaits
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4">
            Where comfort meets style in the perfect space.
          </p>
          <p className="text-base text-gray-600">
            Explore the finest properties tailored for your lifestyle. Find
            security, elegance, and warmth all under one SafeRoof.
          </p>
          <span className="mt-5 inline-block text-purple-700 font-semibold text-lg">
            Start your next chapter here.
          </span>
        </div>
      </section>

      <section className="py-12 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl text-center font-bold font-serif mb-12">
          Featured Properties
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {properties.map((property) => (
            <div
              key={property.propertyId}
              className="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500 bg-white flex flex-col"
            >
              <img
                src={
                  property.images?.[0]?.imageUrl
                    ? `${BACKEND_URL}${property.images[0].imageUrl}`
                    : "https://via.placeholder.com/400x250"
                }
                alt={property.title}
                className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300"
              />

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800">
                  {property.title}
                </h3>
                <p className="mt-1 text-gray-600">
                  {property.address?.city}, {property.address?.state}
                </p>
                <div className="mt-auto font-bold text-purple-600 text-xl">
                  ₹{property.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
