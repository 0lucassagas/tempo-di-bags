// ==========================================================================
// main.js - Punto de Entrada y Lógica General del Sitio
// ==========================================================================

// --- IMPORTACIÓN DE MÓDULOS ---
// Cada línea importa una función específica de un archivo en la carpeta 'modules'.

// Módulo para: Inicializar el cursor personalizado y sus efectos de estela.
import { initCustomCursor } from './modules/cursor.js';

// Módulo para: Inicializar la barra de navegación, incluyendo el menú desplegable de marcas.
import { initNavigation } from './modules/navigation.js';

// Módulo para: Cargar y mostrar el catálogo de productos, manejando la paginación.
import { initCatalog } from './modules/catalog.js'; 

// Módulo para: Inicializar la funcionalidad del formulario para cargar nuevos productos.
import { initUploadPage } from './modules/upload.js';


// --- INICIALIZACIÓN DE LA APLICACIÓN ---
// Esperamos a que todo el contenido del HTML esté cargado antes de ejecutar nuestro código.
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Inicializando Tempo di Bags...');
    
    // Llamamos a cada función importada para activar las diferentes partes de la web.
    initCustomCursor();   // Activa el cursor personalizado.
    initNavigation();     // Activa el menú de marcas.
    initCatalog();       // Activa la lógica del catálogo de productos.

    // Inicializamos la página de carga solo si estamos en esa página específica.
    // Esto evita errores al intentar ejecutar código en páginas que no tienen los elementos necesarios.
    if (document.querySelector('.upload-main')) {
        initUploadPage();
    }
    
    // Próximamente agregaremos:
    // initGame();
    
    console.log('Aplicación lista.');
});