import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { BACKEND_URL } from "./constant.utils";

let api: AxiosInstance | null = null;
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const showTokenExpiredAlert = () => {
  const userConfirmed = window.confirm(
    "Your token has expired. Click OK to log in again."
  );

  if (userConfirmed) {
    localStorage.clear();
    window.location.href = "/auth/signin";
  } else {
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/auth/signin";
    }, 1000);
  }
};

export const instance = (): AxiosInstance => {
  if (api) return api;

  api = axios.create({
    baseURL: BACKEND_URL,
  });

  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const accessToken = localStorage.getItem("token");
      if (accessToken && config.headers) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError | any) => {
      const originalRequest: any = error.config;

      if (
        error.response?.data?.code === "token_not_valid" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
          showTokenExpiredAlert();
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers["Authorization"] = "Bearer " + token;
                resolve(api(originalRequest));
              },
              reject: (err: any) => reject(err),
            });
          });
        }

        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
          try {
            const response = await axios.post(
              `${BACKEND_URL}authentication/refresh-token/`,
              {
                refresh: refreshToken,
              }
            );

            const { access, refresh } = response.data;
            localStorage.setItem("token", access);
            localStorage.setItem("refresh", refresh);

            api!.defaults.headers.common["Authorization"] = "Bearer " + access;
            originalRequest.headers["Authorization"] = "Bearer " + access;

            processQueue(null, access);
            resolve(api!(originalRequest));
          } catch (err) {
            if (err.response?.data?.code === "token_not_valid") {
              showTokenExpiredAlert();
            } else {
              processQueue(err, null);
              localStorage.clear();
              window.location.href = "/auth/signin";
            }
            reject(err);
          } finally {
            isRefreshing = false;
          }
        });
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export default instance;
