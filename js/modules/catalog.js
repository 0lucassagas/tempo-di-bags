// ==========================================================================
// js/modules/catalog.js - Módulo para la gestión y visualización del catálogo
// ==========================================================================

import { convertCurrency, formatCurrency } from './currency.js';

/**
 * Inicializa la funcionalidad del catálogo.
 * Carga productos desde un JSON inicial o desde localStorage, los renderiza y gestiona la paginación.
 */
export function initCatalog() {
    console.log("Inicializando módulo del catálogo...");

    // --- CONFIGURACIÓN Y ESTADO ---
    const LOCAL_STORAGE_KEY = 'tempoDiBagsProducts';
    const PRODUCTS_PER_PAGE = 30; // Mostramos 30 productos por página
    const INITIAL_DATA_URL = 'data/products.json';

    const catalogSection = document.getElementById('catalog-section');
    if (!catalogSection) {
        console.error(`Error: No se encontró el contenedor del catálogo con el ID 'catalog-section'.`);
        return;
    }

    let currentPage = 1;
    let allProducts = [];
    let currentCurrency = 'ARS'; // Moneda por defecto

    // --- FUNCIÓN PARA CARGAR DATOS INICIALES ---
    /**
     * Carga los productos desde el archivo JSON si localStorage está vacío.
     * Esta función asegura que el catálogo siempre tenga datos para mostrar.
     */
    const seedInitialData = async () => {
        try {
            console.log("LocalStorage vacío. Cargando datos iniciales desde JSON...");
            const response = await fetch(INITIAL_DATA_URL);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const initialProducts = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialProducts));
            console.log("Datos iniciales cargados en localStorage.");
            return initialProducts;
        } catch (error) {
            console.error("No se pudieron cargar los datos iniciales:", error);
            catalogSection.innerHTML = `<p style="text-align: center; padding: 2rem; color: red;">Error al cargar los productos iniciales. Por favor, recarga la página.</p>`;
            return []; // Devuelve un array vacío para evitar más errores
        }
    };

    // --- FUNCIÓN PRINCIPAL: OBTENER Y MOSTRAR PRODUCTOS ---
    /**
     * Obtiene los productos desde localStorage (o desde el JSON inicial) e inicia el renderizado.
     */
    const fetchProducts = async () => {
        try {
            const productsFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
            
            // Si no hay productos en localStorage, los cargamos desde el JSON.
            allProducts = productsFromStorage ? JSON.parse(productsFromStorage) : await seedInitialData();
            
            // Si después de intentar cargar, el array sigue vacío, mostramos el mensaje.
            if (allProducts.length === 0) {
                catalogSection.innerHTML = `<p style="text-align: center; padding: 2rem; color: #666;">No hay productos para mostrar. ¡Carga el primero!</p>`;
                return;
            }

            // Si hay productos, renderizamos la primera página.
            renderProducts();
        } catch (error) {
            console.error("Error al procesar los productos desde localStorage:", error);
            catalogSection.innerHTML = `<p style="text-align: center; padding: 2rem; color: red;">Hubo un error al cargar el catálogo.</p>`;
        }
    };

    // --- LÓGICA DE PAGINACIÓN ---
    /**
     * Cambia la página actual y vuelve a renderizar los productos.
     * @param {number} page - El número de página al que se quiere cambiar.
     */
    const changePage = (page) => {
        const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderProducts();
    };

    // --- RENDERIZADO DEL DOM ---
    /**
     * Renderiza la cuadrícula de productos y los controles de paginación
     * para la página actual. Esta función es asíncrona porque convierte monedas.
     */
    const renderProducts = async () => {
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);

        let productsWithConvertedPrice;
        try {
            // Convertimos los precios de todos los productos de la página en paralelo para mayor eficiencia.
            productsWithConvertedPrice = await Promise.all(
                paginatedProducts.map(async (product) => {
                    const convertedAmount = await convertCurrency(product.price, 'ARS', currentCurrency);
                    const formattedPrice = formatCurrency(convertedAmount, currentCurrency);
                    return { ...product, formattedPrice };
                })
            );
        } catch (error) {
            console.error("Error al convertir las monedas, mostrando precios en ARS:", error);
            // Si la conversión falla, mostramos los precios originales en ARS como fallback.
            productsWithConvertedPrice = paginatedProducts.map(product => ({
                ...product,
                formattedPrice: formatCurrency(product.price, 'ARS')
            }));
        }

        // Generamos el HTML de las tarjetas de producto.
        const productsHTML = productsWithConvertedPrice.map(product => {
            // Preparamos la URL de la imagen Base64 para que sea válida.
            const imageUrl = product.imageUrl.startsWith('data:image') 
                ? product.imageUrl 
                : `data:image/jpeg;base64,${product.imageUrl}`;

            return `
                <div class="product-card ${product.status === 'sold-out' ? 'sold-out' : ''}" data-id="${product.id}">
                    <div class="product-card-image-container">
                        <img src="${imageUrl}" alt="${product.name}" class="product-card-image">
                        ${product.status === 'sold-out' ? '<span class="sold-out-label">Agotado</span>' : ''}
                    </div>
                    <div class="product-card-info">
                        <h3 class="product-card-title">${product.name}</h3>
                        <p class="product-card-brand">${product.brand}</p>
                        <p class="product-card-description">${product.description || 'Una pieza única y elegante.'}</p>
                        <p class="product-card-price">${product.formattedPrice}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Generamos el HTML de los botones de paginación.
        const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
        let paginationHTML = `<div class="pagination-container">`;
        
        paginationHTML += `<button class="pagination-button" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        paginationHTML += `<button class="pagination-button" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>`;
        paginationHTML += `</div>`;

        // Inyectamos todo el HTML generado en el contenedor principal.
        catalogSection.innerHTML = `<div class="products-grid">${productsHTML}</div>${paginationHTML}`;
    };

    // --- MANEJO DE EVENTOS ---
    /**
     * Maneja los clics en los controles de paginación usando delegación de eventos.
     */
    catalogSection.addEventListener('click', (e) => {
        const paginationButton = e.target.closest('.pagination-button');
        if (!paginationButton) return;

        const pageAction = paginationButton.dataset.page;

        if (pageAction === 'prev') {
            changePage(currentPage - 1);
        } else if (pageAction === 'next') {
            changePage(currentPage + 1);
        } else {
            changePage(parseInt(pageAction, 10));
        }
    });

    /**
     * Escucha el evento personalizado 'currencyChanged' disparado por el selector de moneda.
     */
    document.addEventListener('currencyChanged', async (e) => {
        currentCurrency = e.detail.currency;
        console.log(`Moneda cambiada a: ${currentCurrency}`);
        await renderProducts(); // Re-renderizamos con la nueva moneda
    });

    // --- INICIALIZACIÓN DEL MÓDULO ---
    fetchProducts();
}