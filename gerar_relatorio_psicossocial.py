#!/usr/bin/env python3
"""
gerar_relatorio_psicossocial.py
Gerador de Relatório Psicossocial em PDF usando ReportLab.
"""

import subprocess
import sys

def _ensure_deps():
    for pkg, import_name in [("reportlab", "reportlab"), ("pypdf", "pypdf")]:
        try:
            __import__(import_name)
        except ImportError:
            print(f"Instalando {pkg}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

_ensure_deps()

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, KeepTogether, PageBreak, NextPageTemplate
)
from reportlab.platypus.flowables import Flowable

# ──────────────────────────────────────────────
# PARÂMETROS CUSTOMIZÁVEIS
# ──────────────────────────────────────────────
CONFIG = {
    "codigo": "PCL-Q1",
    "titulo_linha1": "Pesquisa de Clima Organizacional —",
    "titulo_linha2": "1° Trimestre/2026",
    "descricao": (
        "Pesquisa trimestral combinando dimensões COPSOQ II com indicadores de "
        "clima e engajamento."
    ),
    "periodo": "Janeiro a Marco - 2026",
    "aplicacao": "10/03/2026 a 28/03/2026",
    "responsavel": "Comite de Pessoas & Cultura",
    "respondentes": 312,
    "total_colaboradores": 340,
    "taxa_adesao": "91.8%",
    "foco": "Toda a organizacao",
    "emissao": "25 de maio de 2026",
    "empresa": "Loghaus Logistica",
    "cnpj": "12.345.678/0001-90",
    "endereco": "—",
    "data_avaliacao": "01/04/2026",
    "rt_nome": "Caio Guedes",
    "rt_registro": "CRP-06/12345",
    "rt_especialidade": "Psicologia Organizacional",
    "rt_contato": "(11) 99999-9999",
    "output_filename": "relatorio_psicossocial.pdf",
    "dimensoes": [
        {"nome": "Carga de Trabalho",        "score": 3.12},
        {"nome": "Burnout",                   "score": 2.95},
        {"nome": "Estresse",                  "score": 2.88},
        {"nome": "Conflito trabalho-familia", "score": 2.74},
        {"nome": "Ritmo de trabalho",         "score": 2.68},
        {"nome": "Reconhecimento",            "score": 2.51},
        {"nome": "Suporte social",            "score": 2.42},
        {"nome": "Qualidade da lideranca",    "score": 2.38},
        {"nome": "Justica e respeito",        "score": 2.20},
        {"nome": "Influencia no trabalho",    "score": 2.15},
        {"nome": "Comunidade social",         "score": 1.88},
        {"nome": "Significado do trabalho",   "score": 1.72},
    ],
}

# ──────────────────────────────────────────────
# CORES
# ──────────────────────────────────────────────
DARK_BLUE  = colors.HexColor("#1C2B4B")
ORANGE     = colors.HexColor("#E87722")
AMBER      = colors.HexColor("#F5A623")
GREEN      = colors.HexColor("#27AE60")
RED        = colors.HexColor("#E74C3C")
LIGHT_GRAY = colors.HexColor("#F5F6FA")
TEXT_BODY  = colors.HexColor("#2C3E50")
TEXT_MUTED = colors.HexColor("#7F8C8D")
WHITE      = colors.white
COVER_BOX  = colors.HexColor("#243460")

PAGE_W, PAGE_H = A4
MARGIN = 2.2 * cm

# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────

def nivel(score):
    if score >= 2.67:
        return "ALTO"
    if score >= 1.67:
        return "MODERADO"
    return "BAIXO"


def nivel_color(score):
    n = nivel(score)
    if n == "ALTO":
        return ORANGE
    if n == "MODERADO":
        return AMBER
    return GREEN


def get_styles():
    s = {}

    def add(name, **kw):
        s[name] = ParagraphStyle(name, **kw)

    add("body",      fontName="Helvetica",       fontSize=9,  leading=14, textColor=TEXT_BODY,  alignment=TA_JUSTIFY)
    add("body_l",    fontName="Helvetica",       fontSize=9,  leading=14, textColor=TEXT_BODY,  alignment=TA_LEFT)
    add("muted",     fontName="Helvetica",       fontSize=8,  leading=12, textColor=TEXT_MUTED)
    add("muted_r",   fontName="Helvetica",       fontSize=8,  leading=12, textColor=TEXT_MUTED, alignment=TA_RIGHT)
    add("bold9",     fontName="Helvetica-Bold",  fontSize=9,  leading=13, textColor=TEXT_BODY)
    add("bold10",    fontName="Helvetica-Bold",  fontSize=10, leading=14, textColor=TEXT_BODY)
    add("bold11",    fontName="Helvetica-Bold",  fontSize=11, leading=15, textColor=TEXT_BODY)
    add("section",   fontName="Helvetica-Bold",  fontSize=12, leading=16, textColor=DARK_BLUE,  spaceAfter=2)
    add("orange_hd", fontName="Helvetica-Bold",  fontSize=11, leading=15, textColor=ORANGE)
    add("italic_m",  fontName="Helvetica-Oblique", fontSize=8, leading=12, textColor=TEXT_MUTED)
    add("white_b",   fontName="Helvetica-Bold",  fontSize=9,  leading=13, textColor=WHITE)
    add("white_sm",  fontName="Helvetica",       fontSize=8,  leading=12, textColor=WHITE)
    return s


S = get_styles()
_TOTAL_PAGES = [13]  # mutable so inner callbacks can reference updated value
_SECTION_TITLES = {}  # page_number -> section title (filled at build time)

# ──────────────────────────────────────────────
# CUSTOM FLOWABLES
# ──────────────────────────────────────────────

class OrangeLine(Flowable):
    def __init__(self, width=None, thickness=2, space_before=2, space_after=6):
        super().__init__()
        self._w = width
        self.thickness = thickness
        self.space_before = space_before
        self.space_after = space_after

    def wrap(self, avW, avH):
        self.width = self._w or avW
        return self.width, self.thickness + self.space_before + self.space_after

    def draw(self):
        c = self.canv
        c.setStrokeColor(ORANGE)
        c.setLineWidth(self.thickness)
        c.line(0, self.space_after, self.width, self.space_after)


class OrangeUnderlineTitle(Flowable):
    def __init__(self, text, width=None):
        super().__init__()
        self._text = text
        self._w = width

    def wrap(self, avW, avH):
        self.width = self._w or avW
        return self.width, 22

    def draw(self):
        c = self.canv
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(ORANGE)
        c.drawString(0, 10, self._text)
        c.setStrokeColor(ORANGE)
        c.setLineWidth(1)
        c.line(0, 8, self.width, 8)


class BarChart(Flowable):
    def __init__(self, nome, score, max_score=4, bar_h=18, width=None):
        super().__init__()
        self.nome = nome
        self.score = score
        self.max_score = max_score
        self.bar_h = bar_h
        self._w = width
        self.row_h = bar_h + 28

    def wrap(self, avW, avH):
        self.width = self._w or avW
        return self.width, self.row_h

    def draw(self):
        c = self.canv
        nc = nivel_color(self.score)
        n  = nivel(self.score)

        label_w = 180
        bar_x   = label_w
        bar_w   = self.width - label_w
        bar_y   = self.row_h - self.bar_h - 8

        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(TEXT_BODY)
        c.drawString(0, bar_y + self.bar_h + 4, self.nome)

        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(nc)
        c.drawRightString(self.width, bar_y + self.bar_h + 4, n)

        # Background
        c.setFillColor(LIGHT_GRAY)
        c.rect(bar_x, bar_y, bar_w, self.bar_h, fill=1, stroke=0)

        # Fill
        fill_w = (self.score / self.max_score) * bar_w
        c.setFillColor(nc)
        c.rect(bar_x, bar_y, fill_w, self.bar_h, fill=1, stroke=0)

        # Score label
        score_str = f"{self.score:.2f}"
        c.setFont("Helvetica-Bold", 8)
        if fill_w > 32:
            c.setFillColor(WHITE)
            c.drawRightString(bar_x + fill_w - 3, bar_y + 5, score_str)
        else:
            c.setFillColor(TEXT_BODY)
            c.drawString(bar_x + fill_w + 3, bar_y + 5, score_str)


class KPIBox(Flowable):
    def __init__(self, label, value, sub, value_color=None, sub_color=None, width=None, height=72):
        super().__init__()
        self._label = label
        self._value = value
        self._sub   = sub
        self._vc    = value_color or DARK_BLUE
        self._sc    = sub_color or TEXT_MUTED
        self._w     = width
        self._h     = height

    def wrap(self, avW, avH):
        self.width = self._w or avW
        return self.width, self._h

    def draw(self):
        c = self.canv
        c.setFillColor(LIGHT_GRAY)
        c.roundRect(0, 0, self.width, self._h, 6, fill=1, stroke=0)
        c.setFillColor(ORANGE)
        c.rect(0, self._h - 3, self.width, 3, fill=1, stroke=0)
        c.setFont("Helvetica", 7)
        c.setFillColor(TEXT_MUTED)
        c.drawCentredString(self.width / 2, self._h - 18, self._label)
        c.setFont("Helvetica-Bold", 20)
        c.setFillColor(self._vc)
        c.drawCentredString(self.width / 2, self._h - 42, self._value)
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(self._sc)
        c.drawCentredString(self.width / 2, self._h - 57, self._sub)


class DimensionCard(Flowable):
    def __init__(self, nome, score, texto, width=None):
        super().__init__()
        self.nome  = nome
        self.score = score
        self.texto = texto
        self._w    = width

    def wrap(self, avW, avH):
        self.width = self._w or avW
        # approximate height
        chars_per_line = max(1, int((self.width - 20) / 5.5))
        lines = max(1, len(self.texto) // chars_per_line + 1)
        self.height = 36 + lines * 13
        return self.width, self.height

    def draw(self):
        c = self.canv
        h = self.height
        c.setFillColor(LIGHT_GRAY)
        c.rect(0, 0, self.width, h, fill=1, stroke=0)
        c.setFillColor(ORANGE)
        c.rect(0, 0, 4, h, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(ORANGE)
        c.drawString(12, h - 18, f"{self.nome}  •  {self.score:.2f}/4")
        c.setFont("Helvetica", 8.5)
        c.setFillColor(TEXT_MUTED)
        words = self.texto.split()
        line  = ""
        y     = h - 34
        max_w = self.width - 20
        for word in words:
            test = (line + " " + word).strip()
            if c.stringWidth(test, "Helvetica", 8.5) <= max_w:
                line = test
            else:
                c.drawString(12, y, line)
                y   -= 13
                line = word
        if line:
            c.drawString(12, y, line)


class ActionCard(Flowable):
    def __init__(self, nome, score, acoes, prazo, impacto, width=None):
        super().__init__()
        self.nome   = nome
        self.score  = score
        self.acoes  = acoes
        self.prazo  = prazo
        self.impacto= impacto
        self._w     = width

    def wrap(self, avW, avH):
        self.width  = self._w or avW
        self.height = 30 + len(self.acoes) * 16 + 40
        return self.width, self.height

    def draw(self):
        c = self.canv
        h = self.height
        c.setFillColor(DARK_BLUE)
        c.rect(0, h - 26, self.width, 26, fill=1, stroke=0)
        spaced = "  ".join(self.nome.upper())
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(WHITE)
        c.drawString(8, h - 18, f"{spaced}  —  Plano de Acao")
        c.drawRightString(self.width - 8, h - 18, f"{self.score:.2f}/4")
        c.setFillColor(LIGHT_GRAY)
        c.rect(0, 0, self.width, h - 26, fill=1, stroke=0)
        y = h - 44
        for a in self.acoes:
            c.setFillColor(ORANGE)
            c.circle(10, y + 4, 3, fill=1, stroke=0)
            c.setFont("Helvetica", 8.5)
            c.setFillColor(TEXT_BODY)
            c.drawString(20, y, a)
            y -= 16
        c.setFont("Helvetica", 8)
        c.setFillColor(TEXT_MUTED)
        c.drawString(8, 18, f"PRAZO SUGERIDO: {self.prazo}")
        c.drawString(8, 6,  f"IMPACTO ESPERADO: {self.impacto}")


class OrangeBullet(Flowable):
    def __init__(self, texto, width=None):
        super().__init__()
        self.texto = texto
        self._w    = width
        self.h     = 16

    def wrap(self, avW, avH):
        self.width = self._w or avW
        return self.width, self.h

    def draw(self):
        c = self.canv
        c.setFillColor(ORANGE)
        c.circle(6, 6, 4, fill=1, stroke=0)
        c.setFont("Helvetica", 9)
        c.setFillColor(TEXT_BODY)
        c.drawString(16, 3, self.texto)


class TickItem(Flowable):
    def __init__(self, texto, symbol="v", width=None):
        super().__init__()
        self.texto  = texto
        self.symbol = symbol
        self._w     = width
        self.h      = 14

    def wrap(self, avW, avH):
        self.width = self._w or avW
        return self.width, self.h

    def draw(self):
        c = self.canv
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(ORANGE)
        c.drawString(0, 2, self.symbol)
        c.setFont("Helvetica", 9)
        c.setFillColor(TEXT_BODY)
        c.drawString(14, 2, self.texto)


class ClassifBox(Flowable):
    def __init__(self, width=None):
        super().__init__()
        self._w = width
        self.h  = 62

    def wrap(self, avW, avH):
        self.width = self._w or avW
        return self.width, self.h

    def draw(self):
        c = self.canv
        c.setFillColor(ORANGE)
        c.roundRect(0, 0, self.width, self.h, 8, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(WHITE)
        c.drawCentredString(self.width / 2, 34, "MODERADO — 2.25 / 4")
        c.setFont("Helvetica", 10)
        c.drawCentredString(self.width / 2, 16, "Zona de atencao. Implementar acoes preventivas.")


class DomainCard(Flowable):
    def __init__(self, titulo, bullets, width=None):
        super().__init__()
        self.titulo  = titulo
        self.bullets = bullets
        self._w      = width

    def wrap(self, avW, avH):
        self.width  = self._w or avW
        self.height = 30 + len(self.bullets) * 15 + 8
        return self.width, self.height

    def draw(self):
        c = self.canv
        h = self.height
        c.setFillColor(DARK_BLUE)
        c.rect(0, h - 25, self.width, 25, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(WHITE)
        c.drawString(8, h - 17, self.titulo)
        c.setFillColor(LIGHT_GRAY)
        c.rect(0, 0, self.width, h - 25, fill=1, stroke=0)
        y = h - 40
        for b in self.bullets:
            c.setFillColor(ORANGE)
            c.circle(10, y + 4, 3, fill=1, stroke=0)
            c.setFont("Helvetica", 8.5)
            c.setFillColor(TEXT_BODY)
            c.drawString(20, y, b)
            y -= 15


# ──────────────────────────────────────────────
# PAGE CALLBACKS
# ──────────────────────────────────────────────

def _cover_cb(cfg):
    def fn(canv, doc):
        W, H = PAGE_W, PAGE_H
        m = MARGIN
        canv.setFillColor(DARK_BLUE)
        canv.rect(0, 0, W, H, fill=1, stroke=0)

        # Brand
        canv.setFont("Helvetica-Bold", 13)
        canv.setFillColor(WHITE)
        canv.drawString(m, H - m - 4, "PSICOSSOCIAL ANALYTICS")
        canv.setStrokeColor(ORANGE)
        canv.setLineWidth(4)
        canv.line(m, H - m - 14, m + 200, H - m - 14)
        canv.setFont("Helvetica", 9)
        canv.setFillColor(WHITE)
        canv.drawString(m, H - m - 30, "Relatorio Executivo")

        # Middle
        mid_y = H * 0.52
        canv.setFont("Helvetica-Bold", 14)
        canv.setFillColor(ORANGE)
        canv.drawString(m, mid_y + 70, cfg["codigo"])
        canv.setFont("Helvetica-Bold", 22)
        canv.setFillColor(WHITE)
        canv.drawString(m, mid_y + 38, cfg["titulo_linha1"])
        canv.drawString(m, mid_y + 12, cfg["titulo_linha2"])
        canv.setFont("Helvetica", 10)
        canv.setFillColor(WHITE)
        canv.drawString(m, mid_y - 12, cfg["descricao"])

        # Metadata box
        box_y = mid_y - 110
        box_h = 82
        canv.setFillColor(COVER_BOX)
        canv.roundRect(m, box_y, W - 2*m, box_h, 6, fill=1, stroke=0)

        col1_x = m + 16
        col2_x = m + (W - 2*m) / 2 + 8
        labels_c1 = ["PERIODO", "APLICACAO", "RESPONSAVEL"]
        vals_c1   = [cfg["periodo"], cfg["aplicacao"], cfg["responsavel"]]
        labels_c2 = ["RESPONDENTES", "TAXA DE ADESAO", "FOCO"]
        vals_c2   = [
            f"{cfg['respondentes']} de {cfg['total_colaboradores']}",
            cfg["taxa_adesao"],
            cfg["foco"],
        ]
        row_h_box = (box_h - 16) / 3
        for i in range(3):
            ry = box_y + box_h - 14 - i * row_h_box
            canv.setFont("Helvetica-Bold", 7)
            canv.setFillColor(TEXT_MUTED)
            canv.drawString(col1_x, ry,      labels_c1[i])
            canv.setFont("Helvetica", 8.5)
            canv.setFillColor(WHITE)
            canv.drawString(col1_x, ry - 11, vals_c1[i])
            canv.setFont("Helvetica-Bold", 7)
            canv.setFillColor(TEXT_MUTED)
            canv.drawString(col2_x, ry,      labels_c2[i])
            canv.setFont("Helvetica", 8.5)
            canv.setFillColor(WHITE)
            canv.drawString(col2_x, ry - 11, vals_c2[i])

        # Footer
        canv.setFillColor(ORANGE)
        canv.rect(0, 0, W, 28, fill=1, stroke=0)
        canv.setFont("Helvetica", 8)
        canv.setFillColor(WHITE)
        canv.drawString(m, 10, f"Emitido em {cfg['emissao']}")
        canv.drawRightString(W - m, 10, "Confidencial — Uso Interno")

    return fn


def _inner_cb(cfg, section_map):
    """section_map: {page_number: title} populated after build (use mutable dict)."""
    def fn(canv, doc):
        W, H = PAGE_W, PAGE_H
        m = MARGIN
        pg = doc.page
        title = section_map.get(pg, "")

        canv.setFont("Helvetica-Bold", 11)
        canv.setFillColor(DARK_BLUE)
        canv.drawString(m, H - m + 8, title)
        canv.setFont("Helvetica", 8)
        canv.setFillColor(TEXT_MUTED)
        canv.drawRightString(W - m, H - m + 8, f"{cfg['codigo']} • {cfg['periodo']}")
        canv.setStrokeColor(ORANGE)
        canv.setLineWidth(2)
        canv.line(m, H - m, W - m, H - m)

        canv.setStrokeColor(TEXT_MUTED)
        canv.setLineWidth(0.5)
        canv.line(m, 28, W - m, 28)
        canv.setFont("Helvetica", 7)
        canv.setFillColor(TEXT_MUTED)
        canv.drawString(m, 16, f"{cfg['codigo']} • {cfg['periodo']} • Psicossocial Analytics")
        canv.drawRightString(W - m, 16, f"Pagina {pg} de {_TOTAL_PAGES[0]}")

    return fn


# ──────────────────────────────────────────────
# CONTENT SECTIONS
# ──────────────────────────────────────────────

INTERPRETACOES = {
    "Carga de Trabalho": (
        "Score de 3.12 indica alta sobrecarga de trabalho percebida pelos colaboradores. "
        "Esse nivel de exigencia quantitativa esta associado a maior risco de burnout, "
        "absenteismo e rotatividade. Recomenda-se revisao imediata da distribuicao de "
        "tarefas, dotacao de equipes e processos de priorizacao."
    ),
    "Burnout": (
        "Score de 2.95 coloca esta dimensao na zona de alto risco. Indicadores de esgotamento "
        "emocional e despersonalizacao estao elevados. Intervencoes de suporte psicologico, "
        "revisao da carga e programas de bem-estar sao urgentemente necessarios."
    ),
    "Estresse": (
        "Score de 2.88 indica niveis elevados de estresse ocupacional. A percepcao de pressao "
        "constante e falta de recursos para lidar com as demandas do trabalho pode levar a "
        "consequencias negativas para a saude fisica e mental dos colaboradores."
    ),
    "Conflito trabalho-familia": (
        "Score de 2.74 evidencia dificuldade significativa no equilibrio entre as demandas "
        "profissionais e as responsabilidades familiares. Politicas de flexibilidade e "
        "gestao do tempo sao recomendadas para mitigar este fator de risco."
    ),
    "Ritmo de trabalho": (
        "Score de 2.68, limiar do alto risco, indica percepcao de ritmo acelerado e pressao "
        "temporal constante. O monitoramento continuo e a adocao de pausas regulamentadas "
        "sao medidas essenciais para controle deste indicador."
    ),
    "Reconhecimento": (
        "Score de 2.51 aponta para deficit moderado de reconhecimento percebido pelos "
        "colaboradores. A ausencia de reconhecimento adequado impacta diretamente a "
        "motivacao, o engajamento e a retencao de talentos na organizacao."
    ),
    "Suporte social": (
        "Score de 2.42 indica suporte social moderadamente baixo entre colegas e lideranca. "
        "O fortalecimento das redes de apoio interpessoal e a capacitacao de lideres para "
        "suporte emocional sao estrategias prioritarias."
    ),
    "Qualidade da lideranca": (
        "Score de 2.38 reflete avaliacao moderada da qualidade da lideranca. Aspectos como "
        "comunicacao, feedback, autonomia concedida e suporte ao desenvolvimento precisam "
        "ser fortalecidos por meio de programas estruturados de desenvolvimento de lideres."
    ),
    "Justica e respeito": (
        "Score de 2.20 indica percepcao moderada de justica organizacional. A transparencia "
        "nos processos decisorios, criterios claros de avaliacao e promocao, e respeito nas "
        "relacoes de trabalho sao pilares a serem reforcados."
    ),
    "Influencia no trabalho": (
        "Score de 2.15 revela percepcao moderada de autonomia e influencia nas proprias "
        "atividades. Estrategias de empoderamento, participacao em decisoes e delegacao "
        "responsavel podem elevar este indicador."
    ),
    "Comunidade social": (
        "Score de 1.88 representa risco baixo-moderado. O senso de comunidade e pertencimento "
        "esta razoavelmente preservado, mas acoes de integracao e cultura organizacional "
        "podem potencializar este fator protetor."
    ),
    "Significado do trabalho": (
        "Score de 1.72 indica que os colaboradores percebem significado moderado em suas "
        "atividades. Acoes de comunicacao estrategica, alinhamento de proposito e valorizacao "
        "das contribuicoes individuais podem fortalecer este aspecto."
    ),
}

PLANOS = {
    "Carga de Trabalho": {
        "acoes": [
            "Realizar mapeamento de processos e redistribuicao de tarefas criticas",
            "Implementar metodologia de gestao por prioridades (MoSCoW ou similar)",
            "Revisar dotacao de pessoal nos setores com maior sobrecarga identificada",
            "Estabelecer reunioes semanais de alinhamento e gestao de demandas",
        ],
        "prazo": "30 dias",
        "impacto": "Reducao de 20-30% na percepcao de sobrecarga nos proximos 90 dias",
    },
    "Burnout": {
        "acoes": [
            "Implantar programa de apoio psicologico (EAP) com acesso facilitado",
            "Treinar lideres para identificacao precoce de sinais de esgotamento",
            "Criar politica de descanso obrigatorio e desconexao digital fora do horario",
            "Estabelecer grupos de suporte e rodas de conversa sobre saude mental",
        ],
        "prazo": "45 dias",
        "impacto": "Reducao de absenteismo e melhora nos indicadores de saude mental em 6 meses",
    },
    "Estresse": {
        "acoes": [
            "Oferecer treinamentos de gestao do estresse e mindfulness para equipes",
            "Revisar metas e prazos, alinhando expectativas de forma realista",
            "Implantar pausas estruturadas durante a jornada de trabalho",
            "Monitorar indicadores de saude com pesquisas mensais de pulso",
        ],
        "prazo": "30 dias",
        "impacto": "Melhora de 15% no bem-estar geral percebido no trimestre seguinte",
    },
    "Conflito trabalho-familia": {
        "acoes": [
            "Implementar politica de flexibilidade de horario e trabalho hibrido",
            "Criar programa de apoio a colaboradores com dependentes",
            "Revisar politica de comunicacao fora do horario de trabalho",
            "Oferecer treinamentos de gestao do tempo e equilibrio vida-trabalho",
        ],
        "prazo": "60 dias",
        "impacto": "Aumento na satisfacao geral e reducao de conflitos reportados em 90 dias",
    },
    "Ritmo de trabalho": {
        "acoes": [
            "Mapear gargalos de processo que geram aceleracao desnecessaria do ritmo",
            "Implantar metodologia agil com sprints equilibrados e retrospectivas",
            "Estabelecer metas de ritmo sustentavel com indicadores de monitoramento",
            "Capacitar lideres em gestao de fluxo de trabalho e prevencao de urgencias",
        ],
        "prazo": "45 dias",
        "impacto": "Estabilizacao do ritmo percebido e reducao de horas extras em 60 dias",
    },
    "Reconhecimento": {
        "acoes": [
            "Estruturar programa formal de reconhecimento com criterios transparentes",
            "Capacitar lideres para oferta de feedback construtivo e reconhecimento frequente",
            "Criar mecanismos de celebracao de conquistas individuais e coletivas",
            "Revisar politica de remuneracao e beneficios com base em equidade interna",
        ],
        "prazo": "60 dias",
        "impacto": "Melhora de 20% nos indicadores de engajamento no proximo semestre",
    },
    "Suporte social": {
        "acoes": [
            "Implementar programa de mentoria e buddy system entre colaboradores",
            "Promover atividades de integracao e fortalecimento de vinculos de equipe",
            "Treinar lideres em escuta ativa e suporte emocional as equipes",
            "Criar canais seguros para reporte de situacoes de conflito e assedio",
        ],
        "prazo": "30 dias",
        "impacto": "Fortalecimento do clima de equipe e reducao de conflitos interpessoais",
    },
    "Qualidade da lideranca": {
        "acoes": [
            "Realizar diagnostico 360 graus de competencias de lideranca",
            "Implantar programa estruturado de desenvolvimento de lideres (PDL)",
            "Estabelecer rotina de feedback bidirecional entre lideres e equipes",
            "Monitorar qualidade da lideranca com indicadores trimestrais",
        ],
        "prazo": "90 dias",
        "impacto": "Melhora na avaliacao de lideranca e aumento do engajamento das equipes",
    },
}


def _build_p2(cfg):
    story = []
    paras = [
        ("O COPSOQ II (Copenhagen Psychosocial Questionnaire II) e um instrumento internacional de avaliacao "
         "de riscos psicossociais no trabalho, amplamente utilizado em pesquisas organizacionais e processos "
         "de gestao de saude ocupacional. Desenvolvido na Dinamarca e adaptado para inumeros contextos "
         "culturais, o instrumento avalia multiplas dimensoes que impactam o bem-estar dos trabalhadores."),
        ("A aplicacao do COPSOQ II possibilita identificar fatores de risco e protecao no ambiente de trabalho, "
         "permitindo a elaboracao de planos de acao baseados em evidencias cientificas. Sua estrutura modular "
         "facilita a adaptacao as especificidades de cada organizacao, mantendo o rigor metodologico necessario."),
        ("No contexto brasileiro, a avaliacao psicossocial ganhou relevancia regulatoria com a publicacao da "
         "NR-01 atualizada, que estabelece a obrigatoriedade do Gerenciamento de Riscos Ocupacionais (GRO) "
         "incluindo os fatores psicossociais como parte integrante do Programa de Gerenciamento de Riscos (PGR)."),
        ("A presente pesquisa utiliza uma versao adaptada do COPSOQ II, combinada com indicadores proprios "
         "de clima organizacional e engajamento, proporcionando uma visao abrangente e multidimensional do "
         "ambiente psicossocial da organizacao avaliada."),
    ]
    for p in paras:
        story.append(Paragraph(p, S["body"]))
        story.append(Spacer(1, 7))

    story.append(Spacer(1, 6))
    story.append(OrangeUnderlineTitle("Objetivo do Relatorio Tecnico"))
    story.append(Spacer(1, 8))
    for p in [
        ("O presente relatorio tem por objetivo apresentar os resultados obtidos na Pesquisa de Clima "
         "Organizacional — 1° Trimestre/2026, realizada na organizacao " + cfg["empresa"] + ". "
         "O documento foi elaborado com base nos principios da psicologia organizacional e do trabalho, "
         "seguindo as diretrizes metodologicas do COPSOQ II e as exigencias da NR-01."),
        ("As informacoes aqui contidas destinam-se exclusivamente ao uso interno da organizacao, "
         "subsidiando decisoes estrategicas de gestao de pessoas, saude ocupacional e desenvolvimento "
         "organizacional. A confidencialidade dos dados individuais e garantida em todas as etapas do processo."),
    ]:
        story.append(Paragraph(p, S["body"]))
        story.append(Spacer(1, 7))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Componentes Essenciais do Relatorio", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 8))

    items = [
        ("1. Identificacao e Metodologia",
         "Apresentacao da empresa avaliada, do responsavel tecnico e da metodologia utilizada na coleta e analise dos dados."),
        ("2. Resumo Executivo",
         "Panorama geral dos resultados com indicadores-chave de desempenho (KPIs) e classificacao geral do risco psicossocial."),
        ("3. Analise Detalhada por Dimensao",
         "Ranking das dimensoes psicossociais avaliadas, interpretacao tecnica individualizada e correlacoes entre fatores."),
        ("4. Plano de Acao e Recomendacoes",
         "Diretrizes praticas para intervencao, organizadas por prioridade de risco, com prazos e impactos esperados."),
    ]
    for title, desc in items:
        story.append(Paragraph(f"<b>{title}</b>", S["bold9"]))
        story.append(Paragraph(desc, S["body"]))
        story.append(Spacer(1, 6))

    return story


def _build_p3(cfg):
    story = []
    story.append(Paragraph("Dados da Empresa Avaliada", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 8))

    col_w = PAGE_W - 2 * MARGIN
    emp_data = [
        ["RAZAO SOCIAL",      cfg["empresa"]],
        ["CNPJ",              cfg["cnpj"]],
        ["ENDERECO",          cfg["endereco"]],
        ["DATA DA AVALIACAO", cfg["data_avaliacao"]],
        ["SETORES AVALIADOS", cfg["foco"]],
    ]
    tbl = Table([[Paragraph(k, S["muted"]), Paragraph(v, S["bold9"])] for k, v in emp_data],
                colWidths=[130, col_w - 130])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(0,-1), LIGHT_GRAY),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("LINEBELOW",     (0,0),(-1,-2), 0.5, LIGHT_GRAY),
        ("BOX",           (0,0),(-1,-1), 0.5, TEXT_MUTED),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 10))
    for p in [
        ("A empresa acima identificada contratou a realizacao da Pesquisa de Clima Organizacional com foco "
         "na avaliacao psicossocial de seus colaboradores. O processo foi conduzido em conformidade com os "
         "principios eticos da psicologia e as normas regulamentadoras vigentes."),
        ("A participacao dos colaboradores foi voluntaria e anonima, garantindo a confidencialidade das "
         "respostas individuais. Os dados foram tratados de forma agregada, impossibilitando a identificacao "
         "de respondentes especificos."),
    ]:
        story.append(Paragraph(p, S["body"]))
        story.append(Spacer(1, 7))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Responsavel Tecnico pela Avaliacao", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 8))

    rt_data = [
        ["NOME",          cfg["rt_nome"]],
        ["REGISTRO",      cfg["rt_registro"]],
        ["ESPECIALIDADE", cfg["rt_especialidade"]],
        ["CONTATO",       cfg["rt_contato"]],
    ]
    tbl2 = Table([[Paragraph(k, S["muted"]), Paragraph(v, S["bold9"])] for k, v in rt_data],
                 colWidths=[130, col_w - 130])
    tbl2.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(0,-1), LIGHT_GRAY),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("LINEBELOW",     (0,0),(-1,-2), 0.5, LIGHT_GRAY),
        ("BOX",           (0,0),(-1,-1), 0.5, TEXT_MUTED),
    ]))
    story.append(tbl2)
    story.append(Spacer(1, 10))
    for p in [
        ("O responsavel tecnico listado acima assume a responsabilidade pela conducao metodologica da pesquisa, "
         "pela analise dos dados coletados e pela elaboracao do presente relatorio. Sua atuacao esta em "
         "conformidade com o Codigo de Etica Profissional do Psicologo e as diretrizes do CFP."),
        ("Quaisquer duvidas sobre os resultados, metodologia ou plano de acao podem ser encaminhadas "
         "diretamente ao responsavel tecnico atraves dos contatos informados, respeitando os prazos "
         "estabelecidos no cronograma de devolutiva."),
    ]:
        story.append(Paragraph(p, S["body"]))
        story.append(Spacer(1, 7))

    return story


def _build_p4(cfg):
    story = []
    for p in [
        ("A metodologia empregada nesta pesquisa baseia-se no Copenhagen Psychosocial Questionnaire II "
         "(COPSOQ II), instrumento desenvolvido pelo National Research Centre for the Working Environment "
         "da Dinamarca. O questionario foi aplicado de forma digital, garantindo anonimato e facilidade de "
         "acesso para todos os colaboradores."),
        ("O instrumento utilizado contempla dimensoes relacionadas as exigencias do trabalho, a organizacao "
         "e ao conteudo das tarefas, as relacoes interpessoais e de lideranca, as interfaces trabalho-individuo "
         "e aos valores no local de trabalho. Cada dimensao e avaliada por meio de uma escala Likert de 5 pontos, "
         "convertida para uma escala de 0 a 4 para analise e interpretacao."),
        ("A classificacao dos resultados segue os parametros estabelecidos pelo COPSOQ II: scores de 0 a 1.66 "
         "indicam baixo risco (fator protetor); scores de 1.67 a 2.66 indicam risco moderado (zona de atencao); "
         "e scores de 2.67 a 4.00 indicam alto risco (requer intervencao prioritaria)."),
    ]:
        story.append(Paragraph(p, S["body"]))
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Dimensoes Contempladas no Instrumento", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 8))

    for d in [
        "Exigencias quantitativas e ritmo de trabalho",
        "Exigencias emocionais e cognitivas",
        "Influencia, desenvolvimento e significado do trabalho",
        "Qualidade da lideranca e suporte social",
        "Reconhecimento, justica e previsibilidade",
        "Comunidade social e confianca organizacional",
        "Equilibrio trabalho-familia e saude geral",
    ]:
        story.append(OrangeBullet(d))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Perfil dos Participantes", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 8))

    col_w = PAGE_W - 2 * MARGIN
    perf = [
        ["TOTAL DE RESPONDENTES", f"{cfg['respondentes']} de {cfg['total_colaboradores']}"],
        ["PERIODO DE APLICACAO",  cfg["aplicacao"]],
        ["FOCO",                  cfg["foco"]],
        ["RESPONSAVEL",           cfg["responsavel"]],
    ]
    tbl = Table([[Paragraph(k, S["muted"]), Paragraph(v, S["bold9"])] for k, v in perf],
                colWidths=[160, col_w - 160])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(0,-1), LIGHT_GRAY),
        ("TOPPADDING",    (0,0),(-1,-1), 6),
        ("BOTTOMPADDING", (0,0),(-1,-1), 6),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("LINEBELOW",     (0,0),(-1,-2), 0.5, LIGHT_GRAY),
        ("BOX",           (0,0),(-1,-1), 0.5, TEXT_MUTED),
    ]))
    story.append(tbl)
    return story


def _build_p5(cfg):
    story = []
    avail_w = PAGE_W - 2 * MARGIN
    kpi_w   = (avail_w - 18) / 4

    kpi_row = Table(
        [[
            KPIBox("RISCO GERAL",        "2.25", "MODERADO",  DARK_BLUE, AMBER,      kpi_w),
            KPIBox("ADESAO",             "92%",  "BOA",       DARK_BLUE, GREEN,      kpi_w),
            KPIBox("RESPONDENTES",       "312",  "TOTAL",     DARK_BLUE, TEXT_MUTED, kpi_w),
            KPIBox("DIMENSOES CRITICAS", "1",    "ALTO RISCO",RED,       RED,        kpi_w),
        ]],
        colWidths=[kpi_w]*4,
    )
    kpi_row.setStyle(TableStyle([
        ("LEFTPADDING",  (0,0),(-1,-1), 3),
        ("RIGHTPADDING", (0,0),(-1,-1), 3),
    ]))
    story.append(kpi_row)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Analise Executiva", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Os resultados da Pesquisa de Clima Organizacional — 1° Trimestre/2026 revelam um cenario de risco "
        "psicossocial moderado na organizacao, com score geral de 2.25/4. A analise das doze dimensoes "
        "avaliadas indica concentracao de fatores de risco nas areas de exigencias quantitativas, saude "
        "mental e equilibrio trabalho-familia, demandando atencao prioritaria da gestao.", S["body"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Contexto Organizacional", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "A taxa de adesao de 91.8% (312 de 340 colaboradores) confere elevada representatividade estatistica "
        "aos resultados, garantindo que as conclusoes refletem fidedignamente o estado psicossocial da "
        "organizacao. A ausencia de respostas (8.2%) e considerada dentro dos parametros aceitaveis para "
        "pesquisas deste tipo, nao comprometendo a validade do instrumento.", S["body"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Classificacao Geral", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 10))
    story.append(ClassifBox(avail_w))
    return story


def _build_p6(cfg):
    story = []
    story.append(Paragraph(
        "O ranking abaixo apresenta as doze dimensoes psicossociais avaliadas, ordenadas do maior para o "
        "menor score de risco. Dimensoes com score acima de 2.67 requerem intervencao prioritaria; entre "
        "1.67 e 2.66 demandam atencao preventiva; abaixo de 1.67 sao consideradas fatores protetivos.", S["body"]))
    story.append(Spacer(1, 12))

    avail_w = PAGE_W - 2 * MARGIN
    dims = sorted(cfg["dimensoes"], key=lambda d: d["score"], reverse=True)
    for d in dims:
        story.append(BarChart(d["nome"], d["score"], width=avail_w))
        story.append(Spacer(1, 6))
    return story


def _build_p7(cfg):
    story = []
    story.append(Paragraph(
        "A interpretacao tecnica a seguir apresenta analise individualizada de cada dimensao psicossocial "
        "avaliada, contextualizando os scores obtidos e indicando direcionamentos para intervencao. "
        "As analises foram elaboradas com base no referencial teorico do COPSOQ II e na literatura "
        "cientifica sobre saude mental no trabalho.", S["body"]))
    story.append(Spacer(1, 12))

    avail_w = PAGE_W - 2 * MARGIN
    dims = sorted(cfg["dimensoes"], key=lambda d: d["score"], reverse=True)
    for d in dims:
        texto = INTERPRETACOES.get(d["nome"], "Analise em elaboracao.")
        story.append(KeepTogether([
            DimensionCard(d["nome"], d["score"], texto, width=avail_w),
            Spacer(1, 8),
        ]))
    return story


def _build_p8_p9(cfg):
    story = []
    story.append(Paragraph(
        "O plano de acao a seguir foi elaborado com base nas dimensoes que apresentaram score igual ou "
        "superior a 2.40, indicando necessidade de intervencao preventiva ou corretiva. As acoes foram "
        "priorizadas por nivel de risco e potencial de impacto na saude e bem-estar dos colaboradores.", S["body"]))
    story.append(Spacer(1, 12))

    avail_w = PAGE_W - 2 * MARGIN
    dims_crit = [d for d in sorted(cfg["dimensoes"], key=lambda x: x["score"], reverse=True) if d["score"] >= 2.4]
    for d in dims_crit:
        plano = PLANOS.get(d["nome"], {
            "acoes": ["Monitorar indicador", "Coletar feedbacks", "Planejar intervencao", "Reavaliar em 90 dias"],
            "prazo": "60 dias",
            "impacto": "Melhora geral nos indicadores psicossociais",
        })
        story.append(KeepTogether([
            ActionCard(d["nome"], d["score"], plano["acoes"], plano["prazo"], plano["impacto"], width=avail_w),
            Spacer(1, 10),
        ]))
    return story


def _build_p10(cfg):
    story = []
    story.append(Paragraph("Instrumento Utilizado", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "O Copenhagen Psychosocial Questionnaire II (COPSOQ II) e um instrumento de dominio publico, "
        "desenvolvido e validado pelo National Research Centre for the Working Environment (NFA) da "
        "Dinamarca. A versao utilizada nesta pesquisa foi adaptada para o contexto brasileiro, mantendo "
        "a equivalencia semantica e conceitual dos itens originais.", S["body"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Escala COPSOQ II", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Os scores sao calculados como medias das respostas em escala Likert de 5 pontos, "
        "convertidas para a escala 0-4. A classificacao segue os parametros internacionais:", S["body"]))
    story.append(Spacer(1, 8))

    col_w = PAGE_W - 2 * MARGIN
    esc_data = [
        [Paragraph("<b>FAIXA</b>", S["white_b"]),
         Paragraph("<b>CLASSIFICACAO</b>", S["white_b"]),
         Paragraph("<b>DESCRICAO</b>", S["white_b"])],
        ["0.00 – 1.66", "BAIXO RISCO", "Fator protetor. Manter e potencializar."],
        ["1.67 – 2.66", "RISCO MODERADO", "Zona de atencao. Monitorar e agir preventivamente."],
        ["2.67 – 4.00", "ALTO RISCO", "Requer intervencao prioritaria e urgente."],
    ]
    tbl = Table(esc_data, colWidths=[100, 120, col_w - 220])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1, 0), DARK_BLUE),
        ("FONTNAME",      (0,1),(-1,-1), "Helvetica"),
        ("FONTSIZE",      (0,0),(-1,-1), 8),
        ("BACKGROUND",    (0,1),(-1, 1), colors.HexColor("#EAF9F0")),
        ("BACKGROUND",    (0,2),(-1, 2), colors.HexColor("#FFF8E7")),
        ("BACKGROUND",    (0,3),(-1, 3), colors.HexColor("#FEECEC")),
        ("TOPPADDING",    (0,0),(-1,-1), 6),
        ("BOTTOMPADDING", (0,0),(-1,-1), 6),
        ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ("BOX",           (0,0),(-1,-1), 0.5, TEXT_MUTED),
        ("LINEBELOW",     (0,0),(-1,-1), 0.3, TEXT_MUTED),
    ]))
    story.append(tbl)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Fatores Protetivos", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    for item in [
        "Significado e proposito percebido no trabalho",
        "Suporte social de colegas e lideranca",
        "Autonomia e influencia nas proprias atividades",
        "Reconhecimento e feedback construtivo frequente",
    ]:
        story.append(TickItem(item, symbol="v"))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Fatores de Risco Comuns", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    for item in [
        "Sobrecarga quantitativa e ritmo acelerado de trabalho",
        "Baixo suporte social e isolamento organizacional",
        "Conflito trabalho-familia sem politicas de mitigacao",
        "Ausencia de reconhecimento e recompensas percebidas como injustas",
    ]:
        story.append(TickItem(item, symbol="!"))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Referencias Tecnicas", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    for ref in [
        ("KRISTENSEN, T.S. et al. The Copenhagen Psychosocial Questionnaire — a tool for the assessment "
         "and improvement of the psychosocial work environment. Scandinavian Journal of Work, Environment "
         "& Health, 2005."),
        ("BRASIL. Ministerio do Trabalho e Emprego. NR-01 — Disposicoes Gerais e Gerenciamento de Riscos "
         "Ocupacionais. Atualizacao 2021."),
        ("CONSELHO FEDERAL DE PSICOLOGIA. Resolucao CFP n. 006/2019 — Elaboracao de documentos escritos "
         "produzidos pela(o) psicologa(o) no exercicio profissional. Brasilia: CFP, 2019."),
        ("LEKA, S.; COX, T. (Eds.). The European Framework for Psychosocial Risk Management: PRIMA-EF. "
         "Nottingham: I-WHO Publications, 2008."),
    ]:
        story.append(Paragraph(ref, S["italic_m"]))
        story.append(Spacer(1, 6))

    return story


def _build_p11(cfg):
    story = []
    for p in [
        ("A analise global dos resultados confirma que a organizacao apresenta um perfil psicossocial "
         "de risco moderado, com tendencia de concentracao dos fatores mais criticos nas dimensoes "
         "relacionadas as exigencias do trabalho e a saude mental. A distribuicao dos scores evidencia "
         "a necessidade de abordagem sistemica, integrando acoes de gestao de pessoas, saude ocupacional "
         "e desenvolvimento organizacional."),
        ("Destaca-se positivamente que as dimensoes de Comunidade Social e Significado do Trabalho "
         "apresentaram scores abaixo do limiar de atencao, indicando preservacao do senso de pertencimento "
         "e proposito entre os colaboradores. Esses fatores protetivos devem ser potencializados como "
         "estrategia de resiliencia organizacional frente aos desafios identificados."),
    ]:
        story.append(Paragraph(p, S["body"]))
        story.append(Spacer(1, 8))

    story.append(Spacer(1, 10))
    story.append(Paragraph("Tabela Consolidada de Resultados", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 8))

    col_w = PAGE_W - 2 * MARGIN
    header = [
        Paragraph("<b>DIMENSAO</b>", S["white_b"]),
        Paragraph("<b>SCORE</b>",    S["white_b"]),
        Paragraph("<b>CLASSIFICACAO</b>", S["white_b"]),
    ]
    rows = [header]
    for d in sorted(cfg["dimensoes"], key=lambda x: x["score"], reverse=True):
        n  = nivel(d["score"])
        nc = nivel_color(d["score"])
        niv_style = ParagraphStyle("niv_"+d["nome"], fontName="Helvetica-Bold", fontSize=8, textColor=nc)
        rows.append([
            Paragraph(d["nome"], S["body_l"]),
            Paragraph(f"{d['score']:.2f}", S["bold9"]),
            Paragraph(n, niv_style),
        ])

    tbl = Table(rows, colWidths=[col_w*0.55, col_w*0.15, col_w*0.30])
    tbl.setStyle(TableStyle([
        ("BACKGROUND",     (0,0),(-1, 0), DARK_BLUE),
        ("TOPPADDING",     (0,0),(-1,-1), 6),
        ("BOTTOMPADDING",  (0,0),(-1,-1), 6),
        ("LEFTPADDING",    (0,0),(-1,-1), 8),
        ("ROWBACKGROUNDS", (0,1),(-1,-1), [WHITE, LIGHT_GRAY]),
        ("LINEBELOW",      (0,0),(-1,-1), 0.3, TEXT_MUTED),
        ("BOX",            (0,0),(-1,-1), 0.5, TEXT_MUTED),
    ]))
    story.append(tbl)
    return story


def _build_p12(cfg):
    story = []
    avail_w = PAGE_W - 2 * MARGIN

    domains = [
        {
            "titulo": "Ritmo de Trabalho e Exigencias Quantitativas",
            "bullets": [
                "Auditoria de processos para identificar ineficiencias geradoras de sobrecarga",
                "Redistribuicao de carga com criterios baseados em dados e capacidade real das equipes",
                "Implementacao de metodologias ageis com foco em ritmo sustentavel",
                "Monitoramento continuo via indicadores de workload e absenteismo",
            ],
        },
        {
            "titulo": "Exigencias Emocionais e Saude Mental",
            "bullets": [
                "Implantacao de Programa de Assistencia ao Empregado (EAP) com suporte psicologico",
                "Campanhas internas de saude mental e desmistificacao do adoecimento",
                "Capacitacao de lideres como agentes de saude mental nas equipes",
                "Protocolo de acolhimento para colaboradores em sofrimento psiquico",
            ],
        },
        {
            "titulo": "Lideranca e Ambiente Organizacional",
            "bullets": [
                "Programa estruturado de desenvolvimento de competencias de lideranca",
                "Ciclos regulares de feedback 360 graus com planos de desenvolvimento individual",
                "Revisao dos criterios de promocao e reconhecimento para maior transparencia",
                "Fortalecimento dos canais de comunicacao e participacao dos colaboradores",
            ],
        },
    ]
    for dom in domains:
        story.append(DomainCard(dom["titulo"], dom["bullets"], width=avail_w))
        story.append(Spacer(1, 10))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Integracao ao Plano de Acao do PGR", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    for p in [
        ("As recomendacoes tecnicas apresentadas neste relatorio devem ser integradas ao Programa de "
         "Gerenciamento de Riscos (PGR) da organizacao, em conformidade com a NR-01 atualizada. "
         "A incorporacao dos riscos psicossociais ao PGR e obrigatoria e deve seguir o ciclo PDCA "
         "de planejamento, execucao, verificacao e melhoria continua."),
        ("Recomenda-se a constituicao de um Comite Multidisciplinar de Saude Mental no Trabalho, "
         "envolvendo representantes de RH, Saude Ocupacional, Lideranca e colaboradores, para "
         "governanca das acoes e monitoramento dos indicadores definidos no plano de acao."),
    ]:
        story.append(Paragraph(p, S["body"]))
        story.append(Spacer(1, 7))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Criterios de Reaplicacao Antecipada", S["section"]))
    story.append(OrangeLine())
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "A reaplicacao da pesquisa esta prevista para o 2° Trimestre/2026. No entanto, os seguintes "
        "gatilhos podem indicar necessidade de reaplicacao antecipada:", S["body"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Gatilhos para reaplicacao</b>", S["bold9"]))
    story.append(Spacer(1, 6))
    for g in [
        "Aumento superior a 20% nos indicadores de absenteismo ou afastamentos",
        "Ocorrencia de eventos criticos (demissoes em massa, reestruturacao, conflitos graves)",
        "Solicitacao fundamentada do Comite de Saude Mental ou da CIPA",
        "Denuncias formais de assedio moral ou sexual com impacto sistemico",
        "Queda expressiva nos indicadores de engajamento em pesquisas de pulso mensais",
    ]:
        story.append(OrangeBullet(g))
        story.append(Spacer(1, 3))

    return story


def _build_p13(cfg):
    story = []
    story.append(Paragraph(
        "A Pesquisa de Clima Organizacional — 1° Trimestre/2026 cumpre seu papel diagnostico ao "
        "evidenciar com rigor metodologico o estado psicossocial da " + cfg["empresa"] + ". "
        "Os resultados obtidos oferecem uma base solida para a tomada de decisao estrategica em "
        "saude mental no trabalho, alinhando a organizacao as melhores praticas internacionais "
        "e as exigencias regulatorias brasileiras. O compromisso com a saude e o bem-estar dos "
        "colaboradores e, ao mesmo tempo, uma responsabilidade etica e um fator critico de "
        "sustentabilidade e performance organizacional. A implementacao das acoes recomendadas, "
        "acompanhada de monitoramento continuo, posicionara a organizacao em trajetoria de melhoria "
        "consistente de seu ambiente psicossocial, com beneficios tangiveis para colaboradores, "
        "liderancas e para os resultados do negocio.", S["body"]))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=TEXT_MUTED))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<b>Relatorio elaborado por: {cfg['responsavel']}</b>", S["bold10"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Data de emissao: 27 de maio de 2026", S["muted"]))
    return story


# ──────────────────────────────────────────────
# MAIN GENERATOR
# ──────────────────────────────────────────────

def gerar_relatorio(cfg=None, output_path=None):
    if cfg is None:
        cfg = CONFIG
    
    if output_path is None:
        script_dir  = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(script_dir, cfg["output_filename"])

    sections = [
        ("Introducao",                               _build_p2(cfg)),
        ("Identificacao da Empresa e Resp. Tecnico", _build_p3(cfg)),
        ("Metodologia",                              _build_p4(cfg)),
        ("Resumo Executivo",                         _build_p5(cfg)),
        ("Fatores Psicossociais — Ranking",          _build_p6(cfg)),
        ("Interpretacao Tecnica por Dimensao",       _build_p7(cfg)),
        ("Plano de Acao Recomendado",                _build_p8_p9(cfg)),
        ("Metodologia e Referencias",                _build_p10(cfg)),
        ("Analise Global dos Resultados",            _build_p11(cfg)),
        ("Recomendacoes Tecnicas por Dominio",       _build_p12(cfg)),
        ("Conclusao",                                _build_p13(cfg)),
    ]

    # ── Build story ──
    story = []
    # Page 1: cover — use NextPageTemplate to switch template after cover
    story.append(NextPageTemplate("inner"))
    # Dummy spacer to "fill" cover page (cover is drawn via on_page callback)
    story.append(Spacer(1, PAGE_H * 0.01))
    story.append(PageBreak())

    # Pages 2-13
    for i, (title, content) in enumerate(sections):
        if i > 0:
            story.append(PageBreak())
        story.extend(content)

    # ── PageTemplate wiring ──
    # We track which section maps to which page via a list updated during build
    # The inner callback reads from a mutable list

    section_page_map = {}  # will be populated

    cover_frame = Frame(0, 0, PAGE_W, PAGE_H, leftPadding=0, rightPadding=0,
                        topPadding=0, bottomPadding=0)
    inner_frame = Frame(MARGIN, MARGIN + 10, PAGE_W - 2*MARGIN, PAGE_H - 2*MARGIN - 30,
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

    cover_cb = _cover_cb(cfg)

    # We need the inner callback to know section title per page.
    # Strategy: use a closure with a page_counter list.
    page_counter = [0]  # [inner_page_count]

    def inner_on_page(canv, doc):
        pg = doc.page
        # Use section_page_map populated by SectionMarker flowables.
        # For continuation pages (no marker), walk backwards to find last known title.
        if pg in section_page_map:
            title = section_page_map[pg]
        else:
            # propagate last known
            title = sections[0][0]
            for p in range(pg - 1, 1, -1):
                if p in section_page_map:
                    title = section_page_map[p]
                    break
        W, H = PAGE_W, PAGE_H
        m = MARGIN

        canv.setFont("Helvetica-Bold", 11)
        canv.setFillColor(DARK_BLUE)
        canv.drawString(m, H - m + 8, title)
        canv.setFont("Helvetica", 8)
        canv.setFillColor(TEXT_MUTED)
        canv.drawRightString(W - m, H - m + 8, f"{cfg['codigo']} • {cfg['periodo']}")
        canv.setStrokeColor(ORANGE)
        canv.setLineWidth(2)
        canv.line(m, H - m, W - m, H - m)

        canv.setStrokeColor(TEXT_MUTED)
        canv.setLineWidth(0.5)
        canv.line(m, 28, W - m, 28)
        canv.setFont("Helvetica", 7)
        canv.setFillColor(TEXT_MUTED)
        canv.drawString(m, 16, f"{cfg['codigo']} • {cfg['periodo']} • Psicossocial Analytics")
        canv.drawRightString(W - m, 16, f"Pagina {pg} de {_TOTAL_PAGES[0]}")

    # ── Helper to embed section markers ──
    class SectionMarker(Flowable):
        def __init__(self, title, mapping):
            super().__init__()
            self._title   = title
            self._mapping = mapping

        def wrap(self, avW, avH):
            return 0, 0

        def draw(self):
            pg = self.canv.getPageNumber()
            if pg not in self._mapping:
                self._mapping[pg] = self._title

    def make_story(sec_map):
        fs = []
        fs.append(NextPageTemplate("inner"))
        fs.append(Spacer(1, PAGE_H * 0.01))
        fs.append(PageBreak())
        for i, (title, content) in enumerate(sections):
            if i > 0:
                fs.append(PageBreak())
            fs.append(SectionMarker(title, sec_map))
            fs.extend(content)
        return fs

    def make_doc(path):
        cov_t   = PageTemplate(id="cover", frames=[cover_frame], onPage=cover_cb)
        inner_t = PageTemplate(id="inner", frames=[inner_frame], onPage=inner_on_page)
        return BaseDocTemplate(path, pagesize=A4, pageTemplates=[cov_t, inner_t])

    # ── Pass 1: count pages and capture section map ──
    import io
    pass1_buf = io.BytesIO()
    doc1 = make_doc(pass1_buf)
    map1 = {}
    doc1.build(make_story(map1))
    total = doc1.page
    _TOTAL_PAGES[0] = total
    # Populate section_page_map from pass1 so pass2 header callback has correct data
    section_page_map.update(map1)

    # ── Pass 2: final PDF with correct total ──
    # section_page_map already populated; pass2 SectionMarker updates it again
    doc2 = make_doc(output_path)
    doc2.build(make_story(section_page_map))

    print(f"PDF gerado com sucesso: {output_path}  ({total} paginas)")
    return output_path


if __name__ == "__main__":
    gerar_relatorio()
