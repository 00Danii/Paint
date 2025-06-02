"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/contexts/CanvasContext";
import { Colorful } from "@uiw/react-color";
import { hsvaToHex, hsvaToRgbaString } from "@uiw/color-convert";

// Paletas organizadas por categorías
const colorCategories = {
  basicos: {
    name: "Básicos",
    colors: [
      "#000000",
      "#ffffff",
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#800000",
      "#008000",
      "#000080",
      "#808000",
      "#800080",
      "#008080",
      "#c0c0c0",
      "#808080",
    ],
  },
  pasteles: {
    name: "Pasteles",
    colors: [
      "#ffd1dc",
      "#d1ffd6",
      "#d1d6ff",
      "#fff0d1",
      "#f0d1ff",
      "#d1f0ff",
      "#ffb3ba",
      "#ffdfba",
      "#ffffba",
      "#baffc9",
      "#bae1ff",
      "#e1baff",
      "#ffbae1",
      "#babeff",
      "#ffe5e5",
      "#fff0e5",
      "#ffffe5",
      "#e5ffe9",
      "#e5f3ff",
      "#f0e5ff",
      "#ffe5f0",
      "#e5e5ff",
      "#ffc0cb",
      "#e6e6fa",
    ],
  },
  tierra: {
    name: "Tierra",
    colors: [
      "#a0522d",
      "#cd853f",
      "#deb887",
      "#f5deb3",
      "#8b4513",
      "#d2b48c",
      "#bc8f8f",
      "#f4a460",
      "#daa520",
      "#b8860b",
      "#cd5c5c",
      "#8b7355",
      "#696969",
      "#556b2f",
      "#6b8e23",
      "#9acd32",
      "#32cd32",
      "#228b22",
      "#006400",
      "#2e8b57",
      "#3cb371",
      "#20b2aa",
      "#008b8b",
    ],
  },
  neon: {
    name: "Neón",
    colors: [
      "#39ff14",
      "#ff073a",
      "#fe019a",
      "#0ff0fc",
      "#fcf802",
      "#ff6ec7",
      "#ff1493",
      "#00ff7f",
      "#1e90ff",
      "#ff4500",
      "#ffd700",
      "#adff2f",
      "#00ced1",
      "#ff69b4",
      "#00bfff",
      "#ff6347",
      "#7fff00",
      "#ff00ff",
      "#00ffff",
      "#ffff00",
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ff8c00",
    ],
  },
  oscuros: {
    name: "Oscuros",
    colors: [
      "#1a1a1a",
      "#2e2e2e",
      "#3b3b3b",
      "#4d4d4d",
      "#5e5e5e",
      "#6f6f6f",
      "#2f4f4f",
      "#191970",
      "#000080",
      "#483d8b",
      "#4b0082",
      "#8b008b",
      "#800080",
      "#8b0000",
      "#b22222",
      "#a52a2a",
      "#8b4513",
      "#654321",
      "#2f4f2f",
      "#006400",
      "#8b7d6b",
      "#36454f",
      "#414a4c",
      "#28282b",
    ],
  },
  vibrantes: {
    name: "Vibrantes",
    colors: [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#ffeaa7",
      "#dda0dd",
      "#98d8c8",
      "#f7dc6f",
      "#bb8fce",
      "#85c1e9",
      "#f8c471",
      "#82e0aa",
      "#f1948a",
      "#d7bde2",
      "#a9dfbf",
      "#e60073",
      "#0099cc",
      "#ffcc00",
      "#00cc99",
      "#cc0099",
      "#999900",
      "#660066",
      "#006666",
    ],
  },
  extendidos: {
    name: "Extendidos",
    colors: [
      "#ff9999",
      "#99ff99",
      "#9999ff",
      "#ffff99",
      "#ff99ff",
      "#99ffff",
      "#ffcc99",
      "#cc99ff",
      "#ff6666",
      "#66ff66",
      "#6666ff",
      "#ffff66",
      "#ff66ff",
      "#66ffff",
      "#ff9966",
      "#9966ff",
      "#ff3333",
      "#33ff33",
      "#3333ff",
      "#ffff33",
      "#ff33ff",
      "#33ffff",
      "#ff6633",
      "#6633ff",
      "#ff0066",
      "#66ff00",
      "#0066ff",
      "#ff6600",
      "#6600ff",
      "#00ff66",
      "#ff3366",
      "#3366ff",
      "#ff9990",
      "#90ff99",
      "#9990ff",
    ],
  },
};

// Combinamos todas las paletas para la vista completa
const allColors = Object.values(colorCategories).flatMap(
  (category) => category.colors
);

export default function ColorPicker() {
  const { state, dispatch } = useCanvas();
  const [activeTab, setActiveTab] = useState("picker");
  const [customColor, setCustomColor] = useState(state.color);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  // Convertir HSL a HEX
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Actualizar color desde HSL
  const updateColorFromHSL = () => {
    const hexColor = hslToHex(hue, saturation, lightness);
    dispatch({ type: "SET_COLOR", payload: hexColor });
    setCustomColor(hexColor);
  };

  return (
    <div className="p-2 sm:p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="picker" className="text-xs sm:text-sm">
            Selector
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Todos
          </TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm">
            HSL
          </TabsTrigger>
        </TabsList>

        {/* Color actual */}
        <div className="my-3 flex justify-center items-center gap-3">
          <div className="text-xs font-medium">Color:</div>
          <div
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-md flex-shrink-0"
            style={{ backgroundColor: state.color }}
          />
          <div className="text-xs font-mono">{state.color.toUpperCase()}</div>
        </div>

        <TabsContent value="all" className="mt-3">
          <div className="space-y-4 max-h-120 overflow-y-auto">
            {Object.entries(colorCategories).map(([key, category]) => (
              <div key={key} className="space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 border-b pb-1">
                  {category.name}
                </div>
                <div className="grid grid-cols-12 sm:grid-cols-16 lg:grid-cols-8 gap-0.5 sm:gap-1">
                  {category.colors.map((color) => (
                    <Button
                      key={color}
                      variant="ghost"
                      className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 p-0 rounded-sm lg:rounded-md border transition-all duration-200 hover:scale-110 ${
                        state.color === color
                          ? "border-black dark:border-white ring-2 ring-blue-500"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        dispatch({ type: "SET_COLOR", payload: color })
                      }
                      title={`${category.name}: ${color.toUpperCase()}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-3">
          {/* Controles HSL */}
          <div className="space-y-3">
            <div>
              <div className="text-xs font-medium mb-2">Matiz (Hue)</div>
              <Slider
                value={[hue]}
                onValueChange={(value) => {
                  setHue(value[0]);
                  updateColorFromHSL();
                }}
                max={360}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="text-xs mt-1">{hue}°</div>
            </div>

            <div>
              <div className="text-xs font-medium mb-2">Saturación</div>
              <Slider
                value={[saturation]}
                onValueChange={(value) => {
                  setSaturation(value[0]);
                  updateColorFromHSL();
                }}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="text-xs mt-1">{saturation}%</div>
            </div>

            <div>
              <div className="text-xs font-medium mb-2">Luminosidad</div>
              <Slider
                value={[lightness]}
                onValueChange={(value) => {
                  setLightness(value[0]);
                  updateColorFromHSL();
                }}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="text-xs mt-1">{lightness}%</div>
            </div>
          </div>

          {/* Vista previa del color personalizado */}
          <div className="flex items-center gap-2">
            <div
              className="w-full h-12 rounded-md"
              style={{ backgroundColor: hslToHex(hue, saturation, lightness) }}
            />
          </div>
        </TabsContent>

        <TabsContent value="picker" className="space-y-4 mt-3">
          <div className="space-y-2">
            <Colorful
              color={customColor}
              onChange={(color) => {
                setCustomColor(color.hex);
                dispatch({ type: "SET_COLOR", payload: color.hex });
              }}
              style={{ width: "100%" }}
              disableAlpha
            />
          </div>

          {/* Input manual de HEX */}
          <div className="space-y-2">
            <div className="text-xs font-medium">Código HEX</div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                    dispatch({ type: "SET_COLOR", payload: e.target.value });
                  }
                }}
                placeholder="#000000"
              />
              <Button
                onClick={() => {
                  if (/^#[0-9A-F]{6}$/i.test(customColor)) {
                    dispatch({ type: "SET_COLOR", payload: customColor });
                  }
                }}
                variant="outline"
              >
                OK
              </Button>
            </div>
          </div>

          {/* Colores recientes */}
          <div className="space-y-2">
            <div className="text-xs font-medium">Acceso Rápido</div>
            <div className="grid grid-cols-6 gap-1">
              {[
                "#FF0000",
                "#00FF00",
                "#0000FF",
                "#FFFF00",
                "#FF00FF",
                "#00FFFF",
              ].map((color) => (
                <Button
                  key={color}
                  variant="ghost"
                  className="w-8 h-8 p-0 rounded-md border"
                  style={{ backgroundColor: color }}
                  onClick={() =>
                    dispatch({ type: "SET_COLOR", payload: color })
                  }
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
