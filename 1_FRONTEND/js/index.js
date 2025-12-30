import { get,post  } from "./api.js";

if (localStorage.getItem("rol") !== "directiva") {
    window.location.href = "login.html";
}

// 🚪 Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
});


document.addEventListener("DOMContentLoaded", async () => {
    try {
        const data = await get("total");
        console.log("RESPUESTA API:", data);

        document.getElementById("total-comuneros").textContent = data.total;
    } catch (error) {
        console.error("Error cargando total:", error);
    }
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
        nombres: document.getElementById("nombres").value,
        apellidos: document.getElementById("apellidos").value,
        dni: document.getElementById("dni").value
    };

    try {
        const result = await post("", data); // endpoint vacío = "/api/comuneros/"

        if (result.mensaje) {
            alert(result.mensaje);
            document.getElementById("modal-agregar-comunero").style.display = "none";
            // Aquí puedes refrescar el total de comuneros usando tu función get
        } else if (result.error) {
            alert(result.error);
        }
    } catch (err) {
        console.error(err);
        alert("Error al conectar con el servidor");
    }
});



