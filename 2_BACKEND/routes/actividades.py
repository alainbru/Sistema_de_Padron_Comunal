from flask import Blueprint, request, jsonify
from db.conexion import get_connection
import fdb

actividades_bp = Blueprint("actividades", __name__)


#*****LISTAR ACTIVIDADES*****#
@actividades_bp.route("/", methods=["GET"])
def listar_actividades():
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute("""
            SELECT ID_ACTIVIDAD, NOMBRE_ACTIVIDAD, FECHA, LUGAR, DESCRIPCION
            FROM ACTIVIDADES
        """)
        rows = cur.fetchall()
        actividades = [
            {
                "id_actividad": r[0],
                "nombre_actividad": r[1],
                "fecha": str(r[2]),
                "lugar": r[3],
                "descripcion": r[4]
            } for r in rows
        ]
        cur.close()
        con.close()
        return jsonify(actividades)
    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500


#*****CREAR ACTIVIDAD*****#
@actividades_bp.route("/", methods=["POST"])
def crear_actividad():
    data = request.get_json(force=True)
    con = get_connection()
    cur = con.cursor()
    try:
        cur.execute("""
            INSERT INTO ACTIVIDADES (NOMBRE_ACTIVIDAD, FECHA, LUGAR, DESCRIPCION)
            VALUES (?, ?, ?, ?)
        """, (
            data["nombre_actividad"],
            data["fecha"],
            data["lugar"],
            data.get("descripcion")
        ))
        con.commit()
        return jsonify({"mensaje": "Actividad registrada correctamente"}), 201
    finally:
        cur.close()
        con.close()


#****************ACTUALIZAR ACTIVIDAD*********************#
@actividades_bp.route("/<int:id_actividad>", methods=["PUT"])
def actualizar_actividad(id_actividad):
    data = request.get_json(force=True)

    campos_actualizables = {
        "nombre_actividad": data.get("nombre_actividad"),
        "fecha": data.get("fecha"),
        "lugar": data.get("lugar"),
        "descripcion": data.get("descripcion")
    }

    # Filtrar solo los campos que vienen en la petición
    campos_a_actualizar = {k: v for k, v in campos_actualizables.items() if v is not None}

    if not campos_a_actualizar:
        return jsonify({"error": "No se proporcionaron campos para actualizar"}), 400

    # Construir dinámicamente la consulta SQL
    set_clause = ", ".join(f"{campo.upper()} = ?" for campo in campos_a_actualizar.keys())
    valores = list(campos_a_actualizar.values())
    valores.append(id_actividad)  # Para el WHERE

    con = get_connection()
    cur = con.cursor()
    try:
        cur.execute(f"""
            UPDATE ACTIVIDADES
            SET {set_clause}
            WHERE ID_ACTIVIDAD = ?
        """, valores)

        if cur.rowcount == 0:
            return jsonify({"error": "Actividad no encontrada"}), 404

        con.commit()
        return jsonify({"mensaje": "Actividad actualizada correctamente"}), 200
    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


#****************ELIMINAR ACTIVIDAD*********************#
@actividades_bp.route("/<int:id_actividad>", methods=["DELETE"])
def eliminar_actividad(id_actividad):
    con = get_connection()
    cur = con.cursor()
    try:
        cur.execute("DELETE FROM ACTIVIDADES WHERE ID_ACTIVIDAD = ?", (id_actividad,))
        if cur.rowcount == 0:
            return jsonify({"error": "Actividad no encontrada"}), 404

        con.commit()
        return jsonify({"mensaje": "Actividad eliminada correctamente"}), 200
    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()
