// =====================
// Cargar inventario desde LocalStorage
// =====================
let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

// =====================
// Mostrar inventario
// =====================
function mostrarInventario() {
    let tabla = document.getElementById("tablaInventario");
    tabla.innerHTML = "";

    inventario.forEach((producto, index) => {
        tabla.innerHTML += `
            <tr>
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precio.toLocaleString()}</td>
                <td>$${(producto.cantidad * producto.precio).toLocaleString()}</td>
                <td><button onclick="eliminarProducto(${index})">Eliminar</button></td>
            </tr>
        `;
    });
}

// =====================
// Agregar producto
// =====================
function agregarProducto() {
    let nombre = document.getElementById("nombre").value;
    let cantidad = document.getElementById("cantidad").value;
    let precio = document.getElementById("precio").value;

    if (nombre === "" || cantidad === "" || precio === "") {
        alert("Por favor, complete todos los campos");
        return;
    }

    let nuevo = {
        nombre,
        cantidad: Number(cantidad),
        precio: Number(precio)
    };

    inventario.push(nuevo);

    localStorage.setItem("inventario", JSON.stringify(inventario));
    mostrarInventario();

    document.getElementById("nombre").value = "";
    document.getElementById("cantidad").value = "";
    document.getElementById("precio").value = "";
}

// =====================
// Eliminar producto
// =====================
function eliminarProducto(index) {
    inventario.splice(index, 1);
    localStorage.setItem("inventario", JSON.stringify(inventario));
    mostrarInventario();
}

// Inicializar tabla al cargar la página
mostrarInventario();

