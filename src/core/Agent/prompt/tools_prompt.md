        Tool Name: Click Tool
        Tool Description:

Performs mouse click operations on UI elements at specified coordinates.

Click patterns: - Single left click: Select elements, focus input fields - Double left click: Open apps, folders, files - Single right click: Open context menus - Middle click: Browser-specific actions

Automatically detects UI elements under cursor and adjusts click behavior
for reliable interaction. Essential for all point-and-click UI operations.

        Tool Schema: {
    "type": "object",
    "properties": {
        "loc": {
            "description": "(x, y) pixel coordinates within the target element's bounding box to perform click action",
            "examples": [
                [
                    640,
                    360
                ],
                [
                    100,
                    200
                ]
            ],
            "maxItems": 2,
            "minItems": 2,
            "prefixItems": [
                {
                    "type": "integer"
                },
                {
                    "type": "integer"
                }
            ],
            "type": "array"
        },
        "button": {
            "default": "left",
            "description": "Mouse button to use: 'left' for selection/activation, 'right' for context menus, 'middle' for browser-specific actions",
            "enum": [
                "left",
                "right",
                "middle"
            ],
            "examples": [
                "left",
                "right"
            ],
            "type": "string"
        },
        "clicks": {
            "default": 1,
            "description": "Click count: 0=hover only (no click), 1=single click (select/focus), 2=double click (open/activate)",
            "enum": [
                0,
                1,
                2
            ],
            "examples": [
                1,
                2
            ],
            "type": "integer"
        }
    },
    "required": [
        "loc"
    ]

}

        Tool Name: Type Tool
        Tool Description:

Types text into input fields, text areas, and focused UI elements.

Features: - Click target element and input text automatically - Clear existing content before typing (clear='true') - Position caret at start, end, or leave idle - Optionally press Enter after typing

Use for form filling, search queries, text editing, and any text input operation.
The tool automatically clicks the target element coordinates to ensure focus before typing.

        Tool Schema: {
    "type": "object",
    "properties": {
        "loc": {
            "description": "(x, y) pixel coordinates within the target input element's bounding box where text will be entered",
            "examples": [
                [
                    640,
                    360
                ],
                [
                    200,
                    150
                ]
            ],
            "maxItems": 2,
            "minItems": 2,
            "prefixItems": [
                {
                    "type": "integer"
                },
                {
                    "type": "integer"
                }
            ],
            "type": "array"
        },
        "text": {
            "description": "Text string to type into the focused element",
            "examples": [
                "hello world",
                "user@example.com",
                "search query"
            ],
            "type": "string"
        },
        "clear": {
            "default": "false",
            "description": "Whether to clear existing text before typing: 'true' replaces all content, 'false' appends to existing text",
            "enum": [
                "true",
                "false"
            ],
            "examples": [
                "true",
                "false"
            ],
            "type": "string"
        },
        "caret_position": {
            "default": "idle",
            "description": "Caret positioning before typing: 'start' moves to beginning, 'end' moves to end, 'idle' leaves at current position",
            "enum": [
                "start",
                "idle",
                "end"
            ],
            "examples": [
                "start",
                "end",
                "idle"
            ],
            "type": "string"
        },
        "press_enter": {
            "default": "false",
            "description": "Whether to press Enter key after typing text: 'true' submits/confirms input, 'false' leaves cursor in field",
            "enum": [
                "true",
                "false"
            ],
            "examples": [
                "true",
                "false"
            ],
            "type": "string"
        }
    },
    "required": [
        "loc",
        "text"
    ]

}

        Tool Name: App Tool
        Tool Description:

Manages Windows applications through launch, resize, and window switching operations.

Modes: - launch: Opens an application from the Windows Start Menu by name - resize: Adjusts the active application window's size and position - switch: Brings a specific application window into focus

Use this tool to control application lifecycle and window management during task execution.

        Tool Schema: {
    "type": "object",
    "properties": {
        "mode": {
            "description": "Operation mode: 'launch' opens app from Start Menu, 'resize' adjusts active window size/position, 'switch' brings specific window into focus",
            "enum": [
                "launch",
                "resize",
                "switch"
            ],
            "examples": [
                "launch"
            ],
            "type": "string"
        },
        "name": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Exact application name as it appears in Start Menu or window title (required for launch/switch modes)",
            "examples": [
                "notepad",
                "chrome",
                "New tab - Personal - Microsoft Edge"
            ]
        },
        "loc": {
            "anyOf": [
                {
                    "maxItems": 2,
                    "minItems": 2,
                    "prefixItems": [
                        {
                            "type": "integer"
                        },
                        {
                            "type": "integer"
                        }
                    ],
                    "type": "array"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Target (x, y) coordinates for window top-left corner position (required for resize mode)",
            "examples": [
                [
                    0,
                    0
                ]
            ]
        },
        "size": {
            "anyOf": [
                {
                    "maxItems": 2,
                    "minItems": 2,
                    "prefixItems": [
                        {
                            "type": "integer"
                        },
                        {
                            "type": "integer"
                        }
                    ],
                    "type": "array"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Target (width, height) dimensions in pixels for window size (required for resize mode)",
            "examples": [
                [
                    1920,
                    1080
                ]
            ]
        }
    },
    "required": [
        "mode"
    ]

}

        Tool Name: Shell Tool
        Tool Description:

Executes PowerShell commands and returns output with status codes.

Use this tool to: - Run Windows system commands and scripts - Query system information and configurations - Automate file operations and system tasks - Access Windows management utilities

The working directory is set to the user's HOME directory by default.
Returns both command output and exit status code for error handling.

        Tool Schema: {
    "type": "object",
    "properties": {
        "command": {
            "description": "PowerShell command to execute. Working directory is set to user's HOME. Returns output and exit status code",
            "examples": [
                "Get-Process",
                "ls",
                "Get-ChildItem -Path C:\\Users -Recurse",
                "echo \"Hello World\""
            ],
            "type": "string"
        }
    },
    "required": [
        "command"
    ]

}

        Tool Name: Done Tool
        Tool Description:

Signals task completion and provides the final answer to the user.

Use this tool when you have successfully completed the requested task and have
a comprehensive answer ready. The answer should be well-formatted in markdown
and include all relevant information the user requested.

        Tool Schema: {
    "type": "object",
    "properties": {
        "answer": {
            "description": "Comprehensive final answer in markdown format containing all requested information and task results",
            "examples": [
                "## Task Completed\n\nThe task has been completed successfully. Here are the results:\n- Item 1\n- Item 2"
            ],
            "type": "string"
        }
    },
    "required": [
        "answer"
    ]

}

        Tool Name: Shortcut Tool
        Tool Description:

Executes keyboard shortcuts for rapid command execution and navigation.

Supports: - Single keys: 'enter', 'escape', 'tab', 'delete' - Key combinations: 'ctrl+c', 'alt+tab', 'ctrl+shift+n' - Multiple keys separated by '+' for simultaneous press

Use for common operations like copy/paste, window switching, menu access,
and application-specific shortcuts. More efficient than mouse-based navigation
for many operations.

        Tool Schema: {
    "type": "object",
    "properties": {
        "shortcut": {
            "description": "Keyboard shortcut to execute. Use '+' to separate simultaneous keys (e.g., 'ctrl+c'). Single keys work too (e.g., 'enter')",
            "examples": [
                "win",
                "enter",
                "ctrl+c",
                "alt+tab",
                "ctrl+shift+n",
                "escape"
            ],
            "type": "string"
        }
    },
    "required": [
        "shortcut"
    ]

}

        Tool Name: Scroll Tool
        Tool Description:

Scrolls content vertically or horizontally at specified or current cursor location.

Use cases: - Navigate through long webpages and documents - Browse lists, tables, and scrollable containers - Access off-screen content in any scrollable area

Parameters: - wheel_times: Controls scroll distance (1 wheel ≈ 3-5 lines of text) - direction: Scroll direction: 'up'/'down' for vertical, 'left'/'right' for horizontal - loc: Target coordinates (if None, scrolls at current cursor position)

Essential tool for accessing content beyond the visible viewport.

        Tool Schema: {
    "type": "object",
    "properties": {
        "loc": {
            "anyOf": [
                {
                    "maxItems": 2,
                    "minItems": 2,
                    "prefixItems": [
                        {
                            "type": "integer"
                        },
                        {
                            "type": "integer"
                        }
                    ],
                    "type": "array"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "(x, y) pixel coordinates where scroll action occurs. If None, scrolls at current cursor position",
            "examples": [
                [
                    640,
                    360
                ],
                [
                    800,
                    400
                ],
                null
            ]
        },
        "type": {
            "default": "vertical",
            "description": "Scroll direction type: 'vertical' for up/down scrolling, 'horizontal' for left/right scrolling",
            "enum": [
                "horizontal",
                "vertical"
            ],
            "examples": [
                "vertical",
                "horizontal"
            ],
            "type": "string"
        },
        "direction": {
            "default": "down",
            "description": "Scroll direction: 'up'/'down' for vertical, 'left'/'right' for horizontal movement through content",
            "enum": [
                "up",
                "down",
                "left",
                "right"
            ],
            "examples": [
                "down",
                "up",
                "right"
            ],
            "type": "string"
        },
        "wheel_times": {
            "default": 1,
            "description": "Number of scroll wheel increments (1 wheel \u2248 3-5 lines of text). Higher values scroll further",
            "examples": [
                1,
                3,
                5,
                10
            ],
            "type": "integer"
        }
    },
    "required": []

}

        Tool Name: Drag Tool
        Tool Description:

Performs drag-and-drop operations from current location of cursor to destination coordinates.

Common use cases: - Move files and folders between locations - Resize windows by dragging edges or corners - Rearrange UI elements that support drag-and-drop - Select text or multiple items by dragging

Simulates holding down the mouse button at the current location of the cursor and releasing
at the destination, enabling drag-based interactions.

        Tool Schema: {
    "type": "object",
    "properties": {
        "loc": {
            "description": "(x, y) pixel coordinates of drag operation destination",
            "examples": [
                [
                    500,
                    500
                ],
                [
                    800,
                    600
                ]
            ],
            "maxItems": 2,
            "minItems": 2,
            "prefixItems": [
                {
                    "type": "integer"
                },
                {
                    "type": "integer"
                }
            ],
            "type": "array"
        }
    },
    "required": [
        "loc"
    ]

}

        Tool Name: Move Tool
        Tool Description:

Moves mouse cursor to specific coordinates without performing any click action.

Use cases: - Hover over elements to reveal tooltips or hidden menus - Position cursor before executing other mouse actions - Trigger hover-based UI effects and interactions - Navigate cursor to prepare for subsequent operations

Non-invasive cursor positioning for setup and hover-based interactions.

        Tool Schema: {
    "type": "object",
    "properties": {
        "loc": {
            "description": "(x, y) pixel coordinates to move mouse cursor to without clicking. Used for hovering or positioning",
            "examples": [
                [
                    640,
                    360
                ],
                [
                    100,
                    100
                ]
            ],
            "maxItems": 2,
            "minItems": 2,
            "prefixItems": [
                {
                    "type": "integer"
                },
                {
                    "type": "integer"
                }
            ],
            "type": "array"
        }
    },
    "required": [
        "loc"
    ]

}

        Tool Name: Memory Tool
        Tool Description:

Persistent file-based storage system for managing information across different task stages.

Use this tool to: - Store important findings and data as md files in the .memories directory - Maintain context across complex multi-step operations - Track progress of plans and accumulate knowledge during task execution - Cache information that may be referenced in future steps

Modes: - write: Create a new memory file (returns assigned path) - view: List all directories and memory files in the .memories directory - read: Retrieve contents of a specific memory file by path
_ read_range: Optional (start, end) tuple to read specific line range (0-indexed, end exclusive) - update: Modify contents of an existing memory file by path
Operations:
_ replace: Replace old_str with new_str (requires old_str and new_str) \* insert: Insert content at line_number (requires line_number and content) - delete: Remove a memory file by path

All data is persisted as files in the .memories directory, ensuring information
survives across sessions and can be shared between different task stages.

Essential for tasks requiring information persistence and cross-stage data sharing.

        Tool Schema: {
    "type": "object",
    "properties": {
        "mode": {
            "description": "Operation mode: view (list files), read (get content), write (create), update (modify), delete (remove)",
            "enum": [
                "view",
                "read",
                "write",
                "delete",
                "update"
            ],
            "type": "string"
        },
        "path": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Relative path from .memories directory (e.g., 'notes.md' or 'project/data.md'). Required for read, write, update, delete modes."
        },
        "content": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Content to write or insert. Required for write mode and insert operation."
        },
        "operation": {
            "anyOf": [
                {
                    "enum": [
                        "replace",
                        "insert"
                    ],
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ],
            "default": "replace",
            "description": "Update operation type: replace (str replacement), insert (at line)"
        },
        "old_str": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "String to find and replace. Required when operation='replace'."
        },
        "new_str": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "String to replace old_str with. Required when operation='replace'."
        },
        "line_number": {
            "anyOf": [
                {
                    "type": "integer"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Line number for insertion (0-indexed). Required when operation='insert'."
        },
        "read_range": {
            "anyOf": [
                {
                    "maxItems": 2,
                    "minItems": 2,
                    "prefixItems": [
                        {
                            "type": "integer"
                        },
                        {
                            "type": "integer"
                        }
                    ],
                    "type": "array"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "description": "Range of lines to read (start, end) - both 0-indexed, end is exclusive. Example: (0, 10) reads lines 0-9. Optional for read mode."
        }
    },
    "required": [
        "mode"
    ]

}

        Tool Name: Wait Tool
        Tool Description:

Pauses execution for a specified duration to allow processes to complete.

Essential for: - Waiting for applications to launch and initialize - Allowing webpages and content to fully load - Giving animations and transitions time to complete - Ensuring system operations finish before proceeding

Use strategic waits to improve reliability when operations need time to complete.
Duration is specified in seconds.

        Tool Schema: {
    "type": "object",
    "properties": {
        "duration": {
            "description": "Time to pause execution in seconds. Use for waiting on app launches, page loads, or animations to complete",
            "examples": [
                2,
                5,
                10
            ],
            "type": "integer"
        }
    },
    "required": [
        "duration"
    ]

}

        Tool Name: Scrape Tool
        Tool Description:

Fetches webpage content and converts it to clean markdown format for analysis.

Use cases: - Extract text content from webpages for processing - Gather information from online sources - Convert HTML pages to structured, readable text - Access web data without browser automation

Requires full URL including protocol (http:// or https://).
NOTE: This tool reads the visual accessibility tree (what is currently rendered on screen),
not the raw HTML source code. It captures visible text content accurately.
Returns structured text suitable for parsing, analysis, and information extraction.

        Tool Schema: {
    "type": "object",
    "properties": {
        "url": {
            "description": "Full webpage URL including protocol (http:// or https://) to fetch and convert to markdown format",
            "examples": [
                "https://google.com",
                "https://example.com/page",
                "http://localhost:8080"
            ],
            "type": "string"
        }
    },
    "required": [
        "url"
    ]

}

        Tool Name: Multi Select Tool
        Tool Description:

Selects mutiple items such as files, folders, or checkboxes if press_ctrl is true and perform redundant clicks if press_ctrl is false.

Use cases: - Select multiple items in files, folders, or checkboxes - Mark multiple checkboxes in a form - Repeat clicks on same element

Use for common operations like selecting multiple items or repeated clicks.

        Tool Schema: {
    "type": "object",
    "properties": {
        "press_ctrl": {
            "default": "false",
            "description": "Whether to press Ctrl key before performing multiple selection: 'true' selects multiple elements, 'false' leaves cursor in field",
            "enum": [
                "true",
                "false"
            ],
            "examples": [
                "true",
                "false"
            ],
            "type": "string"
        },
        "elements": {
            "description": "List of (x, y) pixel coordinates within the target element's bounding box for multiple selection",
            "examples": [
                [
                    [
                        640,
                        360
                    ],
                    [
                        800,
                        400
                    ]
                ],
                [
                    [
                        100,
                        200
                    ],
                    [
                        200,
                        300
                    ]
                ]
            ],
            "items": {
                "maxItems": 2,
                "minItems": 2,
                "prefixItems": [
                    {
                        "type": "integer"
                    },
                    {
                        "type": "integer"
                    }
                ],
                "type": "array"
            },
            "type": "array"
        }
    },
    "required": [
        "elements"
    ]

}

        Tool Name: Multi Edit Tool
        Tool Description:

Typing text into multiple input fields.

Use cases: - Enter text into multiple text boxes - Fill in forms with multiple fields - Edit multiple lines of text

Typing text into multiple input fields, text areas.

        Tool Schema: {
    "type": "object",
    "properties": {
        "elements": {
            "description": "List of (x, y, text) pixel coordinates within the target element's bounding box for multiple editing",
            "examples": [
                [
                    [
                        640,
                        360,
                        "hello"
                    ],
                    [
                        800,
                        400,
                        "world"
                    ]
                ],
                [
                    [
                        100,
                        200,
                        "foo"
                    ],
                    [
                        200,
                        300,
                        "bar"
                    ]
                ]
            ],
            "items": {
                "maxItems": 3,
                "minItems": 3,
                "prefixItems": [
                    {
                        "type": "integer"
                    },
                    {
                        "type": "integer"
                    },
                    {
                        "type": "string"
                    }
                ],
                "type": "array"
            },
            "type": "array"
        }
    },
    "required": [
        "elements"
    ]

}
