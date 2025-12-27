from flask import Flask
from routes.comuneros import comuneros_bp
from routes.actividades import actividades_bp

app = Flask(__name__)

app.register_blueprint(comuneros_bp, url_prefix="/api/comuneros")
app.register_blueprint(actividades_bp, url_prefix="/api/actividades")
app.register_blueprint(asistencia_bp, url_prefix="/api/asistencia")

if __name__ == "__main__":
    app.run(debug=True)

