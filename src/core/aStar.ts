import { App } from "../main.ts"
import { Node } from "./grid.ts"
import Heap from 'heap'

const CACHE: {
  startPos: { x: number, y: number },
  endPos: { x: number, y: number },
  path: {x: number, y: number}[],
} = {
  startPos: { x: 0, y: 0 },
  endPos: { x: 0, y: 0 },
  path: [],
}

/**
 * DOC: https://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
 */
function heuristicsManhattan(
  pos0: { x: number, y: number },
  pos1: { x: number, y: number }
) {
  const d1 = Math.abs(pos1.x - pos0.x)
  const d2 = Math.abs(pos1.y - pos0.y)
  return d1 + d2
}

export function findPath(
  app: App,
  startPos: { x: number, y: number },
  endPos: { x: number, y: number }
) {
  if (
    CACHE.startPos.x === startPos.x &&
    CACHE.startPos.y === startPos.y &&
    CACHE.endPos
  ) {
    return CACHE.path
  }

  CACHE.startPos = { ...startPos }
  CACHE.endPos = { ...endPos }

  const openList: Heap<Node> = new Heap((a: Node, b: Node) => a.f - b.f)
  const path: { x: number, y: number }[] = []
  const startNode = app.grid.getNodeAt(startPos.x, startPos.y)
  const endNode = app.grid.getNodeAt(endPos.x, endPos.y)

  startNode.g = 0
  startNode.f = 0

  openList.push(startNode)
  startNode.opened = true

  while (!openList.empty()) {
    // récupérer dans openList, le node avec le plus petit f
    const n = openList.pop()

    if (typeof n === 'undefined') {
      continue
    }

    n.closed = true

    // Le node courant correspond à la destination
    if (n.pos.x === endNode.pos.x && n.pos.y === endNode.pos.y) {
      let temp = structuredClone(n);

      // Ajout du path de tous les parents
      while (typeof temp.parent !== 'undefined') {
        path.push(temp.parent.pos)
        temp = temp.parent
      }

      CACHE.path = path.reverse()
      return CACHE.path
    }

    const successors = app.grid.getSuccessors(n)

    for (let i = 0, l = successors.length; i < l; ++i) {
      const successor = successors[i]
      if (successor.closed) {
        continue
      }

      const x = successor.pos.x
      const y = successor.pos.y

      // Distance entre le successeur et le node
      const ng = n.g + 1

      // Le successeur a déjà était ouvert ? ou le g du node et plus petit
      if (!successor.opened || ng < successor.g) {
        successor.g = ng
        successor.h = successor.h || heuristicsManhattan({ x, y }, endPos)
        successor.f = successor.g + successor.h
        successor.parent = n

        if (!successor.opened) {
          openList.push(successor)
          successor.opened = true
          app.grid.matrix[successor.pos.y][successor.pos.x].colorIndex = 15
        } else {
          openList.updateItem(successor)
        }
      }
    }
  }

  return []
}
