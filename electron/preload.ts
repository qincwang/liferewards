// Preload runs in an isolated context with access to both Node.js and the DOM.
// Expose only what the renderer needs via contextBridge — nothing here for now
// since the app uses only localStorage, which is available natively in the renderer.
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
})
