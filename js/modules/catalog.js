// ==========================================================================
// js/modules/catalog.js - Módulo para la gestión y visualización del catálogo
// ==========================================================================

import { convertCurrency, formatCurrency } from './currency.js';

// --- NUEVO: Función para inicializar el selector de monedas (con imágenes) ---
function initCurrencySelector() {
    const currencyCurrent = document.getElementById('currencyCurrent');
    const currencyDropdown = document.getElementById('currencyDropdown');
    const currentFlag = document.getElementById('currentFlag');
    const currentName = document.getElementById('currentName');

    if (!currencyCurrent || !currencyDropdown) return;

    // --- CORRECCIÓN: Siempre inicia en ARS por defecto ---
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'ARS';
    
    // --- CAMBIO CLAVE: Usamos backgroundImage en lugar de textContent para la bandera ---
    const updateCurrencyUI = (currency) => {
        const selectedOption = currencyDropdown.querySelector(`[data-currency="${currency}"]`);
        if (selectedOption) {
            currentFlag.style.backgroundImage = `url('${selectedOption.dataset.flag}')`;
            currentName.textContent = currency;
        }
    };

    // Establecemos la moneda inicial
    updateCurrencyUI(savedCurrency);

    // Event listener para el botón principal
    currencyCurrent.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = currencyCurrent.getAttribute('aria-expanded') === 'true';
        currencyCurrent.setAttribute('aria-expanded', !isExpanded);
        currencyDropdown.classList.toggle('show');
    });

    // Event listener para las opciones del menú
    currencyDropdown.addEventListener('click', (e) => {
        if (e.target.classList.contains('currency-option')) {
            const newCurrency = e.target.dataset.currency;
            
            // Guardamos la nueva moneda en localStorage
            localStorage.setItem('selectedCurrency', newCurrency);
            
            // Actualizamos la UI
            updateCurrencyUI(newCurrency);
            
            // Cerramos el dropdown
            currencyDropdown.classList.remove('show');
            currencyCurrent.setAttribute('aria-expanded', 'false');

            // --- CLAVE: Disparamos el evento personalizado que catalog.js está esperando ---
            const event = new CustomEvent('currencyChanged', {
                detail: { currency: newCurrency }
            });
            document.dispatchEvent(event);
        }
    });

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!currencyDropdown.contains(e.target) && e.target !== currencyCurrent) {
            currencyDropdown.classList.remove('show');
            currencyCurrent.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Inicializa la funcionalidad del catálogo.
 */
export function initCatalog() {
    console.log("Inicializando módulo del catálogo...");

    // --- CONFIGURACIÓN Y ESTADO ---
    const LOCAL_STORAGE_KEY = 'tempoDiBagsProducts';
    const PRODUCTS_PER_PAGE = 30;
    const INITIAL_DATA_URL = 'data/products.json';

    // Referencias a los contenedores
    const searchBarWrapper = document.getElementById('search-bar-wrapper');
    const productsGridWrapper = document.getElementById('products-grid-wrapper');
    const paginationWrapper = document.getElementById('pagination-wrapper');

    if (!searchBarWrapper || !productsGridWrapper || !paginationWrapper) {
        console.error("Error: No se encontraron los contenedores necesarios para el catálogo.");
        return;
    }

    let currentPage = 1;
    let allProducts = [];
    let currentCurrency = 'ARS';
    
    // NUEVO: Separamos el término de búsqueda del término activo
    let searchTerm = ''; // Lo que el usuario escribe en el input
    let activeSearchTerm = ''; // El término que filtra el catálogo
    
    // Variable de estado para el filtro de marca
    let activeBrandFilter = ''; // La marca que filtra el catálogo

    // --- NUEVO: Escuchamos el evento de filtrado desde el menú de marcas ---
    document.addEventListener('filterByBrand', (e) => {
        activeBrandFilter = e.detail.brand;
        currentPage = 1; // Reiniciamos a la primera página
        renderProducts(); // Volvemos a renderizar el catálogo con el filtro aplicado
    });

    // --- FUNCIÓN PARA CARGAR DATOS INICIALES ---
    const seedInitialData = async () => {
        try {
            console.log("LocalStorage vacío. Cargando datos iniciales desde JSON...");
            const response = await fetch(INITIAL_DATA_URL);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const initialProducts = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialProducts));
            return initialProducts;
        } catch (error) {
            console.error("No se pudieron cargar los datos iniciales:", error);
            productsGridWrapper.innerHTML = `<p style="text-align: center; padding: 2rem; color: red;">Error al cargar los productos iniciales.</p>`;
            return [];
        }
    };

    // --- FUNCIÓN DE FILTRADO ---
    const filterProducts = (products, term, brand) => {
        let filtered = products;

        // Filtramos por término de búsqueda si existe
        if (term) {
            const lowerCaseTerm = term.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(lowerCaseTerm) ||
                product.brand.toLowerCase().includes(lowerCaseTerm)
            );
        }

        // Filtramos por marca si existe
        if (brand) {
            filtered = filtered.filter(product =>
                product.brand.toLowerCase() === brand.toLowerCase()
            );
        }

        return filtered;
    };

    // --- FUNCIÓN PARA RENDERIZAR LA BARRA DE BÚSQUEDA (CON SELECTOR DE MONEDAS) ---
    const renderSearchBar = () => {
        searchBarWrapper.innerHTML = `
            <div class="search-bar-container">
                <input type="text" class="search-input" placeholder="Buscar por nombre o marca...">
                
                <!-- Botón de Buscar con Icono SVG -->
                <button class="action-button search-button has-tooltip" data-tooltip="Buscar con el término actual">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-9-9-9-9"></path>
                        <path d="m21 21-9-9-9-9"></path>
                    </svg>
                    <span>Buscar</span>
                </button>

                <!-- Botón de Limpiar Filtros con Icono SVG -->
                <button class="action-button clear-filters-btn has-tooltip" data-tooltip="Borrar todos los filtros">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 12 12 19"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Limpiar</span>
                </button>

                <!-- NUEVO: Selector de Monedas con Imágenes -->
                <div class="currency-selector-wrapper">
                    <button class="currency-current" id="currencyCurrent" aria-haspopup="true" aria-expanded="false">
                        <div class="currency-flag-icon" id="currentFlag"></div>
                        <span class="currency-name" id="currentName">ARS</span>
                    </button>
                    <div class="currency-dropdown" id="currencyDropdown">
                        <button class="currency-option" data-currency="ARS" data-flag="https://flagcdn.com/48x36/ar.png">Argentina (ARS)</button>
                        <button class="currency-option" data-currency="USD" data-flag="https://flagcdn.com/48x36/us.png">EE.UU. (USD)</button>
                        <button class="currency-option" data-currency="BRL" data-flag="https://flagcdn.com/48x36/br.png">Brasil (BRL)</button>
                        <button class="currency-option" data-currency="EUR" data-flag="https://flagcdn.com/48x36/eu.png">España (EUR)</button>
                    </div>
                </div>

                <div class="search-autocomplete-dropdown"></div>
            </div>
        `;

        // Inicializamos el selector de monedas después de inyectar el HTML
        initCurrencySelector();

        const searchInput = searchBarWrapper.querySelector('.search-input');
        const dropdown = searchBarWrapper.querySelector('.search-autocomplete-dropdown');
        const clearFiltersBtn = searchBarWrapper.querySelector('.clear-filters-btn');

        // Event listener para el input de búsqueda
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            const filteredForAutocomplete = filterProducts(allProducts, searchTerm, activeBrandFilter);
            renderAutocomplete(filteredForAutocomplete, dropdown);
        });

        // Listener para la tecla "Enter"
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                activeSearchTerm = searchTerm;
                currentPage = 1;
                renderProducts();
                dropdown.style.display = 'none';
            }
        });

        // Listener para el botón de limpiar filtros
        clearFiltersBtn.addEventListener('click', () => {
            searchTerm = '';
            activeSearchTerm = '';
            activeBrandFilter = '';
            searchInput.value = '';
            currentPage = 1;
            
            document.querySelectorAll('.brand-filter-link.active').forEach(link => {
                link.classList.remove('active');
            });

            renderProducts();
        });

        // Ocultar autocompletado al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!searchBarWrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    };

    // --- FUNCIÓN PARA RENDERIZAR AUTOCOMPLETADO ---
    const renderAutocomplete = (products, dropdownElement) => {
        dropdownElement.innerHTML = '';
        if (products.length === 0 || searchTerm === '') {
            dropdownElement.style.display = 'none';
            return;
        }
        const maxResultsToShow = 4;
        const limitedProducts = products.slice(0, maxResultsToShow);

        limitedProducts.forEach(product => {
            const item = document.createElement('div');
            item.classList.add('autocomplete-item');

            // --- MODIFICACIÓN: Manejo robusto de imágenes para el autocompletado ---
            let imageUrl;
            if (product.imageUrl) {
                if (product.imageUrl.startsWith('data:image')) {
                    imageUrl = product.imageUrl;
                } else if (product.imageUrl.startsWith('http')) {
                    imageUrl = product.imageUrl;
                } else {
                    imageUrl = product.imageUrl;
                }
            } else {
                // Imagen por defecto si no hay ninguna
                imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRUVFIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNDQ0IyLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDlWMTNNMTIgMTdIMTIuMDFNMjEgMTJIMjEuMDFNNCAxMkg0LjAxTDEyIDZDNy4wMjkgNiAzIDkuMDI5IDMgMTRTNy4wMjkgMjIgMjJDMTIuMDEgMjIgMTIuMDIxIDIyIDEyLjAzMSAyMkMxNi45NzEgMjIgMjAgMTguOTcxIDIwIDE0UzE2Ljk3MSA2IDEyIDZaIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4=';
            }

            item.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}" class="autocomplete-item-image">
                <div class="autocomplete-item-info">
                    <span class="autocomplete-item-name">${product.name}</span>
                    <span class="autocomplete-item-brand">${product.brand}</span>
                </div>
            `;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const searchInput = searchBarWrapper.querySelector('.search-input');
                searchInput.value = product.name;
                searchTerm = product.name;
                activeSearchTerm = product.name;
                currentPage = 1;
                renderProducts();
                dropdownElement.style.display = 'none';
            });
            dropdownElement.appendChild(item);
        });
        dropdownElement.style.display = 'block';
    };

    // --- FUNCIÓN PRINCIPAL: OBTENER Y MOSTRAR PRODUCTOS ---
    const fetchProducts = async () => {
        const productsFromStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
        allProducts = productsFromStorage ? JSON.parse(productsFromStorage) : await seedInitialData();
        if (allProducts.length === 0) {
            productsGridWrapper.innerHTML = `<p style="text-align: center; padding: 2rem; color: #666;">No hay productos para mostrar.</p>`;
            return;
        }
        
        // NUEVO: Ordenar los productos del más nuevo al más antiguo
        allProducts.sort((a, b) => b.id - a.id);

        renderSearchBar();
        renderProducts();
    };

    // --- LÓGICA DE PAGINACIÓN ---
    const changePage = (page) => {
        const filteredProducts = filterProducts(allProducts, activeSearchTerm, activeBrandFilter);
        const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderProducts();
    };

    // --- RENDERIZADO DEL DOM ---
    const renderProducts = async () => {
        const filteredProducts = filterProducts(allProducts, activeSearchTerm, activeBrandFilter);
        const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const endIndex = startIndex + PRODUCTS_PER_PAGE;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        let productsWithConvertedPrice;
        try {
            productsWithConvertedPrice = await Promise.all(
                paginatedProducts.map(async (product) => {
                    const convertedAmount = await convertCurrency(product.price, 'ARS', currentCurrency);
                    const formattedPrice = formatCurrency(convertedAmount, currentCurrency);
                    return { ...product, formattedPrice };
                })
            );
        } catch (error) {
            console.error("Error al convertir las monedas:", error);
            productsWithConvertedPrice = paginatedProducts.map(product => ({
                ...product,
                formattedPrice: formatCurrency(product.price, 'ARS')
            }));
        }

        const productsHTML = productsWithConvertedPrice.map(product => {
            // --- MODIFICACIÓN: Manejo robusto de imágenes para el catálogo principal ---
            let imageUrl;
            if (product.imageUrl) {
                if (product.imageUrl.startsWith('data:image')) {
                    imageUrl = product.imageUrl;
                } else if (product.imageUrl.startsWith('http')) {
                    imageUrl = product.imageUrl;
                } else {
                    imageUrl = product.imageUrl;
                }
            } else {
                // Imagen por defecto si no hay ninguna
                imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';
            }
            
            const isSoldOut = product.status === 'sold-out';
            return `
                <div class="product-card ${isSoldOut ? 'sold-out' : ''}" data-id="${product.id}">
                    <div class="product-card-image-container">
                        <img src="${imageUrl}" alt="${product.name}" class="product-card-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
                        ${isSoldOut ? '<span class="sold-out-label">Agotado</span>' : ''}
                    </div>
                    <div class="product-card-info">
                        <h3 class="product-card-title">${product.name}</h3>
                        <p class="product-card-brand">${product.brand}</p>
                        <p class="product-card-description">${product.description || 'Una pieza única y elegante.'}</p>
                        <p class="product-card-price">${product.formattedPrice}</p>
                        <div class="product-card-actions">
                            <span class="product-availability-status">${isSoldOut ? 'Agotado' : 'Disponible'}</span>
                            <button class="add-to-cart-btn" data-id="${product.id}" title="Agregar al Carrito" ${isSoldOut ? 'disabled' : ''}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
        let paginationHTML = `<div class="pagination-container">`;
        paginationHTML += `<button class="pagination-button" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>`;
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationHTML += `<button class="pagination-button" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>`;
        paginationHTML += `</div>`;

        productsGridWrapper.innerHTML = `<div class="products-grid">${productsHTML}</div>`;
        paginationWrapper.innerHTML = paginationHTML;
    };

    // --- MANEJO DE EVENTOS ---
    document.getElementById('catalog-section').addEventListener('click', (e) => {
        // Lógica de paginación
        const paginationButton = e.target.closest('.pagination-button');
        if (paginationButton) {
            const pageAction = paginationButton.dataset.page;
            if (pageAction === 'prev') changePage(currentPage - 1);
            else if (pageAction === 'next') changePage(currentPage + 1);
            else changePage(parseInt(pageAction, 10));
            return;
        }
        // Lógica del botón "Agregar al Carrito"
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        if (addToCartBtn && !addToCartBtn.disabled) {
            console.log(`(Placeholder) Agregando 1 unidad del producto ${addToCartBtn.dataset.id} al carrito.`);
            return;
        }
        // Lógica del botón de búsqueda (lupa)
        const searchButton = e.target.closest('.search-button');
        if (searchButton) {
            const searchInput = searchBarWrapper.querySelector('.search-input');
            if (searchInput) {
                searchTerm = searchInput.value;
                activeSearchTerm = searchTerm;
                currentPage = 1;
                renderProducts();
            }
            return;
        }
        
        // --- ELIMINADO: La lógica del filtro de marca ahora está en layout.js ---
    });

    // Escucha el evento personalizado de cambio de moneda
    document.addEventListener('currencyChanged', async (e) => {
        currentCurrency = e.detail.currency;
        await renderProducts();
    });

    // --- INICIALIZACIÓN DEL MÓDULO ---
    fetchProducts();
}