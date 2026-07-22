#!/usr/bin/env python3
"""
server.py
Simple Flask server to generate and serve psychosocial reports as PDFs
"""

from flask import Flask, request, send_file, jsonify, send_from_directory
from flask_cors import CORS
import json
import io
import sys
import os
import tempfile
import smtplib
import mimetypes
from email.message import EmailMessage

# Add current directory to path to import gerar_relatorio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_relatorio_psicossocial import gerar_relatorio

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
mimetypes.add_type("text/javascript", ".jsx")

app = Flask(__name__, static_folder=None)
CORS(app)

def load_env_file():
    """Load local .env values without requiring an extra dependency."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8-sig") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

load_env_file()

@app.route('/', methods=['GET'])
def serve_index():
    """Serve the React frontend when Flask is used as the web entrypoint."""
    return send_from_directory(BASE_DIR, "index.html")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Servidor de relatórios psicossociais está ativo"}), 200

@app.route('/api/send-email', methods=['POST'])
def send_email_api():
    """Send transactional test e-mails through the configured SMTP account."""
    try:
        data = request.get_json() or {}
        to_email = (data.get("to") or "").strip()
        subject = (data.get("subject") or "").strip()
        html = data.get("html") or ""
        text = data.get("text") or ""
        reply_to = (data.get("replyTo") or "").strip()

        if not to_email or not subject or not (html or text):
            return jsonify({"error": "Campos obrigatorios: to, subject e html/text"}), 400

        host = os.environ.get("MAIL_HOST")
        port = int(os.environ.get("MAIL_PORT", "587"))
        username = os.environ.get("MAIL_USERNAME")
        password = os.environ.get("MAIL_PASSWORD")
        from_name = os.environ.get("MAIL_FROM_NAME", "Menctor")

        if not host or not username or not password:
            return jsonify({"error": "SMTP nao configurado. Verifique MAIL_HOST, MAIL_USERNAME e MAIL_PASSWORD."}), 500

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = f"{from_name} <{username}>"
        msg["To"] = to_email
        if reply_to:
            msg["Reply-To"] = reply_to
        msg.set_content(text or "Este e-mail possui uma versao HTML.")
        if html:
            msg.add_alternative(html, subtype="html")

        with smtplib.SMTP(host, port, timeout=20) as smtp:
            smtp.starttls()
            smtp.login(username, password)
            smtp.send_message(msg)

        return jsonify({"ok": True, "to": to_email, "subject": subject}), 200
    except Exception as e:
        print(f"Erro ao enviar e-mail: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erro ao enviar e-mail: {str(e)}"}), 500

@app.route('/api/gerar-relatorio', methods=['POST'])
def gerar_relatorio_api():
    """
    Gera e retorna um relatório psicossocial em PDF
    
    Espera JSON com a seguinte estrutura:
    {
      "empresa": "Nome da Empresa",
      "cnpj": "XX.XXX.XXX/0001-XX",
      "endereco": "Endereço",
      "data_avaliacao": "DD/MM/YYYY",
      "respondentes": 100,
      "total_colaboradores": 120,
      "taxa_adesao": "83.3%",
      "periodo": "Janeiro a Março - 2026",
      "aplicacao": "10/03/2026 a 28/03/2026",
      "foco": "Toda a organização",
      "responsavel": "Nome do Responsável",
      "rt_nome": "Nome do Psicólogo",
      "rt_registro": "CRP-XX/XXXXX",
      "rt_especialidade": "Especialidade",
      "rt_contato": "Telefone",
      "dimensoes": [
        {"nome": "Carga de trabalho", "score": 3.12},
        ...
      ]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Nenhum dado foi enviado"}), 400
        
        # Validação básica
        required_fields = ["empresa", "respondentes", "total_colaboradores", "dimensoes"]
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                "error": f"Campos obrigatórios faltando: {', '.join(missing)}"
            }), 400
        
        # Preparar configuração para o gerador
        config = {
            "codigo": data.get("codigo", "PCL-Q2"),
            "titulo_linha1": data.get("titulo_linha1", "Pesquisa de Clima Organizacional —"),
            "titulo_linha2": data.get("titulo_linha2", "2° Trimestre/2026"),
            "descricao": data.get("descricao", 
                "Pesquisa trimestral combinando dimensões COPSOQ II com indicadores de clima e engajamento."),
            "periodo": data.get("periodo", "Abril a Junho - 2026"),
            "aplicacao": data.get("aplicacao", "15/04/2026 a 30/04/2026"),
            "responsavel": data.get("responsavel", "Comite de Pessoas & Cultura"),
            "respondentes": int(data.get("respondentes", 0)),
            "total_colaboradores": int(data.get("total_colaboradores", 0)),
            "taxa_adesao": data.get("taxa_adesao", "0%"),
            "foco": data.get("foco", "Toda a organização"),
            "emissao": data.get("emissao", "27 de maio de 2026"),
            "empresa": data.get("empresa", "Empresa"),
            "cnpj": data.get("cnpj", "XX.XXX.XXX/0001-XX"),
            "endereco": data.get("endereco", "—"),
            "data_avaliacao": data.get("data_avaliacao", "01/04/2026"),
            "rt_nome": data.get("rt_nome", "Caio Guedes"),
            "rt_registro": data.get("rt_registro", "CRP-06/12345"),
            "rt_especialidade": data.get("rt_especialidade", "Psicologia Organizacional"),
            "rt_contato": data.get("rt_contato", "(11) 99999-9999"),
            "output_filename": data.get("output_filename", "relatorio_psicossocial.pdf"),
            "dimensoes": data.get("dimensoes", []),
        }
        
        # Gerar PDF em arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name
        
        try:
            # Gerar relatório e salvar no arquivo temporário
            gerar_relatorio(config, output_path=tmp_path)
            
            # Ler o arquivo gerado
            with open(tmp_path, 'rb') as f:
                pdf_data = f.read()
            
            # Retornar o PDF
            return send_file(
                io.BytesIO(pdf_data),
                mimetype='application/pdf',
                as_attachment=True,
                download_name=config["output_filename"]
            )
        finally:
            # Limpar arquivo temporário
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except Exception as e:
        print(f"Erro ao gerar relatório: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Erro ao gerar relatório: {str(e)}"
        }), 500

@app.route('/api/teste', methods=['GET'])
def teste():
    """Endpoint de teste com dados padrão"""
    from gerar_relatorio_psicossocial import CONFIG
    
    try:
        # Usar configuração padrão
        config = CONFIG.copy()
        
        # Gerar PDF em arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp_path = tmp.name
        
        try:
            gerar_relatorio(config, output_path=tmp_path)
            
            # Ler o arquivo gerado
            with open(tmp_path, 'rb') as f:
                pdf_data = f.read()
            
            return send_file(
                io.BytesIO(pdf_data),
                mimetype='application/pdf',
                as_attachment=True,
                download_name="relatorio_teste.pdf"
            )
        finally:
            # Limpar arquivo temporário
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    
    except Exception as e:
        print(f"Erro ao gerar relatório de teste: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Erro ao gerar relatório: {str(e)}"
        }), 500

@app.route('/<path:path>', methods=['GET'])
def serve_frontend(path):
    """Serve static assets and fall back to index.html for frontend routes."""
    file_path = os.path.join(BASE_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(BASE_DIR, path)

    return send_from_directory(BASE_DIR, "index.html")

if __name__ == '__main__':
    print("Servidor de Relatórios Psicossociais iniciado!")
    print("   Acesse http://localhost:5000/health para verificar o status")
    print("   POST http://localhost:5000/api/gerar-relatorio para gerar um novo relatório")
    print("   GET http://localhost:5000/api/teste para gerar um relatório de teste")
    app.run(debug=True, port=5000, host='127.0.0.1')
