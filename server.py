from flask import Flask, request, send_file, jsonify
from flask_cors import CORS 
from graficos_datos import generar_excel

app = Flask(__name__)
CORS(app)

# Ruta de prueba para comprobar que el servidor corre
@app.route('/')
def index():
    return "Servidor funcionando!"

@app.route('/exportar_excel', methods=['POST'])
def exportar_excel():
    datos = request.json.get('datos', [])
    if not datos:
        return jsonify({"error": "No se recibieron datos"}), 400

    archivo_excel = generar_excel(datos)
    return send_file(
        archivo_excel,
        download_name="resultados_colision.xlsx",
        as_attachment=True,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

if __name__ == "__main__":
    app.run(debug=True)
