@echo off
setlocal
chcp 65001 >nul
title ORBIT - 地理实验室
cd /d "%~dp0"
echo.
echo ORBIT 地理实验室 - 双击启动
echo.
where node >nul 2>nul
if errorlevel 1 goto missing_node
node -e "if(Number(process.versions.node.split('.')[0]) < 18) process.exit(1)" >nul 2>nul
if errorlevel 1 goto old_node
if not exist "dist\index.html" goto missing_files
if not exist "tools\start-windows.mjs" goto missing_files
echo 正在启动，浏览器会自动打开。
echo 使用期间请保持此窗口开启。关闭此窗口即可停止软件。
node "tools\start-windows.mjs"
if errorlevel 1 goto failed
exit /b 0
:missing_node
echo 电脑尚未安装 Node.js，正在打开官方下载页面。
echo 请安装 Windows 版 Node.js LTS，然后关闭此窗口，再双击本脚本。
start "" "https://nodejs.org/"
pause
exit /b 1
:old_node
echo Node.js 版本过旧，请安装官网提供的 LTS 版本后重试。
start "" "https://nodejs.org/"
pause
exit /b 1
:missing_files
echo 找不到项目文件。请右键 ZIP 压缩包，选择“全部解压缩”。
echo 解压后进入文件夹，再双击“启动地理实验室.bat”。
echo 不要只复制此脚本，也不要在压缩包里直接运行。
pause
exit /b 1
:failed
echo.
echo 启动失败。请保留上方错误信息并截图发给我。
pause
exit /b 1
