async function obtenerProductos() {
    const productList = document.getElementById('product-list');
    
    try {
        const response = await fetch(
            `https://cdn.contentful.com/spaces/${CONFIG.CONTENTFUL.SPACE_ID}/environments/master/entries?access_token=${CONFIG.CONTENTFUL.ACCESS_TOKEN}&content_type=reloj`
        );

        const data = await response.json();
        console.log("Datos completos de Contentful:", data);

        //Filtro
        mostrarFiltros (data.items)

        // Crear el contenedor grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'productos-grid';

        data.items.forEach(producto => {
            // Verifica el ID del producto
            console.log(`ID del producto: ${producto.sys.id}`);

            // Obtener el campo "imagenes", que es ahora un array
            const imagenes = producto.fields.imagenes || [];  // Asegúrate de que sea un array

            // Inicializar la variable para almacenar las imágenes en el carrusel
            let imagenesHtml = '';
            imagenes.forEach((imagen, index) => {
                const imagenAsset = data.includes.Asset.find(
                    asset => asset.sys.id === imagen.sys.id
                );
                const imagenUrl = imagenAsset ? `https:${imagenAsset.fields.file.url}` : '';
                
                imagenesHtml += `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <img src="${imagenUrl}" alt="${producto.fields.nombre}">
                    </div>
                `;
            });

            const productElement = document.createElement('div');
            productElement.className = 'producto';

            console.log(producto); // Verifica el objeto completo

            const productUrl = `product-detail.html?id=${producto.sys.id}`;
            console.log(`Enlace generado: ${productUrl}`); // Verificar si se genera bien el enlace
            
            productElement.innerHTML = `
            <a href="product-detail?id=${producto.sys.id}" class="product-link">
                <div class="carousel-container">
                    ${imagenesHtml}
                    <button class="carousel-control prev" onclick="changeImage(event, 'prev')">❮</button>
                    <button class="carousel-control next" onclick="changeImage(event, 'next')">❯</button>
                </div>
                <div class="product-info">
                    <h3>${producto.fields.nombre}</h3>
                    <p class="precio">${producto.fields.precio || 'Consultar precio'}</p>
                    <span class="marca">${producto.fields.marca}</span>    

                </div>
            </a>
        `;
        
            gridContainer.appendChild(productElement);
        });

        // Limpiar el contenido anterior y agregar el nuevo grid
        productList.innerHTML = '';
        productList.appendChild(gridContainer);

        AOS.refresh();
        
    } catch (error) {
        console.error('Error:', error);
        productList.innerHTML = `
            <div class="error-mensaje">
                <p>Error al cargar los productos: ${error.message}</p>
                <button onclick="obtenerProductos()" class="btn-reintentar">
                    Intentar de nuevo
                </button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', obtenerProductos);
console.log("El DOM está listo");

function mostrarFiltros(productos) {
    const filtrosContainer = document.getElementById('filters');
    if (!filtrosContainer) return;

    const marcas = [...new Set(productos.map(p => p.fields.marca))].filter(Boolean);
    filtrosContainer.innerHTML = `
        <select id="filtro-marca">
            <option value="">Todas las marcas</option>
            ${marcas.map(marca => `<option value="${marca}">${marca}</option>`).join('')}
        </select>
        <button onclick="aplicarFiltros()">Filtrar</button>
    `;
}

function aplicarFiltros() {
    console.log("filtra")
    const marcaSeleccionada = document.getElementById('filtro-marca').value;
    console.log(marcaSeleccionada)

    const productos = document.querySelectorAll('.producto');
    console.log(productos)
    productos.forEach(producto => {
        const marca = producto.querySelector('.marca').textContent;        
        let mostrar = true;
        if (marcaSeleccionada && marca !== marcaSeleccionada) mostrar = false;
        
        producto.style.display = mostrar ? 'block' : 'none';
    });
}

// Función para cambiar las imágenes del carrusel
function changeImage(event, direction) {
    event.preventDefault();  // Evita que el enlace se siga (redirección)

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
