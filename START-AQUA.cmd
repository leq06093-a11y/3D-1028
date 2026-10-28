@echo off
setlocal
chcp 65001 >nul
title AQUA REALM 3D
set "AQUA_PACKAGE_DIR=%~dp0"
echo 正在校验并打开水境，首次需要一点时间。请保留全部文件。
powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop';$root=$env:AQUA_PACKAGE_DIR;$m=Get-Content -LiteralPath (Join-Path $root 'manifest.json') -Raw|ConvertFrom-Json;if([IO.Path]::GetFileName($m.appFile) -ne $m.appFile){throw 'Invalid application name'};$target=Join-Path $root $m.appFile;$valid=(Test-Path -LiteralPath $target) -and ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash -eq $m.sha256);if(-not $valid){$temp=$target+'.'+[Guid]::NewGuid().ToString()+'.tmp';try{$stream=[IO.File]::Open($temp,[IO.FileMode]::CreateNew);try{foreach($part in $m.parts){if([IO.Path]::GetFileName($part.name) -ne $part.name){throw 'Invalid part name'};$file=Join-Path $root $part.name;if((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $part.sha256){throw ('File check failed: '+$part.name)};$partStream=[IO.File]::OpenRead($file);try{$partStream.CopyTo($stream)}finally{$partStream.Dispose()}}}finally{$stream.Dispose()};if((Get-FileHash -LiteralPath $temp -Algorithm SHA256).Hash -ne $m.sha256){throw 'Application check failed'};if(Test-Path -LiteralPath $target){Move-Item -LiteralPath $target -Destination ($target+'.previous-'+[DateTime]::Now.Ticks)};Move-Item -LiteralPath $temp -Destination $target}catch{if(Test-Path -LiteralPath $temp){Remove-Item -LiteralPath $temp};throw}};Start-Process -FilePath $target -WorkingDirectory $root"
if errorlevel 1 (
 echo.
 echo 未能启动。请右键压缩包选择“全部解压缩”，不要在压缩包内运行。
 echo 如仍失败，请保留上方错误信息并发给开发者。不要关闭系统防护。
 pause
 exit /b 1
)
exit /b 0
