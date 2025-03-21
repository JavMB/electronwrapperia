const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Mantener las funciones existentes
  askOpenRouter: (params) => ipcRenderer.invoke('askOpenRouter', params),
  getOpenRouterModels: (filter) => ipcRenderer.invoke('getOpenRouterModels', filter),
  
  // Añadir nuevas funciones para la pestaña de noticias
  scrapeNews: () => ipcRenderer.invoke('scrapeNews'),
  openExternalLink: (url) => ipcRenderer.invoke('openExternalLink', url)
});