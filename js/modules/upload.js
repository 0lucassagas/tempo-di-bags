// js/modules/upload.js (Versión Final con Gestión de Marcas y Productos)

export function initUploadPage() {
    console.log("--- DEBUG: initUploadPage se ha iniciado ---");

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.createElement('input');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const uploadForm = document.getElementById('upload-form');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const uploadMessage = document.getElementById('upload-message');
    
    // Elementos de marca
    const brandSelect = document.getElementById('brand-select');
    const newBrandInput = document.getElementById('new-brand-input');

    // Elementos de producto
    const productSelect = document.getElementById('product-select');
    const newProductInput = document.getElementById('new-product-input');

    // Elemento de descripción
    const descriptionInput = document.getElementById('description-input');

    let currentImageData = null;

    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // --- GESTIÓN DE MARCAS ---
    const getBrands = () => {
        const storedBrands = localStorage.getItem('tempoDiBagsBrands');
        return storedBrands ? JSON.parse(storedBrands) : ['Gucci', 'Prada', 'Nike', 'Trendy', 'Louis Vuitton', 'Adidas'];
    };

    const saveBrands = (brands) => {
        localStorage.setItem('tempoDiBagsBrands', JSON.stringify(brands));
    };

    const populateBrandSelect = () => {
        const brands = getBrands();
        brandSelect.innerHTML = '<option value="">Seleccioná una marca</option>';
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    };

    const addNewBrand = () => {
        const newBrand = newBrandInput.value.trim();
        if (newBrand && !getBrands().includes(newBrand)) {
            const brands = getBrands();
            brands.push(newBrand);
            saveBrands(brands);
            populateBrandSelect();
            brandSelect.value = newBrand;
            newBrandInput.value = '';
            checkFormValidity();
        }
    };

    // --- GESTIÓN DE TIPOS DE PRODUCTO (NUEVO) ---
    const getProductTypes = () => {
        const storedProducts = localStorage.getItem('tempoDiBagsProductTypes');
        return storedProducts ? JSON.parse(storedProducts) : ['Bolso', 'Mochila', 'Cinturón', 'Cartera', 'Valija', 'Gorra', 'Botella de Agua'];
    };

    const saveProductTypes = (products) => {
        localStorage.setItem('tempoDiBagsProductTypes', JSON.stringify(products));
    };

    const populateProductSelect = () => {
        const products = getProductTypes();
        productSelect.innerHTML = '<option value="">Seleccioná un tipo de producto</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = product;
            productSelect.appendChild(option);
        });
    };

    const addNewProduct = () => {
        const newProduct = newProductInput.value.trim();
        if (newProduct && !getProductTypes().includes(newProduct)) {
            const products = getProductTypes();
            products.push(newProduct);
            saveProductTypes(products);
            populateProductSelect();
            productSelect.value = newProduct;
            newProductInput.value = '';
            checkFormValidity();
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

    // --- EVENT LISTENERS ---
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            showImagePreview(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            showImagePreview(e.target.files[0]);
        }
    });

    removeImageBtn.addEventListener('click', clearImagePreview);

    // Evento para agregar nueva marca al presionar Enter
    newBrandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addNewBrand();
        }
    });

    // Evento para agregar nuevo producto al presionar Enter (NUEVO)
    newProductInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addNewProduct();
        }
    });

    // --- LÓGICA DEL FORMULARIO ---
    const checkFormValidity = () => {
        const price = document.getElementById('price-input').value;
        const brand = brandSelect.value;
        const product = productSelect.value;
        const description = descriptionInput.value.trim();

        if (currentImageData && price && brand && product && description) {
            saveBtn.disabled = false;
        } else {
            saveBtn.disabled = true;
        }
    };

    // Escuchamos cambios en todos los campos relevantes
    ['price-input', 'brand-select', 'product-select', 'description-input'].forEach(id => {
        document.getElementById(id).addEventListener('input', checkFormValidity);
    });

    // Escuchamos cambios en los inputs de nuevos items
    newBrandInput.addEventListener('input', () => {
        if (newBrandInput.value.trim()) {
            brandSelect.value = "";
        }
        checkFormValidity();
    });

    newProductInput.addEventListener('input', () => { // NUEVO
        if (newProductInput.value.trim()) {
            productSelect.value = "";
        }
        checkFormValidity();
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Si hay una marca nueva en el input, la agregamos antes de guardar
        if (newBrandInput.value.trim()) {
            addNewBrand();
        }

        // Si hay un producto nuevo en el input, lo agregamos antes de guardar (NUEVO)
        if (newProductInput.value.trim()) {
            addNewProduct();
        }

        const newProduct = {
            id: Date.now(),
            name: productSelect.options[productSelect.selectedIndex].text,
            brand: brandSelect.value,
            price: parseFloat(document.getElementById('price-input').value),
            description: descriptionInput.value.trim(),
            imageUrl: currentImageData,
            status: "available"
        };

        try {
            let products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
            products.unshift(newProduct);
            localStorage.setItem('tempoDiBagsProducts', JSON.stringify(products));

            uploadMessage.textContent = '¡Producto cargado con éxito!';
            uploadMessage.className = 'upload-message success';
            uploadMessage.style.display = 'block';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('Error al guardar el producto:', error);
            uploadMessage.textContent = 'Ocurrió un error. Por favor, intenta de nuevo.';
            uploadMessage.className = 'upload-message error';
            uploadMessage.style.display = 'block';
        }
    });

    cancelBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cancelar? Se perderán los datos no guardados.')) {
            clearImagePreview();
            uploadForm.reset();
            uploadMessage.style.display = 'none';
        }
    });

    // --- INICIALIZACIÓN ---
    populateBrandSelect();
    populateProductSelect(); // NUEVO
    console.log("--- DEBUG: initUploadPage ha finalizado su configuración. ---");
}