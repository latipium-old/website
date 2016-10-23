!include "MUI2.nsh"
!include "x64.nsh"
Name "Latipium"
OutFile "Latipium_Setup.exe"

InstallDir "$PROGRAMFILES\Latipium"
InstallDirRegKey HKLM "Software\Latipium" ""

!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_LICENSE "license.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!include "English.nsh"

Section $(Sec_Core_Title) Sec_Core
	SetOutPath "$INSTDIR"
	WriteRegStr HKLM "Software\Latipium" "" "$INSTDIR"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Latipium" "DisplayName" "Latipium"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Latipium" "UninstallString" '"$INSTDIR\Uninstall.exe"'
	WriteUninstaller $INSTDIR\Uninstall.exe
	${If} ${RunningX64}
		inetc::get "https://github.com/electron/electron/releases/download/v1.4.2/electron-v1.4.2-win32-x64.zip" "$INSTDIR\electron.zip"
			Pop $R0
				StrCmp $R0 "OK" +3
					MessageBox MB_OK "Download failed: $R0"
					Quit
	${Else}
		inetc::get "https://github.com/electron/electron/releases/download/v1.4.2/electron-v1.4.2-win32-ia32.zip" "$INSTDIR\electron.zip"
			Pop $R0
				StrCmp $R0 "OK" +3
					MessageBox MB_OK "Download failed: $R0"
					Quit
	${EndIf}
	inetc::get "https://registry.npmjs.org/npm/-/npm-3.10.8.tgz" "$INSTDIR\npm.tgz"
		Pop $R0
			StrCmp $R0 "OK" +3
				MessageBox MB_OK "Download failed: $R0"
				Quit
	nsUnzip::Extract "$INSTDIR\electron.zip"
	CreateDirectory "$INSTDIR\resources\app"
	CreateDirectory "$INSTDIR\resources\app\node_modules"
	untgz::extract -z -d "$INSTDIR\resources\app\node_modules" "$INSTDIR\npm.tgz"
	Rename "$INSTDIR\resources\app\node_modules\package" "$INSTDIR\resources\app\node_modules\npm"
	Rename "$INSTDIR\electron.exe" "$INSTDIR\Latipium.exe"
	Delete "$INSTDIR\electron.zip"
	Delete "$INSTDIR\npm.tgz"
	SetOutPath "$INSTDIR\resources\app"
	File null/manifest.json
	File null/package.json
	CreateDirectory "$INSTDIR\resources\app\_site"
	CreateDirectory "$INSTDIR\resources\app\_site\js"
	SetOutPath "$INSTDIR\resources\app\_site\js"
	File ../js/updater.js
	SectionIn RO
SectionEnd

Section $(Sec_Shortcuts_Title) Sec_Shortcuts
	CreateDirectory "$SMPROGRAMS\Latipium"
	CreateShortcut "$SMPROGRAMS\Latipium\Latipium.lnk" "$INSTDIR\Latipium.exe"
SectionEnd

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
	!insertmacro MUI_DESCRIPTION_TEXT ${Sec_Core} $(Sec_Core_Desc)
	!insertmacro MUI_DESCRIPTION_TEXT ${Sec_Shortcuts} $(Sec_Shortcuts_Desc)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

Section "Uninstall"
	RMDir /r "$INSTDIR"
	RMDir /r "$SMPROGRAMS\Latipium"
	DeleteRegKey /ifempty HKLM "Software\Latipium"
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Latipium"
SectionEnd
