import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import {
  updateCustomerPassword,
  updateCustomerProfile,
  updateCustomerProfilePicture,
} from "@/lib/customer-profile";
import { fetchCurrentUser } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { useState } from "react";

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-bold">Edit profil</h1>
        <p className="text-muted-foreground">Perbarui informasi akun Anda.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informasi profil</CardTitle>
          <CardDescription>Nama dan email akun customer.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form className="flex flex-col gap-4" onSubmit={handleSaveName}>
            <TextField
              label="Nama"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <TextField label="Email" type="email" value={user?.email ?? ""} disabled />
            {nameError && <Badge variant="destructive" size="lg">{nameError}</Badge>}
            {nameSaved && <Badge variant="success">Nama berhasil diperbarui.</Badge>}
            <Button type="submit" className="self-start" disabled={savingName || !name.trim()}>
              {savingName ? "Menyimpan…" : "Simpan nama"}
            </Button>
          </form>

          <div className="h-px bg-border" />

          <form className="flex flex-col gap-4" onSubmit={handleSavePicture}>
            {user?.profilePicture && (
              <img
                src={user.profilePicture}
                alt="Foto profil saat ini"
                className="size-20 rounded-full object-cover"
              />
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="customer-profile-picture">Foto profil</Label>
              <Input
                id="customer-profile-picture"
                type="file"
                accept="image/*"
                onChange={(event) => setProfilePicture(event.target.files?.[0] ?? null)}
              />
            </div>
            {pictureError && <Badge variant="destructive" size="lg">{pictureError}</Badge>}
            {pictureSaved && <Badge variant="success">Foto profil berhasil diperbarui.</Badge>}
            <Button type="submit" className="self-start" disabled={savingPicture || !profilePicture}>
              {savingPicture ? "Mengunggah…" : "Simpan foto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganti password</CardTitle>
          <CardDescription>Masukkan password baru dan konfirmasikan.</CardDescription>
        </CardHeader>
        <CardContent>
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
            {passwordSaved && <Badge variant="success">Password berhasil diperbarui.</Badge>}
            <Button type="submit" className="self-start" disabled={savingPassword || !newPassword}>
              {savingPassword ? "Memperbarui…" : "Ganti password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
