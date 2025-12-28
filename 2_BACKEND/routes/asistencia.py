from flask import Blueprint, request, jsonify
from db.conexion import get_connection
import fdb

asistencia_bp = Blueprint("asistencia", __name__)

#¨****************AGREGAR ASISTENCIA*********************#
@asistencia_bp.route("/", methods=["POST"])
def agregar_asistencia():
    data = request.get_json(force=True)

    if not data.get("id_comunero") or not data.get("id_actividad"):
        return jsonify({"error": "ID de comunero y actividad son obligatorios"}), 400

    con = get_connection()
    cur = con.cursor()

    try:
        cur.execute("""
            INSERT INTO ASISTENCIA (
                ID_COMUNERO, ID_ACTIVIDAD, ASISTIO, OBSERVACIONES
            )
            VALUES (?, ?, ?, ?)
        """, (
            data["id_comunero"],
            data["id_actividad"],
            data.get("asistio", "NO"),
            data.get("observaciones")
        ))
        con.commit()
        return jsonify({"mensaje": "Asistencia registrada correctamente"}), 201

    except fdb.DatabaseError as e:
        if "violation of PRIMARY or UNIQUE KEY constraint" in str(e):
            return jsonify({"error": "Ya existe registro de asistencia para este comunero y actividad"}), 409
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        con.close()


#¨****************VER ASISTENCIAS*********************#
@asistencia_bp.route("/", methods=["GET"])
def listar_asistencia():
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute("""
            SELECT ID_ASISTENCIA, ID_COMUNERO, ID_ACTIVIDAD, ASISTIO, OBSERVACIONES
            FROM ASISTENCIA
        """)
        rows = cur.fetchall()
        lista = [
            {
                "id_asistencia": r[0],
                "id_comunero": r[1],
                "id_actividad": r[2],
                "asistio": r[3],
                "observaciones": r[4]
            }
            for r in rows
        ]
        cur.close()
        con.close()
        return jsonify(lista)

    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500

#¨****************LISTAR ASISTENTES*********************#
#¨****************FILTRAR ASISTENCIA POR SI/NO*********************#
@asistencia_bp.route("/filtrar", methods=["GET"])
def filtrar_asistencia():
    asistio_param = request.args.get("asistio", "").upper().strip()

    if asistio_param not in ("SI", "NO"):
        return jsonify({"error": "El parámetro 'asistio' debe ser 'SI' o 'NO'"}), 400

    try:
        con = get_connection()
        cur = con.cursor()

        cur.execute("""
            SELECT
                A.ID_ASISTENCIA,
                A.ID_COMUNERO,
                C.NOMBRES,
                C.APELLIDOS,
                A.ID_ACTIVIDAD,
                AC.NOMBRE_ACTIVIDAD,
                A.ASISTIO,
                A.OBSERVACIONES
            FROM ASISTENCIA A
            JOIN COMUNEROS C ON A.ID_COMUNERO = C.ID_COMUNEROS
            JOIN ACTIVIDADES AC ON A.ID_ACTIVIDAD = AC.ID_ACTIVIDAD
            WHERE A.ASISTIO = ?
        """, (asistio_param,))

        rows = cur.fetchall()
        lista = [
            {
                "id_asistencia": r[0],
                "id_comunero": r[1],
                "nombres": r[2],
                "apellidos": r[3],
                "id_actividad": r[4],
                "nombre_actividad": r[5],
                "asistio": r[6],
                "observaciones": r[7]
            }
            for r in rows
        ]

        cur.close()
        con.close()
        return jsonify(lista)

    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500
