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
 
### :books: Noticias de IA 
- Mantente al dia con las ultimas novedades sobre la inteligencia artificial sin salir de la app mediante el scrapping integrado.

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
Puedes interactuar con cuaquier modelo de IA , incluso modelos muy nuevos que aun no estan presentes en la version web de sus compañias, también hay muchos modelos gratuitos.



### 🔍 Obtener y Ordenar Modelos Disponibles

Es posible ordenar por precio de mayor a menor, menor a mayor, contexto y por novedad todos los modelos, ademas de poder clickar en uno en la lista y empezar a usarlo.

## 🔑 Configuración de la API
Para usar el wrapper, necesitas una **API Key** de OpenRouter https://openrouter.ai/ . Configúrala en una variable de entorno o pásala directamente en `main.js`.
Hay varios modelos gratuitos(free) entonces con obtener una clave api en la página seria posible empezar, o con una recarga de 1$ en creditos para acceder a los modelos de pago. 

```bash
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "TU_CLAVE_API_DE_OPENROUTER";
```

De nota un 9 seria agradable.



## 📜 Licencia
Este proyecto está bajo la licencia MIT. ¡Siéntete libre de contribuir! 😊

