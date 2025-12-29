import { get } from "./api.js";

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
