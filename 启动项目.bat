@echo off
cd /d "%~dp0"
echo 正在进入项目目录：%cd%
echo.
echo 第一次运行会安装依赖，请耐心等待。
npm.cmd install
if errorlevel 1 (
  echo.
  echo 依赖安装失败，请检查网络或 npm 配置。
  pause
  exit /b 1
)
echo.
echo 正在启动 React 开发服务器...
npm.cmd run dev
pause
