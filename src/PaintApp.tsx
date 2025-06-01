"use client";
import { CanvasProvider } from "./contexts/CanvasContext";
import CanvasContainer from "./components/Paint/CanvasContainer";

export default function PaintApp() {
  return (
    <CanvasProvider>
      <CanvasContainer />
    </CanvasProvider>
  );
}
