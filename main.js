const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Gemini Desktop (Unofficial)",
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      partition: 'persist:gemini'
    }
  });

  // Ocultar menu nativo para visual de app moderno
  win.setMenuBarVisibility(false);

  // Carregar o Gemini
  win.loadURL('https://gemini.google.com/');

  // Injetar o arquivo injector.js quando a página terminar de carregar
  win.webContents.on('did-finish-load', () => {
    const injectorPath = path.join(__dirname, 'injector.js');
    if (fs.existsSync(injectorPath)) {
      const code = fs.readFileSync(injectorPath, 'utf8');
      win.webContents.executeJavaScript(code).catch(err => {
        console.error("Erro ao injetar script:", err);
      });
    }
  });
}

// IPC para abrir o seletor de pastas nativo do Windows
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const folderPath = result.filePaths[0];
  return {
    path: folderPath,
    files: readDirRecursively(folderPath, folderPath)
  };
});

// Ler diretório recursivamente ignorando pastas pesadas (como node_modules, .git)
function readDirRecursively(dir, rootDir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Ignorar diretórios pesados de dependência ou controle de versão
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.next', '.agents', '.gemini', 'brain'].includes(file)) {
        results = results.concat(readDirRecursively(filePath, rootDir));
      }
    } else {
      // Ler apenas arquivos de texto/código (extensões comuns)
      const ext = path.extname(file).toLowerCase();
      const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.md', '.txt', '.java', '.c', '.cpp', '.cs', '.go', '.rs', '.php'];
      if (textExtensions.includes(ext) && stat.size < 100 * 1024) { // Menor que 100KB para não estourar contexto
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const relativePath = path.relative(rootDir, filePath);
          results.push({
            name: file,
            path: relativePath,
            content: content
          });
        } catch (e) {
          console.error("Erro ao ler arquivo:", filePath, e);
        }
      }
    }
  });
  
  return results;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
