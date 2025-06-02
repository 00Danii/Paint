"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Maximize,
  Minimize,
  Download,
  Upload,
  RotateCcw,
  RotateCw,
  Palette,
  PaintRoller,
} from "lucide-react";
import { useCanvas } from "../../contexts/CanvasContext";
import { useTheme } from "next-themes";
import KeyboardShortcutsModal from "./ModalAtajos";

export default function TopBar() {
  const { state, dispatch, canvasRef } = useCanvas();
  const { theme } = useTheme();

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "arte-uwu.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = theme == "dark" ? "#000000" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && state.history[state.historyIndex - 1]) {
      ctx.putImageData(state.history[state.historyIndex - 1], 0, 0);
    }
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && state.history[state.historyIndex + 1]) {
      ctx.putImageData(state.history[state.historyIndex + 1], 0, 0);
    }
  };

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 dark:bg-black">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <Palette className="w-5 h-5 sm:w-6 sm:h-6 " />
          <h1 className="text-sm sm:text-xl font-bold  bg-clip-text ">
            <span className="hidden sm:inline">Pizarrón</span>
          </h1>
          <span className="sm:hidden">Pizarrón</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={state.historyIndex <= 0}
          className=" h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={state.historyIndex >= state.history.length - 1}
          className=" h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
        >
          <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className=" text-xs sm:text-sm px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Archivo</span>
              <span className="sm:hidden">•••</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleSave}>
              <Download className="w-4 h-4 mr-2" />
              Guardar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClear}>
              <Upload className="w-4 h-4 mr-2" />
              Limpiar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Modal de atajos de teclado */}
        <KeyboardShortcutsModal />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_FULLSCREEN" })}
          className="hidden sm:flex h-8 w-8 sm:h-auto sm:w-auto p-1 sm:p-2"
        >
          {state.isFullscreen ? (
            <Minimize className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
