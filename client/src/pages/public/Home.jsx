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
    </div>
  );
};

export default Home;