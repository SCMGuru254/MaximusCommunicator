import { useState } from 'react';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export function useApi() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Create a base axios instance
  const api: AxiosInstance = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to handle loading state
  api.interceptors.request.use(
    (config) => {
      setLoading(true);
      setError(null);
      return config;
    },
    (error) => {
      setLoading(false);
      setError(error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle loading state and errors
  api.interceptors.response.use(
    (response) => {
      setLoading(false);
      return response;
    },
    (error) => {
      setLoading(false);
      setError(error);
      return Promise.reject(error);
    }
  );

  // Wrapper functions for API calls
  const get = (url: string, config?: AxiosRequestConfig) => api.get(url, config);
  const post = (url: string, data?: any, config?: AxiosRequestConfig) => api.post(url, data, config);
  const put = (url: string, data?: any, config?: AxiosRequestConfig) => api.put(url, data, config);
  const del = (url: string, config?: AxiosRequestConfig) => api.delete(url, config);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
  };
}

export default useApi;