/* eslint-env worker */
// A worker belongs to one selected attachment and is terminated on navigation or timeout.
let workbookBytes;
let spreadsheet;
let sheetNames;

/** Reads a bounded, plain-text worksheet; formulas, links and macros are never executed. */
const readSheet = (name) => {
  if (!sheetNames.includes(name)) throw new Error("Worksheet not found.");
  const workbook = spreadsheet.read(workbookBytes, {
    type: "array", sheets: name, sheetRows: 1001, dense: true,
    cellHTML: false, cellFormula: true, sheetStubs: true, bookVBA: false, cellStyles: false,
  });
  const sheet = workbook.Sheets[name];
  if (!sheet?.["!ref"]) return { sheetName: name, rows: [], startRow: 0, startCol: 0, truncated: false };
  const range = spreadsheet.utils.decode_range(sheet["!ref"]);
  const full = spreadsheet.utils.decode_range(sheet["!fullref"] || sheet["!ref"]);
  const endRow = Math.min(range.e.r, range.s.r + 999);
  const endCol = Math.min(range.e.c, range.s.c + 49);
  let textBudget = 2000000;
  let truncated = full.e.r > endRow || full.e.c > endCol;
  const rows = [];
  for (let row = range.s.r; row <= endRow && textBudget > 0; row += 1) {
    const values = [];
    for (let col = range.s.c; col <= endCol; col += 1) {
      const cell = sheet["!data"]?.[row]?.[col] || sheet[spreadsheet.utils.encode_cell({ r: row, c: col })];
      const value = cell?.f && cell.v == null ? "Not calculated"
        : cell ? String(cell.w ?? (cell.v == null ? "" : spreadsheet.utils.format_cell(cell))) : "";
      const limit = Math.min(2000, textBudget);
      values.push(value.slice(0, limit));
      if (value.length > limit) truncated = true;
      textBudget -= Math.min(value.length, limit);
    }
    rows.push(values);
  }
  if (textBudget <= 0) truncated = true;
  return { sheetName: name, rows, startRow: range.s.r, startCol: range.s.c, truncated };
};

/** Decodes only the primary HEIC image, rejecting oversized dimensions before allocating RGBA. */
const decodeHeic = async (buffer) => {
  const { default: createHeif } = await import("libheif-js/libheif-wasm/libheif-bundle.mjs");
  const heif = await createHeif();
  const decoder = new heif.HeifDecoder();
  const images = decoder.decode(new Uint8Array(buffer));
  try {
    const image = images.find((entry) => entry.is_primary()) || images[0];
    if (!image) throw new Error("This HEIC format could not be decoded. Download the original image to view it.");
    const width = image.get_width();
    const height = image.get_height();
    if (width <= 0 || height <= 0 || width * height > 25000000) {
      throw new Error("This image exceeds the 25 megapixel preview limit. Download the original to view it.");
    }
    const pixels = await new Promise((resolve, reject) => {
      image.display({ width, height, data: new Uint8ClampedArray(width * height * 4) }, (result) => {
        if (result) resolve(result);
        else reject(new Error("This HEIC image could not be decoded."));
      });
    });
    return { width, height, pixels: pixels.data.buffer, multipleImages: images.length > 1 };
  } finally {
    images.forEach((image) => image.free());
    // The worker is terminated after conversion, releasing the decoder and WASM heap.
  }
};

self.onmessage = async ({ data }) => {
  try {
    if (data.type === "heic") {
      const image = await decodeHeic(data.buffer);
      self.postMessage({ type: "heic", ...image }, [image.pixels]);
    } else if (data.type === "workbook") {
      const bytes = new Uint8Array(data.buffer);
      const zip = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
      const compound = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((byte, index) => bytes[index] === byte);
      const legacyBiff = bytes[0] === 0x09 && [0x00, 0x02, 0x04, 0x08].includes(bytes[1]);
      // Avoid the parser's text/CSV fallback for damaged or incorrectly named Excel files.
      if (!zip && !compound && !legacyBiff) throw new Error("This file is not a supported Excel workbook.");
      spreadsheet = await import("xlsx");
      workbookBytes = data.buffer;
      const metadata = spreadsheet.read(workbookBytes, { type: "array", bookSheets: true });
      sheetNames = metadata.SheetNames;
      if (!sheetNames.length) throw new Error("This workbook has no worksheets.");
      if (sheetNames.length > 100) throw new Error("This workbook exceeds the 100 worksheet preview limit.");
      self.postMessage({ type: "sheet", sheetNames, ...readSheet(sheetNames[0]) });
    } else if (data.type === "sheet") {
      self.postMessage({ type: "sheet", sheetNames, ...readSheet(data.name) });
    }
  } catch (error) {
    self.postMessage({ type: "error", message: error.message || "Unable to prepare this preview." });
  }
};
