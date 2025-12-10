// ==========================================================================
// main.js - Punto de Entrada y Lógica General del Sitio
// ==========================================================================

// Importamos nuestros módulos especializados
import { initCustomCursor } from './modules/cursor.js';
import { initNavigation } from './modules/navigation.js';
import { initCatalog } from './modules/catalog.js'; 
import { initUploadPage } from './modules/upload.js';

// Esperamos a que todo el contenido de la página esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Inicializando Tempo di Bags...');
    
    // Inicializamos módulos globales que están en todas las páginas
    initCustomCursor();
    initNavigation();

    // --- INICIO: INICIALIZACIÓN CONDICIONAL ---
    // Solo inicializamos un módulo si el elemento clave de su página existe.

    // Inicializamos el catálogo solo si estamos en index.html
    if (document.getElementById('catalog-section')) {
        console.log('Página de catálogo detectada. Inicializando catálogo...');
        initCatalog();
    }

    // Inicializamos la página de carga solo si estamos en cargar-producto.html
    if (document.querySelector('.upload-main')) {
        console.log('Página de carga detectada. Inicializando carga...');
        initUploadPage();
    }
    
    console.log('Aplicación lista.');
});