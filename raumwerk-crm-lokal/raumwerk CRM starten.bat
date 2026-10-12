@echo off
REM Doppelklick unter Windows startet das raumwerk CRM.
cd /d "%~dp0"
where py >nul 2>nul && (py -3 raumwerk_crm.py & goto :ende)
where python >nul 2>nul && (python raumwerk_crm.py & goto :ende)
echo Python 3 ist nicht installiert. Bitte von https://www.python.org/downloads/ installieren
echo und dabei "Add python.exe to PATH" anhaken.
:ende
pause
