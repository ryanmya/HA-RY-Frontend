import { homePathFor } from "@/components/route-guards";
import Logo from "@/components/logo";
import { TextField } from "@/components/text-field";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiError } from "@/lib/api";
import { signIn, type SignInPayload } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { TypeRoles } from "@/types/users";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";

type Role = TypeRoles;

const roles: {
  value: Role;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "CUSTOMER",
    title: "Pelanggan",
    description: "Beli tiket dan lihat acara yang Anda ikuti.",
    icon: "mdi:ticket-outline",
  },
  {
    value: "ORGANIZER",
    title: "Penyelenggara",
    description: "Kelola acara, tiket, dan penjualan di dasbor.",
    icon: "mdi:view-dashboard-outline",
  },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role | null>(null);
  const selectedRole = roles.find((r) => r.value === role);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!role) return;
    const fields = {
      ...Object.fromEntries(new FormData(e.currentTarget)),
      userType: role,
    } as SignInPayload;

    setError(null);
    setSubmitting(true);
    try {
      const { user } = await signIn(fields, role);
      navigate(homePathFor(user.userType), { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-12 h-screen">
      <div className="col-span-4 bg-primary py-9 px-10 flex flex-col justify-between">
        <Logo color="white" />
        <div className="flex flex-col gap-6">
          <span className="type-page-title text-white">
            Satu akun untuk <br /> menonton atau <br /> menyelenggarakan.
          </span>
          <span className="text-primary-subtle">
            Pelanggan langsung kembali ke acara yang mereka lihat.
            <br />
            Penyelenggara masuk ke dasbor.
          </span>
          <div className="flex flex-col gap-2.5">
            <NavLink
              className={cn(
                buttonVariants({ variant: "muted" }),
                "flex items-center justify-start p-4",
              )}
              to="/"
            >
              <Badge>Pelanggan</Badge>
              <Icon icon={"mdi:arrow-right"} />
              <span>kembali ke Events</span>
            </NavLink>
            <NavLink
              className={cn(
                buttonVariants({ variant: "muted" }),
                "flex items-center justify-start p-4",
              )}
              to="/organizer"
            >
              <Badge>Penyelenggara</Badge>
              <Icon icon={"mdi:arrow-right"} />
              <span>kembali ke Dashboard</span>
            </NavLink>
          </div>
        </div>
      </div>
      <div className="col-span-8 bg-background flex items-center justify-center">
        <Card className="w-1/2 p-10 gap-[22px]">
          {!selectedRole ? (
            <div
              key="roles"
              className="flex flex-col gap-[22px] animate-in fade-in slide-in-from-left-4 duration-300"
            >
              <CardHeader>
                <CardTitle>Masuk sebagai</CardTitle>
                <CardDescription>
                  Pilih peran Anda untuk melanjutkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className="flex items-center gap-4 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary hover:bg-primary-subtle"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon icon={r.icon} className="size-5" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="type-card-title">{r.title}</span>
                      <span className="type-meta text-muted-foreground">
                        {r.description}
                      </span>
                    </div>
                    <Icon
                      icon="mdi:chevron-right"
                      className="size-5 text-muted-foreground"
                    />
                  </button>
                ))}
              </CardContent>
            </div>
          ) : (
            <div
              key="form"
              className="flex flex-col gap-[22px] animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <CardHeader>
                <Button
                  variant={"ghost"}
                  className="mb-2 w-fit p-0! relative"
                  prependIcon={<Icon icon="mdi:arrow-left" />}
                  onClick={() => {
                    setRole(null);
                    setError(null);
                  }}
                >
                  Ganti peran
                </Button>
                <CardTitle>Masuk</CardTitle>
                <CardDescription>
                  Masuk sebagai <Badge>{selectedRole.title}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <TextField name="email" label="EMAIL" type="email" required />
                  <TextField
                    name="password"
                    required
                    label="KATA SANDI"
                    type="password"
                    topRight={
                      <Button
                        type="button"
                        variant={"link"}
                        className="p-0 font-bold"
                      >
                        Lupa kata sandi?
                      </Button>
                    }
                  />
                  <Checkbox label="tetap masuk di perangkat ini" />
                  <div className="flex flex-col gap-4 items-center">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Logo loading fontSize="sm" color="current" />
                      ) : (
                        "Masuk"
                      )}
                    </Button>
                    {error && (
                      <Badge variant="destructive" size="lg">
                        <span>{error}</span>
                      </Badge>
                    )}
                  </div>
                </form>
              </CardContent>
            </div>
          )}
          <div className="flex items-center gap-1 justify-center">
            <span>Belum punya akun?</span>
            <NavLink
              className={cn(
                buttonVariants({ variant: "link" }),
                "p-0 font-bold",
              )}
              to="/register"
            >
              Daftar
            </NavLink>
          </div>
        </Card>
      </div>
    </div>
  );
}
