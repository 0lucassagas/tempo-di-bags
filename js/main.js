// ==========================================================================
// main.js - Punto de Entrada y Lógica General del Sitio
// ==========================================================================

// Importamos nuestros módulos especializados
import { initCustomCursor } from './modules/cursor.js';
import { initNavigation } from './modules/navigation.js'; // Este módulo ahora maneja el menú
import { initCatalog } from './modules/catalog.js'; 
import { initUploadPage } from './modules/upload.js'; // Módulo para la página de carga

// Esperamos a que todo el contenido de la página esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializamos cada módulo para que su funcionalidad se active
    console.log('Inicializando Tempo di Bags...');
    initCustomCursor(); // Activa el cursor personalizado
    initNavigation();   // Activa el menú de marcas (¡sin conflictos!)
    initCatalog();     // Activa la lógica del catálogo de productos

    // Inicializamos la página de carga solo si estamos en esa página
    if (document.querySelector('.upload-main')) {
        initUploadPage();
    }
    
    // Próximamente agregaremos:
    // initGame();
    
    console.log('Aplicación lista.');
});