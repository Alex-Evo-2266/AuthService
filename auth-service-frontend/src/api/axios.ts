import axios from "axios";
import { BASE_KEY_STORAGE } from "../config/consts";
import { refreshToken } from "alex-evo-sh-auth";
import { authConfig } from "../config/config";
const PREFIX = '/api-auth';
const PREFIX_EMAIL = '/api-email';

export const api = axios.create({
  baseURL: PREFIX, // свой адрес
  withCredentials: true, // чтобы cookie smart_home шли автоматически
});

export const apiEmail = axios.create({
  baseURL: PREFIX_EMAIL, // свой адрес
  withCredentials: true, // чтобы cookie smart_home шли автоматически
});

const SMARTHOME_USER_DATA = BASE_KEY_STORAGE + "_access"

// Интерцептор добавляет Authorization
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(SMARTHOME_USER_DATA)
    if(!token)
        return config
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Если 401 — пробуем refresh
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    if (error.response?.status === 401) {
      try {
          const token = await refreshToken(authConfig);
          if (token) {
            error.config.headers.Authorization = `Bearer ${token}`;
            return api.request(error.config);
          }
      } catch (e) {
        console.error("Refresh error", e);
      }
    }
    return Promise.reject(error);
  }
);

// Интерцептор добавляет Authorization
apiEmail.interceptors.request.use((config) => {
    const token = localStorage.getItem(SMARTHOME_USER_DATA)
    if(!token)
        return config
    config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Если 401 — пробуем refresh
apiEmail.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    if (error.response?.status === 401) {
      try {
          const token = await refreshToken(authConfig);
          if (token) {
            error.config.headers.Authorization = `Bearer ${token}`;
            return api.request(error.config);
          }
      } catch (e) {
        console.error("Refresh error", e);
      }
    }
    return Promise.reject(error);
  }
);
