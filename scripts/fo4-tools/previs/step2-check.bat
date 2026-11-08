@echo off
rem Step 2: PJM's check in batch mode, building the seed xPrevisPatch.esp (option 1, -Fix).
rem Run from the xEdit folder; replace DATA with the Windows path of the copy's Data folder.
start "" /b clickok.exe "Module Selection" OK 900
FO4Edit.exe -fo4 -autoload -IKnowWhatImDoing "-D:DATA\" -script:FO4Check_PreVisbines.pas -Fix -Log -autoexit
