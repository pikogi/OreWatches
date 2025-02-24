document.addEventListener('DOMContentLoaded', function () {
    // Función para obtener parámetros de la URL
    function obtenerParametroURL(nombre) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nombre);
    }

    // Obtener el ID del producto de la URL
    const productId = obtenerParametroURL('id');
    console.log('ID del producto:', productId); // Verifica si el ID se obtiene correctamente

    // Verifica si hay un ID válido
    if (productId) {
        obtenerDetallesProducto(productId);
    } else {
        document.getElementById('product-detail').innerHTML = `
            <p class="error-mensaje">No se encontró el producto.</p>
        `;
    }

    // Función para obtener los detalles del producto desde Contentful
    async function obtenerDetallesProducto(id) {
        const productDetail = document.getElementById('product-detail');

        try {
            const response = await fetch(
                `https://cdn.contentful.com/spaces/${CONFIG.CONTENTFUL.SPACE_ID}/environments/master/entries/${id}?access_token=${CONFIG.CONTENTFUL.ACCESS_TOKEN}`
            );

            const data = await response.json();

            // Obtener información del producto
            const producto = data.fields;
            const imagenes = producto.imagenes || [];

            // Construir el carrusel de imágenes
            let imagenesHtml = '';
            imagenes.forEach((imagen, index) => {
                const imagenUrl = `https:${imagen.fields.file.url}`;
                imagenesHtml += `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="${imagenUrl}" alt="${producto.nombre}">
                    </div>
                `;
            });

            productDetail.innerHTML = `
                <div class="detalle-producto">
                    <div class="carousel-container">
                        ${imagenesHtml}
                        <button class="carousel-control prev" onclick="changeImage(event, 'prev')">❮</button>
                        <button class="carousel-control next" onclick="changeImage(event, 'next')">❯</button>
                    </div>
                    <h1>${producto.nombre}</h1>
                    <p class="marca">${producto.marca || 'Marca no disponible'}</p>
                    <p class="precio">${producto.precio || 'Consultar precio'}</p>
                    <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
                    <button class="boton-consulta">Consultar por este producto</button>
                </div>
            `;

        } catch (error) {
            console.error('Error al cargar el producto:', error);
            productDetail.innerHTML = `
                <p class="error-mensaje">Error al cargar el producto: ${error.message}</p>
            `;
        }
    }

    // Función para cambiar imágenes en el carrusel
    function changeImage(event, direction) {
        event.preventDefault();
        const carouselItems = event.target.closest('.carousel-container').querySelectorAll('.carousel-item');
        let activeIndex = Array.from(carouselItems).findIndex(item => item.classList.contains('active'));

        if (direction === 'next') {
            activeIndex = (activeIndex + 1) % carouselItems.length;
        } else if (direction === 'prev') {
            activeIndex = (activeIndex - 1 + carouselItems.length) % carouselItems.length;
        }

        carouselItems.forEach(item => item.classList.remove('active'));
        carouselItems[activeIndex].classList.add('active');
    }
});
