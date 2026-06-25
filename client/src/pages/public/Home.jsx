<<<<<<< HEAD
import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Event Management System
          </h1>

          <p className="text-xl mb-8">
            Discover, organize and manage events seamlessly.
          </p>

          <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold">
            Browse Events
          </button>
        </div>
      </section>
=======
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">
        Event Management System
      </h1>

      <p className="text-gray-600 mb-8">
        Manage and participate in events easily.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Register
        </Link>
      </div>
>>>>>>> origin/develop
    </div>
  );
};

<<<<<<< HEAD
export default Home;
=======
export default Home;
>>>>>>> origin/develop
