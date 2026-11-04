import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import {
  updateCustomerPassword,
  updateCustomerProfile,
  updateCustomerProfilePicture,
} from "@/lib/customer-profile";
import { fetchCurrentUser } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { Camera, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

export default function CustomerProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [pictureError, setPictureError] = useState<string | null>(null);
  const [pictureSaved, setPictureSaved] = useState(false);
  const [savingPicture, setSavingPicture] = useState(false);
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const picturePreviewRef = useRef<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (picturePreviewRef.current) URL.revokeObjectURL(picturePreviewRef.current);
    };
  }, []);

  const handleSaveName: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setNameError(null);
    setNameSaved(false);
    setSavingName(true);
    try {
      await updateCustomerProfile(name.trim(), user?.email ?? "");
      if (user) setUser({ ...user, name: name.trim() });
      setNameSaved(true);
    } catch (error) {
      setNameError(getErrorMessage(error));
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePicture: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!profilePicture) return;
    setPictureError(null);
    setPictureSaved(false);
    setSavingPicture(true);
    try {
      const updatedUser = await updateCustomerProfilePicture(profilePicture);
      if (user && updatedUser.profilePicture) {
        setUser({ ...user, profilePicture: updatedUser.profilePicture });
      } else {
        await fetchCurrentUser();
      }
      setProfilePicture(null);
      if (picturePreviewRef.current) URL.revokeObjectURL(picturePreviewRef.current);
      picturePreviewRef.current = null;
      setPicturePreview(null);
      if (pictureInputRef.current) pictureInputRef.current.value = "";
      setPictureSaved(true);
    } catch (error) {
      setPictureError(getErrorMessage(error));
    } finally {
      setSavingPicture(false);
    }
  };

  const handleChangePassword: React.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak sama.");
      return;
    }
    setSavingPassword(true);
    try {
      await updateCustomerPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
      setPasswordDialogOpen(false);
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold">Edit profil</h1>
        <p className="text-muted-foreground">Perbarui informasi akun Anda.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.6fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Foto profil</CardTitle>
            <CardDescription>Klik foto untuk memilih foto baru.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col items-center gap-4" onSubmit={handleSavePicture}>
              <input
                ref={pictureInputRef}
                id="customer-profile-picture"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (picturePreviewRef.current) URL.revokeObjectURL(picturePreviewRef.current);
                  picturePreviewRef.current = file ? URL.createObjectURL(file) : null;
                  setPicturePreview(picturePreviewRef.current);
                  setProfilePicture(file);
                  setPictureError(null);
                  setPictureSaved(false);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                aria-label="Pilih foto profil baru"
                onClick={() => pictureInputRef.current?.click()}
                className="group relative size-40 overflow-hidden rounded-full bg-muted outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                {picturePreview || user?.profilePicture ? (
                  <img
                    src={picturePreview ?? user?.profilePicture ?? ""}
                    alt="Foto profil"
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="mx-auto size-20 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Camera className="size-4" aria-hidden="true" />
                  Ubah foto
                </span>
              </button>
              {profilePicture && (
                <p className="max-w-full truncate text-sm text-muted-foreground">
                  {profilePicture.name}
                </p>
              )}
              {pictureError && <Badge variant="destructive" size="lg">{pictureError}</Badge>}
              {pictureSaved && <Badge variant="success">Foto profil berhasil diperbarui.</Badge>}
              <Button type="submit" disabled={savingPicture || !profilePicture}>
                {savingPicture ? "Mengunggah…" : "Simpan foto"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi profil</CardTitle>
            <CardDescription>Nama, email, dan kode referral akun customer.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSaveName}>
              <TextField
                label="Nama"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <TextField label="Email" type="email" value={user?.email ?? ""} disabled />
              <TextField label="Kode referral" value={user?.referralCode ?? "-"} disabled />
              {nameError && <Badge variant="destructive" size="lg">{nameError}</Badge>}
              {nameSaved && <Badge variant="success">Nama berhasil diperbarui.</Badge>}
              {passwordSaved && <Badge variant="success">Password berhasil diperbarui.</Badge>}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={savingName || !name.trim()}>
                  {savingName ? "Menyimpan…" : "Simpan Nama"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordError(null);
                    setPasswordSaved(false);
                    setPasswordDialogOpen(true);
                  }}
                >
                  Ganti Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open);
          if (!open) {
            setNewPassword("");
            setConfirmPassword("");
            setPasswordError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti password</DialogTitle>
            <DialogDescription>Masukkan password baru dan konfirmasikan.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
            <TextField
              label="Password baru"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <TextField
              label="Konfirmasi password baru"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            {passwordError && <Badge variant="destructive" size="lg">{passwordError}</Badge>}
            <Button type="submit" className="self-start" disabled={savingPassword || !newPassword}>
              {savingPassword ? "Memperbarui…" : "Simpan password"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
