import { Grid } from "../core/grid.ts"

export interface CanvasRenderer {
  canvas: HTMLCanvasElement
  renderer: CanvasRenderingContext2D
  grid: Grid
  options: {
    scaleFactor: number
  }
}
