from http.server import BaseHTTPRequestHandler
import json
import os
import smtplib
from email.message import EmailMessage


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(200, {"ok": True})

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length else "{}"
            data = json.loads(raw or "{}")

            to_email = (data.get("to") or "").strip()
            subject = (data.get("subject") or "").strip()
            html = data.get("html") or ""
            text = data.get("text") or ""
            reply_to = (data.get("replyTo") or "").strip()

            if not to_email or not subject or not (html or text):
                self._send_json(400, {"error": "Campos obrigatorios: to, subject e html/text"})
                return

            host = os.environ.get("MAIL_HOST")
            port = int(os.environ.get("MAIL_PORT", "587"))
            username = os.environ.get("MAIL_USERNAME")
            password = os.environ.get("MAIL_PASSWORD")
            from_name = os.environ.get("MAIL_FROM_NAME", "Menctor")

            if not host or not username or not password:
                self._send_json(500, {"error": "SMTP nao configurado na Vercel."})
                return

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

            self._send_json(200, {"ok": True, "to": to_email, "subject": subject})
        except Exception as exc:
            self._send_json(500, {"error": f"Erro ao enviar e-mail: {exc}"})
