// ==========================================================================
// main.js - Punto de Entrada Único y Lógica General del Sitio
// ==========================================================================

// Importaciones ESTÁTICAS (se cargan siempre)
import { initLayout } from './modules/layout.js';
import { initCustomCursor } from './modules/cursor.js';
import { initNavigation } from './modules/navigation.js';
import { initCatalog } from './modules/catalog.js';
import { convertCurrency, formatCurrency } from './modules/currency.js';

// Esperamos a que todo el contenido de la página esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Inicializando Tempo di Bags...');
    
    // 1. ¡IMPORTANTE! Inicializamos el layout común para todas las páginas.
    // Esto inyecta el header, el nav y el footer. Debe ser lo primero.
    initLayout();

    // 2. Inicializamos los módulos GLOBALES que se usan en todas las páginas
    initCustomCursor(); // Activa el cursor personalizado
    initNavigation();   // Activa el menú de marcas
    
    // 3. Inicializamos el catálogo solo si estamos en la página principal
    // (Asumimos que el catálogo solo existe en index.html)
    if (document.querySelector('#catalog-section')) {
        initCatalog();     // Activa la lógica del catálogo de productos
    }

    // 4. Inicializamos la página de carga solo si estamos en esa página
    // Usamos una importación DINÁMICA para evitar errores de sintaxis en otras páginas
    if (document.querySelector('.upload-main')) {
        import('./modules/upload.js')
            .then(module => {
                // El módulo exporta sus funciones en el objeto 'module'
                module.initUploadPage();
                console.log('Módulo de carga (upload.js) cargado e inicializado.');
            })
            .catch(error => {
                console.error('Error al cargar el módulo de carga (upload.js):', error);
                // Aquí podrías mostrar un mensaje al usuario de que la funcionalidad de carga no está disponible
            });
    }

    // 5. Inicializamos la página de "Sobre Nosotros" si estamos en esa página
    if (document.querySelector('.about-main')) {
        console.log('Página "Sobre Nosotros" detectada.');
        // Aquí podríamos añadir en el futuro: initAboutPage();
    }

    // Prueba rápida del módulo de moneda (puede eliminarse en el futuro)
    convertCurrency(100, 'USD', 'ARS').then(convertedAmount => {
        console.log(`Prueba de conversión: 100 USD son ${formatCurrency(convertedAmount, 'ARS')}`);
    });
    
    console.log('Aplicación lista.');
});