import { get as getDirectiva, post as postDirectiva } from "./api/directivaApi.js";
import { get as getComuneros } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('rol') !== 'directiva') {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logout1');
    if (logoutBtn) logoutBtn.addEventListener('click', () => window.location.href = 'index.html');

    document.getElementById('form-directiva').addEventListener('submit', crearDirectiva);

    cargarComuneros();
    cargarDirectiva();
});

async function cargarComuneros() {
    try {
        const comuneros = await getComuneros('');
        const sel = document.getElementById('id_comunero');
        sel.innerHTML = '<option value="">-- Seleccione comunero --</option>';
        comuneros.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id_comunero;
            opt.textContent = `${c.nombres} ${c.apellidos} (DNI: ${c.dni})`;
            sel.appendChild(opt);
        });
    } catch (err) {
        console.error('Error cargando comuneros', err);
        alert('No se pudieron cargar comuneros');
    }
}

async function crearDirectiva(e) {
    e.preventDefault();
    const cargo = document.getElementById('cargo').value.trim();
    const id_comunero = document.getElementById('id_comunero').value;
    const fecha_inicio = document.getElementById('fecha_inicio').value;
    const fecha_fin = document.getElementById('fecha_fin').value || null;
    const estado = document.getElementById('estado').value || 'ACTIVO';

    if (!cargo || !id_comunero || !fecha_inicio) { alert('Complete los campos obligatorios'); return; }

    try {
        const res = await postDirectiva('', { cargo, id_comunero, fecha_inicio, fecha_fin, estado });
        if (res.error) { alert(res.error); return; }
        alert(res.message || 'Directiva agregada');
        document.getElementById('form-directiva').reset();
        cargarDirectiva();
    } catch (err) {
        console.error('Error creando directiva', err);
        alert('Error al crear directiva');
    }
}

async function cargarDirectiva() {
    try {
        const lista = await getDirectiva('');
        const tbody = document.querySelector('#tabla-directiva tbody');
        tbody.innerHTML = '';
        if (!Array.isArray(lista) || lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay miembros en la directiva.</td></tr>';
            return;
        }

        lista.forEach(d => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${d.id_directiva}</td>
                <td>${d.cargo}</td>
                <td>${d.nombre_comunero} ${d.apellido_comunero}</td>
                <td>${d.fecha_inicio || '-'}</td>
                <td>${d.fecha_fin || '-'}</td>
                <td>${d.estado}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error cargando directiva', err);
        alert('Error al obtener directiva');
    }
}
