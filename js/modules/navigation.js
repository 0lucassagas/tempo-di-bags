// ==========================================================================
// navigation.js - Módulo para la gestión del menú de navegación desplegable.
// ==========================================================================

/**
 * Inicializa la funcionalidad del menú de navegación.
 * Su única responsabilidad es poblar y controlar la visibilidad del menú de marcas.
 */
export function initNavigation() {
    // Lista de marcas. Puedes agregar o quitar aquí fácilmente.
    const brands = [
        "AMAYRA", "TRENDY", "EVERLAST", "HEAD", "INFLUENCER", "SKORA", "WANDERLUST", 
        "ONA SAEZ", "UNIFORM", "DISCOVERY", "TRAVEL TECH", "POLO WELLINGTON", "WILSON", 
        "OREIRO LOVE", "CHN"
    ];

    const menuButton = document.getElementById('menuButton');
    const brandDropdown = document.getElementById('brandDropdown');
    const brandList = document.getElementById('brandList');

    // Si no encontramos los elementos en la página, no hacemos nada.
    if (!menuButton || !brandDropdown || !brandList) {
        console.warn("Elementos del menú de navegación no encontrados.");
        return;
    }

    // --- FUNCIÓN PARA LLENAR EL MENÚ ---
    const populateDropdown = () => {
        brandList.innerHTML = ''; // Limpiamos la lista antes de llenarla
        const sortedBrands = [...brands].sort(); // Ordenamos alfabéticamente
        
        sortedBrands.forEach(brand => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            // Añadimos data-brand y una clase para el listener en catalog.js
            a.href = '#'; // Link dummy para evitar que la página se mueva
            a.textContent = brand;
            a.setAttribute('data-brand', brand); // Atributo para identificar la marca
            a.classList.add('brand-filter-link'); // Clase para el event listener
            
            li.appendChild(a);
            brandList.appendChild(li);
        });
    };

    // --- FUNCIÓN PARA ABRIR/CERRAR EL MENÚ ---
    const toggleDropdown = (forceState = null) => {
        const isOpen = forceState !== null ? forceState : brandDropdown.classList.contains('show');
        if (isOpen) {
            brandDropdown.classList.remove('show');
            menuButton.classList.remove('active');
            menuButton.setAttribute('aria-expanded', 'false');
        } else {
            brandDropdown.classList.add('show');
            menuButton.classList.add('active');
            menuButton.setAttribute('aria-expanded', 'true');
        }
    };

    // --- FUNCIÓN PÚBLICA PARA CERRAR EL MENÚ (Usada por catalog.js) ---
    window.closeBrandDropdown = () => {
        toggleDropdown(false);
    };

    // --- EVENT LISTENERS ---
    // 1. Al hacer clic en el botón, alternamos el menú
    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleDropdown();
    });

    // 2. Al hacer clic en cualquier parte de la página, cerramos el menú si está abierto
    document.addEventListener('click', (event) => {
        // Si el clic es dentro del menú, no hacemos nada.
        if (brandDropdown.contains(event.target)) {
            return;
        }
        // Si el menú está abierto y el clic fue en el botón, ya lo manejó el listener anterior.
        if (menuButton.contains(event.target)) {
            return;
        }
        // Si no, cerramos el menú.
        if (brandDropdown.classList.contains('show')) {
            toggleDropdown(false);
        }
    });

    // Inicializamos el menú llenándolo con las marcas
    populateDropdown();
}