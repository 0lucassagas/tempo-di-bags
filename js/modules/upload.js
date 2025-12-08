// js/modules/upload.js

export function initUploadPage() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.createElement('input'); // Input oculto
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const uploadForm = document.getElementById('upload-form');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const uploadMessage = document.getElementById('upload-message');

    let currentImageData = null; // Guardaremos la imagen en formato Base64

    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // --- Funciones para manejar la imagen ---
    const showImagePreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImageData = e.target.result; // Guardamos la imagen como Base64
            imagePreview.src = currentImageData;
            imagePreviewContainer.style.display = 'block';
            dropZone.style.display = 'none';
            checkFormValidity(); // Verificamos si el formulario está listo para guardar
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

    // --- Eventos de la zona de arrastre (Drop Zone) ---
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

    // --- Lógica del formulario ---
    const checkFormValidity = () => {
        const price = document.getElementById('price-input').value;
        const brand = document.getElementById('brand-select').value;
        const productSelect = document.getElementById('product-select');

        if (currentImageData && price && brand && productSelect.value) {
            saveBtn.disabled = false;
        } else {
            saveBtn.disabled = true;
        }
    };

    ['price-input', 'brand-select', 'product-select'].forEach(id => {
        document.getElementById(id).addEventListener('input', checkFormValidity);
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- Crear el objeto del nuevo producto ---
        const newProduct = {
            id: Date.now(), // ID único basado en el timestamp actual
            name: document.getElementById('product-select').options[document.getElementById('product-select').selectedIndex].text,
            brand: document.getElementById('brand-select').value,
            price: parseFloat(document.getElementById('price-input').value),
            imageUrl: currentImageData,
            status: "available"
        };

        try {
            // --- Guardar en localStorage ---
            let products = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
            products.unshift(newProduct); // Agrega el nuevo producto al principio
            localStorage.setItem('tempoDiBagsProducts', JSON.stringify(products));

            // --- Mostrar mensaje de éxito ---
            uploadMessage.textContent = '¡Producto cargado con éxito!';
            uploadMessage.className = 'upload-message success';
            uploadMessage.style.display = 'block';

            // --- Redirigir al inicio después de un momento ---
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
}