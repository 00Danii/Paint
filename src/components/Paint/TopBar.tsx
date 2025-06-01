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
} from "lucide-react";
import { useCanvas } from "../../contexts/CanvasContext";
import { useTheme } from "next-themes";

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
    <div className="flex items-center justify-between p-3 dark:bg-black">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {/* <Palette className="w-6 h-6 " />
          <h1 className="text-xl font-bold ">Paint</h1> */}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={state.historyIndex <= 0}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={state.historyIndex >= state.history.length - 1}
        >
          <RotateCw className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Archivo
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

        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_FULLSCREEN" })}
        >
          {state.isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
