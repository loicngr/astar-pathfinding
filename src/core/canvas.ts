import { GameConfig } from "../interfaces/game.ts"

export class Canvas {
  public canvas: HTMLCanvasElement
  public renderer: CanvasRenderingContext2D
  public scaleFactor: number

  constructor(config: GameConfig) {
    this.canvas = document.createElement('canvas')
    document.getElementById(config.name)?.appendChild(this.canvas)
    this.renderer = this.canvas.getContext('2d')!
    this.renderer.imageSmoothingEnabled = false
    this.scaleFactor = config.scale || 1
    this.renderer.scale(this.scaleFactor, this.scaleFactor)

    this.canvas.width = config.width * this.scaleFactor || 64 * this.scaleFactor
    this.canvas.height = config.height * this.scaleFactor || 64 * this.scaleFactor

    if (config.fullscreen) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
    }
  }
}
