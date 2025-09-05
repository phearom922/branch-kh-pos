import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded shadow-md text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-600">
          404 - Page Not Found
        </h2>
        <p className="text-gray-700 mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="bg-primary text-white p-2 rounded hover:bg-primary-dark inline-block"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
