# 🚀 OpenRouter AI Wrapper

Este es un potente wrapper de IA que integra **todos los modelos de OpenRouter**, permitiendo a los usuarios elegir el modelo que desean usar para sus consultas, similar a ChatGPT. Además, cuenta con una funcionalidad avanzada de **scraping** para obtener la lista completa de modelos disponibles y ordenarlos según distintos criterios.

## 🛠 Características

### 📌 Funcionalidad Principal
- Consulta a cualquier modelo de OpenRouter de manera fácil y rápida.
- Soporte para múltiples modelos en una sola interfaz.
- Configuración sencilla para alternar entre modelos.

### 🔍 Scraping de Modelos
- Obtiene **todos** los modelos disponibles en OpenRouter.
- Ordena los modelos según:
  - **Precio** (de mayor a menor)
  - **Capacidad de contexto**
  - **Fecha de lanzamiento** (newest)

## 📦 Instalación

Clona este repositorio y accede al directorio:

```bash
 git clone https://github.com/JavMB/electronwrapperia.git
 cd openrouter-ai-wrapper
```

Instala las dependencias necesarias:

```bash
npm install
```

## 🚀 Uso

### 🧠 Ejecutar la Aplicación

Para iniciar la aplicación, usa:

```bash
npm start
```

Esto ejecutará la aplicación utilizando Electron.

### 🧠 Interactuar con Modelos de IA
Puedes interactuar con cuaquier modelo de IA , incluso modelos muy nuevos que aun no estan listados en la propia web, también hay muchos modelos gratuitos.



### 🔍 Obtener y Ordenar Modelos Disponibles

Es posible ordenar por precio de mayor a menor, menor a mayor, contexto y por novedad todos los modelos, ademas de poder clickar en uno en la lista y empezar a usarlo.

## 🔑 Configuración de la API
Para usar el wrapper, necesitas una **API Key** de OpenRouter. Configúrala en una variable de entorno o pásala directamente en `main.js`.

```bash
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "TU_CLAVE_API_DE_OPENROUTER";
```



## 📜 Licencia
Este proyecto está bajo la licencia MIT. ¡Siéntete libre de contribuir! 😊

