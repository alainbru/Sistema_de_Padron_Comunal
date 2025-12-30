import { get as getAsistencias, post as postAsistencia } from "./api/asistenciaApi.js";
import { get as getComuneros } from "./api.js"; // usa API_BASE de comuneros
import { get as getActividades } from "./api/actividadesApi.js";

let asistenciasCache = []; // cache local para permitir filtrado combinado

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("rol") !== "directiva") {
        window.location.href = "login.html";
        return;
    }

    const logoutBtn = document.getElementById('logout1');
    if (logoutBtn) logoutBtn.addEventListener('click', () => window.location.href = 'index.html');

    document.getElementById('form-asistencia').addEventListener('submit', crearAsistencia);
    document.getElementById('btn-aplicar-filtro').addEventListener('click', aplicarFiltro);
    document.getElementById('btn-limpiar-filtro').addEventListener('click', () => {
        document.getElementById('filtro_asistio').value = '';
        document.getElementById('id_actividad').value = '';
        renderTablaFromCache();
    });

    // cuando se seleccione una actividad, mostrar solo asistencias de esa actividad
    document.getElementById('id_actividad').addEventListener('change', () => {
        renderTablaFromCache();
    });

    cargarSelects();
    cargarAsistencias();
});

async function cargarSelects() {
    try {
        const [comuneros, actividades] = await Promise.all([getComuneros(''), getActividades('')]);

        const selCom = document.getElementById('id_comunero');
        comuneros.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id_comunero;
            opt.textContent = `${c.nombres} ${c.apellidos} (DNI: ${c.dni})`;
            selCom.appendChild(opt);
        });

        const selAct = document.getElementById('id_actividad');
        actividades.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id_actividad;
            opt.textContent = `${a.nombre_actividad} — ${a.fecha}`;
            selAct.appendChild(opt);
        });

    } catch (err) {
        console.error('Error cargando selects', err);
        alert('Error cargando comuneros/actividades');
    }
}

async function crearAsistencia(e) {
    e.preventDefault();
    const id_comunero = document.getElementById('id_comunero').value;
    const id_actividad = document.getElementById('id_actividad').value;
    const asistio = document.getElementById('asistio').value || 'NO';
    const observaciones = document.getElementById('observaciones').value.trim();

    if (!id_comunero || !id_actividad) { alert('Seleccione comunero y actividad'); return; }

    try {
        const res = await postAsistencia('', { id_comunero, id_actividad, asistio, observaciones });
        if (res.error) { alert(res.error); return; }
        alert(res.mensaje || 'Asistencia registrada');
        document.getElementById('form-asistencia').reset();
        cargarAsistencias();
    } catch (err) {
        console.error('Error creando asistencia', err);
        alert('Error al registrar asistencia');
    }
}

async function cargarAsistencias() {
    try {
        const asistencias = await getAsistencias(''); // devuelve ids
        asistenciasCache = Array.isArray(asistencias) ? asistencias : [];
        renderTablaFromCache();
    } catch (err) {
        console.error('Error cargando asistencias', err);
        alert('Error al cargar asistencias');
    }
}

// Renderizar aplicando filtros seleccionados (actividad y asistio)
function renderTablaFromCache() {
    const actId = document.getElementById('id_actividad').value;
    const filtroAsistio = document.getElementById('filtro_asistio').value;

    // construir mapas para mostrar nombres
    Promise.all([getComuneros(''), getActividades('')])
        .then(([comuneros, actividades]) => {
            const mapCom = new Map(comuneros.map(c => [c.id_comunero, `${c.nombres} ${c.apellidos}`]));
            const mapAct = new Map(actividades.map(a => [a.id_actividad, a.nombre_actividad]));

            let lista = asistenciasCache.slice();
            if (actId) lista = lista.filter(x => String(x.id_actividad) === String(actId));
            if (filtroAsistio) lista = lista.filter(x => String(x.asistio).toUpperCase() === String(filtroAsistio).toUpperCase());

            const tbody = document.querySelector('#tabla-asistencia tbody');
            tbody.innerHTML = '';
            if (!Array.isArray(lista) || lista.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5">No hay registros.</td></tr>`;
                return;
            }

            lista.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.id_asistencia}</td>
                    <td>${mapCom.get(r.id_comunero) || r.id_comunero}</td>
                    <td>${mapAct.get(r.id_actividad) || r.id_actividad}</td>
                    <td>${r.asistio}</td>
                    <td>${r.observaciones || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('Error cargando comuneros/actividades para render', err);
            alert('Error al renderizar asistencias');
        });
}

function aplicarFiltro() {
    // ahora aplicamos el filtro en el cliente usando la cache para combinar con el filtro por actividad
    renderTablaFromCache();
}