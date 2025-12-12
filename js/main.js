// ==========================================================================
// main.js - Punto de Entrada Único y Lógica General del Sitio
// ==========================================================================

// Importaciones ESTÁTICAS (se cargan siempre)
import { initLayout } from './modules/layout.js';
import { initCustomCursor } from './modules/cursor.js';
import { initNavigation } from './modules/navigation.js';
import { convertCurrency, formatCurrency } from './modules/currency.js';

// Esperamos a que el DOM esté listo. Un solo listener es suficiente.
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('DOM listo. Inicializando Tempo di Bags...');
    
    // 1. Inicializamos el layout común para todas las páginas (header, nav, footer).
    initLayout();

    // 2. Inicializamos los módulos GLOBALES que se usan en todas las páginas.
    initCustomCursor();
    initNavigation();
    
    // 3. --- NUEVO: Lógica del selector de moneda ---
    const currencySelector = document.getElementById('currency-selector');
    if (currencySelector) {
        currencySelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('currency-btn')) {
                document.querySelectorAll('.currency-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                const event = new CustomEvent('currencyChanged', {
                    detail: { currency: e.target.dataset.currency }
                });
                document.dispatchEvent(event);
            }
        });
    }

    // 4. --- IMPORTACIONES DINÁMICAS (para robustez) ---
    
    // Inicializamos el catálogo solo si estamos en la página principal
    if (document.querySelector('#catalog-section')) {
        import('./modules/catalog.js')
            .then(module => {
                module.initCatalog();
                console.log('Módulo del catálogo (catalog.js) cargado e inicializado.');
            })
            .catch(error => {
                console.error('Error al cargar el módulo del catálogo (catalog.js):', error);
            });
    }

    // Inicializamos la página de carga solo si estamos en esa página
    if (document.querySelector('.upload-main')) {
        import('./modules/upload.js')
            .then(module => {
                module.initUploadPage();
                console.log('Módulo de carga (upload.js) cargado e inicializado.');
            })
            .catch(error => {
                console.error('Error al cargar el módulo de carga (upload.js):', error);
            });
    }

    // Inicializamos la página de "Sobre Nosotros" si estamos en esa página
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