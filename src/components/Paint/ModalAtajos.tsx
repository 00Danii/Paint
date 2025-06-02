"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Keyboard } from "lucide-react";

const shortcuts = [
  {
    category: "Herramientas",
    items: [
      { key: "B", description: "Seleccionar Pincel" },
      { key: "E", description: "Seleccionar Borrador" },
      { key: "L", description: "Seleccionar Línea" },
      { key: "R", description: "Seleccionar Rectángulo" },
      { key: "C", description: "Seleccionar Círculo" },
      { key: "F", description: "Seleccionar Relleno" },
    ],
  },
  {
    category: "Edición",
    items: [
      { key: "Ctrl + Z", description: "Deshacer" },
      { key: "Ctrl + Y", description: "Rehacer" },
      { key: "Ctrl + Shift + Z", description: "Rehacer (alternativo)" },
    ],
  },
  {
    category: "Vista",
    items: [
      { key: "F11", description: "Pantalla completa (navegador)" },
      { key: "Esc", description: "Salir de pantalla completa" },
    ],
  },
];

export default function KeyboardShortcutsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
          title="Atajos de teclado"
        >
          <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden lg:inline ml-1 text-xs">Ayuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[200vw] max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Atajos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category} className="space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-semibold pb-1">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 p-2 sm:p-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70 transition-colors"
                  >
                    <span className="text-xs sm:text-sm  flex-1">
                      {shortcut.description}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {shortcut.key.split(" + ").map((key, index, array) => (
                        <div key={index} className="flex items-center">
                          <kbd className="px-2 py-1 text-xs font-mono   rounded shadow-sm bg-white dark:bg-black">
                            {key}
                          </kbd>
                          {index < array.length - 1 && (
                            <span className="mx-1 text-xs">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Información adicional */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border">
            <h4 className="text-xs sm:text-sm font-medium mb-2">💡 Consejos</h4>
            <ul className="text-xs sm:text-sm space-y-1">
              <li>
                • Usa el modo pantalla completa para una mejor experiencia de
                dibujo
              </li>
              <li>
                • Puedes cambiar herramientas rápidamente mientras dibujas
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
