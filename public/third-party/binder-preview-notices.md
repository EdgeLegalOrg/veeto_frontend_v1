# Binder preview dependencies

The browser preview worker includes these unmodified dependencies through the frontend build:

| Dependency | Version | Package licence | Source |
| --- | --- | --- | --- |
| libheif-js | 1.23.5 | LGPL-3.0 | https://github.com/catdad-experiments/libheif-js |
| SheetJS Community Edition (`xlsx`) | 0.20.3 | Apache-2.0 | https://git.sheetjs.com/sheetjs/sheetjs |

The corresponding package licence texts are distributed alongside this notice as `libheif-js-LICENSE.txt` and `sheetjs-LICENSE.txt`. Upstream libheif sources and build instructions are linked from the libheif-js repository and https://github.com/strukturag/libheif.

SheetJS is installed from its versioned official release archive at https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz. Both libraries are bundled with the application; previews do not load scripts from a third-party CDN at runtime or send attachment contents to a conversion service.
