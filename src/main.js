const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");

let mainWindow;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), 
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.setMenu(null);
  
  mainWindow.loadFile(path.join(__dirname, "../frontend/index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// arranque de Electron
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  // En macOS, es común que las apps permanezcan en la barra de menús
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
// Manejador para preguntar a OpenRouter
ipcMain.handle("askOpenRouter", async (event, params) => {
  // Soportar tanto el formato antiguo (string) como el nuevo (objeto)
  const prompt = typeof params === 'string' ? params : params.prompt;
  const model = typeof params === 'string' ? "openai/gpt-4-turbo" : (params.model || "openai/gpt-4-turbo");
  
  try {
    console.log(`Enviando prompt a OpenRouter usando modelo: ${model}`);
    
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://tu-dominio.com", // Reemplaza con tu dominio
          "X-Title": "OpenRouter AI Hub" // Nombre de tu aplicación
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error al consultar OpenRouter:", error);
    throw error;
  }
});

// Manejador para obtener modelos disponibles
ipcMain.handle("getOpenRouterModels", async (event, filter) => {
  try {
    console.log(`Obteniendo modelos de OpenRouter ${filter ? `con filtro: ${filter}` : 'sin filtro'}`);
    
    const response = await axios.get(
      "https://openrouter.ai/api/v1/models",
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://tu-dominio.com", // Reemplaza con tu dominio
          "X-Title": "OpenRouter AI Hub" // Nombre de tu aplicación
        }
      }
    );
    
    let models = response.data.data;
    
    // Si hay un filtro, aplicarlo
    if (filter) {
      switch(filter) {
        case "Newest":
          models.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          break;
        case "Pricing: Low to High":
          models.sort((a, b) => {
            return (a.pricing?.completion || 0) - (b.pricing?.completion || 0);
          });
          break;
        case "Pricing: High to Low":
          models.sort((a, b) => {
            return (b.pricing?.completion || 0) - (a.pricing?.completion || 0);
          });
          break;
        case "Context: High to Low":
          models.sort((a, b) => (b.context_length || 0) - (a.context_length || 0));
          break;
      }
    }
    return models;
  } catch (error) {
    console.error("Error al obtener modelos:", error);
    throw error;
  }
});
