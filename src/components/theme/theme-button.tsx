"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";

export function ToggleTheme() {
  const { setTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<"light" | "dark" | null>(
    null
  );

  const handleThemeChange = (theme: "light" | "dark") => {
    setPendingTheme(theme);
    setDialogOpen(true);
  };

  const confirmThemeChange = () => {
    if (pendingTheme) {
      setTheme(pendingTheme);
      setPendingTheme(null);
    }
    setDialogOpen(false);
  };

  const cancelThemeChange = () => {
    setPendingTheme(null);
    setDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg">
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Cambiar Tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange("light")}>
            Claro
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
            Obscuro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark:bg-black">
          <DialogHeader>
            <DialogTitle>¿Estás seguro que deseas cambiar el tema?</DialogTitle>
            <DialogDescription>
              Cambiar el tema hará que se pierda cualquier contenido no
              guardado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={cancelThemeChange}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmThemeChange}>
              Aceptar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
