document.addEventListener('DOMContentLoaded', async function () {
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
        await obtenerDetallesProducto(productId);
    } else {
        document.getElementById('product-detail').innerHTML = `
            <p class="error-mensaje">No se encontró el producto.</p>
        `;
    }

    async function obtenerDetallesProducto(id) {
        const productDetail = document.getElementById('product-detail');
    
        try {
            const response = await fetch(
                `https://cdn.contentful.com/spaces/${CONFIG.CONTENTFUL.SPACE_ID}/environments/master/entries/${id}?access_token=${CONFIG.CONTENTFUL.ACCESS_TOKEN}`
            );
            const data = await response.json();
            console.log("Respuesta de Contentful:", data);
    
            if (!data.fields) {
                throw new Error("El producto no tiene datos válidos.");
            }
    
            const producto = data.fields;
            const imagenes = producto.imagenes ? producto.imagenes.map(img => img.sys.id) : [];
    
            let imagenesHtml = '';
            let miniaturasHtml = '';
            let imagenPrincipal = '';
            let imagenUrls = []; 
    
            if (imagenes.length > 0) {
                const assetsResponse = await fetch(
                    `https://cdn.contentful.com/spaces/${CONFIG.CONTENTFUL.SPACE_ID}/environments/master/assets?access_token=${CONFIG.CONTENTFUL.ACCESS_TOKEN}`
                );
                const assetsData = await assetsResponse.json();
    
                imagenes.forEach((id, index) => {
                    const imagenAsset = assetsData.items.find(asset => asset.sys.id === id);
                    if (imagenAsset) {
                        const imagenUrl = `https:${imagenAsset.fields.file.url}`;
                        imagenUrls.push(imagenUrl);
    
                        // Definir la imagen principal (la primera por defecto)
                        if (index === 0) {
                            imagenPrincipal = `<img id="main-image" class="zoomable-image" src="${imagenUrl}" alt="${producto.nombre}">`;
                        }
    
                        // Agregar miniaturas
                        miniaturasHtml += `
                            <img class="thumbnail ${index === 0 ? 'active' : ''}" src="${imagenUrl}" alt="${producto.nombre}" onclick="cambiarImagen('${imagenUrl}', this)">
                        `;
                    }
                });
            }
    
            // Insertar el contenido del producto en el DOM
            productDetail.innerHTML = `
                <div class="detalle-producto container">
                    <div class="product-image">
                        <button class="carousel-control prev" onclick="cambiarImagenCarrusel('prev')">❮</button>
                        ${imagenPrincipal}
                        <button class="carousel-control next" onclick="cambiarImagenCarrusel('next')">❯</button>
                        <div class="thumbnail-container">${miniaturasHtml}</div>
                    </div>
                    <div class="product-info">
                        <h1>${producto.nombre}</h1>
                        <p class="marca">Marca: ${producto.marca || 'Marca no disponible'}</p>
                        <p class="modelo">Modelo: ${producto.nombre || 'Modelo no disponible'}</p>
                        <p class="referencia">Referencia: ${producto.referencia || 'Sin referencia'}</p>
                        <p class="descripcion">${producto.descripcion || 'Sin descripción'}</p>
                        <p class="precio">${producto.precio || 'Consultar precio'}</p>
                        <button class="boton-consulta">Consultar</button>

                    </div>
                </div>
            `;
    
            // Ahora que el contenido está en el DOM, seleccionamos los botones
            const botonesConsulta = document.querySelectorAll('.boton-consulta');
    
            // Recorremos cada botón y le asignamos el evento
            botonesConsulta.forEach((boton) => {
                boton.addEventListener('click', () => {
                    const productoUrl = window.location.href; // Obtener la URL completa de la página
                    const mensaje = `Hola%20me%20gustaría%20consultar%20el%20producto%20${encodeURIComponent(producto.nombre)}%20(Ver%20más%20en%20${encodeURIComponent(productoUrl)})`;
                    const numeroWhatsapp = '3517340111'; // Cambia este número por el adecuado
                    window.open(`https://wa.me/${numeroWhatsapp}?text=${mensaje}`, '_blank');
                });
            });
    
            // Guardar imágenes en una variable global para usar en el carrusel
            window.imagenUrls = imagenUrls;
            window.imagenIndex = 0; // Índice de la imagen actual
    
            // Aplicar funcionalidad de zoom
            aplicarZoom();
    
        } catch (error) {
            console.error('Error al cargar el producto:', error);
            productDetail.innerHTML = `
                <p class="error-mensaje">Error al cargar el producto: ${error.message}</p>
            `;
        }
    }
    
    // Función para la lupa
    function aplicarZoom() {
        const productImage = document.querySelector(".zoomable-image");
        if (!productImage) return;

        const zoomContainer = document.createElement("div");
        zoomContainer.classList.add("zoom-container");
        zoomContainer.innerHTML = `<img src="${productImage.src}" alt="Zoom Image">`;
        document.body.appendChild(zoomContainer);

        productImage.addEventListener("click", function () {
            zoomContainer.style.display = "flex";
            zoomContainer.querySelector("img").src = productImage.src;
        });

        zoomContainer.addEventListener("click", function () {
            zoomContainer.style.display = "none";
        });

        const zoomImage = zoomContainer.querySelector("img");
        zoomContainer.addEventListener("mousemove", function (e) {
            const { left, top, width, height } = zoomImage.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;
            zoomImage.style.transformOrigin = `${x}% ${y}%`;
            zoomImage.style.transform = "scale(2)";
        });

        zoomContainer.addEventListener("mouseleave", function () {
            zoomImage.style.transform = "scale(1)";
        });
    }
});
