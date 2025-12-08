// js/modules/catalog.js

export function initCatalog() {
    const catalogSection = document.getElementById('catalog-section');
    const productsPerPage = 12;
    let currentPage = 1;
    let allProducts = [];

    // --- FUNCIÓN PARA OBTENER LOS PRODUCTOS ---
    const fetchProducts = () => {
        // Obtenemos los productos del localStorage. Si no hay, usamos un array vacío.
        const productsFromStorage = localStorage.getItem('tempoDiBagsProducts');
        allProducts = productsFromStorage ? JSON.parse(productsFromStorage) : [];
        
        // Si no hay productos, mostramos un mensaje
        if (allProducts.length === 0) {
            catalogSection.innerHTML = `<p style="text-align: center; padding: 2rem; color: #666;">No hay productos para mostrar. ¡Carga el primero!</p>`;
            return;
        }

        renderProducts();
    };

    // --- FUNCIÓN PARA RENDERIZAR LOS PRODUCTOS Y LA PAGINACIÓN ---
    const renderProducts = () => {
        // Calculamos los productos de la página actual
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);

        // Generamos el HTML de las tarjetas de productos
        const productsHTML = paginatedProducts.map(product => `
            <div class="product-card ${product.status === 'sold-out' ? 'sold-out' : ''}" data-id="${product.id}">
                <div class="product-card-image-container">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-card-image">
                    ${product.status === 'sold-out' ? '<span class="sold-out-label">Agotado</span>' : ''}
                </div>
                <div class="product-card-info">
                    <h3 class="product-card-title">${product.name}</h3>
                    <p class="product-card-brand">${product.brand}</p>
                    <p class="product-card-price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');

        // Generamos el HTML de la paginación
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        let paginationHTML = `<div class="pagination-container">`;
        
        // Botón "Anterior"
        paginationHTML += `<button class="pagination-button" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Anterior</button>`;
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        
        // Botón "Siguiente"
        paginationHTML += `<button class="pagination-button" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Siguiente</button>`;
        
        paginationHTML += `</div>`;

        // Inyectamos todo el HTML en la sección del catálogo
        catalogSection.innerHTML = `
            <div class="products-grid">
                ${productsHTML}
            </div>
            ${paginationHTML}
        `;
    };

    // --- FUNCIÓN GLOBAL PARA CAMBIAR DE PÁGINA ---
    // La hacemos global para que el 'onclick' en el HTML funcione
    window.changePage = (page) => {
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderProducts();
            // Hacemos scroll hacia arriba de la sección de catálogo
            catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // --- INICIALIZACIÓN ---
    fetchProducts();
}