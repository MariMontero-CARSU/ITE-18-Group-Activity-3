const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  hello: () => console.log('Electron preload active'),
});
