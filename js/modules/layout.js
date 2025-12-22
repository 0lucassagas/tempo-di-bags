// ==========================================================================
// layout.js - Módulo para la inyección de componentes de layout comunes (Versión Final)
// ==========================================================================

/**
 * Inyecta el header, la navegación y el footer en la página.
 */
export function initLayout() {
    console.log("initLayout: Iniciando inyección del layout...");
    const body = document.body;

    // Prevenimos que se inyecte más de una vez
    if (body.querySelector('.main-header')) {
        console.log('initLayout: Layout ya inicializado. Omitiendo inyección.');
        return;
    }

    // --- 1. Definimos las plantillas por separado ---
    const headerAndNavTemplate = `
        <header class="main-header">
            <div class="smoke-container">
                <div class="smoke smoke-left"></div>
                <div class="smoke smoke-left-2"></div>
                <div class="smoke smoke-right"></div>
                <div class="smoke smoke-right-2"></div>
            </div>
            <div class="header-content-wrapper">
                <a href="index.html" class="header-logo-link">
                    <img id="header-logo" src="https://z-cdn-media.chatglm.cn/files/3bbfa97d-a75d-499a-a281-72a2f7c4d73b_logo.jpg?auth_key=1790863760-4812e8742a7a4627b887a0660dd66c77-0-028e1d72578d681598afda870811af77" alt="Logo de Tempo di Bags">
                </a>
                <div class="header-text-content">
                    <h1>Tempo di Bags</h1>
                    <p class="header-subtitle">¡Renueva tu estilo y marca tendencia!</p>
                </div>
            </div>
        </header>
        <div class="nav-wrapper">
            <a href="index.html" class="nav-link-sobre-nosotros">Inicio</a>
            <nav class="brand-menu" role="navigation" aria-label="Menú de marcas">
                <button class="menu-button" id="menuButton" aria-haspopup="true" aria-expanded="false">
                    Marcas
                </button>
                <div class="dropdown-content" id="brandDropdown">
                    <ul class="brand-list" id="brandList">
                        <!-- Las marcas serán inyectadas aquí por JavaScript -->
                    </ul>
                </div>
            </nav>
            <a href="cargar-producto.html" class="nav-link-sobre-nosotros">Cargar Producto</a>
            <a href="probador-virtual.html" class="nav-link-sobre-nosotros">Probador Virtual</a>
            <a href="sobre-nosotros.html" class="nav-link-sobre-nosotros">Sobre Nosotros</a>
        </div>
    `;

    const footerTemplate = `
        <footer>
        <div class="footer-smoke-container">
            <div class="footer-smoke footer-smoke-left"></div>
            <div class="footer-smoke footer-smoke-right"></div>
        </div>
        <div class="footer-content">
            <div class="contact-placeholder">
                <div class="footer-contact-image-container">
                    <a href="tel:1133036469" class="contact-link contact-link-phone1" aria-label="Llamar al 1133036469">Teléfono 1</a>
                    <a href="tel:1150971557" class="contact-link contact-link-phone2" aria-label="Llamar al 1150971557">Teléfono 2</a>
                    <a href="https://www.instagram.com/tempodibags" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-instagram" aria-label="Visitar nuestro Instagram">@TempoDiBags</a>
                    <a href="https://www.facebook.com/TempoDiBags" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-facebook" aria-label="Visitar nuestro Facebook">TempoDiBags</a>
                    <a href="https://www.tiktok.com/@tempodibags_mer" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-tiktok" aria-label="Visitar nuestro TikTok">@TempoDiBags_mer</a>
                </div>
            </div>
            <div class="map-container">
                <div class="map-header">
                    <h3>Zonas de Entrega</h3>
                    <p>Consultá nuestras zonas de entrega</p>
                </div>
                <div class="map-frame">
                    <iframe src="https://www.google.com/maps/d/embed?mid=14g80qB0y5h8wAtUJpxbtBi547S3Gxr8&ehbc=2E312F" width="640" height="480"></iframe>
                </div>
            </div>
        </div>
        </footer>
    `;

    // --- 2. Inyectamos en las posiciones correctas ---
    body.insertAdjacentHTML('afterbegin', headerAndNavTemplate);
    body.insertAdjacentHTML('beforeend', footerTemplate);

    console.log("initLayout: HTML inyectado. Inicializando sub-módulos...");
    
    // Llamamos a las funciones de inicialización
    setActiveNavLink();
    initBrandMenu(); // <-- ¡Esta es la función clave!
    initNavigation();

    console.log('initLayout: Layout común inyectado y sub-módulos inicializados correctamente.');
}

/**
 * Añade una clase 'active' al enlace de navegación que corresponde a la página actual.
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-wrapper a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

/**
 * Inicializa el menú de marcas con logos y filtrado.
 * Versión robusta con manejo de errores y comunicación por eventos.
 */
function initBrandMenu() {
    console.log("initBrandMenu: Inicializando menú de marcas con datos reales...");
    const brandList = document.getElementById('brandList');
    if (!brandList) {
        console.error("initBrandMenu: No se encontró el elemento #brandList.");
        return;
    }

    let brandsData = {};
    let brandsWithLogos = [];
    
    // Leemos los datos de las marcas con logos desde localStorage
    try {
        brandsData = JSON.parse(localStorage.getItem('tempoDiBagsBrandsData')) || {};
        brandsWithLogos = Object.keys(brandsData);
    } catch (error) {
        console.error("initBrandMenu: Error al parsear 'tempoDiBagsBrandsData'. Se omitirán los logos.", error);
    }

    // Leemos las marcas desde los productos
    let products = [];
    let brandsFromProducts = [];
    try {
        products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
        brandsFromProducts = [...new Set(products.map(p => p.brand).filter(Boolean))];
    } catch (error) {
        console.error("initBrandMenu: Error al parsear 'tempoDiBagsProducts'.", error);
    }

    // Combinamos ambas listas y eliminamos duplicados para obtener TODAS las marcas
    const allBrands = [...new Set([...brandsWithLogos, ...brandsFromProducts])].sort();

    brandList.innerHTML = '';
    if (allBrands.length === 0) {
        brandList.innerHTML = '<li><a href="#">No hay marcas disponibles</a></li>';
        return;
    }

    allBrands.forEach(brand => {
        try {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            
            // ¡CLAVE! Añadimos las clases y atributos necesarios para el filtrado!
            a.className = 'brand-filter-link';
            a.dataset.brand = brand;
            
            const brandInfo = brandsData[brand];
            if (brandInfo && brandInfo.logo) {
                a.innerHTML = `<img src="${brandInfo.logo}" alt="${brand}" class="brand-list-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"> <span style="display:none;">${brand}</span>`;
            } else {
                a.textContent = brand;
            }
            
            // --- NUEVO: Event Listener para el clic en la marca ---
            a.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Actualizamos la clase 'active' en el menú
                document.querySelectorAll('.brand-filter-link.active').forEach(link => {
                    link.classList.remove('active');
                });
                a.classList.add('active');

                // Disparamos un evento personalizado para comunicar el filtro al catálogo
                const event = new CustomEvent('filterByBrand', {
                    detail: { brand: brand }
                });
                document.dispatchEvent(event);

                // Cerramos el menú desplegable
                if (window.closeBrandDropdown) {
                    window.closeBrandDropdown();
                }
            });

            li.appendChild(a);
            brandList.appendChild(li);
        } catch (error) {
            console.error(`initBrandMenu: Error al procesar la marca "${brand}". Se omitirá.`, error);
        }
    });

    console.log(`initBrandMenu: Menú de marcas poblado con ${allBrands.length} marcas.`);
}

/**
 * Inicializa la navegación del menú desplegable.
 */
export function initNavigation() {
    console.log("initNavigation: Inicializando navegación del desplegable...");
    const menuButton = document.getElementById('menuButton');
    const brandDropdown = document.getElementById('brandDropdown');
    
    if (!menuButton || !brandDropdown) {
        console.error("initNavigation: No se encontraron los elementos #menuButton o #brandDropdown.");
        return;
    }

    // Toggle del menú desplegable
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', !isExpanded);
        menuButton.classList.toggle('active');
        brandDropdown.classList.toggle('show');
    });

    // Cerrar el menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (brandDropdown.classList.contains('show') && !brandDropdown.contains(e.target) && e.target !== menuButton) {
            brandDropdown.classList.remove('show');
            menuButton.classList.remove('active');
            menuButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Hacemos la función para cerrar el menú globalmente para que catalog.js pueda usarla
    window.closeBrandDropdown = () => {
        brandDropdown.classList.remove('show');
        menuButton.classList.remove('active');
        menuButton.setAttribute('aria-expanded', 'false');
    };
    
    console.log("initNavigation: Navegación del desplegable inicializada correctamente.");
}

// Escuchamos eventos para actualizar el menú dinámicamente
document.addEventListener('productAdded', initBrandMenu);
document.addEventListener('brandListUpdated', initBrandMenu);