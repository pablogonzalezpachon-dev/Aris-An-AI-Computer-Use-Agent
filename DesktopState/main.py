from time import sleep
from typing import Optional
import uiautomation as uia
from views import App, DesktopState, Status, Size
from service import Tree
import sys
import json
import ctypes
from fuzzywuzzy import process
import win32process
import win32gui
import win32con
import subprocess
import base64
import os
import csv
import io

tree = Tree()
PROCESS_PER_MONITOR_DPI_AWARE = 2

try:
    ctypes.windll.shcore.SetProcessDpiAwareness(PROCESS_PER_MONITOR_DPI_AWARE)
except Exception:
    ctypes.windll.user32.SetProcessDPIAware()


def get_apps() -> list[App]:
    try:
        desktop = uia.GetRootControl()  # Get the desktop control
        children = desktop.GetChildren()
        apps = []
        for depth, child in enumerate(children):
            if isinstance(child, (uia.WindowControl, uia.PaneControl)):
                window_pattern = child.GetPattern(
                    uia.PatternId.WindowPattern)
                if (window_pattern is None):
                    continue
                if window_pattern.CanMinimize and window_pattern.CanMaximize:
                    status = get_app_status(child)
                    size = get_app_size(child)
                    apps.append(App(**{
                        "name": child.Name,
                        "depth": depth,
                        "status": status,
                        "size": size,
                        "handle": child.NativeWindowHandle,
                        "process_id": child.ProcessId
                    }))
    except Exception as ex:
        print(f"Error in get_apps: {ex}")
        apps = []
    return apps


def get_active_app() -> App | None:
    try:
        handle = uia.GetForegroundWindow()
        for app in get_apps():
            if app.handle != handle:
                continue
            return app
    except Exception as ex:
        print(f"Error in get_active_app: {ex}")
    return None


def get_app_status(control: uia.Control) -> Status:
    if uia.IsIconic(control.NativeWindowHandle):
        return Status.MINIMIZED
    elif uia.IsZoomed(control.NativeWindowHandle):
        return Status.MAXIMIZED
    elif uia.IsWindowVisible(control.NativeWindowHandle):
        return Status.NORMAL
    else:
        return Status.HIDDEN


def get_app_size(control: uia.Control):
    window = control.BoundingRectangle
    if window.isempty():
        return Size(width=0, height=0)
    return Size(width=window.width(), height=window.height())


def get_state(use_vision: bool = False) -> DesktopState:
    sleep(0.1)
    apps = get_apps()
    active_app = get_active_app()
    if active_app is not None and (active_app in apps):
        apps.remove(active_app)
    # print(f"Active app: {active_app}")
    # print(f"Apps: {apps}")
    tree_state = tree.get_state(active_app, apps)
    if use_vision:
        screenshot = tree.annotated_screenshot(
            tree_state.interactive_nodes)
    else:
        screenshot = None
    desktop_state = DesktopState(
        apps=apps, active_app=active_app, screenshot=screenshot, tree_state=tree_state)

    final_response = {
        "activeApp": desktop_state.active_app_to_string(),
        "apps": desktop_state.apps_to_string(),
        "interactiveElements": tree_state.interactive_elements_to_string(),
        'scrollableElements': tree_state.scrollable_elements_to_string()
    }

    return final_response


def is_app_running(name: str):
    apps = {app.name: app for app in get_apps()}
    response = process.extractOne(name, list(
        apps.keys()), score_cutoff=60) is not None
    return {"isAppRunning": response}


def resize_app(size: tuple[int, int] = None, loc: tuple[int, int] = None):
    active_app = get_active_app()
    if active_app is None:
        return {"content": "No active app found", "status": 1}
    if active_app.status == Status.MINIMIZED:
        return {"content": f"{active_app.name} is minimized", "status": 1}
    elif active_app.status == Status.MAXIMIZED:
        return {"content": f"{active_app.name} is maximized", "status": 1}
    else:
        app_control = uia.ControlFromHandle(active_app.handle)
        if loc is None:
            x = app_control.BoundingRectangle.left
            y = app_control.BoundingRectangle.top
            loc = (x, y)
        if size is None:
            width = app_control.BoundingRectangle.width()
            height = app_control.BoundingRectangle.height()
            size = (width, height)
        x, y = loc
        width, height = size
        app_control.MoveWindow(x, y, width, height)
        return {"content": f'{active_app.name} resized to {width}x{height} at {x},{y}.', "status": 0}


def bring_window_to_top(target_handle: int):
    foreground_handle = win32gui.GetForegroundWindow()
    foreground_thread, _ = win32process.GetWindowThreadProcessId(
        foreground_handle)
    target_thread, _ = win32process.GetWindowThreadProcessId(target_handle)
    try:
        ctypes.windll.user32.AllowSetForegroundWindow(-1)
        win32process.AttachThreadInput(
            foreground_thread, target_thread, True)
        win32gui.SetForegroundWindow(target_handle)
        win32gui.BringWindowToTop(target_handle)
    except Exception as e:
        print(f'Failed to bring window to top: {e}')
    finally:
        win32process.AttachThreadInput(
            foreground_thread, target_thread, False)


def switch_app(name: str):
    active_app = get_active_app()
    desktop_apps = get_apps()
    apps = {app.name: app for app in [
        active_app] + desktop_apps if app is not None}
    matched_app: Optional[tuple[str, float]] = process.extractOne(
        name, list(apps.keys()), score_cutoff=70)
    if matched_app is None:
        return {"content": f'Application {name.title()} not found.', "status": 1}
    app_name, _ = matched_app
    app = apps.get(app_name)
    target_handle = app.handle

    if uia.IsIconic(target_handle):
        uia.ShowWindow(target_handle, win32con.SW_RESTORE)
        content = f'{app_name.title()} restored from Minimized state.'
    else:
        bring_window_to_top(target_handle)
        content = f'Switched to {app_name.title()} window.'
    return {"content": content, "status": 0}


def execute_command(command: str) -> tuple[str, int]:
    try:
        encoded = base64.b64encode(
            command.encode("utf-16le")).decode("ascii")
        command_result = subprocess.run(
            ['powershell', '-NoProfile', '-EncodedCommand', encoded],
            capture_output=True,
            errors='ignore',
            timeout=25,
            cwd=os.path.expanduser(path='~')
        )
        stdout = command_result.stdout
        stderr = command_result.stderr
        return (stdout or stderr, command_result.returncode)
    except subprocess.TimeoutExpired:
        return ('Command execution timed out', 1)
    except Exception as e:
        return ('Command execution failed', 1)


def get_apps_from_start_menu() -> dict[str, str]:
    command = 'Get-StartApps | ConvertTo-Csv -NoTypeInformation'
    apps_info, _ = execute_command(command)
    reader = csv.DictReader(io.StringIO(apps_info))
    return {row.get('Name').lower(): row.get('AppID') for row in reader}


def launch_app(name: str) -> tuple[str, int]:
    apps_map = get_apps_from_start_menu()
    matched_app = process.extractOne(
        name, apps_map.keys(), score_cutoff=70)
    if matched_app is None:
        return {"content": f'{name.title()} not found in start menu.', "status": 1}
    app_name, _ = matched_app
    appid = apps_map.get(app_name)
    if appid is None:
        return {"content": f'{name.title()} not found in start menu.', "status": 1}
    if name.endswith('.exe'):
        response, status = execute_command(f'Start-Process {appid}')
    else:
        response, status = execute_command(
            f'Start-Process shell:AppsFolder\\{appid}')
    return {"content": response, "status": status}


def scrape_tool(url: str):
    apps = get_apps()
    active_app = get_active_app()
    tree_state = tree.get_state(active_app, apps)
    if not tree_state.dom_node:
        return {"content": f'Unable to scrape URL: {url}. No DOM node found.', "status": 1}
    dom_node = tree_state.dom_node
    vertical_scroll_percent = dom_node.vertical_scroll_percent
    content = '\n'.join(
        [node.text for node in tree_state.dom_informative_nodes])
    header_status = "Reached top" if vertical_scroll_percent <= 0 else "Scroll up to see more"
    footer_status = "Reached bottom" if vertical_scroll_percent >= 100 else "Scroll down to see more"
    return {"content": f'URL:{url}\nContent:\n{header_status}\n{content}\n{footer_status}', "status": 0}


if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise ValueError("Missing required arguments")

        arg = sys.argv[1].lower()

        # Configure output encoding once
        sys.stdout.reconfigure(encoding='utf-8')

        if arg == "desktop_state":
            if len(sys.argv) < 3:
                raise ValueError("desktop_state requires a boolean argument")
            use_vision = sys.argv[2].lower() in ['true', '1', 'yes']
            result = get_state(use_vision)

        elif arg == "is_app_running":
            if len(sys.argv) < 3:
                raise ValueError("is_app_running requires an app name")
            result = is_app_running(sys.argv[2])

        elif arg == "resize_app":
            if len(sys.argv) < 6:
                raise ValueError("resize_app requires an app name")
            size = (int(sys.argv[2]), int(sys.argv[3]))
            loc = (int(sys.argv[4]), int(sys.argv[5]))
            result = resize_app(size=size, loc=loc)

        elif arg == "switch_app":
            if len(sys.argv) < 3:
                raise ValueError("switch_app requires an app name")
            result = switch_app(sys.argv[2])
        elif arg == "scrape_tool":
            if len(sys.argv) < 3:
                raise ValueError("scrape_tool requires an url")
            result = scrape_tool(sys.argv[2])
        elif arg == "launch_app":
            if len(sys.argv) < 3:
                raise ValueError("launch_app requires a name")
            result = launch_app(sys.argv[2])
        else:
            raise ValueError(f"Unknown command: {arg}")

        # Output result
        print(json.dumps(result, ensure_ascii=False, indent=2))

    except Exception as e:
        # Output error as JSON to stderr
        error_response = {
            "error": str(e),
            "success": False
        }
        sys.stderr.reconfigure(encoding='utf-8')
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)
