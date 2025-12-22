// ==========================================================================
// main.js - Punto de Entrada Único y Lógica General del Sitio
// ==========================================================================

console.log("main.js: Punto de entrada cargado.");

// Importaciones dinámicas para robustez
import { initLayout } from './modules/layout.js';
import { initCustomCursor } from './modules/cursor.js';
import { convertCurrency, formatCurrency } from './modules/currency.js';

// Esperamos a que el DOM esté listo. Un solo listener es suficiente.
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('main.js: DOM listo. Inicializando Tempo di Bags...');
    
    // 1. Inicializamos el layout común para todas las páginas (header, nav, footer).
    // Esta función ahora se encarga de todo el layout.
    initLayout();

    // 2. Inicializamos los módulos GLOBALES que se usan en todas las páginas.
    initCustomCursor();
    
    // 3. Inicializamos el catálogo solo si estamos en la página principal
    if (document.querySelector('#catalog-section')) {
        console.log("main.js: Página principal detectada. Cargando módulo del catálogo.");
        import('./modules/catalog.js')
            .then(module => {
                module.initCatalog();
                console.log("main.js: Módulo del catálogo cargado e inicializado.");
            })
            .catch(error => {
                console.error("main.js: Error al cargar el módulo del catálogo:", error);
            });
    }
    
    // 4. Inicializamos la página de carga solo si estamos en esa página
    if (document.querySelector('.upload-main')) {
        console.log("main.js: Página de carga detectada. Cargando módulo de carga.");
        import('./modules/upload.js')
            .then(module => {
                module.initUploadPage();
                console.log("main.js: Módulo de carga cargado e inicializado.");
            })
            .catch(error => {
                console.error("main.js: Error al cargar el módulo de carga:", error);
            });
    }

    // --- NUEVO: 5. Inicializamos el probador virtual si estamos en esa página ---
    if (document.querySelector('.probador-main')) {
        console.log("main.js: Página del probador virtual detectada. Cargando módulo del probador.");
        import('./modules/probador-virtual.js')
            .then(module => {
                module.initProbadorVirtual();
                console.log("main.js: Módulo del probador virtual cargado e inicializado.");
            })
            .catch(error => {
                console.error("main.js: Error al cargar el módulo del probador virtual:", error);
            });
    }
    
    console.log('main.js: Aplicación lista.');
});