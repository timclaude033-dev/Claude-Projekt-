#!/bin/bash
# Doppelklick auf dem Mac: raumwerk CRM starten, auch für das Handy im gleichen WLAN.
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
  python3 raumwerk_crm.py --handy
else
  echo "Python 3 ist nicht installiert. Bitte von https://www.python.org/downloads/ installieren."
  read -p "Enter zum Schließen ..."
fi
