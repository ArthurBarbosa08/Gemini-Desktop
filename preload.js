const { contextBridge, ipcRenderer } = require('electron');

// Expõe canais seguros para a página web injetada se comunicar com o sistema local
contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder')
});
