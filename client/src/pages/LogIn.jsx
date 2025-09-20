import React from "react";
import { Link } from "react-router-dom";

export default function LogIn() {
  return (
    <div className="p-3 max-w-lg m-10 mx-auto">
      <h1 className="text-4xl text-center font-semibold m-5">Log In</h1>
      <form className="flex flex-col gap-3">
        <input
          className="border rounded-lg p-2"
          type="email"
          placeholder="Email"
        />
        <input
          className="border rounded-lg p-2"
          type="password"
          placeholder="Password"
        />
        <button className="border rounded-lg bg-purple-200 p-1 hover:bg-purple-400">
          LOG IN
        </button>
        <div className="flex gap-2">
          <p>Don't have an account?</p>
          <Link to={"/signup"}>
            <span className="text-violet-900 hover:underline">Sign Up</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
