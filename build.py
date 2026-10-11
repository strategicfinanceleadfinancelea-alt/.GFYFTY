#!/usr/bin/env python3
"""Monta o index.html (arquivo único) a partir de src/.

O YFM Finance gera "Arquivos do cliente" a partir do próprio HTML aberto,
por isso o resultado final precisa ser um único arquivo com CSS e JS embutidos.

Uso:  python3 build.py
"""
from pathlib import Path

raiz = Path(__file__).parent
src = raiz / "src"
html = (src / "template.html").read_text(encoding="utf-8")
css = (src / "styles.css").read_text(encoding="utf-8").rstrip("\n")
js = (src / "app.js").read_text(encoding="utf-8").rstrip("\n")

assert "{{STYLES}}" in html and "{{SCRIPT}}" in html, "template.html sem os marcadores"
html = html.replace("{{STYLES}}", css, 1).replace("{{SCRIPT}}", js, 1)

(raiz / "index.html").write_text(html, encoding="utf-8")
print(f"index.html gerado ({len(html) / 1024:.1f} KB)")
