const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");
const puppeteer = require('puppeteer-core');
const { shell } = require('electron');
let mainWindow;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: true,
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


// Manejador para realizar el scraping de noticias
ipcMain.handle("scrapeNews", async () => {
  try {
    console.log("Iniciando scraping de noticias de IA...");

    const findChromePath = () => {
      if (process.platform === 'win32') {
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
        ];
        
        for (const path of possiblePaths) {
          if (require('fs').existsSync(path)) return path;
        }
      } else if (process.platform === 'darwin') {
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      } else {
        const possiblePaths = [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser'
        ];
        
        for (const path of possiblePaths) {
          if (require('fs').existsSync(path)) return path;
        }
      }
      
      throw new Error('No se encontró una instalación de Chrome. Por favor instala Google Chrome.');
    };

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: findChromePath(), 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navegando a artificialintelligence-news.com...");
    
    await page.goto('https://www.artificialintelligence-news.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log("Página cargada, extrayendo artículos...");
    
    const articles = await page.evaluate(() => {
      const newsItems = [];
      const elements = document.querySelectorAll('.elementor-heading-title.elementor-size-default a');

      elements.forEach(element => {
        const title = element.textContent.trim();
        const url = element.href;
        
        if (title && url) {
          newsItems.push({ title, url });
        }
      });

      return newsItems;
    });

    if (articles.length < 3) {
      const screenshotPath = path.join(app.getPath('temp'), 'ai-news-screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Captura de pantalla guardada en: ${screenshotPath}`);
    }

    await browser.close();
    console.log(`Scraping completado: ${articles.length} artículos encontrados`);

    if (articles.length === 0) {
      throw new Error('No se encontraron artículos en la página. El sitio puede haber cambiado su estructura o estar bloqueando scrapers.');
    }

    return articles;
  } catch (error) {
    console.error("Error al realizar scraping:", error);
    throw error;
  }
});

// Manejar apertura de enlaces externos
ipcMain.handle("openExternalLink", async (event, url) => {
  await shell.openExternal(url);
});