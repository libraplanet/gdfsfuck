@SETLOCAL
@pushd "%~dp0"

@SET PATCH_CMD=cscript //nologo //E:JScript "%D_CUR%patcher.js"
@SET RPL_BIN_SRC=5C 00 53 00 68 00 65 00 6C 00 6C 00 4E 00 65 00 77 00
@SET RPL_BIN_DST=5C 00 78 00 78 00 78 00 78 00 78 00 78 00 78 00 78 00

@GOTO :l_main

@REM -- --------------------------------------------------------------------------------------------
@REM -- sub_proc
@REM -- --------------------------------------------------------------------------------------------
:sub_proc
  @SET EXE_NAME=%~nx1
  @SET EXE_DIR=%~dp1
  @SET EXE_PATH=%~dpnx1
  @SET BAK_PATH=%~dpnx1.bak
  @SET TMP_PATH=%~dpnx1.tmp
  @ECHO EXE_PATH=%EXE_PATH%
  @ECHO BAK_PATH=%BAK_PATH%
  @ECHO TMP_PATH=%BAK_PATH%

  @REM arg check
  @IF "%~1" == "" (
    ECHO argument is blank... ^(proccess is not found..^)
    GOTO :EOF
  )

  @REM bak check
  @REM @IF EXIST "%BAK_PATH%" (
  @REM   ECHO bak file is exists. ^(already patched.^)
  @REM   GOTO :EOF
  @REM )

  @REM patch
  @ECHO bak file is not found.
  @ECHO start patch work.
  %PATCH_CMD% "%EXE_PATH%" "%TMP_PATH%" "%RPL_BIN_SRC%" "%RPL_BIN_DST%"

  @IF NOT "%ERRORLEVEL%" == "0" (
    ECHO target code is not found...
    GOTO :EOF
  )

  @REM kill
  TASKKILL /F /IM "%EXE_NAME%"

  @REM swap
  MOVE /Y "%EXE_PATH%" "%BAK_PATH%"
  MOVE /Y "%TMP_PATH%" "%EXE_PATH%"

  @REM restart
  @REM "%EXE_PATH%"
  @CALL (
    @SETLOCAL
    CD /D "%EXE_DIR%"
    RUNAS /trustlevel:0x20000 "%EXE_PATH%"
    @ENDLOCAL
  )
@GOTO :EOF

@REM -- --------------------------------------------------------------------------------------------
@REM -- sub_reg
@REM -- --------------------------------------------------------------------------------------------
:sub_reg
  @REM clean reg
  REG DELETE HKEY_CLASSES_ROOT\.gdoc\ShellNew /f
  REG DELETE HKEY_CLASSES_ROOT\.gsheet\ShellNew /f
  REG DELETE HKEY_CLASSES_ROOT\.gslides\ShellNew /f
@GOTO :EOF

@REM -- --------------------------------------------------------------------------------------------
@REM -- l_main
@REM -- --------------------------------------------------------------------------------------------
:l_main
@IF "%1" == "-list" (
  powershell -Command "wmic process where \"name = 'GoogleDriveFS.exe'\" get ExecutablePath | Select-String "GoogleDriveFS.exe" | Get-Unique"
  @GOTO :l_eof
)
@IF "%1" == "" (
  @FOR /f "usebackq skip=1 tokens=*" %%A IN (`"%0" -list`) DO @(
    @REM @ECHO "%%A"
    CALL :sub_proc "%%A" && CALL :sub_reg
    @REM CALL :sub_reg
    @REM GOTO :l_eof
  )
  @GOTO :l_eof
)

:l_eof
@ENDLOCAL
