import { get, post } from "./api/actividadesApi.js";

document.addEventListener("DOMContentLoaded", () => {

    // Validar rol (igual que en otras páginas)
    if (localStorage.getItem("rol") !== "directiva") {
        window.location.href = "login.html";
        return;
    }

    const logoutBtn = document.getElementById("logout1");
    if (logoutBtn) logoutBtn.addEventListener("click", () => window.location.href = "index.html");

    document.getElementById("form-actividad").addEventListener("submit", crearActividad);

    mostrarActividades();
});

async function crearActividad(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre_actividad").value.trim();
    const fecha = document.getElementById("fecha").value;
    const lugar = document.getElementById("lugar").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    if (!nombre || !fecha || !lugar) {
        alert("Complete los campos obligatorios: Nombre, Fecha y Lugar.");
        return;
    }

    try {
        const res = await post("", {
            nombre_actividad: nombre,
            fecha: fecha,
            lugar: lugar,
            descripcion: descripcion
        });

        if (res.error) {
            alert(res.error);
            return;
        }

        alert(res.mensaje || "Actividad registrada correctamente");
        document.getElementById("form-actividad").reset();
        mostrarActividades();

    } catch (err) {
        console.error(err);
        alert("Error al crear actividad");
    }
}

function renderTabla(actividades) {
    const tbody = document.querySelector("#tabla-actividades tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(actividades) || actividades.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No hay actividades registradas.</td></tr>`;
        return;
    }

    actividades.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${a.id_actividad}</td>
            <td>${a.nombre_actividad}</td>
            <td>${a.fecha || "-"}</td>
            <td>${a.lugar || "-"}</td>
            <td>${a.descripcion || "-"}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function mostrarActividades() {
    try {
        const actividades = await get("");
        renderTabla(actividades);
    } catch (err) {
        console.error('Error al cargar actividades', err);
        alert('Error al cargar actividades');
    }
}
