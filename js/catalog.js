// Función para crear el skeleton loader de la lista de productos
function crearProductosSkeletonLoader(cantidad = 8) {
    let skeletonHtml = '';
    
    for (let i = 0; i < cantidad; i++) {
        skeletonHtml += `
            <div class="producto skeleton">
                <div class="carousel-container skeleton">
                    <div class="skeleton-image"></div>
                </div>
                <div class="product-info skeleton">
                    <div class="skeleton-marca"></div>
                    <div class="skeleton-nombre"></div>
                    <div class="skeleton-precio"></div>
                </div>
            </div>
        `;
    }
    
    return `<div class="productos-grid skeleton-grid">${skeletonHtml}</div>`;
}

async function obtenerProductos() {
    const productList = document.getElementById('product-list');
    
    // Mostrar el skeleton loader mientras se cargan los productos
    productList.innerHTML = crearProductosSkeletonLoader();
    
    try {
        const response = await fetch(
            `https://cdn.contentful.com/spaces/${CONFIG.CONTENTFUL.SPACE_ID}/environments/master/entries?access_token=${CONFIG.CONTENTFUL.ACCESS_TOKEN}&content_type=reloj`
        );

        const data = await response.json();
        console.log("Datos completos de Contentful:", data);

        // Detectar si estamos en la página principal
        const esPaginaPrincipal = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

        // Limitar a 8 productos solo en la página principal
        const productosParaMostrar = esPaginaPrincipal ? data.items.slice(0, 8) : data.items;

        // Filtro
        mostrarFiltros(productosParaMostrar);

        // Crear el contenedor grid
        const gridContainer = document.createElement('div');
        gridContainer.className = 'productos-grid';

        productosParaMostrar.forEach(producto => {
            // Verifica el ID del producto
            console.log(`ID del producto: ${producto.sys.id}`);

            // Obtener imágenes del producto
            const imagenes = producto.fields.imagenes || [];
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

            const productUrl = `product-detail.html?id=${producto.sys.id}`;

            productElement.innerHTML = `
                <a href="product-detail?id=${producto.sys.id}" class="product-link">
                    <div class="carousel-container">
                        ${imagenesHtml}
                        <button class="carousel-control prev" onclick="changeImage(event, 'prev')">❮</button>
                        <button class="carousel-control next" onclick="changeImage(event, 'next')">❯</button>
                    </div>
                    <div class="product-info">
                        <span class="marca">${producto.fields.marca}</span>    
                        <h3>${producto.fields.nombre}</h3>
                        <p class="precio">${producto.fields.precio || 'Consultar precio'}</p>
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

    // Normalizamos las marcas para evitar duplicados por mayúsculas/minúsculas o espacios
    const marcasUnicas = new Set(
        productos
            .map(p => p.fields.marca?.trim().toLowerCase()) // Convertir a minúsculas y quitar espacios
            .filter(Boolean)
    );

    filtrosContainer.innerHTML = `
        <select id="filtro-marca">
            <option value="">Todas las marcas</option>
            ${[...marcasUnicas]
                .map(marca => `<option value="${marca}">${marca.charAt(0).toUpperCase() + marca.slice(1)}</option>`)
                .join('')}
        </select>
        <button onclick="aplicarFiltros()">Filtrar</button>
    `;
}

function aplicarFiltros() {
    console.log("Filtrando...");

    const marcaSeleccionada = document.getElementById('filtro-marca').value.toLowerCase();
    console.log("Marca seleccionada:", marcaSeleccionada);

    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        const marca = producto.querySelector('.marca').textContent.trim().toLowerCase();
        let mostrar = true;

        if (marcaSeleccionada && marca !== marcaSeleccionada) {
            mostrar = false;
        }

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

document.addEventListener('DOMContentLoaded', obtenerProductos);
console.log("El DOM está listo");

function mostrarFiltros(productos) {
    const filtrosContainer = document.getElementById('filters');
    if (!filtrosContainer) return;

    // Normalizamos las marcas para evitar duplicados por mayúsculas/minúsculas o espacios
    const marcasUnicas = new Set(
        productos
            .map(p => p.fields.marca?.trim().toLowerCase()) // Convertir a minúsculas y quitar espacios
            .filter(Boolean)
    );

    filtrosContainer.innerHTML = `
        <select id="filtro-marca">
            <option value="">Todas las marcas</option>
            ${[...marcasUnicas]
                .map(marca => `<option value="${marca}">${marca.charAt(0).toUpperCase() + marca.slice(1)}</option>`)
                .join('')}
        </select>
        <button onclick="aplicarFiltros()">Filtrar</button>
    `;
}

function aplicarFiltros() {
    console.log("Filtrando...");

    const marcaSeleccionada = document.getElementById('filtro-marca').value.toLowerCase();
    console.log("Marca seleccionada:", marcaSeleccionada);

    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        const marca = producto.querySelector('.marca').textContent.trim().toLowerCase();
        let mostrar = true;

        if (marcaSeleccionada && marca !== marcaSeleccionada) {
            mostrar = false;
        }

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
