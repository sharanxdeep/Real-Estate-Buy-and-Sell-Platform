import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <header className="bg-purple-50 shadow-md text-2xl my-1 p-2">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        <Link to="/">
          <h1 className="font-bold">
            <span className="text-slate-400">Safe</span>
            <span>Roof</span>
          </h1>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex gap-2 bg-white rounded-lg shadow-md"
        >
          <input
            className="p-2 rounded-lg outline-none"
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="bg-purple-200 hover:bg-purple-400 rounded-lg p-2"
          >
            Go
          </button>
        </form>

        <ul className="flex gap-10">
          <Link to="/">
            <li className="hover:underline">Home</li>
          </Link>
          <Link to="/about">
            <li className="hover:underline">About</li>
          </Link>
          <Link to="/profile">
            {currentUser ? (
              <li className="hover:underline">Profile</li>
            ) : (
              <li className="hover:underline">Log In</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
