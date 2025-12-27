import fdb

def get_connection():
    return fdb.connect(
        dsn="D:/SistemaPadronComunal/3_DATABASE/COMUNIDAD.FDB",
        user="ALAIN",
        password="alain1234",
        charset="UTF8"
    )
