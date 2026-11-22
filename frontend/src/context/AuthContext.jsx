
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveTokens = (access, refresh) => {
    localStorage.setItem("reloop-access", access);
    localStorage.setItem("reloop-refresh", refresh);
  };

  const clearSession = () => {
    localStorage.removeItem("reloop-access");
    localStorage.removeItem("reloop-refresh");
    setUser(null);
  };

  const getProfile = async (accessToken) => {
    const response = await API.get("accounts/profile/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    setUser(response.data);
    return response.data;
  };

  useEffect(() => {
    const restoreSession = async () => {
      const access = localStorage.getItem("reloop-access");
      const refresh = localStorage.getItem("reloop-refresh");

      if (!access || !refresh) {
        setLoading(false);
        return;
      }

      try {
        await getProfile(access);
      } catch {
        try {
          const response = await API.post("token/refresh/", {
            refresh,
          });

          localStorage.setItem("reloop-access", response.data.access);
          await getProfile(response.data.access);
        } catch {
          clearSession();
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const register = async (formData) => {
    const response = await API.post("accounts/register/", formData);

    saveTokens(response.data.access, response.data.refresh);
    setUser(response.data.user);

    return response.data;
  };

  const login = async (email, password) => {
    const response = await API.post("accounts/login/", {
      email,
      password,
    });

    saveTokens(response.data.access, response.data.refresh);
    setUser(response.data.user);

    return response.data;
  };

  const logout = async () => {
    const access = localStorage.getItem("reloop-access");
    const refresh = localStorage.getItem("reloop-refresh");

    try {
      if (access && refresh) {
        await API.post(
          "accounts/logout/",
          { refresh },
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );
      }
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
