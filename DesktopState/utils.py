import random
import uiautomation as uia
from views import Size
from psutil import Process
from PIL import Image
import pyautogui as pg

INTERACTIVE_CONTROL_TYPE_NAMES = set([
    'ButtonControl',
    'ListItemControl',
    'MenuItemControl',
    'EditControl',
    'CheckBoxControl',
    'RadioButtonControl',
    'ComboBoxControl',
    'HyperlinkControl',
    'SplitButtonControl',
    'TabItemControl',
    'TreeItemControl',
    'DataItemControl',
    'HeaderItemControl',
    'TextBoxControl',
    'SpinnerControl',
    'ScrollBarControl'
])

DOCUMENT_CONTROL_TYPE_NAMES = set([
    'DocumentControl'
])

STRUCTURAL_CONTROL_TYPE_NAMES = set([
    'PaneControl',
    'GroupControl',
    'CustomControl'
])

INFORMATIVE_CONTROL_TYPE_NAMES = set([
    'TextControl',
    'ImageControl',
    'StatusBarControl',
    # 'ProgressBarControl',
    # 'ToolTipControl',
    # 'TitleBarControl',
    # 'SeparatorControl',
    # 'HeaderControl',
    # 'HeaderItemControl',
])

DEFAULT_ACTIONS = set([
    'Click',
    'Press',
    'Jump',
    'Check',
    'Uncheck',
    'Double Click'
])

BROWSER_NAMES = set([
    'msedge.exe',
    'chrome.exe',
    'firefox.exe'
])

THREAD_MAX_RETRIES = 3


def random_point_within_bounding_box(node: uia.Control, scale_factor: float = 1.0) -> tuple[int, int]:
    """
    Generate a random point within a scaled-down bounding box.

    Args:
        node (Control): The node with a bounding rectangle
        scale_factor (float, optional): The factor to scale down the bounding box. Defaults to 1.0.

    Returns:
        tuple: A random point (x, y) within the scaled-down bounding box
    """
    box = node.BoundingRectangle
    scaled_width = int(box.width() * scale_factor)
    scaled_height = int(box.height() * scale_factor)
    scaled_left = box.left + (box.width() - scaled_width) // 2
    scaled_top = box.top + (box.height() - scaled_height) // 2
    x = random.randint(scaled_left, scaled_left + scaled_width)
    y = random.randint(scaled_top, scaled_top + scaled_height)
    return (x, y)


def get_screen_size() -> Size:
    width, height = uia.GetScreenSize()
    return Size(width=width, height=height)


def is_app_browser(node: uia.Control):
    process = Process(node.ProcessId)
    return process.name() in BROWSER_NAMES


def get_screenshot() -> Image.Image:
    return pg.screenshot()
