@echo off
rem Step 9: merge Previs.esp into the patch. Only the two plugins are loaded.
echo *SanctuaryPrevis.esp> "%TEMP%\Plugins.txt"
echo *Previs.esp>> "%TEMP%\Plugins.txt"
start "" /b clickok.exe "Module Selection" OK 600
start "" /b clickok.exe "Save changed files:" OK 14400
FO4Edit.exe -fo4 -autoexit -IKnowWhatImDoing -P:"%TEMP%\Plugins.txt" "-D:DATA\" -Script:Batch_FO4MergePreVisandCleanRefr.pas -Mod:SanctuaryPrevis.esp -log:step9.log
taskkill /f /im clickok.exe >nul 2>&1
