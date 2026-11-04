import { api } from "@/lib/api";

export function updateCustomerProfile(name: string, email: string) {
  return api.patch<unknown>("/customer/profile", { name, email });
}

export function updateCustomerProfilePicture(profilePicture: File) {
  const formData = new FormData();
  formData.append("profilePicture", profilePicture);
  return api.patch<{ profilePicture?: string }>("/customer/profile-picture", formData);
}

export function updateCustomerPassword(newPassword: string) {
  return api.patch<unknown>("/customer/password", { newPassword });
}
