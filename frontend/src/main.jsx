import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { serverUrl } from "./App.jsx";

export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const publicRoutes = [
      "/login",
      "/signup",
      "/password/forgot",
      window.location.pathname.includes("/password/reset"),
    ];

    const isPublic = publicRoutes.some((route) =>
      typeof route === "string" ? route === window.location.pathname : route,
    );

    if (isPublic) {
      setLoading(false);
      return;
    }
    axios
      .get(`${serverUrl}/api/auth/user`, {
        withCredentials: true,
      })
      .then((res) => {
        setIsAuthenticated(true);
        setUser(res.data.user);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          // expected → user not logged in
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.error("Unexpected error:", error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    /*    <Context.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser }}
    >
      <App />
      <ToastContainer theme="colored" position="top-right" autoClose={2000} />
    </Context.Provider>
  
    */

    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-[#fff9f6]">
          <div className="w-16 h-16 border-4 border-[#ddd] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <Context.Provider
          value={{ isAuthenticated, setIsAuthenticated, user, setUser }}
        >
          <App />
        </Context.Provider>
      )}

      <ToastContainer theme="colored" position="top-right" autoClose={2000} />
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>,
);
