import { App } from "../main.ts"
import { Node } from "./grid.ts"

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

function getLowestNodeIndex(openList: Node[]) {
  let lowestNodeIndex = 0

  for (let i = 0; i < openList.length; i++) {
    if (openList[i].f < openList[lowestNodeIndex].f) {
      lowestNodeIndex = i
    }
  }

  return lowestNodeIndex
}

export function findPath(
  app: App,
  startPos: { x: number, y: number },
  endPos: { x: number, y: number }
) {
  const openList: Node[] = [] // TODO: for better perf use hashMap ?
  const path: { x: number, y: number }[] = []
  const startNode = app.grid.getNodeAt(startPos.x, startPos.y)
  const endNode = app.grid.getNodeAt(endPos.x, endPos.y)

  startNode.g = 0
  startNode.f = 0

  openList.push(startNode)
  startNode.opened = true

  while (openList.length > 0) {
    // récupérer dans openList, le node avec le plus petit f
    let nIndex = getLowestNodeIndex(openList) // TODO: perf, index by f ?
    const n = openList[nIndex]

    // Suppression du node courant dans openList
    openList.splice(nIndex, 1)
    n.closed = true

    // Le node courant correspond à la destination
    if (n.pos.x === endNode.pos.x && n.pos.y === endNode.pos.y) {
      let temp = structuredClone(n);

      // Ajout du path de tous les parents
      while (typeof temp.parent !== 'undefined') {
        path.push(temp.parent.pos)
        temp = temp.parent
      }

      return path.reverse()
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
          const successorInOpenListIndex = openList.findIndex((openListNode) => openListNode.pos.x === x && openListNode.pos.y === y)
          openList.splice(successorInOpenListIndex, 1, successor)
        }
      }
    }
  }

  return []
}
