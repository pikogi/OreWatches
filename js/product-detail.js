function agregarSwipeEnCarrusel() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const carousel = document.querySelector(".product-image");
    let activeImage = document.getElementById("main-image");

    if (!carousel || !activeImage) {
        console.error("No se encontró el carrusel o la imagen principal.");
        return;
    }

    const umbralMovimiento = 150;

    carousel.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        activeImage.style.transition = "none";
    });

    carousel.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        let moveDiff = currentX - startX;
        activeImage.style.transform = `translateX(${moveDiff}px)`;
    });

    carousel.addEventListener("touchend", () => {
        let moveDiff = currentX - startX;
        isDragging = false;
        activeImage.style.transition = "transform 0.3s ease";

        if (moveDiff < -umbralMovimiento) {
            cambiarImagenCarrusel("next");
        } else if (moveDiff > umbralMovimiento) {
            cambiarImagenCarrusel("prev");
        } else {
            activeImage.style.transform = "translateX(0)";
        }
    });
}

function cambiarImagenCarrusel(direccion) {
    if (!window.imagenUrls || window.imagenUrls.length === 0) return;

    if (direccion === "next") {
        window.imagenIndex = (window.imagenIndex + 1) % window.imagenUrls.length;
    } else if (direccion === "prev") {
        window.imagenIndex = (window.imagenIndex - 1 + window.imagenUrls.length) % window.imagenUrls.length;
    }

    const mainImage = document.getElementById("main-image");
    if (!mainImage) return;

    const nuevaImagen = new Image();
    nuevaImagen.src = window.imagenUrls[window.imagenIndex];

    nuevaImagen.onload = function () {
        mainImage.style.opacity = "0";

        setTimeout(() => {
            mainImage.src = nuevaImagen.src;
            mainImage.style.transform = "translateX(0)";
            mainImage.style.opacity = "1";
        }, 200);
    };

    document.querySelectorAll(".thumbnail").forEach((thumbnail, index) => {
        thumbnail.classList.toggle("active", index === window.imagenIndex);
    });
}

function cambiarImagen(url, elemento) {
    const mainImage = document.getElementById("main-image");
    if (mainImage) {
        mainImage.src = url;
    }

    document.querySelectorAll(".thumbnail").forEach((thumbnail) => {
        thumbnail.classList.remove("active");
    });

    elemento.classList.add("active");
}

// Función para crear el skeleton loader
function crearSkeletonLoader() {
    return `
        <div class="detalle-producto container skeleton-container">
            <div class="product-image skeleton">
                <div class="skeleton-image"></div>
                <div class="thumbnail-container skeleton">
                    <div class="skeleton-thumbnail"></div>
                    <div class="skeleton-thumbnail"></div>
                    <div class="skeleton-thumbnail"></div>
                </div>
            </div>
            <div class="product-info skeleton">
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-description"></div>
                <div class="skeleton-price"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", async function () {
    function obtenerParametroURL(nombre) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nombre);
    }

    const productId = obtenerParametroURL("id");
    console.log("ID del producto:", productId);
    const productDetail = document.getElementById("product-detail");

    if (!productId) {
        productDetail.innerHTML = `
            <p class="error-mensaje">No se encontró el producto.</p>
        `;
        return;
    }

    // Mostrar el skeleton loader mientras se carga el producto
    productDetail.innerHTML = crearSkeletonLoader();

    async function obtenerDetallesProducto(id) {
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
            const imagenes = producto.imagenes ? producto.imagenes.map((img) => img.sys.id) : [];

            if (imagenes.length === 0) {
                console.warn("El producto no tiene imágenes.");
            }

            let imagenPrincipal = "";
            let miniaturasHtml = "";
            let imagenUrls = [];

            if (imagenes.length > 0) {
                for (const id of imagenes) {
                    const assetResponse = await fetch(
                        `https://cdn.contentful.com/spaces/${CONFIG.CONTENTFUL.SPACE_ID}/environments/master/assets/${id}?access_token=${CONFIG.CONTENTFUL.ACCESS_TOKEN}`
                    );
                    const assetData = await assetResponse.json();

                    if (assetData.fields && assetData.fields.file && assetData.fields.file.url) {
                        const imagenUrl = `https:${assetData.fields.file.url}`;
                        imagenUrls.push(imagenUrl);

                        if (!imagenPrincipal) {
                            imagenPrincipal = `<img id="main-image" class="zoomable-image" src="${imagenUrl}" alt="${producto.nombre}">`;
                        }

                        miniaturasHtml += `
                            <img class="thumbnail ${imagenUrls.length === 1 ? "active" : ""}" src="${imagenUrl}" alt="${producto.nombre}" onclick="cambiarImagen('${imagenUrl}', this)">
                        `;
                    }
                }
            }

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
                        <p class="marca">Marca: ${producto.marca || "Marca no disponible"}</p>
                        <p class="modelo">Modelo: ${producto.nombre || "Modelo no disponible"}</p>
                        <p class="referencia">Referencia: ${producto.referencia || "Sin referencia"}</p>
                        <p class="descripcion"><u>Descripción:</u> ${producto.descripcion || "Sin descripción"}</p>
                        <p class="precio">${producto.precio || "Consultar precio"}</p>
                        <button class="boton-consulta">Consultar</button>
                    </div>
                </div>
            `;

            document.querySelectorAll(".boton-consulta").forEach((boton) => {
                boton.addEventListener("click", () => {
                    const mensaje = `Hola, me gustaría consultar sobre el producto ${producto.nombre}.`;
                    window.open(`https://wa.me/3517340111?text=${encodeURIComponent(mensaje)}`, "_blank");
                });
            });

            window.imagenUrls = imagenUrls;
            window.imagenIndex = 0;

            aplicarZoom();
            agregarSwipeEnCarrusel();
        } catch (error) {
            console.error("Error al cargar el producto:", error);
            productDetail.innerHTML = `<p class="error-mensaje">Error al cargar el producto: ${error.message}</p>`;
        }
    }

    function aplicarZoom() {
        const productImage = document.querySelector(".zoomable-image");
        if (!productImage) return;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) return;

        const zoomContainer = document.createElement("div");
        zoomContainer.classList.add("zoom-container");
        zoomContainer.innerHTML = `<img src="${productImage.src}" alt="Zoom Image">`;
        document.body.appendChild(zoomContainer);

        productImage.addEventListener("click", () => {
            zoomContainer.style.display = "flex";
            zoomContainer.querySelector("img").src = productImage.src;
        });

        zoomContainer.addEventListener("click", () => {
            zoomContainer.style.display = "none";
        });
    }

    // Cargar los detalles del producto después de mostrar el skeleton
    await obtenerDetallesProducto(productId);
});