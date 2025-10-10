import React from "react";

function About() {
  return (
    <div className="bg-gray-50 min-h-screen relative overflow-x-hidden">

      <section
        className="relative py-24 px-6 text-center flex flex-col items-center justify-center bg-cover bg-center min-h-[350px]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gray-100 bg-opacity-80 mix-blend-multiply"></div>
        <div className="relative z-10 max-w-4xl p-10 rounded-lg bg-white bg-opacity-80 shadow-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 font-serif">
            About SafeRoof
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4">
            Your trusted partner in finding the perfect home.
          </p>
          <p className="text-base text-gray-600">
            At SafeRoof, we aim to bridge the gap between dream homes and real-life comfort. Whether you are looking to buy, sell, or rent, we provide a seamless, secure, and stylish platform for all your real estate needs.
          </p>
        </div>
      </section>


      <section className="py-16 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold font-serif mb-6 text-purple-700">Our Mission</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          We believe everyone deserves a safe and beautiful place to live. Our mission is to simplify property searches, ensure transparency, and offer unmatched customer support so you can find your dream home with confidence.
        </p>
      </section>


      <section className="py-16 px-6 text-center bg-purple-100">
        <h2 className="text-3xl font-bold font-serif mb-4 text-purple-700">Ready to Find Your Dream Home?</h2>
        <p className="text-gray-700 mb-6">Explore our listings today and discover the perfect property for you.</p>
        <a
          href="/"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-full transition-colors"
        >
          Browse Listings
        </a>
      </section>

    </div>
  );
}

export default About;
