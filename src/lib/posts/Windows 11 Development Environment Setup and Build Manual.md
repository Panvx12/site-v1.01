---
title: "Win11 Dev Setup for C/C++, Python and .NET"
author: "waffle"
date: "2026.11.07"
tags: ["dev","C/C++","Python",".NET"]
---
## Section 1: C/C++

### 1. Prerequisites
- Get the latest version of MinGW-w64 via [MSYS2](https://www.msys2.org).
- Install Visual Studio Code via [VS Code Official Site](https://code.visualstudio.com).
- Install the C/C++ extension for VS Code.

### 2. Install the MinGW-w64 Toolchain
1. In the MSYS2 setup wizard, choose your desired Installation Folder. Record this directory for later use. 
2. When setup is complete, ensure the Run MSYS2 now box is checked and select Finish.
3. In the MSYS2 terminal, install the MinGW-w64 toolchain by running the following command:

```bash
pacman -S --needed base-devel mingw-w64-ucrt-x86_64-toolchain
```

4. Add the path of your `ucrt64` bin folder (default path: `C:\msys64\ucrt64\bin`) to the Windows PATH environment variables.
5. Verify the MinGW installation by running the following commands in your terminal:

```bash
gcc --version
g++ --version
gdb --version
```

### 3. Start Your First Project
1. Create a folder for storing your C/C++ source files.
2. Open Visual Studio Code.
3. Open the folder you created and create/edit your C/C++ files.
4. **Run** C/C++ File: Select `C/C++: g++.exe build and debug active file` from the list of detected compilers on your system.
5. **Debug** C/C++ File: Select `C/C++: g++ build and debug active file` from the list of detected compilers on your system.

### 4. Appendix
- Build System for C/C++: [CMake](https://cmake.org/)
- Game Development Libraries for C/C++: [raylib](https://www.raylib.com/)、[SFML](https://www.sfml-dev.org/)、[SDL](https://www.libsdl.org/)

## Section 2: Python

### 1. Prerequisites & Installation
1. Download and install the latest version of Python from [Python Official Downloads](https://www.python.org/downloads/).
2. Install Visual Studio Code via [VS Code Official Site](https://code.visualstudio.com).
3. Install the Python extension for VS Code.
4. Verify the Python installation by running the following command in your terminal:
```cmd
python --version
```

### 2. Install and Use Packages
1. Check the installed version of `pip`:
```cmd
pip --version
```
2. Install external Python packages using `pip` in your terminal:
```cmd
pip install package_name
```

## Section 3: DotNet (.NET)

### 1. Prerequisites & Installation
1. Install Visual Studio Code via [VS Code Official Site](https://code.visualstudio.com).
2. Install the C# and C# Dev Kit extensions for VS Code.
3. Install the [.NET Software Development Kit (SDK)](https://dotnet.microsoft.com/zh-tw/download).
4. Verify the .NET SDK installation by running the following command in your terminal:
```cmd
dotnet --version
```

## References

1.	VS code C/C++: https://code.visualstudio.com/docs/languages/cpp.
2. VS code Python: https://code.visualstudio.com/docs/languages/python.
3.	VS code DotNet: https://code.visualstudio.com/docs/languages/dotnet.