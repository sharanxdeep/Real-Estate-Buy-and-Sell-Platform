import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { signInSuccess, signOut } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "http://localhost:3000";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success)
          throw new Error(data.message || "Failed to fetch user");
        setFormData({ ...data.user, password: "" });
        dispatch(signInSuccess(data.user));
      } catch (err) {
        setErrorMsg(err.message);
      }
    };
    fetchUser();
  }, [dispatch]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Update failed");

      setSuccessMsg("Profile updated successfully!");
      dispatch(signInSuccess(data.user));
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Logout failed");

      dispatch(signOut());
      window.location.href = "/login";
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/delete`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Delete failed");

      dispatch(signOut());
      window.location.href = "/signup";
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-20">
      <h1 className="text-4xl font-semibold text-center my-2">Profile</h1>
      <form
        onSubmit={handleUpdate}
        className="flex flex-col gap-3 text-center p-3"
      >
        <input
          id="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="border p-2 rounded-xl"
        />
        <input
          id="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="border p-2 rounded-xl"
        />
        <input
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 rounded-xl"
          type="email"
        />
        <input
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password (leave blank if unchanged)"
          className="border p-2 rounded-xl"
          type="password"
        />
        <button className="border rounded-xl p-3 bg-purple-200 hover:bg-purple-400 disabled:opacity-50">
          UPDATE
        </button>
        <button
          type="button"
          onClick={() => navigate("/list-property")}
          className="border rounded-xl p-3 bg-green-500 hover:bg-green-800 disabled:opacity-50"
        >
          LIST PROPERTY
        </button>
      </form>
      <div className="flex justify-between mt-5">
        <button className="text-blue-600 hover:underline" onClick={handleDelete}>
          Delete Account
        </button>
        <button className="text-blue-600 hover:underline" onClick={handleLogout}>
          Log out
        </button>
      </div>
      {successMsg && (
        <p className="text-green-600 text-center mt-3">{successMsg}</p>
      )}
      {errorMsg && (
        <p className="text-red-600 text-center mt-3">{errorMsg}</p>
      )}
    </div>
  );
}
