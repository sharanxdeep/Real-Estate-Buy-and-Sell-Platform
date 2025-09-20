import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LogIn() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>{
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  };

    const handleSubmit = async (e) =>{
      e.preventDefault();

      if(!formData.email || !formData.password){
        setError("Both Email and Password are required!!")
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/auth/login",{
          method:"POST",
          headers: {"Content-type": "application/json" },
          body:JSON.stringify(formData),

        });

        const data = await res.json();

        if(data.success===false){
          setError(data.message);
          setLoading(false);
          return;
        }
        setLoading(false);
        navigate("/home");
        
      } catch (error) {
        setLoading(false);
        setError("Something went wrong");
      }
    }

  return (
    <div className="p-3 max-w-lg m-10 mx-auto">
      <h1 className="text-4xl text-center font-semibold m-5">Log In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          onChange={handleChange}
          id="email"
          className="border rounded-lg p-2"
          type="email"
          placeholder="Email"
        />
        <input
          onChange={handleChange}
          id="password"
          className="border rounded-lg p-2"
          type="password"
          placeholder="Password"
        />
        <button
        disabled={loading}
         className = "border rounded-lg bg-purple-200 p-1 hover:bg-purple-400 disabled:opacity-300">
          LOG IN
        </button>
        <div className="flex gap-2">
          <p>Don't have an account?</p>
          <Link to={"/signup"}>
            <span className="text-violet-900 hover:underline">Sign Up</span>
          </Link>
        </div>
        <div>{error && <p className="text-red-500">{error}</p>}</div>
      </form>
    </div>
  );
}
