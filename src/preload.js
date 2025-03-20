const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  askOpenRouter: (params) => ipcRenderer.invoke('askOpenRouter', params),
  getOpenRouterModels: (filter) => ipcRenderer.invoke('getOpenRouterModels', filter)
});
