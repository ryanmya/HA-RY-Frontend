import { homePathFor } from "@/components/route-guards";
import Logo from "@/components/logo";
import Navbar from "@/components/navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import RadioCard from "@/components/radio-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NavLink, useLocation, useNavigate } from "react-router";
import { ApiError } from "@/lib/api";
import { register, type RegisterPayload } from "@/lib/auth";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { TypeRoles } from "@/types/users";
import React, { useState } from "react";

const fieldTitles: Record<string, string> = {
  userType: "JENIS AKUN",
  name: "NAMA LENGKAP",
  email: "EMAIL",
  password: "KATA SANDI",
  profilePicture: "FOTO PROFIL",
  referredByCode: "KODE REFERAL",
  eventOrganizerName: "NAMA PENYELENGGARA",
  role: "PERAN",
};

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

function getErrorMessage(err: unknown) {
  if (!(err instanceof ApiError)) return "Terjadi kesalahan. Coba lagi.";

  const fieldError = /^([A-Za-z][A-Za-z0-9]*):/.exec(err.message);
  if (!fieldError) return err.message;

  const title = fieldTitles[fieldError[1]];
  return title
    ? `${title} : ${err.message.slice(fieldError[0].length)}`
    : err.message;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createEventSignup =
    (location.state as { createEventSignup?: boolean } | null)?.createEventSignup === true;
  const [selectedRole, setSelectedRole] = useState<TypeRoles>(
    createEventSignup ? "ORGANIZER" : "CUSTOMER",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureError, setProfilePictureError] = useState<string | null>(
    null,
  );
  const [agreed, setAgreed] = useState(false);
  const passwordMismatch =
    confirmPassword !== "" && password !== confirmPassword;
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (profilePictureError) return;

    const getFields = Object.fromEntries(
      [...new FormData(e.currentTarget)].filter(
        ([, v]) => typeof v === "string" && v.trim() !== "",
      ),
    );
    setFormError(null);
    setSubmitting(true);
    try {
      const { user } = await register(
        getFields as RegisterPayload,
        selectedRole,
        profilePicture ?? undefined,
      );
      navigate(homePathFor(user.userType), { replace: true });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Navbar
        left={<Logo />}
        right={
          <>
            Sudah punya akun?{" "}
            <NavLink
              className={cn(
                buttonVariants({ variant: "link" }),
                "p-0 px-1 font-bold",
              )}
              to={"/login"}
            >
              Masuk
            </NavLink>
          </>
        }
      />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Buat Akun</CardTitle>
            <CardDescription>
              <div>
                Pilih cara Anda memakai <Logo fontSize="sm" />. Peran tidak bisa
                diubah <br /> setelah pendaftaran
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {createEventSignup && (
              <Badge variant="default" size="lg">
                <span>
                  Untuk membuat acara, silakan mendaftar sebagai penyelenggara.
                </span>
              </Badge>
            )}
            {formError && (
                <Badge variant="destructive" size="lg">
                  <span>{formError}</span>
                </Badge>
              )}
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <RadioCard
                  name="userType"
                  value="CUSTOMER"
                  checked={selectedRole == "CUSTOMER"}
                  title="Pelanggan"
                  description="Beli tiket, kumpulkan poin, tulis ulasan."
                  className="flex-1"
                  onChange={() => setSelectedRole("CUSTOMER")}
                />
                <RadioCard
                  name="userType"
                  value="ORGANIZER"
                  title="Penyelenggara"
                  description="Buat acara, terima pembayaran, lihat statistik."
                  checked={selectedRole == "ORGANIZER"}
                  className="flex-1"
                  onChange={() => setSelectedRole("ORGANIZER")}
                />
              </div>
              <TextField name="name" label="NAMA LENGKAP" />
              <TextField name="email" label="EMAIL" type="email" />
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="profilePicture"
                  className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                >
                  FOTO PROFIL (OPSIONAL)
                </label>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  aria-invalid={Boolean(profilePictureError)}
                  className="rounded-xl border border-border bg-field px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] ?? null;
                    if (file && file.size > MAX_PROFILE_IMAGE_SIZE) {
                      setProfilePicture(null);
                      setProfilePictureError("Ukuran foto profil maksimal 5 MB.");
                      e.currentTarget.value = "";
                      return;
                    }

                    setProfilePicture(file);
                    setProfilePictureError(null);
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  Format gambar, maksimal 5 MB.
                </span>
                {profilePictureError && (
                  <span className="text-xs text-destructive">
                    {profilePictureError}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  name="password"
                  label="KATA SANDI"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  label="ULANGI KATA SANDI"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  aria-invalid={passwordMismatch}
                />
              </div>
              {passwordMismatch && (
                <span className="-mt-4 text-xs text-destructive">
                  Kata sandi tidak sama.
                </span>
              )}
              {selectedRole == "CUSTOMER" ? (
                <TextField
                  name="referredByCode"
                  label="KODE REFERAL - OPTIONAL"
                />
              ) : (
                <>
                  <TextField
                    name="eventOrganizerName"
                    label="NAMA PENYELENGGARA (FROM REGISTRATION TO COMPANY)"
                  />
                  <TextField name="role" label="PERAN - OPTIONAL" />
                </>
              )}
              {selectedRole === "CUSTOMER" && (
                <span className="text-xs text-primary-subtle">
                  Kode referal Anda sendiri dibuat otomatis setelah mendaftar dan
                  tidak bisa diubah.
                </span>
              )}
              <Checkbox
                label="Saya setuju dengan Syarat Layanan dan Kebijakan Privasi."
                checked={agreed}
                onCheckedChange={setAgreed}
              />
              <Button
                type="submit"
                disabled={
                  submitting ||
                  Boolean(profilePictureError) ||
                  !agreed ||
                  !password ||
                  password !== confirmPassword
                }
              >
                {submitting ? (
                  <Logo loading fontSize="sm" color="current" />
                ) : (
                  <>
                    Daftar sebagai{" "}
                    {selectedRole == "CUSTOMER" ? "Pelanggan" : "Penyelenggara"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
