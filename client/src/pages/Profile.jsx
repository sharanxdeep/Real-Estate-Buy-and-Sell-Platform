import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { signInSuccess, signOut } from "../redux/user/userSlice";
import { useNavigate, Link } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          password: "",
        });
        dispatch(signInSuccess(data.user));
      }
    } catch {}
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/unread-count`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setUnreadCount(data.unread);
    } catch {}
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      if (formData.password) payload.password = formData.password;

      const res = await fetch(`${BACKEND_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) return setErrorMsg(data.message);
      setSuccessMsg("Profile updated successfully!");
      dispatch(signInSuccess(data.user));
      setFormData((p) => ({ ...p, password: "" }));
    } catch {
      setErrorMsg("Update failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("token");
    } catch {}
    dispatch(signOut());
    window.dispatchEvent(new CustomEvent("safeRoofAuthChange", { detail: null }));
    navigate("/login");
  };

  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm("Are you sure? This will permanently delete your account.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/user/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) return alert(data.message);
      try {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
      } catch {}
      alert("Account deleted!");
      dispatch(signOut());
      window.dispatchEvent(new CustomEvent("safeRoofAuthChange", { detail: null }));
      navigate("/signup");
    } catch {
      alert("Unable to delete account");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-5 border rounded-xl shadow">
      <h1 className="text-3xl font-semibold text-center mb-6">My Profile</h1>

      <form onSubmit={handleUpdate} className="flex flex-col gap-3">
        <input
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="border p-2 rounded-md"
        />
        <input
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="border p-2 rounded-md"
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="New Password (optional)"
          className="border p-2 rounded-md"
        />

        <button className="bg-purple-500 text-white p-2 rounded-md mt-2">
          Update Profile
        </button>
      </form>

      {successMsg && <p className="text-green-600 mt-3">{successMsg}</p>}
      {errorMsg && <p className="text-red-600 mt-3">{errorMsg}</p>}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={handleDeleteUser}
          className="flex-1 bg-red-700 hover:bg-red-800 text-white p-3 rounded-md"
        >
          Delete Account
        </button>

        <Link to="/inbox" className="flex-1 relative">
          <button className="w-full bg-blue-500 text-white p-3 rounded-md">
            Inbox
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="flex-1 bg-red-500 text-white p-3 rounded-md"
        >
          Logout
        </button>
      </div>

      <button
        onClick={() => navigate("/manage-listings")}
        className="w-full mt-4 bg-indigo-500 text-white p-3 rounded-md"
      >
        Manage Listings
      </button>
    </div>
  );
}
