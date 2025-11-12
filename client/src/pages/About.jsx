import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import bg from "../assets/about-bg.jpg";

const BACKEND_URL = "http://localhost:3000";

export default function About() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average: 0 });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchSummary();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews`);
      const data = await res.json();
      if (res.ok && data.success) setReviews(data.reviews || []);
    } catch (err) {}
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews/summary`);
      const data = await res.json();
      if (res.ok && data.success) setSummary(data.summary || { total: 0, average: 0 });
    } catch (err) {}
  };

  const handleListClick = async () => {
    const token = (() => {
      try {
        return localStorage.getItem("access_token") || localStorage.getItem("token") || null;
      } catch {
        return null;
      }
    })();

    if (token) {
      navigate("/list-property");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data?.success && data?.user) {
        navigate("/list-property");
        return;
      }
    } catch (err) {}
    alert("Please login to list a property");
  };

  const userReview = (() => {
    if (!currentUser) return null;
    return (
      reviews.find((r) => {
        if (r.user && (r.user.userid || r.user.userid === 0)) return Number(r.user.userid) === Number(currentUser.userid);
        if (r.userId) return Number(r.userId) === Number(currentUser.userid);
        return false;
      }) || null
    );
  })();

  const submitReview = async (e) => {
    e?.preventDefault();
    if (!currentUser) {
      alert("Please login to submit a review");
      return;
    }
    if (userReview) {
      alert("You have already submitted a review");
      return;
    }
    if (!comment.trim()) {
      alert("Please write a review");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: Number(rating), comment: String(comment).trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data?.message || "Unable to post review");
        setSubmitting(false);
        return;
      }
      setComment("");
      setRating(5);
      await fetchSummary();
      await fetchReviews();
    } catch (err) {
      alert("Unable to post review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete your review?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data?.message || "Unable to delete review");
        return;
      }
      await fetchSummary();
      await fetchReviews();
    } catch (err) {
      alert("Unable to delete review");
    }
  };

  return (
    <main className="min-h-screen text-gray-800">
      <section className="relative w-full h-[48vh] md:h-[56vh] lg:h-[64vh] bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }} aria-label="Modern city skyline background">
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-10 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">About SafeRoof</h1>
              <p className="mt-3 text-white/90 text-base md:text-lg">SafeRoof is a technology-driven real estate marketplace designed to make property discovery and transactions transparent, fast, and reliable. We connect real owners with genuine buyers and renters — no middlemen, no hidden steps.</p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button onClick={handleListClick} className="inline-flex items-center justify-center px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md text-sm font-medium">List Your Property</button>
                <a href="/about#mission" className="inline-flex items-center justify-center px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium border border-white/10">Learn Our Mission</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Who we are</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">SafeRoof is built by real-estate and product professionals who believe in clarity and trust. Our platform combines verified listings, direct owner–buyer messaging, and powerful search tools to help people find homes and commercial spaces with confidence.</p>

            <h3 className="mt-8 text-xl font-semibold text-gray-800">Our mission</h3>
            <p className="mt-2 text-gray-600">To simplify property discovery and transactions by creating an accessible, secure, and user-first marketplace for owners and seekers.</p>

            <h3 className="mt-8 text-xl font-semibold text-gray-800">Our vision</h3>
            <p className="mt-2 text-gray-600">To be the most trusted real-estate network in India — empowering users to make confident decisions backed by transparency and technology.</p>
          </div>

          <aside className="bg-white rounded-xl border p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-800">What we provide</h4>
            <ul className="mt-4 space-y-3 text-gray-600">
              <li className="flex items-start gap-3"><span className="inline-block mt-1 text-purple-600">•</span><span>Verified property listings with multiple photos</span></li>
              <li className="flex items-start gap-3"><span className="inline-block mt-1 text-purple-600">•</span><span>Direct chat between owners and potential buyers</span></li>
              <li className="flex items-start gap-3"><span className="inline-block mt-1 text-purple-600">•</span><span>Easy property management dashboard</span></li>
              <li className="flex items-start gap-3"><span className="inline-block mt-1 text-purple-600">•</span><span>Smart search and filters (city, locality, price, category)</span></li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl border shadow-sm"><h5 className="font-semibold text-gray-800">Transparency</h5><p className="mt-2 text-gray-600 text-sm">Genuine listings and direct connections.</p></div>
          <div className="p-6 bg-white rounded-xl border shadow-sm"><h5 className="font-semibold text-gray-800">Trust</h5><p className="mt-2 text-gray-600 text-sm">Verified users and safe interactions.</p></div>
          <div className="p-6 bg-white rounded-xl border shadow-sm"><h5 className="font-semibold text-gray-800">Innovation</h5><p className="mt-2 text-gray-600 text-sm">Constantly improving features and UX.</p></div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-purple-50 to-white border rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div><h3 className="text-2xl font-semibold text-gray-800">Ready to list or find a property?</h3><p className="mt-2 text-gray-600">Get started — list your property or browse available properties across cities.</p></div>
          <div className="flex gap-3">
            <button onClick={handleListClick} className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">List a Property</button>
            <a href="/" className="px-5 py-3 border rounded-lg text-gray-700">Browse Properties</a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-2xl font-semibold">Platform Reviews</h2><div className="text-sm text-gray-500">Average rating: {summary.average} • {summary.total} reviews</div></div>
            <div className="text-right"><div className="text-sm text-gray-600">Share your experience</div></div>
          </div>

          <form onSubmit={submitReview} className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Rating</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border rounded p-2">
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
              <div className="ml-auto text-sm text-gray-500">{currentUser ? "You are logged in" : "Log in to post a review"}</div>
            </div>

            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full border rounded p-3" placeholder="Write your review here..." />

            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting} className="bg-purple-600 text-white px-4 py-2 rounded">{submitting ? "Posting..." : "Post Review"}</button>
              <button type="button" onClick={() => { setComment(""); setRating(5); }} className="px-4 py-2 border rounded">Reset</button>
            </div>
          </form>

          <div className="space-y-4">
            {!currentUser && <div className="text-gray-600">Log in to see and manage your review</div>}
            {currentUser && !userReview && <div className="text-gray-600">You have not submitted a review yet</div>}
            {currentUser && userReview && (
              <div className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">{userReview.user ? `${userReview.user.firstName} ${userReview.user.lastName}` : userReview.userName || "You"}</div>
                  <div className="text-sm text-gray-500">{new Date(userReview.createdAt).toLocaleString()}</div>
                </div>
                <div className="mb-2">
                  <p className="text-purple-600 font-bold text-xl flex items-center gap-2">{userReview.rating ?? ""}⭐️</p>
                </div>
                <div className="text-gray-700 mb-2">{userReview.comment ?? userReview.message}</div>
                <div className="text-right">
                  <button onClick={() => handleDelete(userReview.id)} className="text-red-600 text-sm">Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div><div className="text-lg font-semibold">SafeRoof</div><div className="text-sm text-gray-400">Trusted real-estate marketplace</div></div>
          <div className="text-sm text-gray-400">© {new Date().getFullYear()} SafeRoof. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
