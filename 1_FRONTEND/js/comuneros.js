import { get, post, put, remove } from "./api.js";

export async function listarComuneros() {
    try {
        const comuneros = await get(""); // endpoint vacío = /
        const tabla = document.getElementById("tablaComuneros");
        tabla.innerHTML = "";

        comuneros.forEach(c => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${c.id_comunero}</td>
                <td>${c.nombres}</td>
                <td>${c.apellidos}</td>
                <td>${c.dni}</td>
                <td>${c.directorio || ""}</td>
                <td>${c.fecha_nacimiento || ""}</td>
                <td>${c.estado}</td>
            `;
            tabla.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al listar comuneros:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    listarComuneros();
});
