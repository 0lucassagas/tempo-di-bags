/**
 * Módulo del cursor personalizado con efecto de estela y cambio de color en elementos interactivos.
 * Solo se activa en dispositivos con cursor fino (no táctiles).
 */
export function initCustomCursor() {
    // Verificamos si el dispositivo tiene un cursor de precisión
    if (!window.matchMedia('(pointer: fine)').matches) return;
    
    document.body.classList.add('custom-cursor-active');

    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isMouseMoving = false;
    let mouseStopTimer;

    // --- INICIO: LÓGICA DE CAMBIO DE COLOR ---
    // Definimos los colores para el degradado del diamante
    const defaultGradientStops = ['#5E35B1', '#311B92', '#1A0033']; // Púrpura original
    const interactiveGradientStops = ['#FFD700', '#B8860B', '#8B6914']; // Dorado, Oro oscuro, Oro más oscuro

    // Obtenemos el elemento del degradado dentro del SVG del cursor
    const bodyGradient = document.querySelector('#custom-cursor #darkBodyGradient');

    // Función para cambiar los colores del degradado
    const setGradientColor = (colors) => {
        if (!bodyGradient) return;
        const stops = bodyGradient.querySelectorAll('stop');
        stops.forEach((stop, index) => {
            if (colors[index]) {
                stop.style.stopColor = colors[index];
            }
        });
    };

    // Función para cuando el mouse ENTRA en un elemento interactivo
    const handleMouseEnter = () => {
        setGradientColor(interactiveGradientStops);
    };

    // Función para cuando el mouse SALE de un elemento interactivo
    const handleMouseLeave = () => {
        setGradientColor(defaultGradientStops);
    };

    // Buscamos TODOS los elementos interactivos de la página
    const interactiveElements = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"], [tabindex="0"]:not([tabindex="-1"])'
    );

    // Añadimos los eventos de entrada y salida a cada elemento encontrado
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
    });

    // --- FIN: LÓGICA DE CAMBIO DE COLOR ---


    // --- INICIO: LÓGICA DE MOVIMIENTO Y DESTELLOS ---
    // Función para actualizar la posición del cursor con un suavizado MÁS RÁPIDO
    const updateCursorPosition = () => {
        cursorX += (mouseX - cursorX) * 0.5; 
        cursorY += (mouseY - cursorY) * 0.5;
        
        cursor.style.transform = `translate3d(${cursorX - 17.5}px, ${cursorY - 10}px, 0)`;
        
        requestAnimationFrame(updateCursorPosition);
    };

    // Función para crear un destello de color dorado o plateado
    const createSparkle = () => {
        if (!isMouseMoving) return;
        
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Usamos las coordenadas suavizadas para un efecto más limpio
        sparkle.style.left = `${cursorX}px`;
        sparkle.style.top = `${cursorY}px`;
        
        const sparkleColors = ['#FFD700', '#E5E5E5']; // Dorado y Plateado
        const randomColor = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
        sparkle.style.backgroundColor = randomColor;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    };

    // Event listener para el movimiento del mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        isMouseMoving = true;
        clearTimeout(mouseStopTimer);
        
        mouseStopTimer = setTimeout(() => {
            isMouseMoving = false;
        }, 100);
    });

    // Iniciar la animación de seguimiento del cursor
    updateCursorPosition();

    // Crear destellos periódicamente si el mouse está en movimiento
    setInterval(createSparkle, 80);

    // Mantenemos la funcionalidad de añadir una clase al hacer clic
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    // --- FIN: LÓGICA DE MOVIMIENTO Y DESTELLOS ---
}