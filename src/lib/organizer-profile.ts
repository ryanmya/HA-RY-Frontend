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

// GET /organizer/public/:id. No login needed; used on event pages.
export type PublicOrganizer = {
  id: string;
  name: string;
  eventOrganizerName: string;
  profilePicture: string | null;
  totalEvents: number;
  /** null until the organizer has a review. */
  averageRating: number | null;
  totalReviews: number;
};

export function getPublicOrganizer(id: string) {
  return api.get<PublicOrganizer>(`/organizer/public/${id}`);
}
