/// <reference types="vite/client" />
import {App} from "./main.ts";

declare global {
  interface Window {
    _ctx: App
  }
}
