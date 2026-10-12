#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
raumwerk CRM – lokale Version
=============================

Starten:   python3 raumwerk_crm.py        (Windows: py raumwerk_crm.py)
Beenden:   dieses Fenster schließen oder Strg + C

Das Skript braucht nur Python 3.7 oder neuer, keine Zusatzpakete und kein
Internet (außer für die Schriften). Es startet einen kleinen Server, der nur
auf diesem Computer erreichbar ist, und öffnet das CRM im Browser.

Alle Leads liegen im Ordner „raumwerk-daten“ neben diesem Skript:
  leads.json              die aktuellen Daten
  sicherungen/            eine automatische Sicherung pro Tag (die letzten 60)

Optionen:
  --port 8765             anderen Port verwenden
  --daten PFAD            anderen Datenordner verwenden
  --kein-browser          Browser nicht automatisch öffnen
"""

import argparse
import json
import os
import shutil
import socket
import sys
import tempfile
import threading
import time
import urllib.request
import webbrowser
from datetime import date, datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

APP_NAME = "raumwerk CRM"
VERSION = "2026-10-12c"
STANDARD_PORT = 8765
MAX_SICHERUNGEN = 60
MAX_GROESSE = 50 * 1024 * 1024  # 50 MB pro Speichervorgang

HTML = r'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="raumwerk">
<meta name="theme-color" content="#F4F1EA">
<title>raumwerk · Leads</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2323332A'/%3E%3Ctext x='32' y='45' font-family='Georgia,serif' font-style='italic' font-size='40' text-anchor='middle' fill='%23F4F1EA'%3Er%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<!--RW_SERVER-->
<style>
:root{
  --bg:#F4F1EA;
  --bg-alt:#ECEBE3;
  --surface:#FBFAF6;
  --ink:#23332A;
  --ink-soft:#3A4A3F;
  --sage:#6E7A5E;
  --sage-soft:#A7AE96;
  --muted:#6B6F68;
  --faint:#9A9C94;
  --line:#DCD8CC;
  --line-sage:#C8CCBA;
  --accent-warm:#9A6B4F;
  --serif:"Cormorant Garamond", Georgia, "Times New Roman", serif;
  --sans:"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
  --radius:4px;
  --shadow:0 1px 0 rgba(35,51,42,.04), 0 1px 2px rgba(35,51,42,.05);
  --shadow-lift:0 18px 40px -12px rgba(35,51,42,.28), 0 2px 6px rgba(35,51,42,.10);
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;background:var(--bg);color:var(--ink);
  font-family:var(--sans);font-size:15px;line-height:1.55;
  -webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;
  display:flex;flex-direction:column;overflow:hidden;
}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;background:none;border:0;padding:0}
a{color:inherit}
.label{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:500}
.serif{font-family:var(--serif)}
.it{font-style:italic;color:var(--sage)}
svg.i{width:16px;height:16px;flex:none;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}

/* ---------- Kopfzeile ---------- */
.top{
  display:flex;align-items:center;gap:28px;
  padding:18px max(24px, env(safe-area-inset-right)) 16px max(24px, env(safe-area-inset-left));
  border-bottom:1px solid var(--line);background:var(--bg);flex:none;
}
.brand{display:flex;align-items:baseline;gap:14px;white-space:nowrap}
.brand .word{font-family:var(--serif);font-size:30px;line-height:1;font-weight:500;letter-spacing:-.01em}
.brand .word i{color:var(--sage);font-weight:400}
.brand .label{transform:translateY(-3px)}
.stats{display:flex;gap:22px;color:var(--muted);font-size:13.5px;white-space:nowrap}
.stats b{color:var(--ink);font-weight:500;font-variant-numeric:tabular-nums}
.stats .due b{color:var(--accent-warm)}
.top .spacer{flex:1}
.search{
  display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line-sage);
  padding:6px 2px;min-width:200px;color:var(--muted);
}
.search input{border:0;background:transparent;outline:0;width:100%;color:var(--ink)}
.search input::placeholder{color:var(--faint)}
.btn{
  display:inline-flex;align-items:center;gap:8px;white-space:nowrap;
  padding:10px 18px;border-radius:999px;font-size:14px;font-weight:500;
  transition:background .15s, color .15s, border-color .15s;
}
.btn-primary{background:var(--ink);color:var(--bg)}
.btn-primary:hover{background:#1A2820}
.btn-line{border:1px solid var(--line-sage);color:var(--ink)}
.btn-line:hover{border-color:var(--ink)}
.btn-quiet{color:var(--muted);padding:10px 10px}
.btn-quiet:hover{color:var(--ink)}
.btn-sm{padding:7px 14px;font-size:13px}
.link-arrow{display:inline-flex;align-items:center;gap:8px;font-weight:500;color:var(--ink);font-size:14px}
.link-arrow:hover .arr{transform:translate(2px,-2px)}
.arr{transition:transform .15s}

/* ---------- Board ---------- */
.board{
  flex:1;min-height:0;display:flex;gap:18px;overflow-x:auto;overflow-y:hidden;
  padding:22px max(24px, env(safe-area-inset-right)) 18px max(24px, env(safe-area-inset-left));
  -webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;scroll-padding:0 24px;
}
.col{
  flex:0 0 288px;display:flex;flex-direction:column;min-height:0;
  scroll-snap-align:start;
}
.col-head{padding:0 2px 12px;border-bottom:1px solid var(--line);margin-bottom:12px;display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.col-head h2{margin:6px 0 0;font-family:var(--serif);font-weight:500;font-size:24px;line-height:1.1;letter-spacing:-.005em}
.col-head h2 i{color:var(--sage);font-weight:400}
.col-count{font-family:var(--serif);font-size:24px;line-height:1.1;color:var(--faint);font-variant-numeric:lining-nums tabular-nums}
.col[data-stage="closed"] .col-head{border-bottom-color:var(--sage-soft)}
.col-list{
  flex:1;min-height:80px;overflow-y:auto;overflow-x:hidden;padding:2px 2px 40px;
  display:flex;flex-direction:column;gap:10px;-webkit-overflow-scrolling:touch;
  border-radius:var(--radius);transition:background .15s;
}
.col.is-target .col-list{background:rgba(110,122,94,.07)}
.col-empty{
  border:1px dashed var(--line-sage);border-radius:var(--radius);padding:22px 14px;
  text-align:center;color:var(--faint);font-size:13px;
}
.col.is-target .col-empty{display:none}

/* ---------- Karte ---------- */
.card{
  position:relative;background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);
  padding:14px 14px 13px;box-shadow:var(--shadow);cursor:grab;
  -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation;
  transition:border-color .15s, box-shadow .15s;
}
.card:hover{border-color:var(--line-sage)}
.card-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.card-name{font-weight:500;font-size:15px;line-height:1.35;overflow-wrap:anywhere}
.card-age{font-size:12px;color:var(--faint);white-space:nowrap}
.card-firm{color:var(--muted);font-size:13.5px;margin-top:1px;overflow-wrap:anywhere}
.card-meta{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:9px;font-size:12.5px;color:var(--muted)}
.card-meta span{display:inline-flex;align-items:center;gap:6px}
.card-meta svg.i{width:13px;height:13px}
.card-note{
  margin:10px 0 0;padding-top:9px;border-top:1px solid var(--line);font-size:13px;color:var(--ink-soft);
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;letter-spacing:.06em;color:var(--muted)}
.badge::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor}
.badge.warm{color:var(--accent-warm)}
.card-badges{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:9px}
.warnbar{border:1px solid #E2C9B8;background:#F6E9E1;color:#5A3A28;border-radius:var(--radius);padding:10px 14px;font-size:13.5px}
.warnbar b{font-weight:600}
.card-mail{
  margin-top:12px;width:100%;display:flex;align-items:center;justify-content:space-between;
  padding:9px 12px;border-radius:999px;background:var(--ink);color:var(--bg);font-size:13px;font-weight:500;
}
.card-mail:hover{background:#1A2820}
.card-mail[disabled]{background:var(--bg-alt);color:var(--faint);cursor:default}
.card-sent{font-size:12px;color:var(--faint);margin-top:7px;text-align:center}
.card.is-placeholder{opacity:.35;border-style:dashed;box-shadow:none}
.ghost{
  position:fixed;z-index:200;pointer-events:none;margin:0;
  box-shadow:var(--shadow-lift);transform:rotate(1.2deg) scale(1.02);cursor:grabbing;
  border-color:var(--line-sage);
}
body.dragging, body.dragging *{cursor:grabbing!important}
.card.is-pressing{transform:scale(.985);transition:transform .2s}

/* ---------- Overlays ---------- */
.overlay{
  position:fixed;inset:0;z-index:100;background:rgba(35,51,42,.32);
  display:none;align-items:center;justify-content:center;padding:28px;
  -webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);
}
.overlay.open{display:flex;animation:fade .18s ease-out}
@keyframes fade{from{opacity:0}to{opacity:1}}
.panel{
  background:var(--bg);border-radius:6px;width:100%;max-width:1100px;max-height:100%;
  display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 80px -20px rgba(35,51,42,.45);
}
.panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 26px;border-bottom:1px solid var(--line)}
.close{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:var(--muted);border:1px solid var(--line)}
.close:hover{color:var(--ink);border-color:var(--ink)}

/* Detail */
.detail{height:min(860px,100%)}
.detail-body{flex:1;min-height:0;display:grid;grid-template-columns:360px 1fr}
.detail-side > *{flex-shrink:0}
.detail-side{background:var(--bg-alt);padding:28px 28px 22px;overflow-y:auto;border-right:1px solid var(--line);display:flex;flex-direction:column}
.detail-name{font-family:var(--serif);font-size:38px;line-height:1.05;font-weight:500;margin:10px 0 2px;letter-spacing:-.01em;overflow-wrap:anywhere}
.detail-firm{font-family:var(--serif);font-style:italic;font-size:23px;line-height:1.2;color:var(--sage);min-height:4px;overflow-wrap:anywhere}
.stage-select{
  margin-top:20px;display:flex;align-items:center;gap:10px;border:1px solid var(--line-sage);border-radius:999px;
  padding:0 14px;background:var(--surface);
}
.stage-select select{flex:1;border:0;background:transparent;padding:10px 0;outline:0;font-weight:500;-webkit-appearance:none;appearance:none}
.fields{margin-top:22px;border-top:1px solid var(--line-sage)}
.field{display:grid;grid-template-columns:1fr auto;align-items:end;gap:8px;padding:10px 0 9px;border-bottom:1px solid var(--line-sage)}
.field .label{grid-column:1/-1;font-size:10.5px;margin-bottom:-4px}
.field input,.field select{
  width:100%;border:0;background:transparent;outline:0;padding:3px 0;font-size:15px;color:var(--ink);
  border-radius:0;-webkit-appearance:none;appearance:none;min-height:28px;
}
.field input::placeholder{color:var(--faint)}
.field input:focus{box-shadow:0 1px 0 var(--ink)}
.fact{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-sage);color:var(--ink);text-decoration:none;background:var(--surface)}
.fact:hover{border-color:var(--ink)}
.fact.off{opacity:.35;pointer-events:none}
.extra{border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);padding:16px 20px 12px}
.extra-head{display:flex;justify-content:space-between;align-items:center;gap:12px}
.extra-head .add-field{margin:0}
.extra-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:0 26px;margin-top:4px}
.extra-grid .field{border-bottom-color:var(--line)}
.extra-empty{margin:8px 0 2px;color:var(--faint);font-size:13.5px}
.extra .field:last-child{border-bottom-color:var(--line)}
.field textarea{width:100%;border:0;background:transparent;outline:0;padding:3px 0;font-size:15px;color:var(--ink);resize:vertical;line-height:1.5;font-family:inherit}
.field textarea:focus{box-shadow:0 1px 0 var(--ink)}
.fact-sm{width:26px;height:26px;color:var(--faint);border-color:transparent;background:transparent;opacity:.6}
.fact-sm svg.i{width:13px;height:13px}
.field:hover .fact-sm,.fact-sm:focus{opacity:1}
.fact-sm:hover{color:var(--accent-warm);border-color:var(--line-sage)}
.add-field{margin-top:14px;color:var(--sage);font-size:13.5px;font-weight:500}
.add-field:hover{color:var(--ink)}
.side-foot{margin-top:auto;padding-top:22px;display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12.5px;color:var(--faint)}
.danger{color:var(--accent-warm);font-size:13px}
.danger:hover{text-decoration:underline}
.saved{transition:opacity .3s}

.detail-main{padding:28px 32px;overflow-y:auto;display:flex;flex-direction:column;gap:18px}
.main-title{font-family:var(--serif);font-weight:500;font-size:30px;line-height:1.1;margin:8px 0 0}
.quick{display:flex;flex-wrap:wrap;gap:10px}
.compose{border:1px solid var(--line-sage);border-radius:var(--radius);background:var(--surface)}
.compose textarea{
  width:100%;min-height:110px;border:0;background:transparent;resize:vertical;outline:0;
  padding:16px 18px;font-size:15px;line-height:1.6;display:block;
}
.compose textarea::placeholder{color:var(--faint)}
.compose-foot{display:flex;justify-content:space-between;align-items:center;padding:10px 12px 10px 18px;border-top:1px solid var(--line);font-size:12.5px;color:var(--faint)}
.timeline{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.tl{padding:16px 0;border-bottom:1px solid var(--line);display:grid;grid-template-columns:132px 1fr auto;gap:16px;align-items:start}
.tl-date{font-size:12.5px;color:var(--faint);line-height:1.5;padding-top:2px}
.tl-text{white-space:pre-wrap;overflow-wrap:anywhere}
.tl.sys .tl-text{color:var(--muted);font-size:13.5px}
.tl.sys .tl-text::before{content:"— ";color:var(--faint)}
.tl-del{color:var(--faint);opacity:0;transition:opacity .15s;width:26px;height:26px;display:grid;place-items:center;border-radius:50%}
.tl:hover .tl-del{opacity:1}
.tl-del:hover{color:var(--accent-warm)}
@media (hover:none){.tl-del{opacity:.6}}
.tl-empty{padding:22px 0;color:var(--faint);font-size:14px}

/* Import / Einstellungen */
.sheet{max-width:980px;height:min(820px,100%)}
.sheet-body{flex:1;min-height:0;overflow-y:auto;padding:26px 28px}
.sheet-foot{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px 26px;border-top:1px solid var(--line);flex-wrap:wrap}
.tabs{display:flex;gap:24px;border-bottom:1px solid var(--line);margin-bottom:22px}
.tab{padding:0 0 12px;margin-bottom:-1px;color:var(--muted);font-weight:500;border-bottom:1px solid transparent}
.tab.on{color:var(--ink);border-bottom-color:var(--ink)}
.h-serif{font-family:var(--serif);font-weight:500;font-size:34px;line-height:1.08;margin:6px 0 4px;letter-spacing:-.01em}
.lead-text{color:var(--muted);max-width:640px;margin:0 0 18px}
.paste{
  width:100%;min-height:170px;border:1px solid var(--line-sage);border-radius:var(--radius);background:var(--surface);
  padding:14px 16px;font-size:14px;line-height:1.6;outline:0;resize:vertical;
  font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
}
.paste:focus,.input:focus,.area:focus{border-color:var(--ink)}
.hint{font-size:13px;color:var(--faint);margin-top:8px}
.file-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:12px}
.preview{width:100%;border-collapse:collapse;margin-top:22px;font-size:13.5px}
.preview th{text-align:left;font-weight:500;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding:0 10px 10px 0;border-bottom:1px solid var(--line-sage)}
.preview td{padding:10px 10px 10px 0;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}
.preview tr.dup td{color:var(--faint)}
.preview input[type=checkbox]{accent-color:var(--ink);width:16px;height:16px}
.dup-tag{display:block;font-size:11px;color:var(--accent-warm);margin-top:2px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px 22px}
.fl{display:flex;flex-direction:column;gap:6px}
.fl .label{font-size:10.5px}
.input,.area{
  width:100%;border:1px solid var(--line-sage);border-radius:var(--radius);background:var(--surface);
  padding:10px 12px;outline:0;font-size:15px;
}
.area{min-height:280px;resize:vertical;line-height:1.6}
select.input{-webkit-appearance:none;appearance:none}
.span2{grid-column:1/-1}
.section{padding:0 0 28px;margin:0 0 28px;border-bottom:1px solid var(--line)}
.section:last-child{border-bottom:0;margin-bottom:0}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.chip{border:1px solid var(--line-sage);border-radius:999px;padding:4px 11px;font-size:12.5px;color:var(--ink-soft);background:var(--surface);font-family:ui-monospace,Menlo,monospace}
.chip:hover{border-color:var(--ink)}
.mail-preview{border:1px solid var(--line);border-radius:var(--radius);background:var(--surface);padding:18px 20px;white-space:pre-wrap;font-size:14px;color:var(--ink-soft)}
.mail-preview .subj{font-weight:600;color:var(--ink);display:block;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.radio-row{display:flex;flex-wrap:wrap;gap:10px}
.radio-row label{display:flex;align-items:center;gap:8px;border:1px solid var(--line-sage);border-radius:999px;padding:8px 14px;cursor:pointer;font-size:14px;background:var(--surface)}
.radio-row input{accent-color:var(--ink)}
.radio-row label:has(input:checked){border-color:var(--ink)}

/* Hinweis */
.toast{
  position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translate(-50%,20px);
  background:var(--ink);color:var(--bg);padding:11px 12px 11px 20px;border-radius:999px;font-size:14px;
  display:flex;align-items:center;gap:14px;opacity:0;pointer-events:none;transition:opacity .2s, transform .2s;z-index:300;
  max-width:calc(100% - 32px);
}
.toast.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}
.toast button{color:var(--bg);text-decoration:underline;text-underline-offset:3px;padding:0 8px;font-size:14px}
.toast:not(.has-action){padding-right:20px}

.hidden{display:none!important}
.boot{margin:auto;max-width:520px;text-align:center;padding:40px 16px}
.boot-title{font-family:var(--serif);font-size:30px;line-height:1.15;margin:10px 0 8px}
.boot-text{color:var(--muted);margin:0}
.err-bar{position:fixed;left:16px;right:16px;top:12px;z-index:400;background:#F6E9E1;color:#5A3A28;border:1px solid #E2C9B8;border-radius:var(--radius);padding:10px 14px;font-size:13.5px;display:flex;gap:12px;align-items:flex-start}
.err-bar button{margin-left:auto;text-decoration:underline;font-size:13px;color:inherit}
@media (pointer:coarse){input,select,textarea{font-size:16px!important}}

@media (max-width:1180px){
  .stats{display:none}
}
@media (max-width:820px){
  .top{flex-wrap:wrap;gap:12px 16px;padding:14px 16px}
  .top .spacer{display:none}
  .search{order:5;flex:1 1 100%}
  .brand .label{display:none}
  .board{padding:16px;gap:14px;scroll-padding:0 16px}
  .col{flex-basis:82vw}
  .overlay{padding:0}
  .panel{border-radius:0;height:100%;max-height:none}
  .detail-body{grid-template-columns:1fr;overflow-y:auto}
  .detail-side,.detail-main{overflow:visible}
  .detail-side{border-right:0;border-bottom:1px solid var(--line)}
  .detail-main{padding:24px 20px}
  .tl{grid-template-columns:1fr auto}
  .tl-date{grid-column:1/-1;padding:0}
  .grid2{grid-template-columns:1fr}
  .sheet-body{padding:22px 16px}
  .panel-head,.sheet-foot{padding:14px 16px}
  .preview .opt{display:none}
}
</style>
</head>
<body>

<header class="top">
  <div class="brand">
    <span class="word">raum<i>werk</i></span>
    <span class="label">Leads</span>
  </div>
  <div class="stats" id="stats"></div>
  <div class="spacer"></div>
  <label class="search">
    <svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>
    <input id="search" type="search" placeholder="Suchen – Name, Firma, Ort …" autocomplete="off">
  </label>
  <button type="button" class="btn btn-quiet" id="openSettings" title="Einstellungen">
    <svg class="i" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>
    Einstellungen
  </button>
  <button type="button" class="btn btn-primary" id="openImport">
    <svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
    Leads einfügen
  </button>
</header>

<main class="board" id="board">
  <div class="boot" id="boot">
    <span class="label">raumwerk / Leads</span>
    <p class="boot-title">Das Board wird geladen …</p>
    <p class="boot-text">Bleibt diese Meldung stehen, wird die Seite in einer Vorschau ohne JavaScript angezeigt. Bitte den Link direkt in Safari oder Chrome öffnen.</p>
  </div>
</main>

<!-- Lead-Detail -->
<div class="overlay" id="detailOverlay">
  <section class="panel detail" role="dialog" aria-modal="true" aria-label="Lead">
    <div class="detail-body">
      <aside class="detail-side">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
          <span class="label" id="dSince"></span>
          <button type="button" class="close" data-close aria-label="Schließen"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        </div>
        <h1 class="detail-name" id="dName"></h1>
        <div class="detail-firm" id="dFirm"></div>

        <label class="stage-select">
          <span class="label" style="font-size:10.5px">Phase</span>
          <select id="dStage"></select>
          <svg class="i" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg>
        </label>

        <div class="fields" id="dFields"></div>

        <div class="side-foot">
          <button type="button" class="danger" id="dDelete">Lead löschen</button>
          <span class="saved" id="dSaved">Änderungen werden gespeichert</span>
        </div>
      </aside>

      <div class="detail-main">
        <div>
          <span class="label">Verlauf &amp; Notizen</span>
          <h2 class="main-title">Was ist passiert, <span class="it">was kommt als Nächstes.</span></h2>
        </div>
        <div class="warnbar hidden" id="dWarn"></div>
        <section class="extra" id="dExtra"></section>
        <div class="quick" id="dQuick"></div>
        <div class="compose">
          <textarea id="dNote" placeholder="Notiz schreiben – z. B. „Rückruf Donnerstag, interessiert an Roomtour für Neubauprojekt.“"></textarea>
          <div class="compose-foot">
            <span>⌘ / Strg + Enter zum Speichern</span>
            <button type="button" class="btn btn-primary btn-sm" id="dAddNote">Notiz speichern</button>
          </div>
        </div>
        <ul class="timeline" id="dTimeline"></ul>
      </div>
    </div>
  </section>
</div>

<!-- Leads einfügen -->
<div class="overlay" id="importOverlay">
  <section class="panel sheet" role="dialog" aria-modal="true" aria-label="Leads einfügen">
    <div class="panel-head">
      <span class="label">Leads einfügen</span>
      <button type="button" class="close" data-close aria-label="Schließen"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="sheet-body">
      <div class="tabs">
        <button type="button" class="tab on" data-tab="paste">Liste einfügen</button>
        <button type="button" class="tab" data-tab="single">Einzeln anlegen</button>
      </div>

      <div data-pane="paste">
        <h2 class="h-serif">Neue Kontakte. <span class="it">Direkt übernehmen.</span></h2>
        <p class="lead-text">Einfach hineinkopieren – aus Google Sheets, Excel, einer E-Mail oder WhatsApp. Eine Zeile pro Lead, oder Blöcke wie „Name: …“, „Telefon: …“ mit Leerzeile dazwischen. Name, Firma, Telefon und E-Mail werden automatisch erkannt.</p>
        <textarea class="paste" id="pasteArea" placeholder="Max Muster	Muster Immobilien GmbH	+49 171 2345678	max@muster-immobilien.de	München
Anna Beispiel; Beispiel &amp; Partner; 0151 9876543; a.beispiel@beispiel.de

Name: Jonas Weber
Firma: Weber Wohnbau
Telefon: 089 123456
E-Mail: weber@wohnbau.de"></textarea>
        <div class="file-row">
          <label class="btn btn-line btn-sm" for="leadFile" style="cursor:pointer">
            <svg class="i" viewBox="0 0 24 24"><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 15v4h14v-4"/></svg>
            Datei wählen
          </label>
          <span class="hint" id="leadFileHint" style="margin:0">Excel (.xlsx), Word (.docx), CSV oder Text – der Inhalt erscheint oben zur Kontrolle.</span>
          <input type="file" id="leadFile" accept=".xlsx,.docx,.csv,.tsv,.txt,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
        </div>
        <div class="grid2" style="margin-top:16px">
          <label class="fl"><span class="label">Quelle (optional)</span><input class="input" id="pasteSource" placeholder="z. B. Liste Oktober"></label>
        </div>
        <div id="previewWrap"></div>
      </div>

      <div data-pane="single" class="hidden">
        <h2 class="h-serif">Ein Lead. <span class="it">Mit allen Angaben.</span></h2>
        <p class="lead-text">Pflicht ist nur der Name oder die Firma. Alles Weitere lässt sich später im Lead ergänzen.</p>
        <div class="grid2" id="singleForm">
          <label class="fl"><span class="label">Anrede</span>
            <select class="input" name="anrede"><option value="">–</option><option>Herr</option><option>Frau</option></select></label>
          <label class="fl"><span class="label">Name</span><input class="input" name="name" placeholder="Vor- und Nachname"></label>
          <label class="fl"><span class="label">Firma</span><input class="input" name="firma"></label>
          <label class="fl"><span class="label">Ort</span><input class="input" name="ort"></label>
          <label class="fl"><span class="label">Telefon</span><input class="input" name="telefon" type="tel"></label>
          <label class="fl"><span class="label">E-Mail</span><input class="input" name="email" type="email" autocapitalize="off"></label>
          <label class="fl"><span class="label">Website</span><input class="input" name="website" autocapitalize="off"></label>
          <label class="fl"><span class="label">Quelle</span><input class="input" name="quelle"></label>
          <label class="fl span2"><span class="label">Erste Notiz (optional)</span><textarea class="input" name="notiz" rows="3" style="resize:vertical"></textarea></label>
        </div>
      </div>
    </div>
    <div class="sheet-foot">
      <span class="hint" id="importHint" style="margin:0">Neue Leads landen in „Neuer Lead“.</span>
      <button type="button" class="btn btn-primary" id="importGo" disabled>Leads übernehmen</button>
    </div>
  </section>
</div>

<!-- Einstellungen -->
<div class="overlay" id="settingsOverlay">
  <section class="panel sheet" role="dialog" aria-modal="true" aria-label="Einstellungen">
    <div class="panel-head">
      <span class="label">Einstellungen</span>
      <button type="button" class="close" data-close aria-label="Schließen"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="sheet-body">
      <div class="section">
        <span class="label">01 / E-Mail-Vorlage</span>
        <h2 class="h-serif">Die erste Nachricht. <span class="it">Persönlich vorbereitet.</span></h2>
        <p class="lead-text">Diese Vorlage öffnet sich fertig ausgefüllt in Gmail. Platzhalter werden mit den Angaben des Leads ersetzt – vor dem Senden kann alles noch angepasst werden.</p>
        <div class="grid2">
          <label class="fl span2"><span class="label">Betreff</span><input class="input" id="sSubject"></label>
          <label class="fl span2"><span class="label">Text</span><textarea class="area" id="sBody"></textarea></label>
        </div>
        <div class="chips" id="sChips"></div>
        <p class="hint">Antippen fügt den Platzhalter an der Cursor-Position ein. <code>{{begruessung}}</code> wird zu „Guten Tag Herr Weber“, „Guten Tag Frau Weber“ oder „Guten Tag“, je nach Angaben.</p>
        <div style="margin-top:18px">
          <span class="label">Vorschau</span>
          <div class="mail-preview" id="sPreview" style="margin-top:8px"></div>
        </div>
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
          <button type="button" class="btn btn-line btn-sm" id="sResetTpl">Testvorlage wiederherstellen</button>
        </div>
      </div>

      <div class="section">
        <span class="label">02 / Gmail</span>
        <h2 class="h-serif">Wo soll die Mail <span class="it">aufgehen?</span></h2>
        <p class="lead-text">Auf iPad und iPhone öffnet „Automatisch“ die Gmail-App, am Computer Gmail im Browser. Falls auf dem iPad nichts passiert, ist die Gmail-App nicht installiert – dann „Gmail im Browser“ wählen.</p>
        <div class="radio-row" id="sMode">
          <label><input type="radio" name="mode" value="auto"> Automatisch</label>
          <label><input type="radio" name="mode" value="app"> Gmail-App</label>
          <label><input type="radio" name="mode" value="web"> Gmail im Browser</label>
          <label><input type="radio" name="mode" value="mailto"> Standard-Mailprogramm</label>
        </div>
        <div class="grid2" style="margin-top:18px">
          <label class="fl"><span class="label">Ihr Name (für {{absender}})</span><input class="input" id="sSender" placeholder="Vor- und Nachname"></label>
          <label class="fl"><span class="label">Gmail-Konto im Browser</span>
            <select class="input" id="sAccount">
              <option value="0">Erstes angemeldetes Konto</option>
              <option value="1">Zweites Konto</option>
              <option value="2">Drittes Konto</option>
            </select></label>
        </div>
      </div>

      <div class="section">
        <span class="label">03 / Daten</span>
        <h2 class="h-serif">Ihre Leads. <span class="it">Sicher aufbewahrt.</span></h2>
        <p class="lead-text" id="sDataText">Alle Daten liegen nur in diesem Browser auf diesem Gerät – ohne Server, ohne Kosten. Laden Sie regelmäßig eine Sicherung herunter. Damit lassen sich die Leads auch auf ein anderes Gerät übertragen.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button type="button" class="btn btn-primary btn-sm" id="sExport">Sicherung herunterladen</button>
          <label class="btn btn-line btn-sm" for="sImportFile" style="cursor:pointer">Sicherung einspielen</label>
          <button type="button" class="btn btn-line btn-sm" id="sCsv">Als Tabelle (CSV)</button>
          <input type="file" id="sImportFile" accept=".json,application/json" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none">
        </div>
        <p class="hint" id="sLastBackup"></p>
        <p class="hint" id="sVersion"></p>
        <div style="margin-top:22px">
          <button type="button" class="danger" id="sWipe">Alle Leads löschen</button>
        </div>
      </div>
    </div>
  </section>
</div>

<div class="toast" id="toast"><span id="toastText"></span><button type="button" id="toastAction" class="hidden"></button></div>

<script>
function rwShowError(msg){
  try{
    let bar = document.getElementById("errBar");
    if(!bar){
      bar = document.createElement("div"); bar.id = "errBar"; bar.className = "err-bar";
      bar.innerHTML = '<span></span><button type="button">Ausblenden</button>';
      bar.querySelector("button").onclick = function(){ bar.remove(); };
      document.body.appendChild(bar);
    }
    bar.querySelector("span").textContent = "Fehler: " + msg + " – bitte Seite neu laden. Ihre Daten bleiben erhalten.";
  }catch(e){}
}
window.addEventListener("error", function(e){ rwShowError(e.message || "Unbekannt"); });
window.addEventListener("unhandledrejection", function(e){ rwShowError((e.reason && e.reason.message) || String(e.reason)); });
(function(){
"use strict";

/* ================= Grundlagen ================= */
const STAGES = [
  {id:"neu",            no:"01", title:"Neuer",       it:"Lead."},
  {id:"nicht_erreicht", no:"02", title:"Telefonisch", it:"nicht erreicht."},
  {id:"nachhaken",      no:"03", title:"Nach",        it:"haken."},
  {id:"email",          no:"04", title:"E-Mail",      it:"raus."},
  {id:"termin",         no:"05", title:"Ersttermin",  it:"gebucht."},
  {id:"closed",         no:"06", title:"Geclosed.",   it:""}
];
const STAGE_NAME = {
  neu:"Neuer Lead", nicht_erreicht:"Telefonisch nicht erreicht", nachhaken:"Nachhaken",
  email:"E-Mail raus", termin:"Ersttermin gebucht", closed:"Geclosed"
};
const KEY = "raumwerk-crm-v1";

const DEFAULT_SUBJECT = "Ihre Immobilien – als ruhige Roomtour aus vorhandenen Fotos";
const DEFAULT_BODY =
`{{begruessung}},

ich bin auf Ihre aktuellen Objekte aufmerksam geworden und möchte Ihnen kurz raumwerk vorstellen.

Aus Ihren vorhandenen Fotos gestalten wir ruhige, stimmige Immobilienvideos – als geführte Roomtour für Ihre Website, das Exposé und Social Media. Auf Wunsch verfeinern wir zusätzlich Licht und Farben oder richten leere Räume virtuell ein. Ihre Immobilie bleibt dabei immer wiedererkennbar.

Gern zeige ich Ihnen an einem Beispiel, wie das bei einem Ihrer Objekte aussehen könnte.

Hätten Sie in den nächsten Tagen 15 Minuten Zeit für ein kurzes Gespräch?

Herzliche Grüße
{{absender}}

raumwerk
ws-strategy.de`;

const PLACEHOLDERS = ["begruessung","vorname","nachname","name","firma","ort","absender"];

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);
const now = () => new Date().toISOString();

const ICON = {
  phone:'<svg class="i" viewBox="0 0 24 24"><path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/></svg>',
  mail:'<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="M4 7l8 6 8-6"/></svg>',
  pin:'<svg class="i" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.2"/></svg>',
  web:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/></svg>',
  arrow:'<svg class="i arr" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  cal:'<svg class="i" viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="14" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/></svg>',
  x:'<svg class="i" viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  retry:'<svg class="i" viewBox="0 0 24 24"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4h4"/></svg>',
  check:'<svg class="i" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};

/* ================= Speicher ================= */
function defaultDb(){
  return {version:1, leads:[], settings:{
    subject:DEFAULT_SUBJECT, body:DEFAULT_BODY, mode:"auto", account:"0", sender:"", lastBackup:null, fields:[]
  }};
}
// Lokaler Modus: Das Python-Skript liefert die Seite aus und speichert in eine Datei.
const SERVER = !!window.RW_SERVER;
function normalize(d){
  const base = defaultDb();
  d = (d && typeof d === "object") ? d : {};
  d.version = 1;
  d.settings = Object.assign(base.settings, d.settings || {});
  d.leads = Array.isArray(d.leads) ? d.leads : [];
  if(!Array.isArray(d.settings.fields)) d.settings.fields = [];
  // Felder, die nur an Leads hängen, in die Liste aufnehmen
  d.leads.forEach(l => Object.keys(l.extra || {}).forEach(k => { if(!d.settings.fields.includes(k)) d.settings.fields.push(k); }));
  return d;
}
let db = SERVER ? defaultDb() : load();
let loaded = !SERVER;
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(raw) return normalize(JSON.parse(raw));
  }catch(e){ console.warn(e); }
  return defaultDb();
}
let storageOk = true;
let rev = 0, dirty = false, pushing = false, pushTimer = null, retryTimer = null;
function save(){
  if(!loaded) return;          // nie leere Daten über die Datei schreiben
  if(SERVER){
    dirty = true;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 250);
    return;
  }
  try{ localStorage.setItem(KEY, JSON.stringify(db)); storageOk = true; }
  catch(e){
    if(storageOk) toast("Diese Ansicht kann nicht dauerhaft speichern – bitte die Seite direkt im Browser öffnen.");
    storageOk = false;
  }
}
function push(keepalive){
  if(!dirty || (pushing && !keepalive)) return;
  const force = pushing;        // Seite wird geschlossen, während noch gespeichert wird
  pushing = true; dirty = false;
  clearTimeout(retryTimer);
  return fetch("/api/daten", {
    method:"POST", keepalive:!!keepalive,
    headers:{"Content-Type":"application/json", "X-Raumwerk":"1"},
    body:JSON.stringify({rev, force, data:db})
  }).then(r => {
    if(r.status === 409){
      // Ein anderes Fenster hat inzwischen gespeichert: beide Stände zusammenführen
      return fetch("/api/daten", {cache:"no-store"}).then(x => x.json()).then(j => {
        db = normalize(mergeDb(normalize(j.data), db)); rev = j.rev; dirty = true; storageOk = true;
        render(); if(openId) renderDetail();
        toast("Änderungen aus einem anderen Fenster übernommen.");
      });
    }
    if(!r.ok) throw new Error("HTTP " + r.status);
    return r.json().then(j => { rev = j.rev; storageOk = true; });
  }).catch(() => {
    dirty = true;
    if(storageOk) toast("Speichern fehlgeschlagen – läuft das Python-Fenster noch? Neuer Versuch läuft.");
    storageOk = false;
    retryTimer = setTimeout(push, 4000);
  }).finally(() => {
    pushing = false;
    if(dirty && storageOk) push();
  });
}
function mergeDb(server, local){
  const gone = new Set([...(server.deleted||[]), ...(local.deleted||[])]);
  const map = new Map();
  server.leads.forEach(l => { if(!gone.has(l.id)) map.set(l.id, l); });
  local.leads.forEach(l => {
    if(gone.has(l.id)) return;
    const o = map.get(l.id);
    if(!o){ map.set(l.id, l); return; }
    const newer = (l.updated||"") >= (o.updated||"") ? l : o, older = newer === l ? o : l;
    const ids = new Set((newer.notes||[]).map(n => n.id));
    const notes = [...(newer.notes||[]), ...(older.notes||[]).filter(n => !ids.has(n.id))]
      .filter(n => !gone.has(n.id)).sort((a,b) => a.ts < b.ts ? 1 : a.ts > b.ts ? -1 : 0);
    map.set(l.id, Object.assign({}, newer, {notes}));
  });
  return Object.assign({}, local, {leads:[...map.values()], deleted:[...gone].slice(-2000)});
}
function forget(id){ db.deleted = (db.deleted || []).concat(id).slice(-2000); }
function fetchData(){
  return fetch("/api/daten", {cache:"no-store"})
    .then(r => { if(!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(j => { db = normalize(j.data); rev = j.rev; loaded = true; render(); });
}
const byId = id => db.leads.find(l => l.id === id);

/* ================= Hilfen ================= */
function fmtDate(iso, withTime=true){
  if(!iso) return "";
  const d = new Date(iso);
  const date = d.toLocaleDateString("de-DE",{day:"numeric",month:"short",year: d.getFullYear()!==new Date().getFullYear() ? "numeric" : undefined});
  return withTime ? date + ", " + d.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}) + " Uhr" : date;
}
function dayDiff(iso){
  const a = new Date(iso); a.setHours(0,0,0,0);
  const b = new Date(); b.setHours(0,0,0,0);
  return Math.round((b - a) / 864e5);
}
function rel(iso){
  const d = dayDiff(iso);
  if(d <= 0) return "heute";
  if(d === 1) return "gestern";
  if(d < 7) return "vor " + d + " Tagen";
  if(d < 14) return "vor 1 Woche";
  if(d < 60) return "vor " + Math.floor(d/7) + " Wochen";
  return fmtDate(iso, false);
}
function todayStr(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function dueInfo(l){
  if(!l.wiedervorlage || l.stage === "closed") return null;
  const t = todayStr();
  if(l.wiedervorlage < t) return {cls:"warm", text:"Wiedervorlage überfällig"};
  if(l.wiedervorlage === t) return {cls:"warm", text:"Wiedervorlage heute"};
  const d = new Date(l.wiedervorlage + "T00:00");
  return {cls:"", text:"Wiedervorlage " + d.toLocaleDateString("de-DE",{day:"numeric",month:"short"})};
}
function splitName(n){
  const parts = String(n||"").trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return {vor:"", nach:""};
  if(parts.length === 1) return {vor:"", nach:parts[0]};
  return {vor:parts[0], nach:parts.slice(1).join(" ")};
}
function telHref(t){ return "tel:" + String(t||"").replace(/[^\d+]/g,""); }
function webHref(w){ w = String(w||"").trim(); return /^https?:\/\//i.test(w) ? w : "https://" + w; }
function displayName(l){ return l.name || l.firma || "Ohne Namen"; }
function normPhone(t){ return String(t||"").replace(/\D/g,"").replace(/^00/,"").replace(/^0/,"49"); }

function addHistory(l, text, sys=true){
  l.notes = l.notes || [];
  l.notes.unshift({id:uid(), ts:now(), text, sys});
}
function touch(l){ l.updated = now(); }

function setStage(l, stage, note=true){
  if(l.stage === stage) return;
  const from = l.stage;
  l.stage = stage;
  const col = db.leads.filter(x => x.stage === stage && x !== l);
  l.order = col.length ? Math.min(...col.map(x => x.order || 0)) - 1 : 0;
  if(note) addHistory(l, "Verschoben: " + STAGE_NAME[from] + " → " + STAGE_NAME[stage]);
  touch(l);
}

/* ================= E-Mail ================= */
function fillTemplate(tpl, l){
  const {vor, nach} = splitName(l.name);
  let gruss = "Guten Tag";
  if(l.anrede && nach) gruss = "Guten Tag " + l.anrede + " " + nach;
  else if(!l.anrede && vor && nach) gruss = "Guten Tag " + vor + " " + nach;
  const map = {
    begruessung:gruss, vorname:vor, nachname:nach, name:l.name||"", firma:l.firma||"",
    ort:l.ort||"", absender:db.settings.sender||""
  };
  return String(tpl||"")
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (m,k) => k in map ? map[k] : m)
    .replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}
function isAppleTouch(){
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}
// Sperrvermerke aus importierten Spalten (z. B. Sterneintrag, Werbewiderspruch)
function warnings(l){
  const w = [];
  for(const [k, v] of Object.entries(l.extra || {})){
    if(!/^\s*ja\b/i.test(v || "")) continue;
    if(/werbesperre|sterneintrag|robinson/i.test(k)) w.push({type:"tel", text:"Keine Werbeanrufe (Sterneintrag)"});
    else if(/werbewiderspruch|widerspruch/i.test(k)) w.push({type:"all", text:"Werbewiderspruch im Impressum"});
  }
  return w;
}
function okToContact(l, how){
  const w = warnings(l).filter(x => x.type === "all" || x.type === how);
  if(!w.length) return true;
  return confirm(displayName(l) + ":\n" + w.map(x => "• " + x.text).join("\n") +
    "\n\n" + (how === "tel" ? "Trotzdem anrufen?" : "Trotzdem E-Mail vorbereiten?"));
}
function openMail(l){
  if(!l.email){ toast("Für diesen Lead ist keine E-Mail-Adresse hinterlegt."); return; }
  if(!okToContact(l, "mail")) return;
  const s = db.settings;
  const subject = fillTemplate(s.subject, l);
  const body = fillTemplate(s.body, l);
  const e = encodeURIComponent;
  let mode = s.mode;
  if(mode === "auto") mode = isAppleTouch() ? "app" : "web";
  if(mode === "app"){
    location.href = "googlegmail:///co?to=" + e(l.email) + "&subject=" + e(subject) + "&body=" + e(body);
  }else if(mode === "mailto"){
    location.href = "mailto:" + e(l.email) + "?subject=" + e(subject) + "&body=" + e(body);
  }else{
    const url = "https://mail.google.com/mail/u/" + e(s.account||"0") + "/?view=cm&fs=1&tf=1&to=" + e(l.email) + "&su=" + e(subject) + "&body=" + e(body);
    const w = window.open(url, "_blank");
    if(w){ try{ w.opener = null; }catch(_){} }
    else location.href = url;
  }
  l.lastMail = now();
  addHistory(l, "E-Mail in Gmail vorbereitet: „" + subject + "“");
  touch(l); save(); render();
  if(openId === l.id) renderDetail();
}

/* ================= Board ================= */
const board = $("#board");
let query = "";

function matches(l){
  if(!query) return true;
  const hay = [l.name,l.firma,l.email,l.telefon,l.ort,l.quelle,l.website,...Object.values(l.extra||{}),...(l.notes||[]).map(n=>n.text)].join(" ").toLowerCase();
  return query.split(/\s+/).every(q => hay.includes(q));
}

function cardHtml(l){
  const lastNote = (l.notes||[]).find(n => !n.sys);
  const due = dueInfo(l);
  const meta = [];
  if(l.telefon) meta.push(`<span>${ICON.phone}${esc(l.telefon)}</span>`);
  if(l.attempts) meta.push(`<span>${ICON.retry}${l.attempts}× versucht</span>`);
  const firm = [l.name ? l.firma : "", l.ort].filter(Boolean).join(" · ");
  let mail = "";
  if(l.stage === "email"){
    mail = l.email
      ? `<button type="button" class="card-mail" data-act="mail">In Gmail öffnen ${ICON.arrow}</button>` +
        (l.lastMail ? `<div class="card-sent">Zuletzt vorbereitet ${esc(rel(l.lastMail))}</div>` : "")
      : `<button type="button" class="card-mail" disabled>Keine E-Mail hinterlegt</button>`;
  }
  return `<article class="card" data-id="${esc(l.id)}">
    <div class="card-top"><span class="card-name">${esc(displayName(l))}</span><span class="card-age">${esc(rel(l.updated||l.created))}</span></div>
    ${firm ? `<div class="card-firm">${esc(firm)}</div>` : ""}
    ${meta.length ? `<div class="card-meta">${meta.join("")}</div>` : ""}
    ${due || warnings(l).length ? `<div class="card-badges">${due ? `<span class="badge ${due.cls}">${esc(due.text)}</span>` : ""}${warnings(l).map(w => `<span class="badge warm">${esc(w.text)}</span>`).join("")}</div>` : ""}
    ${lastNote ? `<p class="card-note">${esc(lastNote.text)}</p>` : ""}
    ${mail}
  </article>`;
}

function render(){
  const scrolls = {};
  $$(".col", board).forEach(c => scrolls[c.dataset.stage] = $(".col-list", c).scrollTop);
  const boardScroll = board.scrollLeft;

  board.innerHTML = STAGES.map(s => {
    const leads = db.leads.filter(l => l.stage === s.id && matches(l)).sort((a,b) => (a.order||0) - (b.order||0));
    return `<section class="col" data-stage="${s.id}">
      <header class="col-head">
        <div><span class="label">${s.no} / ${esc(STAGE_NAME[s.id])}</span>
        <h2>${esc(s.title)}${s.it ? " <i>" + esc(s.it) + "</i>" : ""}</h2></div>
        <span class="col-count">${leads.length}</span>
      </header>
      <div class="col-list">${leads.map(cardHtml).join("") || `<div class="col-empty">${query ? "Keine Treffer" : "Leads hierher ziehen"}</div>`}</div>
    </section>`;
  }).join("");

  $$(".col", board).forEach(c => { const v = scrolls[c.dataset.stage]; if(v) $(".col-list", c).scrollTop = v; });
  board.scrollLeft = boardScroll;
  renderStats();
}

function renderStats(){
  const L = db.leads;
  const open = L.filter(l => l.stage !== "closed").length;
  const termine = L.filter(l => l.stage === "termin").length;
  const closed = L.filter(l => l.stage === "closed").length;
  const t = todayStr();
  const due = L.filter(l => l.wiedervorlage && l.wiedervorlage <= t && l.stage !== "closed").length;
  $("#stats").innerHTML =
    `<span><b>${open}</b> offen</span><span><b>${termine}</b> Ersttermine</span><span><b>${closed}</b> geclosed</span>` +
    (due ? `<span class="due"><b>${due}</b> Wiedervorlage fällig</span>` : "");
}

if(SERVER && window.RW_VERSION) $(".brand .label").textContent = "Leads · V " + window.RW_VERSION;
$("#search").addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); render(); });

/* ================= Ziehen & Ablegen (Maus + Touch) ================= */
let press = null;   // gedrückt, aber noch nicht gezogen
let drag = null;    // aktives Ziehen
const HOLD_MS = 230, MOVE_TOL = 8;

board.addEventListener("pointerdown", e => {
  const card = e.target.closest(".card");
  if(!card || e.target.closest("button,a,input")) return;
  if(e.pointerType === "mouse" && e.button !== 0) return;
  press = {id:card.dataset.id, card, x0:e.clientX, y0:e.clientY, x:e.clientX, y:e.clientY, type:e.pointerType, timer:null};
  if(e.pointerType !== "mouse"){
    card.classList.add("is-pressing");
    press.timer = setTimeout(() => { if(press) startDrag(); }, HOLD_MS);
  }
});

document.addEventListener("pointermove", e => {
  if(drag){ drag.x = e.clientX; drag.y = e.clientY; moveDrag(); return; }
  if(!press) return;
  press.x = e.clientX; press.y = e.clientY;
  const dist = Math.hypot(press.x - press.x0, press.y - press.y0);
  if(dist > MOVE_TOL){
    if(press.type === "mouse") startDrag();
    else cancelPress(); // Finger wischt: normal scrollen
  }
});

document.addEventListener("pointerup", e => {
  if(drag){ endDrag(); return; }
  if(!press) return;
  const p = press; cancelPress();
  if(Math.hypot(e.clientX - p.x0, e.clientY - p.y0) <= MOVE_TOL) openDetail(p.id);
});
document.addEventListener("pointercancel", () => { if(drag) endDrag(true); else cancelPress(); });
document.addEventListener("touchmove", e => { if(drag) e.preventDefault(); }, {passive:false});
board.addEventListener("contextmenu", e => { if(e.target.closest(".card")) e.preventDefault(); });

function cancelPress(){
  if(!press) return;
  clearTimeout(press.timer);
  press.card.classList.remove("is-pressing");
  press = null;
}

function startDrag(){
  const p = press; press = null;
  clearTimeout(p.timer);
  p.card.classList.remove("is-pressing");
  const r = p.card.getBoundingClientRect();
  const ghost = p.card.cloneNode(true);
  ghost.classList.add("ghost");
  ghost.style.width = r.width + "px";
  document.body.appendChild(ghost);
  p.card.classList.add("is-placeholder");
  document.body.classList.add("dragging");
  if(navigator.vibrate) try{ navigator.vibrate(12); }catch(_){}
  drag = {id:p.id, card:p.card, ghost, offX:p.x - r.left, offY:p.y - r.top, x:p.x, y:p.y,
          fromStage:byId(p.id).stage, raf:0};
  moveDrag();
  drag.raf = requestAnimationFrame(autoScroll);
}

function colAt(x, y){
  const el = document.elementFromPoint(x, y);
  return el ? el.closest(".col") : null;
}

function moveDrag(){
  const d = drag;
  d.ghost.style.left = (d.x - d.offX) + "px";
  d.ghost.style.top  = (d.y - d.offY) + "px";
  const col = colAt(d.x, d.y);
  $$(".col.is-target").forEach(c => { if(c !== col) c.classList.remove("is-target"); });
  if(!col) return;
  col.classList.add("is-target");
  const list = $(".col-list", col);
  const cards = $$(".card", list).filter(c => c !== d.card);
  let before = null;
  for(const c of cards){
    const r = c.getBoundingClientRect();
    if(d.y < r.top + r.height/2){ before = c; break; }
  }
  if(before){ if(d.card.nextSibling !== before) list.insertBefore(d.card, before); }
  else if(list.lastElementChild !== d.card || d.card.parentNode !== list){
    const empty = $(".col-empty", list);
    list.appendChild(d.card);
    if(empty) list.appendChild(empty);
  }
}

function autoScroll(){
  if(!drag) return;
  const edge = 70, max = 16;
  const br = board.getBoundingClientRect();
  if(drag.x < br.left + edge) board.scrollLeft -= Math.ceil(max * (1 - (drag.x - br.left)/edge));
  else if(drag.x > br.right - edge) board.scrollLeft += Math.ceil(max * (1 - (br.right - drag.x)/edge));
  const col = colAt(drag.x, drag.y);
  if(col){
    const list = $(".col-list", col), lr = list.getBoundingClientRect();
    if(drag.y < lr.top + 50) list.scrollTop -= 10;
    else if(drag.y > lr.bottom - 50) list.scrollTop += 10;
  }
  moveDrag();
  drag.raf = requestAnimationFrame(autoScroll);
}

function endDrag(cancelled){
  const d = drag; drag = null;
  cancelAnimationFrame(d.raf);
  d.ghost.remove();
  document.body.classList.remove("dragging");
  $$(".col.is-target").forEach(c => c.classList.remove("is-target"));
  if(!cancelled){
    const col = d.card.closest(".col");
    const l = byId(d.id);
    if(col && l){
      const stage = col.dataset.stage;
      if(stage !== l.stage){
        addHistory(l, "Verschoben: " + STAGE_NAME[l.stage] + " → " + STAGE_NAME[stage]);
        l.stage = stage; touch(l);
      }
      if(query){
        // Bei aktiver Suche sind nicht alle Karten sichtbar: nur oben einsortieren
        if(stage !== d.fromStage){
          const others = db.leads.filter(x => x.stage === stage && x !== l);
          l.order = others.length ? Math.min(...others.map(x => x.order || 0)) - 1 : 0;
        }
      }else{
        // Reihenfolge aus der sichtbaren Spalte übernehmen
        $$(".card", $(".col-list", col)).forEach((c, i) => { const x = byId(c.dataset.id); if(x) x.order = i; });
      }
      save();
      if(stage !== d.fromStage) toast(esc(displayName(l)) + " → " + STAGE_NAME[stage]);
    }
  }
  render();
}

board.addEventListener("click", e => {
  const btn = e.target.closest("[data-act='mail']");
  if(!btn) return;
  e.stopPropagation();
  const l = byId(btn.closest(".card").dataset.id);
  if(l) openMail(l);
});

/* ================= Overlays ================= */
function openOverlay(el){ el.classList.add("open"); }
function closeOverlay(el){
  el.classList.remove("open");
  if(el.id === "detailOverlay"){ flushDetail(); openId = null; render(); }
}
$$(".overlay").forEach(o => {
  o.addEventListener("click", e => { if(e.target === o || e.target.closest("[data-close]")) closeOverlay(o); });
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape"){ const o = $(".overlay.open"); if(o) closeOverlay(o); }
});

/* ================= Lead-Detail ================= */
let openId = null;
const FIELDS = [
  {k:"anrede",  label:"Anrede", type:"select", opts:["","Herr","Frau"]},
  {k:"name",    label:"Name", ph:"Vor- und Nachname"},
  {k:"firma",   label:"Firma"},
  {k:"telefon", label:"Telefon", type:"tel", act:"tel"},
  {k:"email",   label:"E-Mail", type:"email", act:"mail"},
  {k:"ort",     label:"Ort"},
  {k:"website", label:"Website", act:"web"},
  {k:"quelle",  label:"Quelle", ph:"z. B. Liste Oktober"},
  {k:"wiedervorlage", label:"Wiedervorlage", type:"date"}
];
const stageSel = $("#dStage");
stageSel.innerHTML = STAGES.map(s => `<option value="${s.id}">${esc(STAGE_NAME[s.id])}</option>`).join("");

function openDetail(id){
  openId = id;
  renderDetail(true);
  openOverlay($("#detailOverlay"));
}

function renderDetail(full){
  const l = byId(openId); if(!l) return;
  $("#dSince").textContent = "Lead seit " + fmtDate(l.created, false);
  $("#dName").textContent = displayName(l);
  $("#dFirm").textContent = l.name ? (l.firma || "") : "";
  stageSel.value = l.stage;

  if(full){
    $("#dFields").innerHTML = FIELDS.map(f => {
      const v = l[f.k] || "";
      const input = f.type === "select"
        ? `<select data-k="${f.k}">${f.opts.map(o => `<option value="${o}" ${o===v?"selected":""}>${o||"–"}</option>`).join("")}</select>`
        : `<input data-k="${f.k}" type="${f.type||"text"}" value="${esc(v)}" placeholder="${esc(f.ph||"–")}" ${f.type==="email"||f.act==="web"?'autocapitalize="off" autocorrect="off"':""}>`;
      let act = "";
      if(f.act === "tel") act = `<a class="fact" data-fact="tel" title="Anrufen">${ICON.phone}</a>`;
      if(f.act === "mail") act = `<button type="button" class="fact" data-fact="mail" title="In Gmail öffnen">${ICON.mail}</button>`;
      if(f.act === "web") act = `<a class="fact" data-fact="web" target="_blank" rel="noopener" title="Website öffnen">${ICON.web}</a>`;
      return `<label class="field"><span class="label">${esc(f.label)}</span>${input}${act}</label>`;
    }).join("");
    $("#dExtra").innerHTML = extraFieldsHtml(l);
    $("#dNote").value = "";
  }
  updateFieldActions(l);
  const w = warnings(l);
  $("#dWarn").classList.toggle("hidden", !w.length);
  $("#dWarn").innerHTML = w.map(x => "<b>Achtung:</b> " + esc(x.text) + (x.type === "tel" ? " – Werbeanrufe sind hier nicht erlaubt." : " – die Firma widerspricht Werbung.")).join("<br>");

  const q = [];
  q.push(`<button type="button" class="btn btn-line btn-sm" data-q="noreach">${ICON.retry} Nicht erreicht${l.attempts ? " · " + l.attempts + "×" : ""}</button>`);
  q.push(`<button type="button" class="btn btn-line btn-sm" data-q="mail" ${l.email ? "" : "disabled style='opacity:.45'"}>${ICON.mail} In Gmail öffnen</button>`);
  if(l.stage !== "termin" && l.stage !== "closed") q.push(`<button type="button" class="btn btn-line btn-sm" data-q="termin">${ICON.cal} Ersttermin gebucht</button>`);
  if(l.stage !== "closed") q.push(`<button type="button" class="btn btn-line btn-sm" data-q="closed">${ICON.check} Geclosed</button>`);
  $("#dQuick").innerHTML = q.join("");

  const notes = l.notes || [];
  $("#dTimeline").innerHTML = notes.length ? notes.map(n => `
    <li class="tl ${n.sys ? "sys" : ""}">
      <span class="tl-date">${esc(fmtDate(n.ts))}</span>
      <div class="tl-text">${esc(n.text)}</div>
      <button type="button" class="tl-del" data-del="${esc(n.id)}" title="Eintrag entfernen">${ICON.x}</button>
    </li>`).join("") : `<li class="tl-empty">Noch keine Notizen. Der erste Eintrag steht oben.</li>`;
}

function extraFieldsHtml(l){
  const fields = db.settings.fields || [];
  const rows = fields.map(k => {
    const v = (l.extra || {})[k] || "";
    const long = v.length > 60 || v.includes("\n");
    const input = long
      ? `<textarea data-x="${esc(k)}" rows="${Math.min(6, Math.ceil(v.length / 38) + 1)}" placeholder="–">${esc(v)}</textarea>`
      : `<input data-x="${esc(k)}" type="text" value="${esc(v)}" placeholder="–">`;
    return `<label class="field"><span class="label">${esc(k)}</span>${input}<button type="button" class="fact fact-sm" data-xdel="${esc(k)}" title="Feld „${esc(k)}“ entfernen">${ICON.x}</button></label>`;
  }).join("");
  return `<div class="extra-head"><span class="label">Angaben zum Lead</span><button type="button" class="add-field" data-xadd>+ Feld hinzufügen</button></div>` +
    (fields.length ? `<div class="extra-grid">${rows}</div>` : `<p class="extra-empty">Zusätzliche Spalten aus Ihren Listen – etwa Objektart oder Anzahl Objekte – erscheinen hier automatisch.</p>`);
}
function setExtra(l, k, v){
  l.extra = l.extra || {};
  if(v) l.extra[k] = v; else delete l.extra[k];
}

function updateFieldActions(l){
  const tel = $("[data-fact='tel']"), mail = $("[data-fact='mail']"), web = $("[data-fact='web']");
  if(tel){ tel.href = l.telefon ? telHref(l.telefon) : "#"; tel.classList.toggle("off", !l.telefon); }
  if(mail) mail.classList.toggle("off", !l.email);
  if(web){ web.href = l.website ? webHref(l.website) : "#"; web.classList.toggle("off", !l.website); }
}

let saveTimer = null;
["#dFields", "#dExtra"].forEach(sel => $(sel).addEventListener("input", e => {
  const k = e.target.dataset.k, x = e.target.dataset.x; if(!k && !x) return;
  const l = byId(openId); if(!l) return;
  if(x) setExtra(l, x, e.target.value.trim());
  else l[k] = e.target.value.trim();
  touch(l);
  $("#dName").textContent = displayName(l);
  $("#dFirm").textContent = l.name ? (l.firma || "") : "";
  updateFieldActions(l);
  $("#dSaved").textContent = "Wird gespeichert …";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { save(); $("#dSaved").textContent = "Gespeichert"; }, 350);
}));
["#dFields", "#dExtra"].forEach(sel => $(sel).addEventListener("change", e => { if(e.target.dataset.k || e.target.dataset.x){ save(); $("#dSaved").textContent = "Gespeichert"; } }));
["#dFields", "#dExtra"].forEach(sel => $(sel).addEventListener("click", e => {
  const b = e.target.closest("[data-fact='mail']");
  if(b){ e.preventDefault(); const l = byId(openId); if(l) openMail(l); return; }
  const t = e.target.closest("[data-fact='tel']");
  if(t){ const l = byId(openId); if(l && !okToContact(l, "tel")) e.preventDefault(); return; }
  const del = e.target.closest("[data-xdel]");
  if(del){
    e.preventDefault();
    const k = del.dataset.xdel;
    const used = db.leads.filter(x => (x.extra || {})[k]).length;
    if(!confirm("Feld „" + k + "“ bei allen Leads entfernen?" + (used ? "\n\nEs ist bei " + used + " Lead" + (used > 1 ? "s" : "") + " ausgefüllt – diese Angaben gehen verloren." : ""))) return;
    flushDetail();
    db.settings.fields = db.settings.fields.filter(f => f !== k);
    db.leads.forEach(x => { if(x.extra && k in x.extra){ delete x.extra[k]; touch(x); } });
    save(); renderDetail(true); render();
    return;
  }
  if(e.target.closest("[data-xadd]")){
    e.preventDefault();
    const name = (prompt("Name des neuen Feldes (z. B. „Objektart“ oder „Anzahl Objekte“):") || "").trim();
    if(!name) return;
    if(FIELDS.some(f => f.label.toLowerCase() === name.toLowerCase()) || db.settings.fields.some(f => f.toLowerCase() === name.toLowerCase())){
      toast("Dieses Feld gibt es schon."); return;
    }
    flushDetail();
    db.settings.fields.push(name); save(); renderDetail(true);
    const inp = $$("#dExtra [data-x]").find(i => i.dataset.x === name); if(inp) inp.focus();
  }
}));
function flushDetail(){ if(saveTimer){ clearTimeout(saveTimer); saveTimer = null; save(); } }

stageSel.addEventListener("change", () => {
  const l = byId(openId); if(!l) return;
  setStage(l, stageSel.value); save(); renderDetail(); render();
});

function addNote(){
  const ta = $("#dNote"); const text = ta.value.trim();
  const l = byId(openId); if(!text || !l) return;
  addHistory(l, text, false); touch(l); save();
  ta.value = ""; renderDetail(); render();
}
$("#dAddNote").addEventListener("click", addNote);
$("#dNote").addEventListener("keydown", e => { if(e.key === "Enter" && (e.metaKey || e.ctrlKey)){ e.preventDefault(); addNote(); } });

$("#dTimeline").addEventListener("click", e => {
  const b = e.target.closest("[data-del]"); if(!b) return;
  const l = byId(openId); if(!l) return;
  const n = (l.notes||[]).find(x => x.id === b.dataset.del);
  if(n && !n.sys && !confirm("Diese Notiz löschen?")) return;
  l.notes = (l.notes||[]).filter(n => n.id !== b.dataset.del);
  forget(b.dataset.del);
  save(); renderDetail(); render();
});

$("#dQuick").addEventListener("click", e => {
  const b = e.target.closest("[data-q]"); if(!b) return;
  const l = byId(openId); if(!l) return;
  const q = b.dataset.q;
  if(q === "mail"){ openMail(l); return; }
  if(q === "noreach"){
    l.attempts = (l.attempts||0) + 1;
    addHistory(l, "Anrufversuch " + l.attempts + " – nicht erreicht");
    if(l.stage === "neu") setStage(l, "nicht_erreicht");
    touch(l);
  }
  if(q === "termin") setStage(l, "termin");
  if(q === "closed") setStage(l, "closed");
  save(); renderDetail(); render();
});

let lastDeleted = null;
$("#dDelete").addEventListener("click", () => {
  const l = byId(openId); if(!l) return;
  if(!confirm("„" + displayName(l) + "“ wirklich löschen?")) return;
  lastDeleted = {lead:l, index:db.leads.indexOf(l)};
  db.leads = db.leads.filter(x => x !== l);
  forget(l.id);
  save();
  closeOverlay($("#detailOverlay"));
  toast("Lead gelöscht", "Rückgängig", () => {
    if(!lastDeleted) return;
    db.leads.splice(lastDeleted.index, 0, lastDeleted.lead);
    db.deleted = (db.deleted || []).filter(x => x !== lastDeleted.lead.id);
    lastDeleted = null; save(); render();
  });
});

/* ================= Leads einfügen ================= */
const KEYMAP = [
  ["anrede", /^(anrede|salutation)$/],
  ["name", /^(name|ansprechpartner(in)?|kontakt(person)?|person|vor-? ?und nachname|vollst.*name|contact)$/],
  ["vorname", /^(vorname|first ?name)$/],
  ["nachname", /^(nachname|last ?name|surname)$/],
  ["firma", /^(firma|unternehmen|company|büro|buero|maklerbüro|maklerbuero|agentur|makler|firmenname)$/],
  ["telefon", /^(telefon|tel\.?|telefonnummer|phone|handy|mobil|mobile|nummer|tel\.? ?nr\.?)$/],
  ["email", /^(e-?mail|mail|email-?adresse|e-mail-adresse)$/],
  ["ort", /^(ort|stadt|city|standort|plz ?\/? ?ort|region)$/],
  ["website", /^(website|webseite|web|homepage|url|internet)$/],
  ["quelle", /^(quelle|source|herkunft)$/],
  ["notiz", /^(notiz|notizen|bemerkung|bemerkungen|kommentar|note|notes)$/]
];
const RX_MAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const RX_PHONE = /^\+?[\d][\d\s\/().-]{5,}\d$/;
const RX_WEB = /^(https?:\/\/|www\.)\S+$|^[a-z0-9-]+(\.[a-z0-9-]+)*\.(de|ch|at|com|net|org|eu|immobilien|info|io|biz)(\/\S*)?$/i;
const RX_FIRM = /\b(gmbh|ag|kg|ohg|ug|e\.?\s?k\.?|immobilien|makler|realty|real estate|estate|partner|wohnbau|haus|verwaltung|properties|group|gruppe|&)\b/i;

function keyOf(h){
  const t = String(h||"").toLowerCase().replace(/[:*]/g,"").trim();
  for(const [k, rx] of KEYMAP) if(rx.test(t)) return k;
  return null;
}
function cleanLabel(h){
  h = String(h || "").replace(/^"|"$/g, "").replace(/\s+/g, " ").replace(/:$/, "").trim();
  return h ? h[0].toUpperCase() + h.slice(1) : h;
}
function finalize(o){
  if(!o.name && (o.vorname || o.nachname)) o.name = [o.vorname, o.nachname].filter(Boolean).join(" ");
  delete o.vorname; delete o.nachname;
  if(o.email){ const m = String(o.email).match(RX_MAIL); o.email = m ? m[0].toLowerCase() : ""; }
  if(o.anrede){ o.anrede = /frau/i.test(o.anrede) ? "Frau" : /herr/i.test(o.anrede) ? "Herr" : ""; }
  // „Herr Max Muster“ im Namen erkennen
  if(o.name){
    const m = o.name.match(/^(Herr|Frau)\s+(.+)$/i);
    if(m){ o.anrede = o.anrede || (m[1][0].toUpperCase() + m[1].slice(1).toLowerCase()); o.name = m[2]; }
  }
  for(const k in o) if(typeof o[k] === "string") o[k] = o[k].trim();
  return o;
}
function classifyCells(cells){
  const o = {}, rest = [];
  for(let c of cells){
    c = c.trim().replace(/^"|"$/g,"").trim();
    if(!c) continue;
    const m = c.match(RX_MAIL);
    if(m && !o.email && c.replace(m[0],"").replace(/[<>()\s,;:]|mailto/gi,"") === ""){ o.email = m[0]; continue; }
    if(!o.telefon && RX_PHONE.test(c) && (c.replace(/\D/g,"").length >= 6)){ o.telefon = c; continue; }
    if(!o.website && RX_WEB.test(c)){ o.website = c; continue; }
    if(!o.anrede && /^(herr|frau)$/i.test(c)){ o.anrede = c; continue; }
    rest.push(c);
  }
  for(const c of rest){
    if(!o.firma && RX_FIRM.test(c)) { o.firma = c; continue; }
    if(!o.name) { o.name = c; continue; }
    if(!o.firma) { o.firma = c; continue; }
    if(!o.ort && c.length < 40 && !/\d{6,}/.test(c)) { o.ort = c; continue; }
    o.notiz = (o.notiz ? o.notiz + " · " : "") + c;
  }
  return o;
}
function splitLine(line, sep){
  if(sep === "\t" || sep === ";" || sep === "|") return line.split(sep);
  // Komma mit Anführungszeichen
  const out = []; let cur = "", q = false;
  for(const ch of line){
    if(ch === '"'){ q = !q; continue; }
    if(ch === "," && !q){ out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}
const isKv = l => /^\s*[A-Za-zÄÖÜäöüß .\-\/]{2,30}\s*:\s*\S/.test(l) && !!keyOf(l.split(":")[0]);
function sepOf(s){
  return s.includes("\t") ? "\t" : s.includes(";") ? ";" : s.includes("|") ? "|" : s.includes(",") ? "," : null;
}
function parseBlock(lines){
  const out = []; let cur = {};
  const push = () => { if(Object.keys(cur).length){ out.push(finalize(cur)); cur = {}; } };
  for(const line of lines){
    const idx = line.indexOf(":");
    const k = idx > 0 && isKv(line) ? keyOf(line.slice(0, idx)) : null;
    const gm = !k && line.match(/^([A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß0-9 .\-\/()#&]{1,39})\s*:\s*(.+)$/);
    if(k){
      const v = line.slice(idx + 1).trim();
      if(cur[k] && k !== "notiz") push();
      cur[k] = k === "notiz" && cur.notiz ? cur.notiz + " " + v : v;
    }else if(gm && !/^https?$/i.test(gm[1].trim())){
      cur.extra = cur.extra || {};
      cur.extra[cleanLabel(gm[1])] = gm[2].trim();
    }else{
      // Zeile ohne Schlüssel: E-Mail / Telefon erkennen, sonst Notiz
      const c = classifyCells([line]);
      if(c.email && !cur.email) cur.email = c.email;
      else if(c.telefon && !cur.telefon) cur.telefon = c.telefon;
      else if(c.website && !cur.website) cur.website = c.website;
      else if(!Object.keys(cur).length) Object.assign(cur, c);
      else cur.notiz = (cur.notiz ? cur.notiz + " " : "") + line;
    }
  }
  push();
  return out;
}
function parseFree(r){
  // Freitext-Zeile: E-Mail & Telefon herausziehen, Rest an „ - “ trennen
  let rest = r;
  const o = {};
  const m = rest.match(RX_MAIL); if(m){ o.email = m[0]; rest = rest.replace(m[0], " "); }
  const p = rest.match(/\+?\d[\d\s\/().-]{5,}\d/); if(p && p[0].replace(/\D/g,"").length >= 6){ o.telefon = p[0].trim(); rest = rest.replace(p[0], " "); }
  let parts = rest.split(/\s+[-–—]\s+|\s{2,}/).map(s => s.trim()).filter(s => s && !/^[-–—]+$/.test(s));
  // „Lisa Sommer Sommer Immobilien“ → Name + Firma
  if(parts.length === 1 && RX_FIRM.test(parts[0])){
    const w = parts[0].split(/\s+/);
    if(w.length >= 3 && /^[A-ZÄÖÜ]/.test(w[0]) && /^[A-ZÄÖÜ]/.test(w[1]) && !RX_FIRM.test(w[0] + " " + w[1]))
      parts = [w.slice(0,2).join(" "), w.slice(2).join(" ")];
  }
  const c = classifyCells(parts);
  return Object.assign(c, {email:o.email || c.email, telefon:o.telefon || c.telefon});
}
function parseRows(rows, state){
  const out = [];
  let {header, headerRaw, hsep} = state;
  rows.forEach((r, i) => {
    const sep = sepOf(r);
    if(sep){
      const raw = splitLine(r, sep).map(c => c.trim());
      const keys = raw.map(keyOf);
      if(keys.filter(Boolean).length >= 2 && !RX_MAIL.test(r)){
        header = keys; headerRaw = raw; hsep = sep;
        Object.assign(state, {header, headerRaw, hsep});
        // Zusatzfelder in Spaltenreihenfolge (auch Spalten, die eine zweite Telefonnummer o. Ä. enthalten)
        const seen = new Set();
        raw.forEach((h, j) => {
          const k = keys[j];
          if(h && (!k || seen.has(k))) lastFieldOrder.push(cleanLabel(h));
          if(k) seen.add(k);
        });
        return;
      }
    }
    if(header && sep === hsep){
      const o = {}, extra = [];
      splitLine(r, sep).forEach((c, j) => {
        c = c.trim(); if(!c) return;
        const k = header[j];
        if(k && (!o[k] || k === "notiz")) o[k] = o[k] ? o[k] + " · " + c : c;
        else if(headerRaw[j]) { o.extra = o.extra || {}; o.extra[cleanLabel(headerRaw[j])] = c; }
        else extra.push(c);
      });
      if(extra.length) o.notiz = [o.notiz, ...extra].filter(Boolean).join(" · ");
      out.push(finalize(o));
    }else if(sep){
      out.push(finalize(classifyCells(splitLine(r, sep))));
    }else{
      out.push(finalize(parseFree(r)));
    }
  });
  return out;
}
let lastFieldOrder = [];
// CSV mit Anführungszeichen (Trennzeichen oder Zeilenumbrüche in Zellen) sauber in Tab-Zeilen umwandeln
function csvToTsv(text, d){
  const rows = []; let row = [], cell = "", q = false;
  for(let i = 0; i < text.length; i++){
    const ch = text[i];
    if(q){
      if(ch === '"'){ if(text[i+1] === '"'){ cell += '"'; i++; } else q = false; }
      else cell += ch;
    }else if(ch === '"' && cell.trim() === "") { q = true; cell = ""; }
    else if(ch === d){ row.push(cell); cell = ""; }
    else if(ch === "\n"){ row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  row.push(cell); rows.push(row);
  return rows.map(r => r.map(c => c.replace(/[\t\n]+/g, " ").trim()).join("\t")).join("\n");
}
function parseLeads(text){
  lastFieldOrder = [];
  text = String(text||"").replace(/\r+\n|\r/g,"\n").replace(/ /g," ");
  if(!text.trim()) return [];
  const firstLine = text.slice(0, text.indexOf("\n") >= 0 ? text.indexOf("\n") : undefined);
  if(!firstLine.includes("\t") && text.includes('"')){
    const d = firstLine.split(";").length >= firstLine.split(",").length ? ";" : ",";
    if(firstLine.split(d).length >= 3) text = csvToTsv(text, d);
  }
  // In Abschnitte zerlegen (Leerzeilen). Abschnitte mit „Name: …“-Zeilen sind ein Block-Lead,
  // alle anderen werden zeilenweise gelesen.
  const out = [];
  // Nur Leerzeichen am Rand entfernen – führende Tabs stehen für leere Zellen
  const segments = text.split(/\n[ \u00a0]*\n/).map(s => s.split("\n").map(l => l.replace(/^[ \u00a0]+|[ \u00a0]+$/g, "")).filter(l => l.replace(/\t/g, "").trim())).filter(s => s.length);
  const state = {header:null, headerRaw:null, hsep:null};  // Kopfzeile gilt auch nach Leerzeilen weiter
  for(const seg of segments){
    const kv = seg.filter(isKv).length;
    if(kv >= 2 && kv >= seg.length * 0.5) out.push(...parseBlock(seg.map(l => l.trim())));
    else out.push(...parseRows(seg, state));
  }
  return out.filter(o => o.name || o.firma || o.email || o.telefon);
}
function findDup(o){
  const ph = o.telefon ? normPhone(o.telefon) : "";
  return db.leads.find(l =>
    (o.email && l.email && l.email.toLowerCase() === o.email.toLowerCase()) ||
    (ph && ph.length >= 7 && l.telefon && normPhone(l.telefon) === ph)
  );
}
function newLead(o, source){
  const t = now();
  const l = {
    id:uid(), created:t, updated:t, stage:"neu", order:0, attempts:0,
    anrede:o.anrede||"", name:o.name||"", firma:o.firma||"", telefon:o.telefon||"", email:o.email||"",
    ort:o.ort||"", website:o.website||"", quelle:o.quelle || source || "", wiedervorlage:"", notes:[],
    extra:Object.assign({}, o.extra || {})
  };
  if(o.notiz) l.notes.push({id:uid(), ts:t, text:o.notiz, sys:false});
  return l;
}

let parsed = [];
let importTab = "paste";
const pasteArea = $("#pasteArea");
function renderPreview(){
  parsed = parseLeads(pasteArea.value).map(o => ({o, dup:findDup(o), on:true}));
  // Dubletten innerhalb der Liste
  const seen = new Set();
  parsed.forEach(p => {
    const k = (p.o.email||"").toLowerCase() || normPhone(p.o.telefon);
    if(k && seen.has(k)) p.dupList = true;
    if(k) seen.add(k);
    p.noContact = !(p.o.telefon || p.o.email || p.o.website);
    if(p.dup || p.dupList || p.noContact) p.on = false;
  });
  const wrap = $("#previewWrap");
  if(!parsed.length){
    wrap.innerHTML = pasteArea.value.trim() ? `<p class="hint">Noch kein Lead erkannt – bitte pro Zeile mindestens Name, Telefon oder E-Mail.</p>` : "";
  }else{
    wrap.innerHTML = `<table class="preview"><thead><tr>
      <th style="width:28px"></th><th>Name</th><th>Firma</th><th>Telefon</th><th>E-Mail</th><th class="opt">Ort</th><th class="opt">Notiz &amp; Felder</th></tr></thead><tbody>
      ${parsed.map((p,i) => `<tr class="${p.dup||p.dupList||p.noContact ? "dup" : ""}">
        <td><input type="checkbox" data-i="${i}" ${p.on ? "checked" : ""}></td>
        <td>${esc((p.o.anrede ? p.o.anrede + " " : "") + (p.o.name||"–"))}${p.dup ? `<span class="dup-tag">schon vorhanden: ${esc(displayName(p.dup))}</span>` : p.dupList ? `<span class="dup-tag">doppelt in der Liste</span>` : p.noContact ? `<span class="dup-tag">ohne Telefon/E-Mail – abgewählt</span>` : ""}</td>
        <td>${esc(p.o.firma||"–")}</td><td>${esc(p.o.telefon||"–")}</td><td>${esc(p.o.email||"–")}</td>
        <td class="opt">${esc(p.o.ort||"–")}</td><td class="opt">${esc(p.o.notiz||"")}${p.o.extra && Object.keys(p.o.extra).length ? `<span class="dup-tag" style="color:var(--sage)">+ ${Object.keys(p.o.extra).map(esc).join(", ")}</span>` : ""}</td></tr>`).join("")}
      </tbody></table>`;
  }
  updateImportBtn();
}
pasteArea.addEventListener("input", renderPreview);

/* ---- Dateien lesen: .xlsx / .docx (ZIP mit XML), .csv / .txt ---- */
async function unzip(buf){
  const dv = new DataView(buf), u8 = new Uint8Array(buf), files = {};
  let eocd = -1;
  for(let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if(dv.getUint32(i, true) === 0x06054b50){ eocd = i; break; }
  if(eocd < 0) throw new Error("Keine gültige Office-Datei");
  let p = dv.getUint32(eocd + 16, true);
  const n = dv.getUint16(eocd + 10, true);
  const dec = new TextDecoder();
  for(let i = 0; i < n; i++){
    if(dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const off = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
    files[name] = {method, csize, off};
    p += 46 + nlen + xlen + clen;
  }
  return async name => {
    const f = files[name]; if(!f) return null;
    const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true);
    const data = u8.subarray(start, start + f.csize);
    if(f.method === 0) return dec.decode(data);
    if(typeof DecompressionStream === "undefined") throw new Error("Dieser Browser kann keine Office-Dateien entpacken – bitte Inhalt kopieren und einfügen.");
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return await new Response(stream).text();
  };
}
const xml = t => new DOMParser().parseFromString(t, "application/xml");
const byTag = (node, tag) => Array.from(node.getElementsByTagName("*")).filter(e => e.localName === tag);
function colIndex(ref){
  const m = /^([A-Z]+)/.exec(ref || ""); if(!m) return -1;
  let n = 0; for(const ch of m[1]) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1;
}
function cellText(v){ return String(v ?? "").replace(/[\t\r\n]+/g, " ").trim(); }
async function xlsxToText(buf){
  const get = await unzip(buf);
  const shared = [];
  const ss = await get("xl/sharedStrings.xml");
  if(ss) byTag(xml(ss), "si").forEach(si => shared.push(byTag(si, "t").map(t => t.textContent).join("")));
  // erstes Tabellenblatt laut Arbeitsmappe
  let sheet = "xl/worksheets/sheet1.xml";
  try{
    const wb = xml(await get("xl/workbook.xml")), rels = xml(await get("xl/_rels/workbook.xml.rels"));
    const first = byTag(wb, "sheet")[0];
    const rid = first && (first.getAttribute("r:id") || first.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id"));
    const rel = byTag(rels, "Relationship").find(r => r.getAttribute("Id") === rid);
    if(rel){ const t = rel.getAttribute("Target").replace(/^\/?(xl\/)?/, ""); sheet = "xl/" + t; }
  }catch(_){}
  const sx = await get(sheet);
  if(!sx) throw new Error("Tabellenblatt nicht gefunden");
  const lines = [];
  byTag(xml(sx), "row").forEach(row => {
    const cells = [];
    byTag(row, "c").forEach((c, i) => {
      const idx = c.getAttribute("r") ? colIndex(c.getAttribute("r")) : i;
      const t = c.getAttribute("t");
      const vEl = byTag(c, "v")[0];
      let v = "";
      if(t === "s") v = shared[+(vEl ? vEl.textContent : -1)] ?? "";
      else if(t === "inlineStr") v = byTag(c, "t").map(x => x.textContent).join("");
      else v = vEl ? vEl.textContent : "";
      cells[idx] = cellText(v);
    });
    const line = Array.from(cells, x => x || "").join("\t");
    if(line.replace(/\t/g, "").trim()) lines.push(line);
  });
  return lines.join("\n");
}
async function docxToText(buf){
  const get = await unzip(buf);
  const doc = xml(await get("word/document.xml"));
  const body = byTag(doc, "body")[0];
  const out = [];
  const para = p => byTag(p, "t").map(t => t.textContent).join("").trim();
  for(const node of Array.from(body ? body.children : [])){
    if(node.localName === "tbl"){
      out.push("");
      byTag(node, "tr").forEach(tr => {
        const cells = Array.from(tr.children).filter(c => c.localName === "tc").map(tc => cellText(byTag(tc, "p").map(para).filter(Boolean).join(" ")));
        if(cells.join("").trim()) out.push(cells.join("\t"));
      });
      out.push("");
    }else if(node.localName === "p"){
      out.push(para(node));
    }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
$("#leadFile").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  const hint = $("#leadFileHint");
  hint.textContent = "Lese „" + f.name + "“ …";
  try{
    const name = f.name.toLowerCase();
    let text;
    if(name.endsWith(".xlsx")) text = await xlsxToText(await f.arrayBuffer());
    else if(name.endsWith(".docx")) text = await docxToText(await f.arrayBuffer());
    else if(name.endsWith(".xls") || name.endsWith(".doc") || name.endsWith(".pdf") || name.endsWith(".numbers") || name.endsWith(".pages"))
      throw new Error("Dieses Format geht leider nicht. Bitte als .xlsx, .docx oder .csv speichern – oder den Inhalt kopieren und oben einfügen.");
    else{
      const buf = await f.arrayBuffer();
      try{ text = new TextDecoder("utf-8", {fatal:true}).decode(buf); }
      catch(_){ text = new TextDecoder("windows-1252").decode(buf); }
      text = text.replace(/^\ufeff/, "");
    }
    pasteArea.value = text;
    renderPreview();
    hint.textContent = "„" + f.name + "“ geladen – " + parsed.length + " Lead" + (parsed.length === 1 ? "" : "s") + " erkannt. Bitte unten prüfen.";
  }catch(err){
    hint.textContent = err.message || "Die Datei konnte nicht gelesen werden.";
  }
});
$("#previewWrap").addEventListener("change", e => {
  const i = e.target.dataset.i; if(i == null) return;
  parsed[+i].on = e.target.checked; updateImportBtn();
});
function singleData(){
  const o = {};
  $$("#singleForm [name]").forEach(el => o[el.name] = el.value.trim());
  return o;
}
$("#singleForm").addEventListener("input", updateImportBtn);
function updateImportBtn(){
  const btn = $("#importGo");
  if(importTab === "paste"){
    const n = parsed.filter(p => p.on).length;
    btn.disabled = !n;
    btn.textContent = n === 1 ? "1 Lead übernehmen" : n ? n + " Leads übernehmen" : "Leads übernehmen";
    const dups = parsed.filter(p => p.dup || p.dupList).length, nc = parsed.filter(p => p.noContact && !p.dup && !p.dupList).length;
    const parts = [];
    if(dups) parts.push(dups + " mögliche Dublette" + (dups>1?"n":""));
    if(nc) parts.push(nc + " Zeile" + (nc>1?"n":"") + " ohne Kontaktdaten");
    $("#importHint").textContent = parts.length ? parts.join(" und ") + " abgewählt – bei Bedarf anhaken." : "Neue Leads landen oben in „Neuer Lead“.";
  }else{
    const o = singleData();
    btn.disabled = !(o.name || o.firma);
    btn.textContent = "Lead anlegen";
    const d = (o.email || o.telefon) ? findDup(o) : null;
    $("#importHint").textContent = d ? "Achtung: ähnlicher Lead vorhanden – " + displayName(d) : "Landet oben in „Neuer Lead“.";
  }
}
$$(".tab").forEach(t => t.addEventListener("click", () => {
  importTab = t.dataset.tab;
  $$(".tab").forEach(x => x.classList.toggle("on", x === t));
  $$("[data-pane]").forEach(p => p.classList.toggle("hidden", p.dataset.pane !== importTab));
  updateImportBtn();
  setTimeout(() => (importTab === "paste" ? pasteArea : $("#singleForm [name=name]")).focus(), 30);
}));
$("#openImport").addEventListener("click", () => {
  openOverlay($("#importOverlay"));
  updateImportBtn();
  setTimeout(() => (importTab === "paste" ? pasteArea : $("#singleForm [name=name]")).focus(), 60);
});
$("#importGo").addEventListener("click", () => {
  let added = [];
  if(importTab === "paste"){
    const src = $("#pasteSource").value.trim();
    added = parsed.filter(p => p.on).map(p => newLead(p.o, src));
  }else{
    const o = singleData();
    if(!(o.name || o.firma)) return;
    added = [newLead(o, o.quelle)];
  }
  if(!added.length) return;
  // oben in „Neuer Lead“ einsortieren
  const col = db.leads.filter(l => l.stage === "neu");
  let top = col.length ? Math.min(...col.map(l => l.order||0)) : 0;
  for(let i = added.length - 1; i >= 0; i--) added[i].order = --top;
  db.leads.push(...added);
  const used = new Set(added.flatMap(l => Object.keys(l.extra)));
  [...(importTab === "paste" ? lastFieldOrder : []), ...used].forEach(k => {
    if(used.has(k) && !db.settings.fields.includes(k)) db.settings.fields.push(k);
  });
  save(); render();
  pasteArea.value = ""; $("#pasteSource").value = ""; parsed = []; $("#previewWrap").innerHTML = "";
  $$("#singleForm [name]").forEach(el => el.value = "");
  closeOverlay($("#importOverlay"));
  toast(added.length === 1 ? "1 Lead übernommen" : added.length + " Leads übernommen");
  board.scrollTo({left:0, behavior:"smooth"});
});

/* ================= Einstellungen ================= */
const sSubject = $("#sSubject"), sBody = $("#sBody");
let lastFocusTpl = sBody;
function sampleLead(){
  return db.leads.find(l => l.stage === "email" && l.email) || db.leads.find(l => l.name) ||
    {anrede:"Herr", name:"Jonas Weber", firma:"Weber Wohnbau GmbH", ort:"München"};
}
function renderMailPreview(){
  const l = sampleLead();
  $("#sPreview").innerHTML = `<span class="subj">${esc(fillTemplate(db.settings.subject, l))}</span>${esc(fillTemplate(db.settings.body, l))}`;
}
function fillSettings(){
  const s = db.settings;
  sSubject.value = s.subject; sBody.value = s.body;
  $$("#sMode input").forEach(r => r.checked = r.value === s.mode);
  $("#sSender").value = s.sender || "";
  $("#sAccount").value = s.account || "0";
  $("#sChips").innerHTML = PLACEHOLDERS.map(p => `<button type="button" class="chip" data-ph="${p}">{{${p}}}</button>`).join("");
  if(SERVER) $("#sDataText").textContent = "Alle Leads werden auf diesem Computer in der Datei „" + (window.RW_DATAFILE || "leads.json") + "“ gespeichert – ohne Cloud, ohne Kosten. Das Skript legt zusätzlich jeden Tag automatisch eine Sicherung an. Eine heruntergeladene Sicherung eignet sich, um die Leads auf ein anderes Gerät zu übertragen.";
  $("#sVersion").textContent = SERVER ? "Version " + (window.RW_VERSION || "–") + " · lokal" : "Online-Version";
  $("#sLastBackup").textContent = s.lastBackup ? "Letzte Sicherung: " + fmtDate(s.lastBackup) : "Noch keine Sicherung heruntergeladen.";
  renderMailPreview();
}
$("#openSettings").addEventListener("click", () => { fillSettings(); openOverlay($("#settingsOverlay")); });
[sSubject, sBody].forEach(el => {
  el.addEventListener("focus", () => lastFocusTpl = el);
  el.addEventListener("input", () => { db.settings.subject = sSubject.value; db.settings.body = sBody.value; save(); renderMailPreview(); });
});
$("#sChips").addEventListener("mousedown", e => { if(e.target.closest(".chip")) e.preventDefault(); });
$("#sChips").addEventListener("click", e => {
  const c = e.target.closest(".chip"); if(!c) return;
  const el = lastFocusTpl, ins = "{{" + c.dataset.ph + "}}";
  const a = el.selectionStart ?? el.value.length, b = el.selectionEnd ?? el.value.length;
  el.value = el.value.slice(0, a) + ins + el.value.slice(b);
  el.focus(); el.selectionStart = el.selectionEnd = a + ins.length;
  el.dispatchEvent(new Event("input"));
});
$("#sResetTpl").addEventListener("click", () => {
  if(!confirm("Aktuelle Vorlage durch die Testvorlage ersetzen?")) return;
  db.settings.subject = DEFAULT_SUBJECT; db.settings.body = DEFAULT_BODY; save(); fillSettings();
});
$("#sMode").addEventListener("change", e => { db.settings.mode = e.target.value; save(); });
$("#sSender").addEventListener("input", e => { db.settings.sender = e.target.value.trim(); save(); renderMailPreview(); });
$("#sAccount").addEventListener("change", e => { db.settings.account = e.target.value; save(); });

function download(name, content, type){
  const blob = new Blob([content], {type});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
$("#sExport").addEventListener("click", () => {
  db.settings.lastBackup = now(); save();
  download("raumwerk-leads-" + todayStr() + ".json", JSON.stringify(db, null, 2), "application/json");
  fillSettings();
});
$("#sCsv").addEventListener("click", () => {
  const xf = db.settings.fields || [];
  const cols = ["Phase","Anrede","Name","Firma","Telefon","E-Mail","Ort","Website","Quelle","Wiedervorlage","Anrufversuche","Angelegt","Letzte Notiz", ...xf];
  const q = v => '"' + String(v ?? "").replace(/"/g,'""') + '"';
  const rows = db.leads.map(l => [STAGE_NAME[l.stage], l.anrede, l.name, l.firma, l.telefon, l.email, l.ort, l.website, l.quelle,
    l.wiedervorlage, l.attempts||0, fmtDate(l.created,false), ((l.notes||[]).find(n=>!n.sys)||{}).text || "", ...xf.map(k => (l.extra||{})[k] || "")].map(q).join(";"));
  download("raumwerk-leads-" + todayStr() + ".csv", "﻿" + [cols.map(q).join(";"), ...rows].join("\n"), "text/csv");
});
$("#sImportFile").addEventListener("change", async e => {
  const f = e.target.files[0]; e.target.value = ""; if(!f) return;
  try{
    const d = JSON.parse(await f.text());
    if(!d || !Array.isArray(d.leads)) throw new Error("format");
    const merge = db.leads.length && confirm(
      "Sicherung mit " + d.leads.length + " Leads gefunden.\n\nOK = mit den vorhandenen Leads zusammenführen\nAbbrechen = vorhandene Leads ersetzen");
    if(merge){
      const ids = new Set(db.leads.map(l => l.id));
      d.leads.forEach(l => { if(!ids.has(l.id)) db.leads.push(l); });
      ((d.settings || {}).fields || []).forEach(k => { if(!db.settings.fields.includes(k)) db.settings.fields.push(k); });
      db = normalize(db);
    }else{
      if(db.leads.length && !confirm("Alle " + db.leads.length + " vorhandenen Leads werden ersetzt. Fortfahren?")) return;
      db.leads = d.leads;
      db.settings = Object.assign(defaultDb().settings, d.settings || {});
      db = normalize(db);
    }
    save(); render(); fillSettings();
    toast("Sicherung eingespielt");
  }catch(err){ toast("Diese Datei ist keine gültige raumwerk-Sicherung."); }
});
$("#sWipe").addEventListener("click", () => {
  if(!db.leads.length) return;
  if(!confirm("Wirklich alle " + db.leads.length + " Leads löschen? Das lässt sich nicht rückgängig machen.")) return;
  if(!confirm("Letzte Bestätigung: alle Leads löschen?")) return;
  db.leads.forEach(l => forget(l.id));
  db.leads = []; save(); render(); toast("Alle Leads gelöscht");
});

/* ================= Hinweis ================= */
let toastTimer = null;
function toast(html, actionLabel, action){
  const t = $("#toast"), b = $("#toastAction");
  $("#toastText").innerHTML = html;
  if(actionLabel){
    b.textContent = actionLabel; b.classList.remove("hidden"); t.classList.add("has-action");
    b.onclick = () => { action(); t.classList.remove("show"); };
  }else{ b.classList.add("hidden"); t.classList.remove("has-action"); }
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), actionLabel ? 6000 : 2600);
}

if(SERVER){
  fetchData().catch(() => rwShowError("Die Daten konnten nicht geladen werden. Läuft das Python-Fenster noch?"));
  // Beim Zurückkehren in den Tab Änderungen aus anderen Fenstern übernehmen
  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "visible" && loaded && !dirty && !pushing && !drag && !$(".overlay.open"))
      fetch("/api/daten", {cache:"no-store"}).then(r => r.json()).then(j => {
        if(j.rev !== rev && !dirty){ db = normalize(j.data); rev = j.rev; render(); }
      }).catch(() => {});
    if(document.visibilityState === "hidden" && dirty) push(true);
  });
  window.addEventListener("pagehide", () => { if(dirty) push(true); });
}else{
  window.addEventListener("storage", e => { if(e.key === KEY){ db = load(); render(); } });
  render();
}
})();
</script>
</body>
</html>
'''


# ---------------------------------------------------------------- Speicher

class Speicher:
    """Liest und schreibt leads.json atomar und legt tägliche Sicherungen an."""

    def __init__(self, ordner):
        self.ordner = os.path.abspath(ordner)
        self.datei = os.path.join(self.ordner, "leads.json")
        self.sicherungen = os.path.join(self.ordner, "sicherungen")
        self.lock = threading.Lock()
        os.makedirs(self.sicherungen, exist_ok=True)
        self.rev = 0
        self.daten = None
        self._laden()

    def _laden(self):
        if not os.path.exists(self.datei):
            self.daten = None
            return
        try:
            with open(self.datei, "r", encoding="utf-8") as f:
                inhalt = json.load(f)
            self.rev = int(inhalt.get("rev", 0))
            self.daten = inhalt.get("data")
        except (OSError, ValueError) as fehler:
            # Defekte Datei nicht überschreiben, sondern beiseitelegen
            kaputt = self.datei + ".defekt-" + datetime.now().strftime("%Y%m%d-%H%M%S")
            shutil.copy2(self.datei, kaputt)
            print("  ! leads.json war nicht lesbar ({}).".format(fehler))
            print("    Kopie gesichert unter: {}".format(kaputt))
            print("    Die letzte Tagessicherung liegt in: {}".format(self.sicherungen))
            self.daten = None

    def lesen(self):
        with self.lock:
            return {"rev": self.rev, "data": self.daten}

    def schreiben(self, daten, rev, erzwingen=False):
        with self.lock:
            if not erzwingen and rev != self.rev:
                return None  # in einem anderen Fenster geändert
            self.rev += 1
            self.daten = daten
            inhalt = json.dumps({"rev": self.rev, "gespeichert": datetime.now().isoformat(timespec="seconds"),
                                 "data": daten}, ensure_ascii=False, indent=1)
            fd, tmp = tempfile.mkstemp(prefix=".leads-", suffix=".tmp", dir=self.ordner)
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    f.write(inhalt)
                    f.flush()
                    os.fsync(f.fileno())
                os.replace(tmp, self.datei)
            except BaseException:
                try:
                    os.remove(tmp)
                except OSError:
                    pass
                raise
            self._tagessicherung()
            return self.rev

    def _tagessicherung(self):
        ziel = os.path.join(self.sicherungen, "leads-{}.json".format(date.today().isoformat()))
        try:
            shutil.copy2(self.datei, ziel)  # überschreibt die Sicherung von heute: Stand am Tagesende
            alte = sorted(n for n in os.listdir(self.sicherungen) if n.startswith("leads-") and n.endswith(".json"))
            for name in alte[:-MAX_SICHERUNGEN]:
                os.remove(os.path.join(self.sicherungen, name))
        except OSError as fehler:
            print("  ! Sicherung fehlgeschlagen: {}".format(fehler))


# ---------------------------------------------------------------- Server

def baue_handler(speicher, port):
    erlaubte_hosts = {"127.0.0.1:{}".format(port), "localhost:{}".format(port)}
    seite = HTML.replace(
        "<!--RW_SERVER-->",
        "<script>window.RW_SERVER=true;window.RW_DATAFILE={};window.RW_VERSION={};</script>".format(
            json.dumps(speicher.datei), json.dumps(VERSION)),
    ).encode("utf-8")

    class Handler(BaseHTTPRequestHandler):
        server_version = "raumwerk"
        sys_version = ""

        def log_message(self, *args):
            pass  # ruhige Konsole

        def _host_ok(self):
            # Schutz gegen fremde Webseiten, die per DNS-Trick auf localhost zugreifen
            return self.headers.get("Host", "") in erlaubte_hosts

        def _senden(self, status, body, typ="application/json; charset=utf-8"):
            if isinstance(body, (dict, list)):
                body = json.dumps(body, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", typ)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if not self._host_ok():
                return self._senden(403, {"fehler": "nicht erlaubt"})
            pfad = self.path.split("?", 1)[0]
            if pfad in ("/", "/index.html"):
                return self._senden(200, seite, "text/html; charset=utf-8")
            if pfad == "/api/daten":
                return self._senden(200, speicher.lesen())
            if pfad == "/api/ping":
                return self._senden(200, {"app": APP_NAME, "version": VERSION, "daten": speicher.datei})
            if pfad == "/favicon.ico":
                return self._senden(204, b"", "image/x-icon")
            return self._senden(404, {"fehler": "nicht gefunden"})

        def do_POST(self):
            # Eigener Header erzwingt eine CORS-Vorabprüfung, die wir nie erlauben:
            # fremde Webseiten können so nichts in die Datei schreiben.
            if not self._host_ok() or self.headers.get("X-Raumwerk") != "1":
                return self._senden(403, {"fehler": "nicht erlaubt"})
            if self.path.split("?", 1)[0] == "/api/beenden":
                # Eine neuere Version übernimmt: diesen Server sauber beenden
                self._senden(200, {"ok": True})
                threading.Thread(target=self.server.shutdown, daemon=True).start()
                return
            if self.path.split("?", 1)[0] != "/api/daten":
                return self._senden(404, {"fehler": "nicht gefunden"})
            try:
                laenge = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                laenge = 0
            if laenge <= 0 or laenge > MAX_GROESSE:
                return self._senden(413, {"fehler": "ungültige Größe"})
            try:
                anfrage = json.loads(self.rfile.read(laenge).decode("utf-8"))
                daten = anfrage["data"]
                if not isinstance(daten, dict) or not isinstance(daten.get("leads"), list):
                    raise ValueError("leads fehlt")
                rev = int(anfrage.get("rev", 0))
            except (ValueError, KeyError, TypeError, UnicodeDecodeError):
                return self._senden(400, {"fehler": "ungültige Daten"})
            try:
                neu = speicher.schreiben(daten, rev, bool(anfrage.get("force")))
            except OSError as fehler:
                print("  ! Speichern fehlgeschlagen: {}".format(fehler))
                return self._senden(500, {"fehler": "Speichern fehlgeschlagen"})
            if neu is None:
                return self._senden(409, {"fehler": "veraltet", "rev": speicher.rev})
            return self._senden(200, {"rev": neu})

    return Handler


def laeuft_schon(port):
    """Antwort des bereits laufenden CRM (dict) oder None."""
    try:
        with urllib.request.urlopen("http://127.0.0.1:{}/api/ping".format(port), timeout=1) as r:
            info = json.loads(r.read().decode("utf-8"))
            return info if info.get("app") == APP_NAME else None
    except Exception:
        return None


def windows_prozess_beenden(port):
    """Ältere Versionen kennen /api/beenden nicht: unter Windows den Prozess am Port beenden.
    Wird nur aufgerufen, nachdem /api/ping bestätigt hat, dass dort das raumwerk CRM läuft."""
    import subprocess
    try:
        ausgabe = subprocess.run(["netstat", "-ano", "-p", "TCP"], capture_output=True, text=True,
                                 errors="replace", timeout=10).stdout
    except Exception:
        return False
    pids = set()
    for zeile in ausgabe.splitlines():
        teile = zeile.split()
        # TCP  127.0.0.1:8765  0.0.0.0:0  ABHÖREN/LISTENING  1234
        if len(teile) >= 5 and teile[0].upper() == "TCP" and teile[1] == "127.0.0.1:{}".format(port) \
                and teile[2] in ("0.0.0.0:0", "*:*") and teile[-1].isdigit():
            pids.add(teile[-1])
    pids.discard(str(os.getpid()))
    for pid in pids:
        subprocess.run(["taskkill", "/PID", pid, "/F"], capture_output=True, timeout=10)
    for _ in range(30):
        time.sleep(0.2)
        if not laeuft_schon(port):
            return True
    return False


def alten_beenden(port):
    try:
        req = urllib.request.Request("http://127.0.0.1:{}/api/beenden".format(port), data=b"{}", method="POST",
                                     headers={"X-Raumwerk": "1", "Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=2).read()
    except Exception:
        return False
    for _ in range(30):
        time.sleep(0.2)
        if not laeuft_schon(port):
            return True
    return False


def port_frei(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if os.name != "nt":
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # wie der Server selbst
        try:
            s.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def main():
    if sys.version_info < (3, 7):
        print("Bitte Python 3.7 oder neuer verwenden.")
        sys.exit(1)

    for strom in (sys.stdout, sys.stderr):
        try:
            strom.reconfigure(errors="replace")  # Umlaute auch in alten Windows-Konsolen
        except Exception:
            pass

    hier = os.path.dirname(os.path.abspath(__file__))
    parser = argparse.ArgumentParser(description="raumwerk CRM lokal starten")
    parser.add_argument("--port", type=int, default=STANDARD_PORT)
    parser.add_argument("--daten", default=os.path.join(hier, "raumwerk-daten"))
    parser.add_argument("--kein-browser", action="store_true")
    args = parser.parse_args()

    port = args.port
    laufend = laeuft_schon(port)
    if laufend and laufend.get("version") == VERSION:
        url = "http://127.0.0.1:{}/".format(port)
        print("{} läuft bereits – öffne {}".format(APP_NAME, url))
        if not args.kein_browser:
            webbrowser.open(url)
        return
    if laufend:
        # Eine andere (ältere) Version läuft noch und würde sonst weiter angezeigt.
        beendet = alten_beenden(port) if laufend.get("version") else False
        if not beendet and os.name == "nt":
            beendet = windows_prozess_beenden(port)
        if not beendet:
            print()
            print("  ACHTUNG: Es läuft noch eine ältere Version des raumwerk CRM.")
            print("  Bitte alle schwarzen raumwerk-Fenster schließen")
            print("  (oder den Computer neu starten) und dann erneut starten.")
            print()
            sys.exit(1)
        print("  Ältere Version beendet – starte die neue.")
    # Falls der Port von etwas anderem belegt ist, den nächsten freien nehmen.
    # Hinweis: Die Leads liegen in der Datei, nicht im Browser – der Port ist egal.
    while not port_frei(port):
        port += 1
        if port > args.port + 50:
            print("Kein freier Port gefunden.")
            sys.exit(1)

    speicher = Speicher(args.daten)
    server = ThreadingHTTPServer(("127.0.0.1", port), baue_handler(speicher, port))
    url = "http://127.0.0.1:{}/".format(port)

    anzahl = len((speicher.daten or {}).get("leads", []))
    print()
    print("  raumwerk CRM läuft.  (Version {})".format(VERSION))
    print("  Im Browser:  {}".format(url))
    print("  Daten:       {}  ({} Leads)".format(speicher.datei, anzahl))
    print()
    print("  Dieses Fenster geöffnet lassen, solange Sie arbeiten.")
    print("  Beenden mit Strg + C oder Fenster schließen.")
    print()

    if not args.kein_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        print("\n  raumwerk CRM beendet. Alle Daten sind gespeichert.")


if __name__ == "__main__":
    main()
