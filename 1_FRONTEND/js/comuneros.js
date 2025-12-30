import { get, buscar } from "./api.js";



document.addEventListener("DOMContentLoaded", () => {

    // Validar rol
    if (localStorage.getItem("rol") !== "directiva") {
        window.location.href = "login.html";
        return;
    }

    // 🚪 Cerrar sesión
    const logoutBtn = document.getElementById("logout1");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // 🔍 Buscar
    document.getElementById("btn-buscar").addEventListener("click", buscarComunero);

    // 🧹 Limpiar
    document.getElementById("btn-limpiar").addEventListener("click", limpiarBusqueda);

    // ⌨️ Enter para buscar
    document.getElementById("buscar-comunero").addEventListener("keyup", (e) => {
        if (e.key === "Enter") buscarComunero();
    });

    // Cargar datos al iniciar
    mostrarComuneros();
});

function renderTabla(comuneros) {
    const tbody = document.querySelector("#tabla-comuneros tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(comuneros) || comuneros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13">No hay resultados.</td></tr>`;
        return;
    }

    comuneros.forEach(c => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${c.id_comunero}</td>
            <td>${c.nombres}</td>
            <td>${c.apellidos}</td>
            <td>${c.dni}</td>
            <td>${c.directorio || "-"}</td>
            <td>${c.fecha_nacimiento || "-"}</td>
            <td>${c.n_hijos ?? 0}</td>
            <td>${c.fecha_registro || "-"}</td>
            <td>${c.estado}</td>
            <td>${c.extension_terreno ?? 0}</td>
            <td>${c.estado_civil || "-"}</td>
            <td>${c.cantidad_ganados ?? 0}</td>
            <td>${c.observaciones || "-"}</td>
        `;
        tbody.appendChild(fila);
    });
}

async function mostrarComuneros() {
    try {
        const comuneros = await get("");   // GET /api/comuneros
        renderTabla(comuneros);
    } catch (err) {
        console.error("Error al cargar comuneros:", err);
        alert("Error al cargar comuneros");
    }
}

async function buscarComunero() {
    const q = document.getElementById("buscar-comunero").value.trim();

    if (!q) {
        mostrarComuneros();
        return;
    }

    try {
        const resultado = await buscar(q);
        renderTabla(resultado);
    } catch (err) {
        console.error(err);
        alert("Error en la búsqueda");
    }
}

function limpiarBusqueda() {
    const input = document.getElementById("buscar-comunero");
    input.value = "";
    mostrarComuneros();
}
