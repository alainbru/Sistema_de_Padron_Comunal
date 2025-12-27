from flask import Blueprint, request, jsonify
from db.conexion import get_connection

comuneros_bp = Blueprint("comuneros", __name__)

@comuneros_bp.route("/", methods=["POST"])
def crear_comunero():
    try:
        data = request.get_json(force=True)

        if not data.get("nombres") or not data.get("apellidos") or not data.get("dni"):
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        con = get_connection()
        cur = con.cursor()

        # 🔎 verificar DNI duplicado
        cur.execute("SELECT COUNT(*) FROM COMUNEROS WHERE DNI = ?", (data["dni"],))
        if cur.fetchone()[0] > 0:
            cur.close()
            con.close()
            return jsonify({"error": "El DNI ya está registrado"}), 409

        cur.execute("""
            INSERT INTO COMUNEROS (NOMBRES, APELLIDOS, DNI)
            VALUES (?, ?, ?)
        """, (
            data["nombres"],
            data["apellidos"],
            data["dni"]
        ))

        con.commit()
        cur.close()
        con.close()

        return jsonify({"mensaje": "Comunero creado correctamente"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

