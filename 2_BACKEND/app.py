from flask import Flask
from routes.comuneros import comuneros_bp

app = Flask(__name__)

app.register_blueprint(comuneros_bp, url_prefix="/api/comuneros")

if __name__ == "__main__":
    app.run(debug=True)
