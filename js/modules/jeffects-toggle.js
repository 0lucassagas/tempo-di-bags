/**
 * Módulo del interruptor de efectos.
 * Versión reescrita para ser robusta y evitar errores de ámbito.
 */
export function initEffectsToggle() {
    const toggleWrapper = document.querySelector('.effects-toggle-wrapper');
    const toggle = document.getElementById('effects-toggle');
    const toggleText = document.querySelector('.toggle-text');
    const body = document.body;

    // Si el interruptor o su contenedor no existen, salimos de la función.
    if (!toggleWrapper || !toggle || !toggleText) {
        console.warn('Interruptor de efectos no encontrado en la página.');
        return;
    }

    console.log("--- DEBUG: Interruptor de efectos inicializado ---");

    // --- FUNCIÓN PARA ACTUALIZAR TEXTO (Versión Segura) ---
    // La pasamos los elementos que necesita como argumentos para evitar problemas de ámbito.
    const updateToggleText = (toggleElement, textElement) => {
        const newText = toggleElement.checked ? 'Quitar Efectos' : 'Poner Efectos';
        textElement.textContent = newText;
    };

    // --- FUNCIÓN PARA APLICAR ESTADO ---
    const applyEffectsState = (isActive) => {
        body.classList.toggle('effects-off', !isActive);
        updateToggleText(toggle, toggleText);
    };

    // --- LÓGICA DE VISIBILIDAD EN SCROLL ---
    const handleScroll = () => {
        if (window.scrollY > 50) {
            toggleWrapper.classList.add('hide');
        } else {
            toggleWrapper.classList.remove('hide');
        }
    };
    window.addEventListener('scroll', handleScroll);

    // --- LÓGICA DE ESTADO INICIAL ---
    const savedState = localStorage.getItem('effectsEnabled');
    const effectsEnabled = savedState !== 'false'; // Por defecto, los efectos están activos

    toggle.checked = effectsEnabled;
    applyEffectsState(effectsEnabled);

    // --- EVENTO DE CAMBIO ---
    toggle.addEventListener('change', () => {
        const isActive = toggle.checked;
        localStorage.setItem('effectsEnabled', isActive);
        applyEffectsState(isActive);
    });
}