import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends the httpOnly refresh cookie
});

// The access token lives in memory only (not localStorage), so scripts can't steal it from storage
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

// Attach the token to every request
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// If a request fails with 401, get a new access token and retry it once
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        // Several requests can fail at once, so they all share one refresh call
        refreshing = refreshing || api.post("/auth/refresh").finally(() => (refreshing = null));
        const { data } = await refreshing;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new Event("auth:logout")); // tells AuthContext to clear the user
      }
    }
    return Promise.reject(error);
  }
);

// Turns any error into a readable message for the UI
export const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || "Something went wrong";

export default api;