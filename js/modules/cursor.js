// ==========================================================================
// cursor.js - Módulo del Cursor Personalizado (Versión Simplificada)
// ==========================================================================

/**
 * Inicializa el cursor personalizado.
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

    // --- LÓGICA DE MOVIMIENTO ---
    const updateCursorPosition = () => {
        cursorX += (mouseX - cursorX) * 0.5; 
        cursorY += (mouseY - cursorY) * 0.5;
        cursor.style.transform = `translate3d(${cursorX - 17.5}px, ${cursorY - 10}px, 0)`;
        requestAnimationFrame(updateCursorPosition);
    };

    // --- LÓGICA DE DESTELLOS ---
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
    });

    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    // --- INICIALIZACIÓN ---
    document.body.classList.add('custom-cursor-active');
    updateCursorPosition();
    setInterval(createSparkle, 80);
    
    console.log('Cursor personalizado inicializado.');
}