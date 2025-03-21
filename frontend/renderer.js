// Cambiar visibilidad de tabs
const tabButtons = document.querySelectorAll(".tab-buttons button");
const tabContents = document.querySelectorAll(".tab-content");

// Función para mostrar un tab específico
function showTab(tabId) {
  // Ocultamos todas las secciones
  tabContents.forEach((tab) => {
    tab.style.display = "none";
  });
  
  // Quitamos la clase active de todos los botones
  tabButtons.forEach((btn) => {
    btn.classList.remove("active");
  });
  
  // Mostramos la sección seleccionada
  document.getElementById(tabId).style.display = "block";
  
  // Activamos el botón correspondiente
  document.querySelector(`.tab-buttons button[data-tab="${tabId}"]`).classList.add("active");
  
  // Si estamos mostrando la pestaña de modelos, preparamos la interfaz
  if (tabId === "modelsTab" && (!modelsData || modelsData.length === 0)) {
    loadModels(); // Carga inicial sin filtro
  }
}

// Configurar eventos click para los botones de pestañas
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    showTab(btn.dataset.tab);
  });
});

// Variables globales para el seletor de modelos
let allModels = [];
let selectedModelId = "openai/gpt-4-turbo";
const modelSelector = document.querySelector(".model-selector-current");
const modelDropdown = document.querySelector(".model-dropdown");
const selectedModelDisplay = document.querySelector(".selected-model");
const arrowIcon = document.querySelector(".arrow-icon");
const modelDropdownList = document.querySelector(".model-dropdown-list");
const modelSearchInput = document.getElementById("modelSearchInput");

// Función para cargar y organizar los modelos para el selector
async function loadModelsForSelector() {
  if (allModels.length === 0) {
    try {
      // Mostrar estado de carga
      modelDropdownList.innerHTML = '<div class="loading-models">Cargando modelos...</div>';
      
      // Intentar cargar modelos desde la API
      const models = await window.api.getOpenRouterModels();
      
      // Si hay modelos, organizarlos por proveedor
      if (Array.isArray(models) && models.length > 0) {
        allModels = models;
        renderModelsList(allModels);
      } else {
        modelDropdownList.innerHTML = '<div class="loading-models">No se encontraron modelos disponibles</div>';
      }
    } catch (error) {
      console.error("Error al cargar modelos para el selector:", error);
      modelDropdownList.innerHTML = '<div class="loading-models">Error al cargar modelos</div>';
      
      // Cargar algunos modelos por defecto en caso de error
      allModels = [
        { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo" },
        { id: "anthropic/claude-3-opus", name: "Claude 3 Opus" },
        { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet" },
        { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" },
        { id: "google/gemini-pro", name: "Gemini Pro" },
        { id: "mistralai/mistral-7b", name: "Mistral 7B" },
        { id: "mistralai/mixtral-8x7b", name: "Mixtral 8x7B" },
        { id: "meta-llama/llama-3-70b", name: "Llama 3 70B" }
      ];
      renderModelsList(allModels);
    }
  } else {
    // Si ya tenemos modelos cargados, solo renderizamos la lista
    renderModelsList(allModels);
  }
}

// Función para renderizar la lista de modelos
function renderModelsList(models, searchTerm = '') {
  // Limpiar la lista
  modelDropdownList.innerHTML = '';
  
  // Si hay término de búsqueda, filtramos los modelos
  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    models = models.filter(model => 
      (model.name && model.name.toLowerCase().includes(lowerSearchTerm)) || 
      model.id.toLowerCase().includes(lowerSearchTerm)
    );
  }

  if (models.length === 0) {
    modelDropdownList.innerHTML = '<div class="loading-models">No se encontraron modelos que coincidan</div>';
    return;
  }

  // Organizar modelos por proveedor
  const modelsByProvider = {};
  models.forEach(model => {
    const provider = model.id.split('/')[0];
    if (!modelsByProvider[provider]) {
      modelsByProvider[provider] = [];
    }
    modelsByProvider[provider].push(model);
  });

  // Renderizar modelos agrupados por proveedor
  Object.keys(modelsByProvider).sort().forEach(provider => {
    // Agregar encabezado de proveedor
    const providerHeading = document.createElement('div');
    providerHeading.className = 'model-group-heading';
    providerHeading.textContent = provider.toUpperCase();
    modelDropdownList.appendChild(providerHeading);

    // Agregar modelos de este proveedor
    modelsByProvider[provider].forEach(model => {
      const modelOption = document.createElement('div');
      modelOption.className = `model-option ${model.id === selectedModelId ? 'selected' : ''}`;
      modelOption.dataset.modelId = model.id;
      
      const displayName = model.name || model.id.split('/').pop().replace(/-/g, ' ');
      
      modelOption.innerHTML = `
        <div class="model-option-details">
          <div class="model-option-name">${displayName}</div>
          <div class="model-option-id">${model.id}</div>
        </div>
      `;
      
      modelOption.addEventListener('click', () => {
        selectModel(model.id, displayName);
      });
      
      modelDropdownList.appendChild(modelOption);
    });
  });
}

// Función para seleccionar un modelo
function selectModel(modelId, displayName) {
  selectedModelId = modelId;
  
  // Actualizar texto mostrado
  const displayText = displayName || modelId.split('/').pop().replace(/-/g, ' ');
  selectedModelDisplay.textContent = displayText;
  
  // Cerrar dropdown
  toggleModelDropdown(false);
  
  // Guardar modelo seleccionado (opcional)
  localStorage.setItem('selectedModelId', modelId);
  
  console.log(`Modelo seleccionado: ${modelId}`);
}

// Toggle para mostrar/ocultar el dropdown de modelos
function toggleModelDropdown(forceState) {
  const isOpen = forceState !== undefined ? forceState : modelDropdown.style.display !== "block";
  
  modelDropdown.style.display = isOpen ? "block" : "none";
  arrowIcon.classList.toggle("up", isOpen);
  arrowIcon.classList.toggle("down", !isOpen);
  
  if (isOpen) {
    loadModelsForSelector();
    // Enfocar la barra de búsqueda cuando se abre
    setTimeout(() => modelSearchInput.focus(), 100);
  }
}

// Evento para abrir/cerrar el dropdown
modelSelector.addEventListener('click', () => toggleModelDropdown());

// Cerrar dropdown si se hace clic fuera de él
document.addEventListener('click', (e) => {
  if (!modelSelector.contains(e.target) && !modelDropdown.contains(e.target)) {
    toggleModelDropdown(false);
  }
});

// Buscar modelos mientras se escribe
modelSearchInput.addEventListener('input', (e) => {
  renderModelsList(allModels, e.target.value);
});

// Evento para enviar prompt a OpenRouter
document.getElementById("sendChat").addEventListener("click", async () => {
  const prompt = document.getElementById("chatPrompt").value.trim();
  const chatResult = document.getElementById("chatResult");
  
  // Validación básica
  if (!prompt) {
    chatResult.innerHTML = "<p style='color: var(--warning);'>Por favor, escribe una pregunta.</p>";
    return;
  }
  
  // Mostrar indicador de carga
  chatResult.innerHTML = "<p class='loading'><em>Generando respuesta...</em></p>";
  
  try {
    // Enviar objeto con prompt y modelo seleccionado
    const respuesta = await window.api.askOpenRouter({
      prompt: prompt,
      model: selectedModelId
    });
    
    // Mostrar respuesta
    chatResult.textContent = respuesta;
  } catch (error) {
    // Mostrar error formateado
    chatResult.innerHTML = `<p style="color: var(--error);">Error: ${error.message || "No se pudo obtener respuesta"}</p>`;
  }
});

// Para la pestaña de modelos
let modelsData = [];
const modelsList = document.querySelector('.models-list');

// Función para cargar modelos en la pestaña de modelos
async function loadModels(filter) {
  try {
    // Mostrar estado de carga
    modelsList.innerHTML = '<p class="loading">Cargando modelos...</p>';
    
    // Obtener modelos desde la API con el filtro aplicado
    modelsData = await window.api.getOpenRouterModels(filter);
    
    if (!modelsData || modelsData.length === 0) {
      modelsList.innerHTML = '<p>No se encontraron modelos disponibles.</p>';
      return;
    }
    
    // Actualizar UI con los modelos
    renderModels(modelsData);
    
    // Actualizar texto del botón de filtro
    if (filter) {
      document.querySelector('.dropbtn').textContent = `Filtro: ${filter}`;
    }
  } catch (error) {
    console.error("Error al cargar modelos:", error);
    modelsList.innerHTML = `<p style="color: var(--error);">Error: ${error.message || "No se pudieron cargar los modelos"}</p>`;
  }
}

// Renderizar modelos en la interfaz
function renderModels(models) {
  modelsList.innerHTML = '';
  
  models.forEach(model => {
    const modelCard = document.createElement('div');
    modelCard.className = 'model-card';
    
    // Obtener nombre para mostrar
    const displayName = model.name || model.id.split('/').pop().replace(/-/g, ' ');
    
    // Formatear el contexto en una forma más legible
    const contextSize = model.context_length 
      ? formatNumber(model.context_length) + ' tokens'
      : 'No especificado';
      
    // Formatear precio si existe
    const pricingInfo = model.pricing
      ? `$${(model.pricing.completion * 1000).toFixed(4)}/1K tkns`
      : 'No disponible';
      
    // Verificar si el modelo tiene un proveedor
    const provider = model.id.includes('/') 
      ? model.id.split('/')[0] 
      : 'Desconocido';
      
    modelCard.innerHTML = `
      <h3 title="${model.id}">${displayName}</h3>
      <div class="model-info">
        <div class="model-detail">
          <span class="detail-label">ID:</span> 
          <span class="detail-value">${model.id}</span>
        </div>
        <div class="model-detail">
          <span class="detail-label">Proveedor:</span> 
          <span class="detail-value">${provider}</span>
        </div>
        <div class="model-detail">
          <span class="detail-label">Contexto:</span> 
          <span class="detail-value">${contextSize}</span>
        </div>
        <div class="model-detail">
          <span class="detail-label">Precio:</span> 
          <span class="detail-value">${pricingInfo}</span>
        </div>
        ${model.description ? `
        <div class="model-detail description">
          <span class="detail-label">Descripción:</span>
          <span class="detail-value">${truncateText(model.description, 100)}</span>
        </div>` : ''}
      </div>
    `;
    
    // Añadir evento para seleccionar este modelo para el chat
    modelCard.addEventListener('click', () => {
      selectModel(model.id, displayName);
      showTab('chatTab');
    });
    
    modelsList.appendChild(modelCard);
  });
}

// Funciones auxiliares
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ---- CONTROL DEL DROPDOWN ----
const dropdown = document.querySelector('.dropdown');
const dropbtn = document.querySelector('.dropbtn');

// Mostrar/ocultar el dropdown al hacer clic en el botón
dropbtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('open');
});

// Configurar eventos para las opciones del dropdown de filtros
document.querySelectorAll(".dropdown-content a").forEach(link => {
  link?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const filterValue = e.target.textContent;
    loadModels(filterValue);
    dropdown.classList.remove('open'); // Cerramos el dropdown después de seleccionar
  });
});

// Cerrar el dropdown cuando se hace clic fuera de él
document.addEventListener('click', (e) => {
  if (dropdown && !dropdown.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// Cargar modelo guardado al inicializar
document.addEventListener('DOMContentLoaded', () => {
  // Mostrar el primer tab por defecto
  showTab("chatTab");
  
  // Cargar modelo guardado si existe
  const savedModelId = localStorage.getItem('selectedModelId');
  if (savedModelId) {
    selectedModelId = savedModelId;
    const displayName = savedModelId.split('/').pop().replace(/-/g, ' ');
    selectedModelDisplay.textContent = displayName;
  }
  
  // Cargar los modelos en segundo plano para que estén listos
  setTimeout(() => {
    if (allModels.length === 0) {
      loadModelsForSelector();
    }
  }, 1000);

  // Lógica para la pestaña de noticias
const refreshNewsBtn = document.getElementById('refreshNews');
const newsContainer = document.querySelector('.news-container');
const newsStatus = document.querySelector('.news-status');

// Función para cargar noticias
async function loadNews() {
  if (!refreshNewsBtn || !newsContainer) return;
  
  try {
    // Actualizar UI para mostrar que se están cargando
    refreshNewsBtn.disabled = true;
    refreshNewsBtn.textContent = 'Cargando...';
    newsStatus.textContent = 'Obteniendo las últimas noticias...';
    newsContainer.innerHTML = '<p class="loading">Extrayendo información de artificialintelligence-news.com...</p>';
    
    // Llamar a la función de scraping
    const articles = await window.api.scrapeNews();
    
    // Actualizar estado
    refreshNewsBtn.disabled = false;
    refreshNewsBtn.textContent = 'Actualizar Noticias';
    
    if (!articles || articles.length === 0) {
      newsContainer.innerHTML = '<div class="no-results">No se encontraron artículos. Intenta nuevamente más tarde.</div>';
      newsStatus.textContent = 'No se encontraron artículos.';
      return;
    }
    
    // Mostrar última actualización
    const now = new Date();
    newsStatus.textContent = `Última actualización: ${now.toLocaleTimeString()} - ${articles.length} artículos encontrados`;
    
    // Renderizar artículos
    renderNewsArticles(articles);
  } catch (error) {
    console.error('Error al cargar noticias:', error);
    
    // Actualizar UI para mostrar el error
    newsContainer.innerHTML = `<div class="no-results">Error al cargar noticias: ${error.message || 'Error desconocido'}</div>`;
    newsStatus.textContent = 'Error al cargar noticias.';
    refreshNewsBtn.disabled = false;
    refreshNewsBtn.textContent = 'Reintentar';
  }
}

// Función para renderizar artículos
function renderNewsArticles(articles) {
  newsContainer.innerHTML = '';
  
  articles.forEach(article => {
    const articleCard = document.createElement('div');
    articleCard.className = 'news-card';
    
    // Crear contenido HTML para el artículo
    articleCard.innerHTML = `
      ${article.image ? `<img src="${article.image}" alt="${article.title}" class="news-image">` : ''}
      <div class="news-content">
        <div class="news-date">${article.date}</div>
        <h3 class="news-title">${article.title}</h3>
        <p class="news-summary">${truncateText(article.summary, 120)}</p>
        <div class="news-link">
          <a href="${article.url}" target="_blank" rel="noopener noreferrer">Leer más</a>
        </div>
      </div>
    `;
    
    newsContainer.appendChild(articleCard);
  });
}

// Registrar evento de clic para botón de actualizar
refreshNewsBtn?.addEventListener('click', loadNews);
});

// Manejar clic en enlaces para abrirlos en navegador externo
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (link && link.getAttribute('target') === '_blank') {
    e.preventDefault();
  
    if (window.api.openExternalLink) {
      window.api.openExternalLink(link.getAttribute('href'));
    } else {
      window.open(link.getAttribute('href'), '_blank');
    }
  }
});
