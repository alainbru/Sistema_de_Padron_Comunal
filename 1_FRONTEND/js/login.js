// Vista Directiva (admin)
document.getElementById("btnDirectiva").addEventListener("click", () => {
    localStorage.setItem("rol", "directiva");
    window.location.href = "index.html";
});

// Vista Comunero (para después)
document.getElementById("btnComunero").addEventListener("click", () => {
    localStorage.setItem("rol", "comunero");
    alert("Vista comunero pendiente");
});
