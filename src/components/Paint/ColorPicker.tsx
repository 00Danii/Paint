"use client";
import { Button } from "@/components/ui/button";
import { useCanvas } from "../../contexts/CanvasContext";

const colors = [
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
];

export default function ColorPicker() {
  const { state, dispatch } = useCanvas();

  return (
    <div className="dark:bg-black p-4">
      <div className="mb-3">
        <div className="text-xs  font-medium mb-2">Color Actual</div>
        <div
          className="w-12 h-12 rounded-lg  shadow-lg mx-auto"
          style={{ backgroundColor: state.color }}
        />
      </div>

      <div className="grid grid-cols-8 gap-1">
        {colors.map((color) => (
          <Button
            key={color}
            variant="ghost"
            className={`w-6 h-6 p-0 rounded-md border transition-all duration-200 hover:scale-110 ${
              state.color === color ? "" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => dispatch({ type: "SET_COLOR", payload: color })}
          />
        ))}
      </div>

      <div className="mt-3">
        <input
          type="color"
          value={state.color}
          onChange={(e) =>
            dispatch({ type: "SET_COLOR", payload: e.target.value })
          }
          className="w-full h-8 rounded-md  bg-transparent cursor-pointer"
        />
      </div>
    </div>
  );
}
