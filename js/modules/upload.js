// ==========================================================================
// js/modules/upload.js - Módulo para la carga de productos (Versión Definitiva)
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

    // NUEVOS: Elementos para el logo de la marca
    const newBrandLogoContainer = document.getElementById('new-brand-logo-container');
    const newBrandLogoInput = document.getElementById('new-brand-logo-input');
    const brandLogoDropZone = document.getElementById('brand-logo-drop-zone');
    const brandLogoPreviewContainer = document.getElementById('brand-logo-preview-container');
    const brandLogoPreview = document.getElementById('brand-logo-preview');
    const removeBrandLogoBtn = document.getElementById('remove-brand-logo-btn');

    // Elementos de descripción y detalles
    const materialInput = document.getElementById('material-input');
    const dimensionsInput = document.getElementById('dimensions-input');
    const featuresInput = document.getElementById('features-input');
    
    const searchDetailsBtn = document.getElementById('search-details-btn');
    const saveBrandBtn = document.getElementById('save-brand-btn'); // NUEVO: Botón para guardar solo la marca

    // Elementos para los modales
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    let currentImageData = null;
    let currentBrandLogoData = null; // Para guardar el logo en base64

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

    // --- NUEVO: GESTIÓN DEL LOGO DE MARCA ---
    const showBrandLogoPreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentBrandLogoData = e.target.result;
            brandLogoPreview.src = currentBrandLogoData;
            brandLogoPreviewContainer.style.display = 'block';
            brandLogoDropZone.style.display = 'none';
            checkFormValidity(); // NUEVO: Revisamos validez para habilitar/deshabilitar botón de guardar marca
        };
        reader.readAsDataURL(file);
    };

    const clearBrandLogoPreview = () => {
        currentBrandLogoData = null;
        brandLogoPreview.src = '';
        brandLogoPreviewContainer.style.display = 'none';
        brandLogoDropZone.style.display = 'flex';
        newBrandLogoInput.value = '';
        checkFormValidity(); // NUEVO: Revisamos validez
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

        // NUEVO: Lógica para habilitar el botón de guardar marca
        const brandName = newBrandInput.value.trim();
        if (brandName) {
            saveBrandBtn.disabled = false;
        } else {
            saveBrandBtn.disabled = true;
        }

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

    // NUEVOS: Event Listeners para el logo de marca
    brandLogoDropZone.addEventListener('click', () => newBrandLogoInput.click());
    brandLogoDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        brandLogoDropZone.classList.add('drag-over');
    });
    brandLogoDropZone.addEventListener('dragleave', () => {
        brandLogoDropZone.classList.remove('drag-over');
    });
    brandLogoDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        brandLogoDropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            showBrandLogoPreview(e.dataTransfer.files[0]);
        }
    });
    newBrandLogoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            showBrandLogoPreview(e.target.files[0]);
        }
    });
    removeBrandLogoBtn.addEventListener('click', clearBrandLogoPreview);

    // --- LÓGICA DE SINCRONIZACIÓN DE CAMPOS ---
    brandSelect.addEventListener('change', () => { 
        newBrandInput.value = ''; 
        newBrandLogoContainer.style.display = 'none'; // Ocultar logo si se selecciona una marca existente
        clearBrandLogoPreview(); // Limpiar logo si se selecciona una marca existente
        checkFormValidity(); 
        updateSearchButton(); 
    });
    newBrandInput.addEventListener('input', () => { 
        brandSelect.value = '';
        // Mostrar u ocultar el contenedor del logo
        if (newBrandInput.value.trim()) {
            newBrandLogoContainer.style.display = 'block';
        } else {
            newBrandLogoContainer.style.display = 'none';
            clearBrandLogoPreview();
        }
        checkFormValidity(); 
        updateSearchButton(); 
    });
    
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

        // --- NUEVO: LÓGICA PARA GUARDAR MARCA NUEVA (SI CORRESPONDE) ---
        if (newBrandInput.value.trim()) {
            let brandsData = JSON.parse(localStorage.getItem('tempoDiBagsBrandsData')) || {};
            
            // Si la marca no existe, la agregamos con su logo (si hay)
            if (!brandsData[finalBrand]) {
                brandsData[finalBrand] = {
                    logo: currentBrandLogoData || null // Guardamos el logo en base64 o null
                };
                localStorage.setItem('tempoDiBagsBrandsData', JSON.stringify(brandsData));
                console.log(`Nueva marca "${finalBrand}" guardada con logo.`);
                
                // Disparamos un evento para que otros módulos (como el menú de marcas) se actualicen
                const event = new CustomEvent('brandListUpdated');
                document.dispatchEvent(event);
            }
        }

        // Si se usó una marca nueva, la guardamos en la lista (para compatibilidad)
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
            clearBrandLogoPreview();
            uploadForm.reset();
            uploadWarning.style.display = 'none';
            hideModal();
            // Al resetear, también hay que chequear la validez para volver a poner los 'required'
            checkFormValidity();
        }
    });

    // --- NUEVO: FUNCIÓN PARA GUARDAR SOLO LA MARCA (AHORA DENTRO DEL SCOPE) ---
    /**
     * Guarda solo la marca y su logo en localStorage.
     * Se activa cuando el usuario presiona el botón "Guardar Marca".
     */
    async function saveBrandOnly() {
        const brandName = newBrandInput.value.trim();
        if (!brandName) {
            showModal('error', 'Por favor, ingresa un nombre para la marca.');
            return;
        }

        try {
            let brandsData = JSON.parse(localStorage.getItem('tempoDiBagsBrandsData')) || {};

            // Si la marca ya existe, no hacemos nada.
            if (brandsData[brandName]) {
                showModal('info', `La marca "${brandName}" ya existe. No se realizaron cambios.`);
                return;
            }

            // Si no existe, la guardamos con su logo (si hay).
            brandsData[brandName] = {
                logo: currentBrandLogoData || null // Guardamos el logo en base64 o null
            };
            
            localStorage.setItem('tempoDiBagsBrandsData', JSON.stringify(brandsData));
            console.log(`Nueva marca "${brandName}" guardada con éxito.`);
            
            // Disparamos un evento para que otros módulos (como el menú de marcas) se actualicen.
            const event = new CustomEvent('brandListUpdated');
            document.dispatchEvent(event);

            showModal('success', `¡La marca "${brandName}" se ha guardado correctamente.`);
            
            // Limpiamos los campos del formulario de marca
            newBrandInput.value = '';
            clearBrandLogoPreview();
            newBrandLogoContainer.style.display = 'none';
            checkFormValidity(); // Actualizamos el estado de los botones

        } catch (error) {
            console.error('Error al guardar la marca:', error);
            showModal('error', 'Ocurrió un error al guardar la marca. Por favor, intenta de nuevo.');
        }
    }

    // NUEVO: Event Listener para el botón de guardar marca
    saveBrandBtn.addEventListener('click', saveBrandOnly);

    // --- INICIALIZACIÓN ---
    populateSelect(brandSelect, getBrands(), 'Seleccioná una marca');
    populateSelect(productSelect, getProductTypes(), 'Seleccioná un tipo de producto');
    
    checkFormValidity();
    updateSearchButton();

    console.log("--- DEBUG: initUploadPage ha finalizado su configuración. ---");
}