import React, { use, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
    setError("All fields are required");
    setSuccess(null);
    return;
  }

    try {
       setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success===false){
      setError(data.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setError(null);
    setSuccess("User created successfully -> Redirecting to login");

    setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
};
  console.log(formData);

  return (
    <div>
      {" "}
      <div className="p-3 max-w-lg m-10 mx-auto">
        <h1 className="text-4xl text-center font-semibold m-5">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border rounded-lg p-2"
            id="email"
            onChange={handleChange}
            type="email"
            placeholder="Email"
          />
          <input
            className="border rounded-lg p-2"
            type="text"
            id="firstName"
            onChange={handleChange}
            placeholder="First Name"
            maxLength={20}
          />
          <input
            className="border rounded-lg p-2"
            type="text"
            id="lastName"
            onChange={handleChange}
            placeholder="Last Name"
            maxLength={20}
          />
          <input
            className="border rounded-lg p-2"
            type="password"
            id="password"
            onChange={handleChange}
            placeholder="Password"
            maxLength={30}
          />
          <button disabled={loading} className="border rounded-lg bg-purple-200 p-1 hover:bg-purple-400 disabled:opacity-300">
            {loading ? 'Loading...' : 'SIGN UP'}
          </button>
        </form>
        <div id="textChange">{error && <p className="text-red-500">{error}</p>}
        </div>
        <div>{success && <p className="text-green-600 mt-3">{success}</p>}</div>
      </div>
    </div>
  );
  }
