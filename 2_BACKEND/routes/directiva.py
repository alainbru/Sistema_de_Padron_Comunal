from flask import Blueprint, request, jsonify
from db.conexion import get_connection
import fdb

directiva_bp = Blueprint("directiva", __name__)

###### Crear una nueva directiva###########
@directiva_bp.route("/", methods=["POST"])
def crear_directiva():
    data = request.get_json(force=True)
    cargo = data.get("cargo")
    id_comunero = data.get("id_comunero")
    fecha_inicio = data.get("fecha_inicio")
    fecha_fin = data.get("fecha_fin")  
    estado = data.get("estado", "ACTIVO")  # por defecto 'ACTIVO'

    if not cargo or not id_comunero or not fecha_inicio:
        return jsonify({"error": "Debe proporcionar cargo, ID de comunero y fecha de inicio"}), 400

    try:
        con = get_connection()
        cur = con.cursor()

        # Opcional: validar que no haya otro comunero activo con el mismo cargo
        if estado.upper() == "ACTIVO":
            cur.execute("""
                SELECT COUNT(*) FROM DIRECTIVA
                WHERE CARGO = ? AND ESTADO = 'ACTIVO'
            """, (cargo,))
            if cur.fetchone()[0] > 0:
                return jsonify({"error": "Ya existe un comunero activo con este cargo"}), 400

        cur.execute(
            "INSERT INTO DIRECTIVA (CARGO, ID_COMUNERO, FECHA_INICIO, FECHA_FIN, ESTADO) VALUES (?, ?, ?, ?, ?)",
            (cargo, id_comunero, fecha_inicio, fecha_fin, estado.upper())
        )
        con.commit()
        return jsonify({"message": "Directiva creada correctamente"}), 201
    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


###### Ver la directiva###########
@directiva_bp.route("/", methods=["GET"])
def listar_directiva():
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute("""
            SELECT d.ID_DIRECTIVA, d.CARGO, d.ID_COMUNERO, c.NOMBRES, c.APELLIDOS,
                   d.FECHA_INICIO, d.FECHA_FIN, d.ESTADO
            FROM DIRECTIVA d
            JOIN COMUNEROS c ON d.ID_COMUNERO = c.ID_COMUNEROS
        """)
        filas = cur.fetchall()
        resultado = [
            {
                "id_directiva": fila[0],
                "cargo": fila[1],
                "id_comunero": fila[2],
                "nombre_comunero": fila[3],
                "apellido_comunero": fila[4],
                "fecha_inicio": str(fila[5]),
                "fecha_fin": str(fila[6]) if fila[6] else None,
                "estado": fila[7]
            } for fila in filas
        ]
        return jsonify(resultado)
    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()
