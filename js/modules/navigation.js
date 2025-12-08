/**
 * Módulo de gestión del menú de navegación desplegable.
 */
export function initNavigation() {
    // Lista de marcas. Puedes agregar o quitar aquí fácilmente.
    const brands = [
        "AMAYRA", "TRENDY", "EVERLAST", "HEAD", "INFLUENCER", "SKORA", "WANDERLUST", 
        "ONA SAENZ", "UNIFORM", "DISCOVERY", "TRAVEL TECH", "POLO WELLINGTON", "WILSON", 
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
            // NOTA: Este href es un placeholder. En el futuro, podría filtrar el catálogo.
            a.href = `#${brand.toLowerCase().replace(/\s+/g, '-')}`;
            a.textContent = brand;
            li.appendChild(a);
            brandList.appendChild(li);
        });
    };

    // --- FUNCIÓN PARA ABRIR/CERRAR EL MENÚ ---
    const toggleDropdown = () => {
        const isOpen = brandDropdown.classList.contains('show');
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

    // --- EVENT LISTENERS ---
    // 1. Al hacer clic en el botón, alternamos el menú
    menuButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Evita que el clic se propague y cierre el menú inmediatamente
        toggleDropdown();
    });

    // 2. Al hacer clic en cualquier parte de la página, cerramos el menú si está abierto
    document.addEventListener('click', (event) => {
        // Usamos .contains() que es más fiable que .closest() o .matches()
        if (brandDropdown.classList.contains('show') && !menuButton.contains(event.target) && !brandDropdown.contains(event.target)) {
            brandDropdown.classList.remove('show');
            menuButton.classList.remove('active');
            menuButton.setAttribute('aria-expanded', 'false');
        }
    });

    // Inicializamos el menú llenándolo con las marcas
    populateDropdown();
}