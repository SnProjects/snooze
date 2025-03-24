@echo off
wt -- "C:\Program Files\Git\bin\bash.exe" -li -c "nx serve frontend"; split-pane -H -- "C:\Program Files\Git\bin\bash.exe" -li -c "nx serve backend"
