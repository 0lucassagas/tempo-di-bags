// js/modules/effects-toggle.js

export function initEffectsToggle() {
    const toggle = document.getElementById('effects-toggle');
    // --- CORRECCIÓN APLICADA AQUÍ ---
    const toggleText = document.querySelector('.toggle-text'); 
    const body = document.body;

    // --- Cargar la preferencia guardada ---
    const savedState = localStorage.getItem('effectsEnabled');
    const effectsEnabled = savedState !== 'false'; // Por defecto, los efectos están activos

    // Sincronizar el estado del interruptor con la preferencia guardada
    toggle.checked = effectsEnabled;
    updateToggleText();

    // --- Evento para manejar el cambio ---
    toggle.addEventListener('change', () => {
        const isActive = toggle.checked;
        
        // Guardar la preferencia del usuario
        localStorage.setItem('effectsEnabled', isActive);

        // Añadir o quitar la clase que desactiva los efectos
        body.classList.toggle('effects-off', !isActive);
        updateToggleText();
    });

    // --- Función para actualizar el texto del interruptor ---
    function updateToggleText() {
        toggleText.textContent = toggle.checked ? 'Quitar Efectos' : 'Poner Efectos';
    }
}