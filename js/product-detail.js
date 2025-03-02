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

    const umbralMovimiento = 150; // Se necesita deslizar al menos 150px para cambiar de imagen

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

    // Obtener la nueva imagen antes de aplicarla
    const nuevaImagen = new Image();
    nuevaImagen.src = window.imagenUrls[window.imagenIndex];

    nuevaImagen.onload = function () {
        // Ocultar con fade-out
        mainImage.style.opacity = "0";

        setTimeout(() => {
            mainImage.src = nuevaImagen.src; // Cambiar la imagen
            mainImage.style.transform = "translateX(0)";
            mainImage.style.opacity = "1"; // Volver a mostrar con fade-in
        }, 200);
    };
    // Actualizar miniaturas activas
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

document.addEventListener("DOMContentLoaded", async function () {
    function obtenerParametroURL(nombre) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nombre);
    }

    const productId = obtenerParametroURL("id");
    console.log("ID del producto:", productId);

    if (productId) {
        await obtenerDetallesProducto(productId);
    } else {
        document.getElementById("product-detail").innerHTML = `
            <p class="error-mensaje">No se encontró el producto.</p>
        `;
    }

    async function obtenerDetallesProducto(id) {
        const productDetail = document.getElementById("product-detail");

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

            let imagenPrincipal = "";
            let miniaturasHtml = "";
            let imagenUrls = [];

            if (imagenes.length > 0) {
                const assetsResponse = await fetch(
                    `https://cdn.contentful.com/spaces/${CONFIG.CONTENTFUL.SPACE_ID}/environments/master/assets?access_token=${CONFIG.CONTENTFUL.ACCESS_TOKEN}`
                );
                const assetsData = await assetsResponse.json();

                imagenes.forEach((id, index) => {
                    const imagenAsset = assetsData.items.find((asset) => asset.sys.id === id);
                    if (imagenAsset) {
                        const imagenUrl = `https:${imagenAsset.fields.file.url}`;
                        imagenUrls.push(imagenUrl);

                        if (index === 0) {
                            imagenPrincipal = `<img id="main-image" class="zoomable-image" src="${imagenUrl}" alt="${producto.nombre}">`;
                        }

                        miniaturasHtml += `
                            <img class="thumbnail ${index === 0 ? "active" : ""}" src="${imagenUrl}" alt="${producto.nombre}" onclick="cambiarImagen('${imagenUrl}', this)">
                        `;
                    }
                });
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