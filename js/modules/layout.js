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
            <!-- Columna de la IZQUIERDA: Contacto (CON LA NUEVA IMAGEN) -->
            <div class="contact-placeholder">
                <div class="footer-contact-image-container">
                    <!-- Enlaces invisibles superpuestos -->
                    <a href="tel:1133036469" class="contact-link contact-link-phone1" aria-label="Llamar al 1133036469">Teléfono 1</a>
                    <a href="tel:1150971557" class="contact-link contact-link-phone2" aria-label="Llamar al 1150971557">Teléfono 2</a>
                    <a href="https://www.instagram.com/tempodibags" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-instagram" aria-label="Visitar nuestro Instagram">@TempoDiBags</a>
                    <a href="https://www.facebook.com/TempoDiBags" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-facebook" aria-label="Visitar nuestro Facebook">TempoDiBags</a>
                    <a href="https://www.tiktok.com/@tempodibags_mer" target="_blank" rel="noopener noreferrer" class="contact-link contact-link-tiktok" aria-label="Visitar nuestro TikTok">@TempoDiBags_mer</a>
                    
                </div>
            </div>
                
                <!-- Columna de la DERECHA: Mapa (SIN CAMBIOS) -->
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