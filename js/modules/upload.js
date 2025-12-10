// ==========================================================================
// upload.js - Módulo para la carga de productos (Versión Final Corregida)
// ==========================================================================

export function initUploadPage() {
    console.log("--- DEBUG: initUploadPage se ha iniciado ---");

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.createElement('input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const uploadForm = document.getElementById('upload-form');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const uploadWarning = document.getElementById('upload-warning');
    
    // Elementos de marca y producto
    const brandSelect = document.getElementById('brand-select');
    const newBrandInput = document.getElementById('new-brand-input');
    const productSelect = document.getElementById('product-select');
    const newProductInput = document.getElementById('new-product-input');

    // Elementos de descripción y detalles
    const materialInput = document.getElementById('material-input');
    const dimensionsInput = document.getElementById('dimensions-input');
    const featuresInput = document.getElementById('features-input');
    
    const searchDetailsBtn = document.getElementById('search-details-btn');

    // Elementos para los modales
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let currentImageData = null;

    // --- CONFIGURACIÓN INICIAL DEL INPUT DE ARCHIVO ---
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // --- GESTIÓN DE MARCAS Y PRODUCTOS ---
    const getItemsFromStorage = (key, defaultList) => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultList;
    };
    const saveItemsToStorage = (key, items) => localStorage.setItem(key, JSON.stringify(items));
    const extractUniqueItemsFromProducts = (propertyName) => {
        const products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
        const uniqueItems = new Set(products.map(p => p[propertyName]).filter(Boolean));
        return Array.from(uniqueItems);
    };
    const getBrands = () => {
        const defaultBrands = ['Gucci', 'Prada', 'Nike', 'Trendy', 'Louis Vuitton', 'Adidas'];
        const storedBrands = getItemsFromStorage('tempoDiBagsBrands', defaultBrands);
        const productBrands = extractUniqueItemsFromProducts('brand');
        const allBrands = [...new Set([...defaultBrands, ...storedBrands, ...productBrands])].sort();
        saveItemsToStorage('tempoDiBagsBrands', allBrands);
        return allBrands;
    };
    const getProductTypes = () => {
        const defaultTypes = ['Bolso', 'Mochila', 'Cinturón', 'Cartera', 'Valija', 'Gorra', 'Botella de Agua'];
        const storedTypes = getItemsFromStorage('tempoDiBagsProductTypes', defaultTypes);
        const productTypes = extractUniqueItemsFromProducts('name');
        const allTypes = [...new Set([...defaultTypes, ...storedTypes, ...productTypes])].sort();
        saveItemsToStorage('tempoDiBagsProductTypes', allTypes);
        return allTypes;
    };
    const populateSelect = (selectElement, items, placeholder) => {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    };
    const addNewItem = (inputElement, storageKey, selectElement, placeholder) => {
        const newItem = inputElement.value.trim();
        if (newItem) {
            const items = getItemsFromStorage(storageKey, []);
            if (!items.includes(newItem)) {
                items.push(newItem);
                saveItemsToStorage(storageKey, items);
                populateSelect(selectElement, items, placeholder);
                selectElement.value = newItem;
                inputElement.value = '';
                checkFormValidity();
            }
        }
    };

    // --- GESTIÓN DE IMÁGENES ---
    const showImagePreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImageData = e.target.result;
            imagePreview.src = currentImageData;
            imagePreviewContainer.style.display = 'block';
            dropZone.style.display = 'none';
            checkFormValidity();
        };
        reader.readAsDataURL(file);
    };
    const clearImagePreview = () => {
        currentImageData = null;
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
        dropZone.style.display = 'flex';
        saveBtn.disabled = true;
        fileInput.value = '';
    };

    // --- LÓGICA DE MODALES ---
    const showModal = (type, message) => {
        const iconEmoji = type === 'success' ? '😊' : (type === 'error' ? '😞' : '🤔');
        modalBody.innerHTML = `
            <div class="modal-icon modal-icon-${type}">${iconEmoji}</div>
            <p class="modal-message">${message}</p>
        `;
        modalOverlay.classList.add('show');
    };
    const hideModal = () => {
        modalOverlay.classList.remove('show');
    };

    // --- LÓGICA DE VALIDACIÓN Y DUPLICADOS ---
    const checkForDuplicates = (brand, productName) => {
        const products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
        return products.some(p => 
            p.brand.toLowerCase() === brand.toLowerCase() && 
            p.name.toLowerCase() === productName.toLowerCase()
        );
    };

    const checkFormValidity = () => {
        const price = document.getElementById('price-input').value;
        
        // --- CORRECCIÓN CLAVE: Obtenemos el valor del select O del input nuevo ---
        const brand = brandSelect.value || newBrandInput.value.trim();
        const productName = productSelect.options[productSelect.selectedIndex].text;

        // --- CORRECCIÓN CLAVE: Solo los campos principales son obligatorios ---
        const isFormValid = currentImageData && price && brand && productName;
        saveBtn.disabled = !isFormValid;

        if (brand && productName && checkForDuplicates(brand, productName)) {
            uploadWarning.style.display = 'block';
            saveBtn.textContent = 'Guardar Duplicado';
        } else {
            uploadWarning.style.display = 'none';
            saveBtn.textContent = 'Guardar Artículo';
        }
    };
    
    // --- LÓGICA DE BÚSQUEDA EXTERNA ---
    const updateSearchButton = () => {
        // --- CORRECCIÓN CLAVE: Obtenemos el valor del select O del input nuevo ---
        const brand = brandSelect.value || newBrandInput.value.trim();
        const productName = productSelect.options[productSelect.selectedIndex].text;
        
        if (brand && productName) {
            searchDetailsBtn.disabled = false;
            const searchQuery = `mercadolibre ${brand} ${productName} características`;
            searchDetailsBtn.onclick = () => {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
                // Explicamos al usuario qué hacer
                showModal('info', 'Se abrió una nueva pestaña con una búsqueda en Google. Buscá los detalles en el resultado y copialos manualmente en los campos de "Detalles Específicos".');
            };
        } else {
            searchDetailsBtn.disabled = true;
            searchDetailsBtn.onclick = null;
        }
    };

    // --- EVENT LISTENERS ---
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); if (e.dataTransfer.files.length > 0) showImagePreview(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) showImagePreview(e.target.files[0]); });
    removeImageBtn.addEventListener('click', clearImagePreview);
    modalCloseBtn.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

    newBrandInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addNewItem(newBrandInput, 'tempoDiBagsBrands', brandSelect, 'Seleccioná una marca'); } });
    newProductInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); addNewItem(newProductInput, 'tempoDiBagsProductTypes', productSelect, 'Seleccioná un tipo de producto'); } });

    // Listeners para validación y actualización de UI
    ['price-input', 'brand-select', 'product-select', 'material-input', 'dimensions-input'].forEach(id => {
        document.getElementById(id).addEventListener('input', checkFormValidity);
    });
    newBrandInput.addEventListener('input', () => { if (newBrandInput.value.trim()) brandSelect.value = ""; checkFormValidity(); });
    newProductInput.addEventListener('input', () => { if (newProductInput.value.trim()) productSelect.value = ""; checkFormValidity(); });
    
    brandSelect.addEventListener('change', () => { checkFormValidity(); updateSearchButton(); });
    productSelect.addEventListener('change', () => { checkFormValidity(); updateSearchButton(); });

    // --- LÓGICA DE ENVÍO DEL FORMULARIO ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (newBrandInput.value.trim()) addNewItem(newBrandInput, 'tempoDiBagsBrands', brandSelect, 'Seleccioná una marca');
        if (newProductInput.value.trim()) addNewItem(newProductInput, 'tempoDiBagsProductTypes', productSelect, 'Seleccioná un tipo de producto');

        const productDetails = {
            material: materialInput.value.trim(),
            dimensions: dimensionsInput.value.trim(),
            features: featuresInput.value.trim()
        };

        const newProduct = {
            id: Date.now(),
            name: productSelect.options[productSelect.selectedIndex].text,
            brand: brandSelect.value,
            price: parseFloat(document.getElementById('price-input').value),
            description: productDetails.features || 'Sin características adicionales.',
            imageUrl: currentImageData,
            status: "available",
            details: productDetails
        };

        try {
            let products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
            products.unshift(newProduct);
            localStorage.setItem('tempoDiBagsProducts', JSON.stringify(products));

            showModal('success', '¡Tu producto se agregó correctamente!');
            setTimeout(() => { window.location.href = 'index.html'; }, 2500);

        } catch (error) {
            console.error('Error al guardar el producto:', error);
            showModal('error', 'Fallo la carga del producto. Por favor, intenta de nuevo.');
        }
    });

    cancelBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados.')) {
            clearImagePreview();
            uploadForm.reset();
            uploadWarning.style.display = 'none';
            hideModal();
        }
    });

    // --- INICIALIZACIÓN ---
    populateSelect(brandSelect, getBrands(), 'Seleccioná una marca');
    populateSelect(productSelect, getProductTypes(), 'Seleccioná un tipo de producto');
    
    // Llamada inicial para asegurar que el estado sea correcto
    checkFormValidity();
    updateSearchButton();

    console.log("--- DEBUG: initUploadPage ha finalizado su configuración. ---");
}