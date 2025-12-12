// ==========================================================================
// layout.js - Módulo para la inyección de componentes de layout comunes
// ==========================================================================

/**
 * Inyecta el header, la navegación y el footer en la página.
 * Esta versión inyecta el header/nav al principio y el footer al final
 * para asegurar una estructura DOM correcta.
 */
export function initLayout() {
    const body = document.body;

    // Prevenimos que se inyecte más de una vez
    if (body.querySelector('.main-header')) {
        console.log('Layout ya inicializado. Omitiendo inyección.');
        return;
    }

    // --- 1. Definimos las plantillas por separado ---
    const headerAndNavTemplate = `
        <!-- ==========================================================================
           INICIO: HEADER - Cabecera de la Página (Diseño Simple y Unificado)
           ========================================================================== -->
        <header class="main-header">
    <div class="smoke-container">
        <div class="smoke smoke-left"></div>
        <div class="smoke smoke-left-2"></div>
        <div class="smoke smoke-right"></div>
        <div class="smoke smoke-right-2"></div>
    </div>
    
    <!-- NUEVO: Contenedor Flexbox para alinear los logos y el texto -->
    <div class="header-content-wrapper">
        <!-- Logo a la izquierda -->
        <a href="index.html" class="header-logo-link">
            <img id="header-logo" src="https://z-cdn-media.chatglm.cn/files/3bbfa97d-a75d-499a-a281-72a2f7c4d73b_logo.jpg?auth_key=1790863760-4812e8742a7a4627b887a0660dd66c77-0-028e1d72578d681598afda870811af77" alt="Logo de Tempo di Bags">
        </a>
        
        <!-- Texto central -->
        <div class="header-text-content">
            <h1>Tempo di Bags</h1>
            <p class="header-subtitle">¡Renueva tu estilo y marca tendencia!</p>
        </div>

        <!-- Logo a la derecha -->
        <a href="index.html" class="header-logo-link">
            <img id="header-logo" src="https://z-cdn-media.chatglm.cn/files/3bbfa97d-a75d-499a-a281-72a2f7c4d73b_logo.jpg?auth_key=1790863760-4812e8742a7a4627b887a0660dd66c77-0-028e1d72578d681598afda870811af77" alt="Logo de Tempo di Bags">
        </a>
    </div>
</header>

        <!-- ==========================================================================
           INICIO: NAVEGACIÓN PRINCIPAL (Sticky - Fija al hacer scroll)
           ========================================================================== -->
        <div class="nav-wrapper">
            <!-- 1. Inicio -->
            <a href="index.html" class="nav-link-sobre-nosotros">Inicio</a>
            
            <!-- 2. Marcas -->
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

            <!-- 3. Cargar Producto -->
            <a href="cargar-producto.html" class="nav-link-sobre-nosotros">Cargar Producto</a>
            
            <!-- 4. Sobre Nosotros -->
            <a href="sobre-nosotros.html" class="nav-link-sobre-nosotros">Sobre Nosotros</a>
        </div>
    `;

    const footerTemplate = `
        <!-- ==========================================================================
           INICIO: FOOTER - Pie de Página (Versión definitiva)
           ========================================================================== -->
        <footer>
            <div class="footer-smoke-container">
                <div class="footer-smoke footer-smoke-left"></div>
                <div class="footer-smoke footer-smoke-right"></div>
            </div>
            <div class="footer-content">
                <div class="contact-placeholder">
                    <div class="neon-bg"></div>
                    <div class="contact-content">
                        <div class="contact-main">
                            <h2>Contactanos</h2>
                            <p class="contact-subtitle">Hacé tu pedido</p>
                            <div class="contact-phones">
                                <a href="tel:1133036469" class="contact-link">
                                <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>                                    <span>1133036469 / 1150971557</span>
                                </a>
                            </div>
                        </div>
                        
                        <div class="contact-social">
                            <p class="social-title">Seguinos en nuestras redes:</p>
                            <div class="social-links">
                                <a href="https://www.instagram.com/tempodibags" target="_blank" rel="noopener noreferrer" class="social-link">
                                    <svg class="social-icon" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
                                    <span>@TempoDiBags</span>
                                </a>
                                <a href="https://www.facebook.com/TempoDiBags" target="_blank" rel="noopener noreferrer" class="social-link">
                                    <svg class="social-icon" viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
                                    <span>TempoDiBags</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contenedor del mapa de Google Maps -->
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

    // Llamamos a la función para marcar el enlace activo
    setActiveNavLink();

    console.log('Layout común inyectado correctamente.');
}

/**
 * Añade una clase 'active' al enlace de navegación que corresponde a la página actual.
 * Lógica mejorada para manejar correctamente la página principal (index.html).
 */
function setActiveNavLink() {
    // Obtenemos el nombre del archivo de la URL actual.
    // Si la URL es '/', `split('/').pop()` devuelve '', así que usamos 'index.html' como fallback.
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-wrapper a');

    navLinks.forEach(link => {
        // Comparamos el href del enlace con la página actual.
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}