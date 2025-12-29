from flask import Blueprint, request, jsonify
from db.conexion import get_connection
import fdb

comuneros_bp = Blueprint("comuneros", __name__)

#¨****************AGREGAR COMUNERO*********************#
@comuneros_bp.route("/", methods=["POST"])
def crear_comunero():
    data = request.get_json(force=True)

    # 🔒 Validar campos obligatorios
    if not data.get("nombres") or not data.get("apellidos") or not data.get("dni"):
        return jsonify({"error": "Nombres, apellidos y DNI son obligatorios"}), 400

    con = get_connection()
    cur = con.cursor()

    try:
        # 🧩 Insert completo
        cur.execute("""
            INSERT INTO COMUNEROS (
                NOMBRES, APELLIDOS, DNI, DIRECTORIO, FECHA_NACIMIENTO,
                N_HIJOS, ESTADO, EXTENSION_TERRENO, ESTADOS_CIVIL,
                CANTIDAD_GANADOS, OBSERVACIONES
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["nombres"],
            data["apellidos"],
            data["dni"],
            data.get("directorio"),
            data.get("fecha_nacimiento"),
            data.get("n_hijos"),
            data.get("estado", "ACTIVO"),
            data.get("extension_terreno"),
            data.get("estado_civil"),
            data.get("cantidad_ganados"),
            data.get("observaciones")
        ))

        con.commit()
        return jsonify({"mensaje": "Comunero registrado correctamente"}), 201

    except fdb.DatabaseError as e:
        if "violation of PRIMARY or UNIQUE KEY constraint" in str(e):
            return jsonify({"error": "El DNI ya está registrado"}), 409
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        con.close()



#¨****************VER TODOS LOS COMUNEROS*********************#

@comuneros_bp.route("/", methods=["GET"])
def listar_comuneros():
    try:
        con = get_connection()
        cur = con.cursor()

        cur.execute("""
            SELECT
                ID_COMUNEROS, NOMBRES, APELLIDOS, DNI, DIRECTORIO,
                FECHA_NACIMIENTO, N_HIJOS, FECHA_REGISTRO, ESTADO,
                EXTENSION_TERRENO, ESTADOS_CIVIL, CANTIDAD_GANADOS, OBSERVACIONES
            FROM COMUNEROS
        """)

        rows = cur.fetchall()
        comuneros = []

        for r in rows:
            comuneros.append({
                "id_comunero": r[0],
                "nombres": r[1],
                "apellidos": r[2],
                "dni": r[3],
                "directorio": r[4],
                "fecha_nacimiento": str(r[5]) if r[5] else None,
                "n_hijos": r[6],
                "fecha_registro": str(r[7]) if r[7] else None,
                "estado": r[8],
                "extension_terreno": float(r[9]) if r[9] else None,
                "estado_civil": r[10],
                "cantidad_ganados": r[11],
                "observaciones": r[12]
            })

        cur.close()
        con.close()
        return jsonify(comuneros)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


#¨****************BUSCAR COMUNERO*********************#
@comuneros_bp.route("/buscar", methods=["GET"])
def buscar_comunero():
    q = request.args.get("q", "").strip()  
    if not q:
        return jsonify({"error": "Debe proporcionar un nombre, apellido o DNI para buscar"}), 400

    try:
        con = get_connection()
        cur = con.cursor()

        # ------------------------------
        # σ: Selección (filtro)
        # π: Proyección (columnas que queremos devolver)
        # ------------------------------
        sql = """
            SELECT
                ID_COMUNEROS, NOMBRES, APELLIDOS, DNI, DIRECTORIO,
                FECHA_NACIMIENTO, N_HIJOS, FECHA_REGISTRO, ESTADO,
                EXTENSION_TERRENO, ESTADOS_CIVIL, CANTIDAD_GANADOS, OBSERVACIONES
            FROM COMUNEROS
            WHERE UPPER(NOMBRES) LIKE ?          -- σ: filtrar por nombre
               OR UPPER(APELLIDOS) LIKE ?       -- σ: filtrar por apellido
               OR DNI = ?                        -- σ: filtrar por DNI exacto
        """

        params = (f"%{q.upper()}%", f"%{q.upper()}%", q)
        cur.execute(sql, params)

        rows = cur.fetchall()

        # ------------------------------
        # π: proyectar las columnas en diccionario para devolver JSON
        # ------------------------------
        comuneros = [
            {
                "id_comunero": r[0],
                "nombres": r[1],
                "apellidos": r[2],
                "dni": r[3],
                "directorio": r[4],
                "fecha_nacimiento": str(r[5]) if r[5] else None,
                "n_hijos": r[6],
                "fecha_registro": str(r[7]) if r[7] else None,
                "estado": r[8],
                "extension_terreno": float(r[9]) if r[9] else None,
                "estado_civil": r[10],
                "cantidad_ganados": r[11],
                "observaciones": r[12]
            } 
            for r in rows
        ]

        cur.close()
        con.close()
        return jsonify(comuneros)

    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500


#****************ACTUALIZAR COMUNERO*********************#
@comuneros_bp.route("/<int:id_comunero>", methods=["PUT"])
def actualizar_comunero(id_comunero):
    data = request.get_json(force=True)

    # 🔒 Campos que se pueden actualizar (coinciden con la tabla)
    campos_actualizables = {
        "directorio": data.get("directorio"),
        "n_hijos": data.get("n_hijos"),
        "estados_civil": data.get("estados_civil"), 
        "cantidad_ganados": data.get("cantidad_ganados"),
        "extension_terreno": data.get("extension_terreno"),
        "observaciones": data.get("observaciones"),
        "estado": data.get("estado")  #  ACTIVO, RETIRADO, FALLECIDO
    }

    # Filtrar solo los campos que vienen en la petición
    campos_a_actualizar = {k: v for k, v in campos_actualizables.items() if v is not None}

    if not campos_a_actualizar:
        return jsonify({"error": "No se proporcionaron campos para actualizar"}), 400

    # Construir dinámicamente la consulta SQL
    set_clause = ", ".join(f"{campo.upper()} = ?" for campo in campos_a_actualizar.keys())
    valores = list(campos_a_actualizar.values())
    valores.append(id_comunero)  # Para el WHERE

    con = get_connection()
    cur = con.cursor()

    try:
        cur.execute(f"""
            UPDATE COMUNEROS
            SET {set_clause}
            WHERE ID_COMUNEROS = ?
        """, valores)

        if cur.rowcount == 0:
            return jsonify({"error": "Comunero no encontrado"}), 404

        con.commit()
        return jsonify({"mensaje": "Comunero actualizado correctamente"}), 200

    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        con.close()

#¨****************ELIMINAR COMUNERO*********************#
@comuneros_bp.route("/<int:id_comunero>", methods=["DELETE"])
def eliminar_comunero(id_comunero):
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute("DELETE FROM COMUNEROS WHERE ID_COMUNEROS = ?", (id_comunero,))
        if cur.rowcount == 0:
            return jsonify({"error": "Comunero no encontrado"}), 404
        con.commit()
        return jsonify({"mensaje": "Comunero eliminado correctamente"}), 200
    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


@comuneros_bp.route("/total", methods=["GET"])
def total_comuneros():
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) FROM COMUNEROS")
        total = cur.fetchone()[0]
        return jsonify({"total": total})
    except fdb.DatabaseError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()
