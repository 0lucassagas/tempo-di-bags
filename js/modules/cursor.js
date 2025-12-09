// ==========================================================================
// cursor.js - Módulo del Cursor Personalizado (Versión con Efecto Hover Corregido)
// ==========================================================================

/**
 * Inicializa el cursor personalizado con efecto de estela y cambio de color dorado al hover.
 * Solo se activa en dispositivos con cursor de precisión (no táctiles).
 */
export function initCustomCursor() {
    // Verificamos si el dispositivo tiene un cursor de precisión
    if (!window.matchMedia('(pointer: fine)').matches) {
        console.log('Dispositivo táctil detectado. El cursor personalizado no se activará.');
        return;
    }
    
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) {
        console.error('El elemento #custom-cursor no fue encontrado en el HTML.');
        return;
    }

    // --- ESTADO ---
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isMouseMoving = false;
    let mouseStopTimer;

    // Selector para todos los elementos interactivos sobre los que el cursor debe cambiar
    const interactiveElementsSelector = 'a, button, input, textarea, select, [role="button"], .product-card, .menu-button, .pagination-button, .brand-list li a';

    // Seleccionamos los elementos <g> específicos del SVG que queremos modificar
    const cursorBody = cursor.querySelector('svg > g > g:nth-child(1)'); // El cuerpo principal
    const cursorFire = cursor.querySelector('svg > g > g:nth-child(2)'); // El efecto de fuego

    // --- LÓGICA DE MOVIMIENTO Y DETECCIÓN DE HOVER ---
    const updateCursorPosition = () => {
        cursorX += (mouseX - cursorX) * 0.5; 
        cursorY += (mouseY - cursorY) * 0.5;
        cursor.style.transform = `translate3d(${cursorX - 17.5}px, ${cursorY - 10}px, 0)`;
        requestAnimationFrame(updateCursorPosition);
    };

    const createSparkle = () => {
        if (!isMouseMoving) return;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${cursorX}px`;
        sparkle.style.top = `${cursorY}px`;
        
        const sparkleColors = ['#FFD700', '#E5E5E5'];
        const randomColor = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        sparkle.style.backgroundColor = randomColor;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    };

    // --- EVENT LISTENERS ---
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        clearTimeout(mouseStopTimer);
        mouseStopTimer = setTimeout(() => isMouseMoving = false, 100);

        // --- INICIO: LÓGICA DE HOVER CORREGIDA ---
        const interactiveElement = e.target.closest(interactiveElementsSelector);

        if (interactiveElement) {
            // Estamos sobre un elemento interactivo. Aplicamos el color dorado.
            if (cursorBody) cursorBody.style.fill = '#FFD700';
            if (cursorFire) cursorFire.style.fill = '#FFA500';
        } else {
            // No estamos sobre un elemento interactivo. Restauramos el color original.
            // Al establecer el estilo en '', el navegador usa el atributo 'fill' del HTML.
            if (cursorBody) cursorBody.style.fill = '';
            if (cursorFire) cursorFire.style.fill = '';
        }
        // --- FIN: LÓGICA DE HOVER CORREGIDA ---
    });

    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    // --- INICIALIZACIÓN ---
    document.body.classList.add('custom-cursor-active');
    updateCursorPosition();
    setInterval(createSparkle, 80);
    
    console.log('Cursor personalizado con efecto hover dorado (versión corregida) inicializado.');
}