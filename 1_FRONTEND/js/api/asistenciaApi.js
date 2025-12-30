const API_BASE = "http://127.0.0.1:5000/api/asistencia";

export async function get(endpoint = "") {
    const res = await fetch(`${API_BASE}/${endpoint}`);
    return await res.json();
}

export async function post(endpoint, data) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export async function filtrar(asistio) {
    const res = await fetch(`${API_BASE}/filtrar?asistio=${encodeURIComponent(asistio)}`);
    return await res.json();
}