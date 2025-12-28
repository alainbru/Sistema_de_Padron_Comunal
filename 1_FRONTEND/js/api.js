// api.js
const API_BASE = "http://127.0.0.1:5000/api/comuneros";

export async function get(endpoint = "") {
    const res = await fetch(`${API_BASE}/${endpoint}`); // endpoint vacío = /
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

export async function put(endpoint, data) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return await res.json();
}

export async function remove(endpoint) {
    const res = await fetch(`${API_BASE}/${endpoint}`, { method: "DELETE" });
    return await res.json();
}
