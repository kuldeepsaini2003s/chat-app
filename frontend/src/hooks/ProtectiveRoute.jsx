import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectiveRoute = () => {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default ProtectiveRoute;
