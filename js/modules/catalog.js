// ==========================================================================
// js/modules/catalog.js - Versión Optimizada con Event Delegation
// ==========================================================================

export function initCatalog() {
    const catalogSection = document.getElementById('catalog-section');
    const productsPerPage = 12;
    let currentPage = 1;
    let allProducts = [];

    // --- FUNCIÓN PARA OBTENER LOS PRODUCTOS ---
    const fetchProducts = () => {
        const productsFromStorage = localStorage.getItem('tempoDiBagsProducts');
        allProducts = productsFromStorage ? JSON.parse(productsFromStorage) : [];
        
        if (allProducts.length === 0) {
            catalogSection.innerHTML = `<p style="text-align: center; padding: 2rem; color: #666;">No hay productos para mostrar. ¡Carga el primero!</p>`;
            return;
        }

        renderProducts();
    };

    // --- FUNCIÓN PARA CAMBIAR DE PÁGINA ---
    const changePage = (page) => {
        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderProducts(); // Re-renderizamos con la nueva página
    };

    // --- FUNCIÓN PARA RENDERIZAR LOS PRODUCTOS Y LA PAGINACIÓN ---
    const renderProducts = () => {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);

        const productsHTML = paginatedProducts.map(product => `
            <div class="product-card ${product.status === 'sold-out' ? 'sold-out' : ''}" data-id="${product.id}">
                <div class="product-card-image-container">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-card-image">
                    ${product.status === 'sold-out' ? '<span class="sold-out-label">Agotado</span>' : ''}
                </div>
                <div class="product-card-info">
                    <h3 class="product-card-title">${product.name}</h3>
                    <p class="product-card-brand">${product.brand}</p>
                    <p class="product-card-description">${product.description || 'Una pieza única y elegante.'}</p>
                    <p class="product-card-price">$${product.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');

        const totalPages = Math.ceil(allProducts.length / productsPerPage);
        let paginationHTML = `<div class="pagination-container">`;
        
        paginationHTML += `<button class="pagination-button" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        paginationHTML += `<button class="pagination-button" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente</button>`;
        paginationHTML += `</div>`;

        catalogSection.innerHTML = `<div class="products-grid">${productsHTML}</div>${paginationHTML}`;
    };

    // --- INICIO: EVENT DELEGATION PARA LA PAGINACIÓN ---
    catalogSection.addEventListener('click', (e) => {
        // Verificamos si el clic fue en un botón de paginación
        const paginationButton = e.target.closest('.pagination-button');
        if (!paginationButton) return; // Si no, no hacemos nada

        // Obtenemos la página a la que queremos ir desde el atributo 'data-page'
        const pageToGo = paginationButton.dataset.page;

        if (pageToGo === 'prev') {
            changePage(currentPage - 1);
        } else if (pageToGo === 'next') {
            changePage(currentPage + 1);
        } else {
            // Es un número de página
            changePage(parseInt(pageToGo, 10));
        }
    });
    // --- FIN: EVENT DELEGATION ---

    // --- INICIALIZACIÓN ---
    fetchProducts();
}