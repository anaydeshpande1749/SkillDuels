//this is protectedroute

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, authLoading, children }) => {

  // ⏳ Wait until auth check is finished
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Checking authentication...
      </div>
    );
  }

  // ❌ No user after auth check → redirect
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authenticated → allow access
  return children;
};

export default ProtectedRoute;


// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     // Not logged in → go to home page
//     return <Navigate to="/" replace />;
//   }

//   // Logged in → allow access
//   return children;
// };

// export default ProtectedRoute;

