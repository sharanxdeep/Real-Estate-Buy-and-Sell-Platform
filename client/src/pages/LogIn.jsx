// LogIn.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInFailure, signInSuccess } from "../redux/user/userSlice";



export default function LogIn() {
  const [formData, setFormData] = useState({});
  const {loading, error} = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) =>{
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  };

    const handleSubmit = async (e) =>{
      e.preventDefault();

      if(!formData.email || !formData.password){
         dispatch(signInFailure("Both Email and Password are required!!"))
        return;
      }

      try {
        dispatch(signInStart());
        const res = await fetch("/api/auth/login",{
          method:"POST",
          headers: {"Content-type": "application/json" },
          body:JSON.stringify(formData),

        });

        const data = await res.json();

        if(data.success===false){
          dispatch(signInFailure((data.message)));
          return;
        }
        dispatch(signInSuccess(data));
        navigate("/");
        
      } catch (error) {
        dispatch(signInFailure(error.message));
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
          maxLength={30}
        />
        <input
          onChange={handleChange}
          id="password"
          className="border rounded-lg p-2"
          type="password"
          placeholder="Password"
          maxLength={20}
          minLength={8}
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
