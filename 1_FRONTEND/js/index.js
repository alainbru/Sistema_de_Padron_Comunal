import { get,post  } from "./api.js";

if (localStorage.getItem("rol") !== "directiva") {
    window.location.href = "login.html";
}

// 🚪 Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});


async function refreshTotal() {
    try {
        const data = await get("total");
        document.getElementById("total-comuneros").textContent = data.total;
    } catch (error) {
        console.error("Error cargando total:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await refreshTotal();
});





// Botón para ir a la lista de comuneros
document.getElementById("btn-ver-comuneros").addEventListener("click", () => {
    window.location.href = "comuneros.html";
});
// Abrir modal
document.getElementById("btn-agregar-comunero").addEventListener("click", () => {
    document.getElementById("modal-agregar-comunero").style.display = "block";
});
// Cerrar modal
document.getElementById("btn-cerrar-modal").addEventListener("click", () => {
    document.getElementById("modal-agregar-comunero").style.display = "none";
});
// Guardar comunero
document.getElementById("btn-guardar-comunero").addEventListener("click", async () => {
    const data = {
        nombres: document.getElementById("nombres").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        dni: document.getElementById("dni").value.trim(),
        directorio: document.getElementById("directorio").value.trim(),
        fecha_nacimiento: document.getElementById("fecha_nacimiento").value || null,
        n_hijos: document.getElementById("n_hijos").value ? Number(document.getElementById("n_hijos").value) : null,
        estado: document.getElementById("estado").value || "ACTIVO",
        extension_terreno: document.getElementById("extension_terreno").value ? Number(document.getElementById("extension_terreno").value) : null,
        estado_civil: document.getElementById("estado_civil").value || "",
        cantidad_ganados: document.getElementById("cantidad_ganados").value ? Number(document.getElementById("cantidad_ganados").value) : null,
        observaciones: document.getElementById("observaciones").value.trim()
    };

    // Validación mínima
    if (!data.nombres || !data.apellidos || !data.dni) {
        alert('Complete los campos obligatorios: nombres, apellidos, dni.');
        return;
    }

    try {
        const result = await post("", data); // endpoint vacío = "/api/comuneros/"

        if (result.mensaje) {
            alert(result.mensaje);
            document.getElementById("modal-agregar-comunero").style.display = "none";
            const form = document.getElementById("modal-agregar-comunero-form");
            if (form) form.reset();
            await refreshTotal();
        } else if (result.error) {
            alert(result.error);
        }
    } catch (err) {
        console.error(err);
        alert("Error al conectar con el servidor");
    }
});



