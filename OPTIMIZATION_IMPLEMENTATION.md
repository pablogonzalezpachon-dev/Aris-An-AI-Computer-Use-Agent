# Quick Implementation Guide - Aris Optimizations

## Priority 1: Remove Console.log (10-20% Improvement)

### Create a logger utility:

```typescript
// src/core/logger.ts
const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => isDev && console.error(...args),
  warn: (...args: any[]) => isDev && console.warn(...args),
  info: (...args: any[]) => isDev && console.info(...args),
};

// Usage: Replace all console.log with logger.log
// Before: console.log("invoking messages");
// After: logger.log("invoking messages");
```

**Files to update**:

- `src/core/Agent/service.ts` (11+ console.log calls)
- `src/core/Agent/utils.ts` (1 console.log)
- `src/core/Agent/desktop/utils.ts` (6+ console.log calls)
- `src/core/llms/google.ts` (2 console.log calls)
- `src/main/porcupine-worker.ts` (5+ console.log calls)

---

## Priority 2: Disable DevTools in Production (5-15% Improvement)

### Update src/main/index.ts

```typescript
// Before:
win.webContents.openDevTools({ mode: "detach" });

// After:
if (process.env.NODE_ENV === "development") {
  win.webContents.openDevTools({ mode: "detach" });
}

// Or make it environment-based
if (process.env.OPEN_DEV_TOOLS === "true") {
  win.webContents.openDevTools({ mode: "detach" });
}
```

---

## Priority 3: Replace eval() with JSON.parse (5-10% Improvement)

### Update src/core/Agent/utils.ts

```typescript
// Before:
function extractAgentData(message: string): AgentData | undefined {
  let result = new AgentData();
  console.log(message);

  // ... extract XML ...

  if (actionInputMatch) {
    const actionInputStr = actionInputMatch[1].trim();
    try {
      action.params = eval(`(${actionInputStr})`);
    } catch (error) {
      action.params = JSON.parse(actionInputStr);
    }
    // ...
  }
}

// After:
function extractAgentData(message: string): AgentData | undefined {
  let result = new AgentData();

  // ... extract XML ...

  if (actionInputMatch) {
    const actionInputStr = actionInputMatch[1].trim();
    try {
      action.params = JSON.parse(actionInputStr);
    } catch (error) {
      logger.warn(`Failed to parse action input: ${actionInputStr}`, error);
      action.params = {};
    }
    // ...
  }
}
```

---

## Priority 4: Cache Desktop State (30-50% Improvement)

### Create a state cache in Agent/service.ts

```typescript
export default class Agent {
  // ... existing properties ...
  private lastDesktopState: DesktopState | undefined;
  private lastStateHash: string = "";
  private stateCacheTTL: number = 5000; // 5 seconds
  private lastStateTime: number = 0;

  // Add hash function
  private hashDesktopState(state: DesktopState): string {
    // Simple hash of critical state properties
    return JSON.stringify({
      activeApp: state.activeApp?.name,
      appCount: state.apps.length,
      interactiveCount: state.interactiveElements.length,
    });
  }

  // Modify getState to use cache
  private async getStateWithCache(useVision: boolean): Promise<DesktopState> {
    const now = Date.now();

    // If cache is fresh, return cached state
    if (
      this.lastDesktopState &&
      now - this.lastStateTime < this.stateCacheTTL
    ) {
      return this.lastDesktopState;
    }

    // Fetch fresh state
    const newState = await this.desktop.getState(useVision);
    const newHash = this.hashDesktopState(newState);

    // Only update if state actually changed
    if (newHash !== this.lastStateHash) {
      this.lastDesktopState = newState;
      this.lastStateHash = newHash;
    }

    this.lastStateTime = now;
    return this.lastDesktopState!;
  }

  // Use in invoke method:
  // Replace: let desktopState = await this.desktop.getState(this.useVision);
  // With: let desktopState = await this.getStateWithCache(this.useVision);
}
```

### Modify Python to support selective refresh:

```python
# DesktopState/main.py - Add optional parameters
def get_state(use_vision: bool = False, refresh_cache: bool = False) -> DesktopState:
    if not refresh_cache and hasattr(get_state, 'cached_state'):
        return get_state.cached_state

    # ... existing logic ...

    get_state.cached_state = desktop_state
    return desktop_state
```

---

## Priority 5: Image Caching for Vision Mode (15-25% Improvement)

### Update src/core/messages/service.ts

```typescript
class ImageMessage extends BaseMessage {
  role: "human" = "human";
  image: sharp.Sharp | null;
  mimeType: string;
  private scaledImageCache: Map<number, Buffer> = new Map();

  constructor(
    content: string,
    image: sharp.Sharp,
    mimeType: string = "image/png"
  ) {
    super("human", content);
    this.image = image;
    this.mimeType = mimeType;
  }

  async imageToBase64(): Promise<string | undefined> {
    const imageBytes = await this.imageToBytes();
    if (imageBytes) return Buffer.from(imageBytes).toString("base64");
  }

  async scaleImage(scale: number = 0.5): Promise<void> {
    if (!this.image) return;

    // Check cache first
    const cacheKey = Math.round(scale * 100);
    if (this.scaledImageCache.has(cacheKey)) {
      // Cache hit - restore from buffer
      const cachedBuffer = this.scaledImageCache.get(cacheKey)!;
      this.image = sharp(cachedBuffer);
      return;
    }

    const metadata = await this.image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const size = {
      width: Math.floor(width * scale),
      height: Math.floor(height * scale),
    };

    const scaledImage = this.image.resize(size.width, size.height);
    const buffer = await scaledImage.toBuffer();

    // Cache the scaled result
    this.scaledImageCache.set(cacheKey, buffer);

    this.image = scaledImage;
  }

  async imageToBytes(): Promise<Buffer<ArrayBufferLike> | undefined> {
    if (!this.image) return Buffer.alloc(0);
    return await this.image.toBuffer();
  }
}
```

---

## Priority 6: Optimize Python UIAutomation (40-60% Improvement)

### Update DesktopState/service.py

```python
from time import time
from functools import lru_cache

class Tree:
    def __init__(self):
        self.screen_size = get_screen_size()
        self.dom: Optional[Control] = None
        self.dom_bounding_box: BoundingBox = None
        self.screen_box = BoundingBox(
            top=0, left=0, bottom=self.screen_size.height, right=self.screen_size.width,
            width=self.screen_size.width, height=self.screen_size.height
        )
        # Add caching
        self._control_cache: dict = {}
        self._cache_timestamp: dict = {}
        self._cache_ttl = 0.5  # 500ms cache TTL

    def _get_cached_pattern(self, control: Control, pattern_id, cache_key: str):
        """Cache pattern queries to avoid repeated calls"""
        if cache_key in self._control_cache:
            cached_time = self._cache_timestamp.get(cache_key, 0)
            if time() - cached_time < self._cache_ttl:
                return self._control_cache[cache_key]

        try:
            pattern = control.GetPattern(pattern_id)
            self._control_cache[cache_key] = pattern
            self._cache_timestamp[cache_key] = time()
            return pattern
        except:
            return None

    def get_appwise_nodes(self, apps: list[Control]) -> tuple[list[TreeElementNode], list[ScrollElementNode], list[TextElementNode]]:
        interactive_nodes, scrollable_nodes, dom_informative_nodes = [], [], []

        # Reduce threads - only use for large window sets
        max_workers = min(len(apps), 4) if len(apps) > 10 else 1

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            retry_counts = {app: 0 for app in apps}
            future_to_app = {
                executor.submit(
                    self.get_nodes, app,
                    is_app_browser(app)
                ): app
                for app in apps
            }
            while future_to_app:
                for future in as_completed(list(future_to_app)):
                    app = future_to_app.pop(future)
                    try:
                        result = future.result()
                        if result:
                            element_nodes, scroll_nodes, dom_informative_nodes = result
                            interactive_nodes.extend(element_nodes)
                            scrollable_nodes.extend(scroll_nodes)
                            dom_informative_nodes.extend(dom_informative_nodes)
                    except Exception as e:
                        retry_counts[app] += 1
                        if retry_counts[app] < THREAD_MAX_RETRIES:
                            new_future = executor.submit(
                                self.get_nodes, app, is_app_browser(app))
                            future_to_app[new_future] = app

        return interactive_nodes, scrollable_nodes, dom_informative_nodes

    def get_nodes(self, node: Control, is_browser: bool = False) -> tuple[list[TreeElementNode], list[ScrollElementNode], list[TextElementNode]]:
        window_bounding_box = node.BoundingRectangle

        def is_element_visible(node: Control, threshold: int = 0):
            is_control = node.IsControlElement
            box = node.BoundingRectangle
            if box.isempty():
                return False
            width = box.width()
            height = box.height()
            area = width*height
            is_offscreen = (not node.IsOffscreen) or node.ControlTypeName in ['EditControl']
            return area > threshold and is_offscreen and is_control

        # ... rest of implementation
```

---

## Priority 7: Vite Build Optimization

### Update vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Optimize for production
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["lucide-react"],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
```

---

## Testing & Verification

After implementing optimizations:

```bash
# Measure performance
1. Use DevTools Lighthouse for UI metrics
2. Profile Python execution:
   python -m cProfile -s cumtime DesktopState/main.py
3. Monitor memory: psutil in Python, performance.now() in TypeScript
4. Measure: agent execution time, desktop state fetch time
```

---

## Expected Results

| Optimization         | Impact      | Effort | Gain          |
| -------------------- | ----------- | ------ | ------------- |
| Remove console.log   | Production  | 30min  | 10-20%        |
| Disable DevTools     | Production  | 5min   | 5-15%         |
| Replace eval()       | Runtime     | 15min  | 5-10%         |
| Cache desktop state  | Runtime     | 1hr    | 30-50%        |
| Optimize Python tree | Runtime     | 2hrs   | 40-60%        |
| Image caching        | Vision mode | 45min  | 15-25%        |
| Vite optimization    | Build       | 30min  | 20-30% bundle |

**Total Time: ~5-6 hours for 50-85% improvement**
