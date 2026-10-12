@echo off
REM Doppelklick unter Windows startet das raumwerk CRM.
cd /d "%~dp0"
where py >nul 2>nul && (py raumwerk_crm.py & goto :ende)
where python >nul 2>nul && (python raumwerk_crm.py & goto :ende)
where python3 >nul 2>nul && (python3 raumwerk_crm.py & goto :ende)
echo Python 3 ist nicht installiert.
echo Am einfachsten: Microsoft Store oeffnen, nach "Python 3" suchen und installieren.
:ende
pause
