import React, { useEffect } from 'react'
import axios from 'axios'

export default function useAxiosFetch() {
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
  });

  // Intereptors
  useEffect(() => {

    // request interceptor
    const requestInceptor = axios.interceptors.request.use(function (config)  {
        // Do something before request is sent
        return config;
      }, function (error) {
        // Do something with request error
        return Promise.reject(error);
      });

      // Response Interceptor
      const responseInterceptor = axios.interceptors.response.use(function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response;
      }, function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
      });

      return () => {
        axiosInstance.interceptors.request.eject(requestInceptor);
        axiosInstance.interceptors.response.eject(responseInterceptor);
      }
  }, [axiosInstance])
  
    return axiosInstance
  
}
