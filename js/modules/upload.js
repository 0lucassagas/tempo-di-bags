// ==========================================================================
// upload.js - Módulo para la carga de productos (Versión Definitiva)
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
    document.body.appendChild(fileInput);

    // --- GESTIÓN DE MARCAS Y PRODUCTOS (Funciones Auxiliares) ---
    const getItemsFromStorage = (key, defaultList) => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultList;
    };
    const saveItemsToStorage = (key, items) => localStorage.setItem(key, JSON.stringify(items));
    
    const getBrands = () => {
        const defaultBrands = ['Gucci', 'Prada', 'Nike', 'Trendy', 'Louis Vuitton', 'Adidas'];
        const storedBrands = getItemsFromStorage('tempoDiBagsBrands', defaultBrands);
        const products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
        const productBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
        const allBrands = [...new Set([...defaultBrands, ...storedBrands, ...productBrands])].sort();
        saveItemsToStorage('tempoDiBagsBrands', allBrands);
        return allBrands;
    };
    const getProductTypes = () => {
        const defaultTypes = ['Bolso', 'Mochila', 'Cinturón', 'Cartera', 'Valija', 'Gorra', 'Botella de Agua'];
        const storedTypes = getItemsFromStorage('tempoDiBagsProductTypes', defaultTypes);
        const products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
        const productTypes = [...new Set(products.map(p => p.name).filter(Boolean))];
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

    // --- NUEVO: Función para sincronizar los atributos 'required' ---
    const updateRequiredAttributes = () => {
        // Si hay texto en el campo nuevo, el select ya no es obligatorio
        if (newBrandInput.value.trim()) {
            brandSelect.required = false;
        } else {
            brandSelect.required = true;
        }

        if (newProductInput.value.trim()) {
            productSelect.required = false;
        } else {
            productSelect.required = true;
        }
    };

    // --- LÓGICA DE VALIDACIÓN ---
    const checkFormValidity = () => {
        // Llamamos primero a la función que sincroniza los 'required'
        updateRequiredAttributes();

        const price = document.getElementById('price-input').value;
        const brand = brandSelect.value || newBrandInput.value.trim();
        const productName = productSelect.value || newProductInput.value.trim();

        const isFormValid = currentImageData && price && brand && productName;
        saveBtn.disabled = !isFormValid;

        // Lógica de advertencia de duplicados
        if (brand && productName) {
            const products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
            const isDuplicate = products.some(p => 
                p.brand.toLowerCase() === brand.toLowerCase() && 
                p.name.toLowerCase() === productName.toLowerCase()
            );
            if (isDuplicate) {
                uploadWarning.style.display = 'block';
                saveBtn.textContent = 'Guardar Duplicado';
            } else {
                uploadWarning.style.display = 'none';
                saveBtn.textContent = 'Guardar Artículo';
            }
        } else {
            uploadWarning.style.display = 'none';
            saveBtn.textContent = 'Guardar Artículo';
        }
    };
    
    // --- LÓGICA DE BÚSQUEDA EXTERNA ---
    const updateSearchButton = () => {
        const brand = brandSelect.value || newBrandInput.value.trim();
        const productName = productSelect.value || newProductInput.value.trim();
        
        if (brand && productName) {
            searchDetailsBtn.disabled = false;
            const searchQuery = `mercadolibre ${brand} ${productName} características`;
            searchDetailsBtn.onclick = () => {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
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
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); if (e.dataTransfer.files.length > 0) showImagePreview(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) showImagePreview(e.target.files[0]); });
    removeImageBtn.addEventListener('click', clearImagePreview);
    modalCloseBtn.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

    // --- LÓGICA DE SINCRONIZACIÓN DE CAMPOS ---
    brandSelect.addEventListener('change', () => { newBrandInput.value = ''; checkFormValidity(); updateSearchButton(); });
    newBrandInput.addEventListener('input', () => { brandSelect.value = ''; checkFormValidity(); updateSearchButton(); });
    
    productSelect.addEventListener('change', () => { newProductInput.value = ''; checkFormValidity(); updateSearchButton(); });
    newProductInput.addEventListener('input', () => { productSelect.value = ''; checkFormValidity(); updateSearchButton(); });

    // Listener para los otros campos del formulario
    ['price-input', 'material-input', 'dimensions-input', 'features-input'].forEach(id => {
        document.getElementById(id).addEventListener('input', checkFormValidity);
    });

    // --- LÓGICA DE ENVÍO DEL FORMULARIO ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const finalBrand = brandSelect.value || newBrandInput.value.trim();
        const finalProductName = productSelect.value || newProductInput.value.trim();

        // Si se usó una marca nueva, la guardamos en la lista
        if (newBrandInput.value.trim()) {
            const brands = getBrands();
            if (!brands.includes(finalBrand)) {
                brands.push(finalBrand);
                saveItemsToStorage('tempoDiBagsBrands', brands);
            }
        }

        // Si se usó un producto nuevo, lo guardamos en la lista
        if (newProductInput.value.trim()) {
            const productTypes = getProductTypes();
            if (!productTypes.includes(finalProductName)) {
                productTypes.push(finalProductName);
                saveItemsToStorage('tempoDiBagsProductTypes', productTypes);
            }
        }

        const productDetails = {
            material: materialInput.value.trim(),
            dimensions: dimensionsInput.value.trim(),
            features: featuresInput.value.trim()
        };

        const newProduct = {
            id: Date.now(),
            name: finalProductName,
            brand: finalBrand,
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

            const event = new CustomEvent('productAdded', {
                detail: { product: newProduct }
            });
            document.dispatchEvent(event);

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
            // Al resetear, también hay que chequear la validez para volver a poner los 'required'
            checkFormValidity();
        }
    });

    // --- INICIALIZACIÓN ---
    populateSelect(brandSelect, getBrands(), 'Seleccioná una marca');
    populateSelect(productSelect, getProductTypes(), 'Seleccioná un tipo de producto');
    
    checkFormValidity();
    updateSearchButton();

    console.log("--- DEBUG: initUploadPage ha finalizado su configuración. ---");
}