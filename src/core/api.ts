import { CanvasRenderer } from "../interfaces/canvas.ts"

export class Api {
  private readonly palette: string[]
  private mapAdjustments = {x: 0, y: 0}

  constructor(private context: CanvasRenderer) {
    this.palette = [
      '#000000',
      '#1D2B53',
      '#7E2553',
      '#008751',
      '#AB5236',
      '#5F574F',
      '#C2C3C7',
      '#FFF1E8',
      '#FF004D',
      '#FFA300',
      '#FFEC27',
      '#00E436',
      '#29ADFF',
      '#83769C',
      '#FF77A8',
      '#FFCCAA',
    ]
  }

  public clearScreen(colorIndex?: number): void {
    const context = this.context.renderer

    if (colorIndex === undefined) {
      context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    } else {
      context.fillStyle = this.palette[colorIndex]
      context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height)
    }
  }

  public widthInPixels(): number {
    return this.context.canvas.width / this.context.options.scaleFactor
  }

  public heightInPixels(): number {
    return this.context.canvas.height / this.context.options.scaleFactor
  }

  public drawPixel(x: number, y: number, colorIndex: number): void {
    this.context.renderer.fillStyle = this.palette[colorIndex]

    this.context.renderer.fillRect(
      x * this.context.options.scaleFactor,
      y * this.context.options.scaleFactor,
      this.context.options.scaleFactor,
      this.context.options.scaleFactor
    )
  }

  public drawRectOutline(x0: number, y0: number, w: number, h: number, colorIndex: number): void {
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
          this.drawPixel(x0 + x, y0 + y, colorIndex)
        }
      }
    }
  }

  public drawRect(x: number, y: number, w: number, h: number, colorIndex: number): void {
    this.context.renderer.fillStyle = this.palette[colorIndex]

    this.context.renderer.fillRect(
      x * this.context.options.scaleFactor,
      y * this.context.options.scaleFactor,
      w * this.context.options.scaleFactor,
      h * this.context.options.scaleFactor
    )

    this.drawRectOutline(x, y, w, h, 0)
  }

  public drawLine(from: { x: number, y: number }, to: { x: number, y: number }, c: number): void {
    from.x = Math.ceil(from.x)
    from.y = Math.ceil(from.y)
    to.x = Math.ceil(to.x)
    to.y = Math.ceil(to.y)
    let dx = Math.abs(to.x - from.x)
    let dy = Math.abs(to.y - from.y)
    let sx = from.x < to.x ? 1 : -1
    let sy = from.y < to.y ? 1 : -1
    let err = dx - dy

    for (let x = 0; x <= dx; x++) {
      for (let y = 0; y <= dy; y++) {
        this.drawPixel(from.x, from.y, c)
        if (from.x == to.x && from.y == to.y) {
          break
        }
        let e2 = 2 * err
        if (e2 >= -dy) {
          err -= dy
          from.x += sx
        }
        if (e2 < dx) {
          err += dx
          from.y += sy
        }
      }
    }
  }

  public map(
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    sx?: number,
    sy?: number
  ): void {
    let mapArray = this.context.grid.matrix
    let tileSize = this.context.grid.tileSize
    let numberVerticalTiles = this.context.grid.height
    let numberHorizontalTiles = this.context.grid.width
    let width = w || numberHorizontalTiles
    let height = h || numberVerticalTiles
    this.mapAdjustments.x = x || 0
    this.mapAdjustments.y = y || 0
    let x1 = sx || 0
    let y1 = sy || 0

    for (let y0 = this.mapAdjustments.y; y0 < height; y0++) {
      for (let x0 = this.mapAdjustments.x; x0 < width; x0++) {
        this.drawTile(
          mapArray[y0][x0].walkable ? mapArray[y0][x0].colorIndex : 9,
          x1 + (x0 - this.mapAdjustments.x) * tileSize,
          y1 + (y0 - this.mapAdjustments.y) * tileSize
        )
      }
    }
  }

  public drawTileRec(colorIndex: number, x1: number, y1: number, x0: number, y0: number) {
    this.drawTile(
      colorIndex,
      x1 + (x0 - this.mapAdjustments.x) * this.context.grid.tileSize,
      y1 + (y0 - this.mapAdjustments.y) * this.context.grid.tileSize
    )
  }

  public drawTile(colorIndex: number, x: number, y: number) {
    this.context.renderer.imageSmoothingEnabled = false
    this.drawRect(x, y, this.context.grid.tileSize, this.context.grid.tileSize, colorIndex)
  }
}
