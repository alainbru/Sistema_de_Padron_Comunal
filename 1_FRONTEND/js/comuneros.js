import { get } from "./api.js";

// Validar rol
if (localStorage.getItem("rol") !== "directiva") {
    window.location.href = "login.html";
}

// 🚪 Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

