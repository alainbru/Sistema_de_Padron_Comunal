from db.conexion import get_connection

try:
    con = get_connection()
    print("✅ Conectado correctamente a COMUNIDAD.FDB")
    con.close()
except Exception as e:
    print("❌ Error:", e)
