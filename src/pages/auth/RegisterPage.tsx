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
import { NavLink, useNavigate } from "react-router";
import { ApiError } from "@/lib/api";
import { register, type RegisterPayload } from "@/lib/auth";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { TypeRoles } from "@/types/users";
import React, { useState } from "react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<TypeRoles>("CUSTOMER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const passwordMismatch =
    confirmPassword !== "" && password !== confirmPassword;
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const getFields = Object.fromEntries(
      [...new FormData(e.currentTarget)].filter(
        ([, v]) => typeof v !== "string" || v.trim() !== "",
      ),
    );
    console.log(getFields);
    setFormError(null);
    setSubmitting(true);
    try {
      const { user } = await register(
        getFields as RegisterPayload,
        selectedRole,
      );
      navigate(homePathFor(user.userType), { replace: true });
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
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
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-1/3">
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
                    label="NAMA PENYELENGGARA (TANPA SPASI)"
                  />
                  <TextField name="role" label="PERAN - OPTIONAL" />
                </>
              )}
              <Checkbox
                label="Saya setuju dengan Syarat Layanan dan Kebijakan Privasi."
                checked={agreed}
                onCheckedChange={setAgreed}
              />
              {formError && (
                <Badge variant="destructive" size="lg">
                  <span>{formError}</span>
                </Badge>
              )}
              <Button
                type="submit"
                disabled={
                  submitting ||
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
              <span className="text-xs text-primary-subtle">
                Kode referal Anda sendiri dibuat otomatis setelah mendaftar dan
                tidak bisa diubah.
              </span>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
