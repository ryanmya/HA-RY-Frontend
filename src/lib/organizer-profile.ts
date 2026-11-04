import { api } from "@/lib/api";

export function updateOrganizerProfile(name: string, email: string) {
  return api.patch<unknown>("/organizer/profile", { name, email });
}

export function updateOrganizerProfilePicture(profilePicture: File) {
  const formData = new FormData();
  formData.append("profilePicture", profilePicture);
  return api.patch<{ profilePicture?: string }>("/organizer/profile-picture", formData);
}

export function updateOrganizerPassword(newPassword: string) {
  return api.patch<unknown>("/organizer/password", { newPassword });
}
