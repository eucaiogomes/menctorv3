#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
test_api.py
Script para testar a API de geração de relatórios
"""

import requests
import json
from datetime import datetime

# Dados de teste
teste_dados = {
    "codigo": "PCL-Q2",
    "titulo_linha1": "Pesquisa de Clima Organizacional —",
    "titulo_linha2": "2° Trimestre/2026",
    "descricao": "Pesquisa trimestral combinando dimensões COPSOQ II com indicadores de clima e engajamento.",
    "periodo": "Abril a Junho - 2026",
    "aplicacao": "15/04/2026 a 30/04/2026",
    "responsavel": "Comite de Pessoas & Cultura",
    "respondentes": 312,
    "total_colaboradores": 340,
    "taxa_adesao": "91.8%",
    "foco": "Toda a organização",
    "emissao": "27 de maio de 2026",
    "empresa": "Loghaus Logística",
    "cnpj": "12.345.678/0001-90",
    "endereco": "Avenida Paulista, 1000",
    "data_avaliacao": "01/04/2026",
    "rt_nome": "Caio Guedes",
    "rt_registro": "CRP-06/12345",
    "rt_especialidade": "Psicologia Organizacional",
    "rt_contato": "(11) 99999-9999",
    "output_filename": "relatorio_teste.pdf",
    "dimensoes": [
        {"nome": "Carga de trabalho", "score": 3.12},
        {"nome": "Burnout", "score": 2.95},
        {"nome": "Estresse", "score": 2.88},
        {"nome": "Conflito trabalho-família", "score": 2.74},
        {"nome": "Ritmo de trabalho", "score": 2.68},
        {"nome": "Reconhecimento", "score": 2.51},
        {"nome": "Suporte social", "score": 2.42},
        {"nome": "Qualidade da liderança", "score": 2.38},
        {"nome": "Justiça e respeito", "score": 2.20},
        {"nome": "Influência no trabalho", "score": 2.15},
        {"nome": "Comunidade social", "score": 1.88},
        {"nome": "Significado do trabalho", "score": 1.72},
    ]
}

def teste_health():
    """Testa o endpoint de health check"""
    print("[TEST] Testando health check...")
    try:
        response = requests.get("http://localhost:5000/health", timeout=5)
        if response.status_code == 200:
            print("[OK] Health check OK")
            print(f"     Resposta: {response.json()}")
            return True
        else:
            print(f"[FAIL] Health check falhou com status {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERROR] Erro ao conectar: {e}")
        return False

def teste_relatorio_teste():
    """Testa a geração de relatório com dados de teste"""
    print("\n[TEST] Testando geração de relatório de teste...")
    try:
        response = requests.get("http://localhost:5000/api/teste", timeout=30)
        if response.status_code == 200:
            # Salvar o PDF
            with open("relatorio_teste_download.pdf", "wb") as f:
                f.write(response.content)
            print(f"[OK] Relatório de teste gerado com sucesso!")
            print(f"     Tamanho: {len(response.content)} bytes")
            print(f"     Arquivo salvo: relatorio_teste_download.pdf")
            return True
        else:
            print(f"[FAIL] Falha ao gerar relatório: {response.status_code}")
            print(f"     Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Erro ao gerar relatório: {e}")
        return False

def teste_relatorio_customizado():
    """Testa a geração de relatório com dados customizados"""
    print("\n[TEST] Testando geração de relatório customizado...")
    try:
        print("     Enviando dados...")
        response = requests.post(
            "http://localhost:5000/api/gerar-relatorio",
            json=teste_dados,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            # Salvar o PDF
            filename = f"relatorio_customizado_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            with open(filename, "wb") as f:
                f.write(response.content)
            print(f"[OK] Relatório customizado gerado com sucesso!")
            print(f"     Tamanho: {len(response.content)} bytes")
            print(f"     Arquivo salvo: {filename}")
            return True
        else:
            print(f"[FAIL] Falha ao gerar relatório: {response.status_code}")
            try:
                error_data = response.json()
                print(f"     Erro: {error_data.get('error', 'Erro desconhecido')}")
            except:
                print(f"     Resposta: {response.text}")
            return False
    except Exception as e:
        print(f"[ERROR] Erro ao gerar relatório: {e}")
        return False

def main():
    print("=" * 60)
    print("[SUITE] TESTES DA API DE RELATÓRIOS PSICOSSOCIAIS")
    print("=" * 60)
    
    resultados = []
    
    # Teste 1: Health check
    resultados.append(("Health Check", teste_health()))
    
    # Teste 2: Relatório de teste
    resultados.append(("Relatório de Teste", teste_relatorio_teste()))
    
    # Teste 3: Relatório customizado
    resultados.append(("Relatório Customizado", teste_relatorio_customizado()))
    
    # Resumo
    print("\n" + "=" * 60)
    print("[SUMMARY] RESUMO DOS TESTES")
    print("=" * 60)
    for teste, resultado in resultados:
        status = "[OK] PASSOU" if resultado else "[FAIL] FALHOU"
        print(f"{status}: {teste}")
    
    total = len(resultados)
    passou = sum(1 for _, r in resultados if r)
    print(f"\nTotal: {passou}/{total} testes passaram")
    
    if passou == total:
        print("\n[SUCCESS] Todos os testes passaram! O servidor está funcionando corretamente.")
    else:
        print("\n[WARNING] Alguns testes falharam. Verifique o servidor e tente novamente.")

if __name__ == "__main__":
    main()
