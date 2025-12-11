// ==========================================================================
// cursor.js - Módulo del Cursor Personalizado (Versión con Estela de Destellos)
// ==========================================================================

/**
 * Inicializa el cursor personalizado.
 */
export function initCustomCursor() {
    console.log('initCustomCursor: Función llamada.');

    if (!window.matchMedia('(pointer: fine)').matches) {
        console.log('Dispositivo táctil detectado. El cursor personalizado no se activará.');
        return;
    }

    let cursor = document.getElementById('custom-cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        
        cursor.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#FFD700;stop-opacity:0.8" />
                        <stop offset="50%" style="stop-color:#FF69B4;stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:#00CED1;stop-opacity:0.8" />
                    </linearGradient>
                    <radialGradient id="darkBodyGradient" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" style="stop-color:#5E35B1;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#311B92;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1A0033;stop-opacity:1" />
                    </radialGradient>
                </defs>
                <g transform="translate(50,50)">
                    <g class="cursor-body" fill="url(#darkBodyGradient)" stroke="#4527A0" stroke-width="0.5">
                        <polygon points="0,-35 25,-10 15,30 -15,30 -25,-10" />
                        <polygon points="0,-35 -25,-10 -35,5 -20,5" />
                        <polygon points="0,-35 25,-10 35,5 20,5" />
                        <polygon points="-25,-10 -15,30 -30,30 -35,5" />
                        <polygon points="25,-10 15,30 30 30 35,5" />
                    </g>
                    <g class="cursor-fire" fill="url(#fireGradient)" opacity="0.8">
                        <polygon points="0,-35 12,-22 0,-15" />
                        <polygon points="0,-35 -12,-22 0,-15" />
                        <polygon points="15,30 0,15 5,5" />
                        <polygon points="-15,30 0,15 -5,5" />
                    </g>
                    <path d="M 0,-25 L 5,-15 L 0,-10 L -5,-15 Z" fill="white" opacity="0.9"/>
                </g>
            </svg>
        `;
        document.body.appendChild(cursor);
        console.log('Elemento #custom-cursor creado y añadido al DOM.');
    }

    document.body.classList.add('custom-cursor-active');
    console.log('Clase .custom-cursor-active añadida al body.');

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    let lastSparkleTime = 0; // Variable para controlar la frecuencia de los destellos

    const animate = () => {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        requestAnimationFrame(animate);
    };

    // --- INICIO: LÓGICA PARA LA ESTELA DE DESTELLOS ---
    const createSparkle = (x, y) => {
        const sparkle = document.createElement('div');
        const isGold = Math.random() > 0.5; // 50% de probabilidad de ser dorado o plateado
        
        sparkle.className = `sparkle ${isGold ? 'sparkle-gold' : 'sparkle-silver'}`;
        
        // Añadimos una pequeña variación a la posición para un efecto más natural
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;
        
        sparkle.style.left = `${x + offsetX}px`;
        sparkle.style.top = `${y + offsetY}px`;
        
        document.body.appendChild(sparkle);

        // Eliminamos el destello después de la animación
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    };

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Creamos un destello cada 30ms para no sobrecargar el navegador
        const now = Date.now();
        if (now - lastSparkleTime > 30) {
            createSparkle(mouseX, mouseY);
            lastSparkleTime = now;
        }
    });
    // --- FIN: LÓGICA PARA LA ESTELA DE DESTELLOS ---

    // Event Listeners para efectos de hover
    const interactiveElements = 'a, button, input, textarea, select, [role="button"], .product-card, .menu-button, .pagination-button, .brand-list li a, .nav-link-sobre-nosotros';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveElements)) {
            cursor.classList.add('is-hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveElements)) {
            cursor.classList.remove('is-hovering');
        }
    });

    animate();
    console.log('Cursor personalizado con estela de destellos inicializado correctamente.');
}