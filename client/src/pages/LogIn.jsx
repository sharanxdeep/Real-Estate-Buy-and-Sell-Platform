import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInStart, signInFailure, signInSuccess } from "../redux/user/userSlice";

const BACKEND_URL = "http://localhost:3000";

export default function LogIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(signInFailure(null));
  }, [dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return dispatch(signInFailure("Email & Password required"));

    try {
      dispatch(signInStart());
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return dispatch(signInFailure(data.message || "Login failed"));

      if (data.token) {
        try {
          localStorage.setItem("access_token", data.token);
        } catch {}
      }

      dispatch(signInSuccess(data.user));
      window.dispatchEvent(new CustomEvent("safeRoofAuthChange", { detail: data.user.userid }));
      navigate("/");
    } catch (err) {
      dispatch(signInFailure(err.message));
    }
  };

  return (
    <div className="p-3 max-w-lg m-10 mx-auto">
      <h1 className="text-4xl text-center font-semibold m-5">Log In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input id="email" placeholder="Email" type="email" onChange={handleChange} className="border p-2 rounded-xl" />
        <input id="password" placeholder="Password" type="password" onChange={handleChange} className="border p-2 rounded-xl" />
        <button disabled={loading} className="bg-purple-200 border p-2 rounded-xl hover:bg-purple-400 disabled:opacity-50">
          {loading ? "Loading..." : "LOG IN"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{" "}
        <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate("/signup")}>
          Sign Up
        </span>
      </p>
    </div>
  );
}
