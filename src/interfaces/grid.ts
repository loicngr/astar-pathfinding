import { type Node } from "../core/grid.ts"

export interface GridConstruct {
  matrix: { walkable: boolean, colorIndex: number }[][],
  nodes: Node[][],
  width: number,
  height: number,
  startPos:  { x: number, y: number },
  endPos:  { x: number, y: number }
}
