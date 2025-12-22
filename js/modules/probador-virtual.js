// ==========================================================================
// js/modules/probador-virtual.js - Módulo para el Probador Virtual (CON API GRATUITA)
// ==========================================================================

/**
 * Inicializa la funcionalidad del probador virtual.
 */
export function initProbadorVirtual() {
    console.log("--- DEBUG: initProbadorVirtual se ha iniciado ---");

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const userImageDropZone = document.getElementById('user-image-drop-zone');
    const userImageInput = document.createElement('input');
    const userImagePreviewContainer = document.getElementById('user-image-preview-container');
    const userImagePreview = document.getElementById('user-image-preview');
    const removeUserImageBtn = document.getElementById('remove-user-image-btn');
    const probadorSearchInput = document.getElementById('probador-search-input');
    const productSelector = document.getElementById('product-selector');
    const generateBtn = document.getElementById('generate-btn');

    // Elementos para el modal de resultado
    const resultModalOverlay = document.getElementById('result-modal-overlay');
    const resultModalCloseBtn = document.getElementById('result-modal-close-btn');
    const resultModalBody = document.getElementById('result-modal-body');
    const resultLoader = document.getElementById('result-loader');
    const resultImage = document.getElementById('result-image');
    const resultActions = document.getElementById('result-actions');
    const tryAnotherModalBtn = document.getElementById('try-another-modal-btn');
    const saveResultModalBtn = document.getElementById('save-result-modal-btn');

    let currentUserImageData = null;
    let selectedProductId = null;
    let allProducts = [];

    // --- CONFIGURACIÓN INICIAL DEL INPUT DE ARCHIVO ---
    userImageInput.type = 'file';
    userImageInput.accept = 'image/*';
    userImageInput.style.display = 'none';
    document.body.appendChild(userImageInput);

    // --- NUEVO: FUNCIÓN PARA MEJORAR LA IMAGEN CON UPSCALE.MEDIA ---
    const enhanceImageWithUpscaleMedia = async (base64Image) => {
        // Upscale.media necesita la imagen en formato Blob, no en Base64
        const base64Data = base64Image.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });

        const formdata = new FormData();
        formdata.append("image_file", imageBlob, "user_photo.jpg");

        const requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'follow'
        };

        try {
            console.log("Enviando imagen a Upscale.media para mejora...");
            const response = await fetch("https://api.upscale.media/v1/upscaler", requestOptions);
            const result = await response.json();
            
            if (result && result.id) {
                console.log("Solicitud de mejora enviada. ID:", result.id);
                // Ahora debemos consultar el resultado
                const resultUrl = `https://api.upscale.media/v1/result/${result.id}`;
                
                // Polling: consultamos cada 2 segundos hasta que la imagen esté lista
                return new Promise((resolve, reject) => {
                    const checkResult = async () => {
                        const res = await fetch(resultUrl);
                        const data = await res.json();
                        
                        if (data.status === 'success' && data.image_url) {
                            console.log("Imagen mejorada con éxito. Descargando...");
                            // Descargamos la imagen mejorada para convertirla a Base64
                            const imageResponse = await fetch(data.image_url);
                            const imageBlob = await imageResponse.blob();
                            
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(imageBlob);
                        } else if (data.status === 'failed') {
                            reject(new Error(data.error || 'Error en el procesamiento de la imagen.'));
                        } else {
                            // Sigue procesando, intentamos de nuevo en 2 segundos
                            setTimeout(checkResult, 2000);
                        }
                    };
                    checkResult();
                });
            } else {
                throw new Error('No se pudo iniciar la mejora de imagen.');
            }
        } catch (error) {
            console.error("Error al mejorar la imagen con Upscale.media:", error);
            showModal('error', `No se pudo mejorar la imagen: ${error.message}. Se usará la original.`);
            return base64Image; // Devuelve la imagen original en caso de error
        }
    };

    // --- GESTIÓN DE IMÁGENES (MODIFICADA PARA MEJORAR CALIDAD) ---
    const showUserImagePreview = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const originalImageData = e.target.result;
            
            // Mostrar estado de "mejorando calidad"
            userImagePreview.src = originalImageData;
            userImagePreviewContainer.style.display = 'block';
            userImageDropZone.style.display = 'none';

            // Añadir overlay de carga
            const enhancementLoader = document.createElement('div');
            enhancementLoader.className = 'enhancement-loader';
            enhancementLoader.innerHTML = `
                <div class="loader-spinner"></div>
                <p>Mejorando calidad con IA...</p>
            `;
            userImagePreviewContainer.appendChild(enhancementLoader);

            // Llamar a la API de mejora
            const enhancedImageData = await enhanceImageWithUpscaleMedia(originalImageData);
            
            // Remover el loader
            enhancementLoader.remove();

            // Establecer la imagen mejorada (o la original si falló)
            currentUserImageData = enhancedImageData;
            userImagePreview.src = currentUserImageData;
            
            checkGenerationReadiness();
        };
        reader.readAsDataURL(file);
    };

    const clearUserImagePreview = () => {
        currentUserImageData = null;
        userImagePreview.src = '';
        userImagePreviewContainer.style.display = 'none';
        userImageDropZone.style.display = 'flex';
        userImageInput.value = '';
        checkGenerationReadiness();
    };

    // --- LÓGICA DE VALIDACIÓN Y ESTADO DEL BOTÓN ---
    const checkGenerationReadiness = () => {
        if (currentUserImageData && selectedProductId) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    };

    // --- LÓGICA DEL EFECTO DE ESTRELLAS (DENTRO DEL MODAL) ---
    const triggerStarburstInModal = () => {
        const container = document.createElement('div');
        container.className = 'starburst-modal-container';
        
        for (let i = 0; i < 16; i++) {
            const star = document.createElement('span');
            star.className = 'star-modal';
            
            const angle = (360 / 16) * i;
            const distance = 80 + Math.random() * 80;
            
            star.style.setProperty('--tx', `${Math.cos(angle * Math.PI / 180) * distance}px`);
            star.style.setProperty('--ty', `${Math.sin(angle * Math.PI / 180) * distance}px`);
            
            container.appendChild(star);
        }
        
        resultModalBody.appendChild(container);
        
        setTimeout(() => {
            container.remove();
        }, 1000);
    };

    const style = document.createElement('style');
    style.textContent = `
        .star-modal {
            animation: starburst-modal-animation 1s ease-out forwards;
            transform: translate(-50%, -50%) translate(var(--tx), var(--ty));
        }
    `;
    document.head.appendChild(style);

    // --- FUNCIÓN PARA RENDERIZAR PRODUCTOS ---
    const renderProducts = (productsToRender) => {
        if (productsToRender.length === 0) {
            productSelector.innerHTML = '<p>No se encontraron productos con ese nombre.</p>';
            return;
        }
        productSelector.innerHTML = productsToRender.map(product => `
            <div class="product-card-selector" data-product-id="${product.id}">
                <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';">
                <p>${product.name}</p>
            </div>
        `).join('');
    };
    
    // --- FUNCIÓN PARA CARGAR Y FILTRAR PRODUCTOS ---
    const loadAndFilterProducts = (searchTerm = '') => {
        const filteredProducts = allProducts.filter(product => {
            const lowerCaseTerm = searchTerm.toLowerCase();
            return product.name.toLowerCase().includes(lowerCaseTerm) ||
                   product.brand.toLowerCase().includes(lowerCaseTerm);
        });
        renderProducts(filteredProducts);
    };

    // --- LÓGICA DEL MODAL DE RESULTADO ---
    const showResultModal = () => {
        resultModalOverlay.classList.add('show');
        resultLoader.style.display = 'flex';
        resultImage.style.display = 'none';
        resultActions.style.display = 'none';

        setTimeout(() => {
            triggerStarburstInModal();
        }, 300);

        setTimeout(() => {
            resultImage.src = currentUserImageData; // Ahora usa la imagen MEJORADA
            resultLoader.style.display = 'none';
            resultImage.style.display = 'block';
            resultActions.style.display = 'flex';
        }, 2000);
    };

    const hideResultModal = () => {
        resultModalOverlay.classList.remove('show');
    };
    
    // --- LÓGICA DE MODALES ---
    const showModal = (type, message) => {
        const iconEmoji = type === 'success' ? '😊' : (type === 'error' ? '😞' : '🤔');
        const modalBody = document.querySelector('#modal-body'); // Reutilizamos el modal existente
        if(modalBody) {
            modalBody.innerHTML = `
                <div class="modal-icon modal-icon-${type}">${iconEmoji}</div>
                <p class="modal-message">${message}</p>
            `;
            const modalOverlay = document.getElementById('modal-overlay');
            if(modalOverlay) modalOverlay.classList.add('show');
        }
    };

    // --- EVENT LISTENERS ---
    userImageDropZone.addEventListener('click', () => userImageInput.click());
    userImageDropZone.addEventListener('dragover', (e) => { e.preventDefault(); userImageDropZone.classList.add('drag-over'); });
    userImageDropZone.addEventListener('dragleave', () => userImageDropZone.classList.remove('drag-over'));
    userImageDropZone.addEventListener('drop', (e) => { e.preventDefault(); userImageDropZone.classList.remove('drag-over'); if (e.dataTransfer.files.length > 0) showUserImagePreview(e.dataTransfer.files[0]); });
    userImageInput.addEventListener('change', (e) => { if (e.target.files.length > 0) showUserImagePreview(e.target.files[0]); });
    removeUserImageBtn.addEventListener('click', clearUserImagePreview);

    probadorSearchInput.addEventListener('input', (e) => {
        loadAndFilterProducts(e.target.value);
    });

    productSelector.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card-selector');
        if (card) {
            document.querySelectorAll('.product-card-selector.selected').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedProductId = card.dataset.productId;
            checkGenerationReadiness();
        }
    });

    generateBtn.addEventListener('click', () => {
        showResultModal();
    });

    // Listeners del modal
    resultModalCloseBtn.addEventListener('click', hideResultModal);
    resultModalOverlay.addEventListener('click', (e) => { if (e.target === resultModalOverlay) hideResultModal(); });
    
    if (tryAnotherModalBtn) {
        tryAnotherModalBtn.textContent = 'Cerrar';
        tryAnotherModalBtn.addEventListener('click', hideResultModal);
    }

    if (saveResultModalBtn) {
        saveResultModalBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = resultImage.src;
            link.download = 'probador-virtual-tempo-di-bags.png';
            link.click();
        });
    }

    // --- INICIALIZACIÓN ---
    allProducts = JSON.parse(localStorage.getItem('tempoDiBagsProducts')) || [];
    if (allProducts.length === 0) {
        productSelector.innerHTML = '<p>No hay productos disponibles para probar.</p>';
    } else {
        loadAndFilterProducts();
    }
    
    console.log("--- DEBUG: initProbadorVirtual ha finalizado su configuración. ---");
}