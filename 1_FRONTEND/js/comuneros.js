import { get } from "./api.js";

// Validar rol
if (localStorage.getItem("rol") !== "directiva") {
    window.location.href = "login.html";
}

// 🚪 Cerrar sesión
document.getElementById("logout1").addEventListener("click", () => {
    window.location.href = "index.html";
});

// Función para mostrar comuneros en HTML
async function mostrarComuneros() {
    try {
        const comuneros = await get(); // Trae todos los comuneros
        const tbody = document.querySelector("#tabla-comuneros tbody");
        tbody.innerHTML = ""; // Limpiar antes de mostrar

        if (comuneros.length === 0) {
            tbody.innerHTML = `<tr><td colspan="13">No hay comuneros registrados.</td></tr>`;
            return;
        }

        // Llenar filas
        comuneros.forEach(c => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${c.id_comunero}</td>
                <td>${c.nombres}</td>
                <td>${c.apellidos}</td>
                <td>${c.dni}</td>
                <td>${c.directorio || "-"}</td>
                <td>${c.fecha_nacimiento || "-"}</td>
                <td>${c.n_hijos || 0}</td>
                <td>${c.fecha_registro || "-"}</td>
                <td>${c.estado}</td>
                <td>${c.extension_terreno || 0}</td>
                <td>${c.estado_civil || "-"}</td>
                <td>${c.cantidad_ganados || 0}</td>
                <td>${c.observaciones || "-"}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (err) {
        console.error(err);
        alert("Error al cargar comuneros");
    }
}

// Llamar a la función al cargar la página
window.addEventListener("load", mostrarComuneros);
