import {GridConstruct} from "../interfaces/grid.ts";

export class Node {
  public f: number // Résultat de h + g

  constructor(
    public pos: { x: number, y: number },
    public g: number = 0, // Le coût (résultat de parent.g + 1) entre le node parent et celui-ci
    public h: number = 0, // Distance entre le node et la destination
    public walkable: boolean = false,
    public opened: boolean = false,
    public closed: boolean = false,
    public parent?: Node,
    f?: number
  ) {
    this.f = f ?? h + g
  }
}

export class Grid {
  public tileSize: number = 16

  constructor(
    public matrix: GridConstruct['matrix'] = [],
    public nodes: GridConstruct['nodes'] = [],
    public width: GridConstruct['width'] = 0,
    public height: GridConstruct['height'] = 0,
    public startPos: GridConstruct['startPos'] = {x: 0, y: 0},
    public endPos: GridConstruct['endPos'] = {x: 0, y: 0}
  ) {
    if (this.nodes.length === 0) {
      this.nodes = this._buildNodes()
    }
  }

  static fromObj(payload: GridConstruct) {
    return new Grid(
      payload.matrix,
      payload.nodes,
      payload.width,
      payload.height,
      payload.startPos,
      payload.endPos
    )
  }

  defineMatrix(value: { walkable: boolean, colorIndex: number }[][]) {
    this.matrix = value

    this.height = value.length
    this.width = value[0].length

    this.nodes = this._buildNodes()
  }

  clone() {
    return structuredClone(this.nodes)
  }

  isWalkableAt(x: number, y: number): boolean {
    if (typeof this.matrix[y] === 'undefined' || typeof this.matrix[y][x] === 'undefined') {
      return false
    }

    return this.matrix[y][x].walkable
  }

  isInGrid(x: number, y: number) {
    return (x >= 0 && x < this.width) && (y >= 0 && y < this.height)
  }

  getNodeAt(x: number, y: number) {
    return this.nodes[y][x]
  }

  private _buildNodes() {
    const nodes = []

    for (let i = 0; i < this.height; ++i) {
      nodes[i] = new Array(this.height)
      for (let j = 0; j < this.width; ++j) {
        nodes[i][j] = new Node({ x: j, y: i })
      }
    }

    for (let i = 0; i < this.height; ++i) {
      for (let j = 0; j < this.width; ++j) {
        nodes[i][j].walkable = this.matrix[i][j].walkable
      }
    }

    return nodes
  }

  getSuccessors(node: Node) {
    const successors = []
    const x = node.pos.x
    const y = node.pos.y
    const nodes = this.clone()

    // Top
    if (this.isWalkableAt(x, y - 1)) {
      successors.push(nodes[y - 1][x])
    }

    // Left
    if (this.isWalkableAt(x + 1, y)) {
      successors.push(nodes[y][x + 1])
    }

    // Bottom
    if (this.isWalkableAt(x, y + 1)) {
      successors.push(nodes[y + 1][x])
    }

    // Right
    if (this.isWalkableAt(x - 1, y)) {
      successors.push(nodes[y][x - 1])
    }

    return successors
  }
}


