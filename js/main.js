// ==========================================================================
// main.js - Punto de Entrada y Lógica General del Sitio
// ==========================================================================

// Importamos nuestros módulos especializados
import { initCustomCursor } from './modules/cursor.js';
import { initNavigation } from './modules/navigation.js';
import { initCatalog } from './modules/catalog.js'; 
import { initUploadPage } from './modules/upload.js';
import { convertCurrency, formatCurrency } from './modules/currency.js';

// Esperamos a que todo el contenido de la página esté listo
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Inicializando Tempo di Bags...');
    initCustomCursor(); // Activa el cursor personalizado
    initNavigation();   // Activa el menú de marcas
    initCatalog();     // Activa la lógica del catálogo de productos

    // Inicializamos la página de carga solo si estamos en esa página
    if (document.querySelector('.upload-main')) {
        initUploadPage();
    }
    
    // Inicializamos la página de sobre nosotros si estamos en esa página
    if (document.querySelector('.about-main')) {
        // Podríamos tener un initAboutPage() en el futuro
        console.log('Página "Sobre Nosotros" detectada.');
    }
    
    // Prueba rápida del módulo de moneda (puede eliminarse luego)
    convertCurrency(100, 'USD', 'ARS').then(convertedAmount => {
        console.log(`Prueba de conversión: 100 USD son ${formatCurrency(convertedAmount, 'ARS')}`);
    });
    
    console.log('Aplicación lista.');
});