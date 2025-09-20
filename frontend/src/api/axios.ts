import axios from "axios";

const API = axios.create({
  baseURL: "api/", // or your deployed API URL
  headers: {
    "Content-Type": "application/json",
  },
});


function getCookie(name:any) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add a request interceptor to inject access token
API.interceptors.request.use(
  (config) => {
    console.log("Interceptor is running...");

    const tokens = localStorage.getItem("authTokens");
    console.log("1. Tokens from localStorage:", tokens);

    if (tokens) {
      const { access } = JSON.parse(tokens);
      console.log("2. Parsed access token:", access);

      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
        console.log("3. Authorization header set:", config.headers.Authorization);
      }
    }

    // Add this part to set the CSRF token header
    if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
      config.headers["X-CSRFToken"] = getCookie("csrftoken");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token is expired and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("token/refresh/")
    ) {
      originalRequest._retry = true;

      try {
        const stored = localStorage.getItem("authTokens");
        const tokens = stored ? JSON.parse(stored) : null;

        if (!tokens?.refresh) {
          return Promise.reject(error);
        }

        const res = await API.post("refresh/", {
          refresh: tokens.refresh,
        });

        const newAccess = res.data.access;
        const updatedTokens = {
          access: newAccess,
          refresh: tokens.refresh,
        };

        localStorage.setItem("authTokens", JSON.stringify(updatedTokens));
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        return API(originalRequest);
      } catch (refreshError) {
        console.error(" Token refresh failed:", refreshError);
        localStorage.removeItem("authTokens");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
