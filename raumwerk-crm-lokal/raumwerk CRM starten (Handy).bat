@echo off
REM Startet das raumwerk CRM so, dass es auch auf dem Handy im gleichen WLAN erreichbar ist.
cd /d "%~dp0"
where py >nul 2>nul && (py raumwerk_crm.py --handy & goto :ende)
where python >nul 2>nul && (python raumwerk_crm.py --handy & goto :ende)
where python3 >nul 2>nul && (python3 raumwerk_crm.py --handy & goto :ende)
echo Python 3 ist nicht installiert.
echo Am einfachsten: Microsoft Store oeffnen, nach "Python 3" suchen und installieren.
:ende
pause
