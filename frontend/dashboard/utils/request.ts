import { ofetch } from "ofetch";
import { tokenStorage } from "./token";
import { toast } from "@/hooks/use-toast";

// Create base instance
const request = ofetch.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Your base API URL
  // Add auth token to requests
  async onRequest({ options }) {
    const token = tokenStorage.get();
    if (token) {
      options.headers.set("Authorization", `Bearer ${token}`);
    }
  },

  async onResponse({ response }) {
    if (response._data["code"] === 1) {
      return;
    }
    if (response._data["code"] != 200) {
      toast({
        title: "Error",
        description: response._data["message"],
        variant: "destructive",
      });
    }
  },

  // Global error handling
  onRequestError: ({ error }) => {
    console.error("Request error:", error);
    toast({
      title: "Request error",
      description: error.message,
      variant: "destructive",
    });
  },
  onResponseError: ({ response }) => {
    if (response?.status === 401) {
      tokenStorage.remove();
      window.location.href = process.env.NEXT_PUBLIC_HOME_PAGE_URL!;
      return;
    }
  },
});

// Helper methods
export const http = {
  get: <T>(url: string, params?: any, headers?: HeadersInit | undefined) =>
    request<T>(url, { method: "GET", params, headers }),
  post: <T>(url: string, data?: any, headers?: HeadersInit | undefined) =>
    request<T>(url, { method: "POST", body: data, headers }),
  put: <T>(url: string, data?: any, headers?: HeadersInit | undefined) =>
    request<T>(url, { method: "PUT", body: data, headers }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};

export default request;
