import { Injectable } from '@angular/core';
import type { WorkBook, WorkSheet } from 'xlsx';
import { BulkImportProductItem } from './products.service';

/**
 * Definición de una columna de la plantilla oficial de inventario.
 */
interface TemplateColumn {
  header: string;
  key: keyof BulkImportProductItem;
  required: boolean;
  description: string;
  example: [string | number, string | number];
}

/**
 * Error de validación de una fila concreta del archivo.
 */
export interface ImportRowError {
  /** Número de fila tal como lo ve el usuario en Excel (la fila 1 son los encabezados). */
  row: number;
  messages: string[];
}

/**
 * Resultado del análisis local del archivo, antes de enviarlo al backend.
 */
export interface ParsedImportFile {
  fileName: string;
  totalRows: number;
  validItems: BulkImportProductItem[];
  rowErrors: ImportRowError[];
}

/**
 * Error estructural que impide procesar el archivo (formato, encabezados, tamaño).
 */
export class ImportFileError extends Error {
  constructor(message: string, public readonly details: string[] = []) {
    super(message);
    this.name = 'ImportFileError';
  }
}

/**
 * Servicio de importación de inventario mediante la plantilla oficial de Firmeza.
 * Responsabilidades:
 *  - Generar y descargar la plantilla oficial (.xlsx).
 *  - Leer archivos .xlsx, .xls y .csv (separador y codificación detectados automáticamente).
 *  - Validar estrictamente los encabezados y el contenido de cada fila.
 *  - Normalizar símbolos monetarios y separadores de miles/decimales.
 * No realiza llamadas HTTP: el envío al backend es responsabilidad de ProductsService.
 */
@Injectable({
  providedIn: 'root'
})
export class InventoryImportService {
  static readonly MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
  static readonly MAX_ROWS = 2000;
  static readonly ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
  static readonly TEMPLATE_FILE_NAME = 'Plantilla_Inventario_Firmeza.xlsx';

  /** Columnas oficiales. Los límites coinciden con BulkImportProductItemDto del backend. */
  static readonly COLUMNS: TemplateColumn[] = [
    { header: 'SKU', key: 'sku', required: true, description: 'Código único del producto (máx. 30 caracteres).', example: ['CEM-001', 'VAR-12MM'] },
    { header: 'Nombre', key: 'name', required: true, description: 'Nombre comercial (máx. 80 caracteres).', example: ['Cemento Gris 50kg', 'Varilla Corrugada 12mm'] },
    { header: 'Descripcion', key: 'description', required: false, description: 'Detalle adicional (máx. 500 caracteres).', example: ['Cemento de uso general', 'Varilla de acero 6 metros'] },
    { header: 'Categoria', key: 'category', required: true, description: 'Categoría principal (máx. 40 caracteres).', example: ['Materiales', 'Aceros'] },
    { header: 'Cantidad', key: 'stock', required: true, description: 'Unidades en stock. Número entero entre 0 y 100.000.', example: [150, 80] },
    { header: 'PrecioCosto', key: 'costPrice', required: true, description: 'Costo unitario. Acepta $, puntos y comas (ej. $18.500).', example: [18500, 32000.5] },
    { header: 'PrecioVenta', key: 'salePrice', required: true, description: 'Precio de venta unitario. Debe ser mayor a 0.', example: [25000, 41500] },
    { header: 'Ubicacion', key: 'location', required: false, description: 'Bodega o pasillo (máx. 30 caracteres). Si se omite: "Sin asignar".', example: ['Bodega A - P2', 'Patio 1'] },
    { header: 'StockMinimo', key: 'minStock', required: false, description: 'Umbral de alerta de stock bajo. Entero entre 0 y 100.000 (por defecto 5).', example: [10, 20] }
  ];

  // ---------------------------------------------------------------------------
  // Plantilla
  // ---------------------------------------------------------------------------

  /**
   * Genera la plantilla oficial con dos filas de ejemplo y una hoja de instrucciones.
   */
  async downloadTemplate(): Promise<void> {
    const XLSX = await import('xlsx');
    const columns = InventoryImportService.COLUMNS;

    const dataSheet = XLSX.utils.aoa_to_sheet([
      columns.map(c => c.header),
      columns.map(c => c.example[0]),
      columns.map(c => c.example[1])
    ]);
    dataSheet['!cols'] = columns.map(c => ({ wch: Math.max(14, c.header.length + 4, String(c.example[0]).length + 2) }));

    const helpSheet = XLSX.utils.aoa_to_sheet([
      ['Columna', 'Obligatoria', 'Descripción'],
      ...columns.map(c => [c.header, c.required ? 'Sí' : 'No', c.description]),
      [],
      ['Notas'],
      ['- No cambie el nombre de los encabezados de la hoja "Inventario".'],
      ['- Reemplace las filas de ejemplo por sus productos.'],
      [`- Máximo ${InventoryImportService.MAX_ROWS} productos por archivo.`],
      ['- Si un SKU ya existe, podrá elegir entre sumar la cantidad o sobrescribir los datos.']
    ]);
    helpSheet['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 80 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Inventario');
    XLSX.utils.book_append_sheet(workbook, helpSheet, 'Instrucciones');
    XLSX.writeFile(workbook, InventoryImportService.TEMPLATE_FILE_NAME);
  }

  // ---------------------------------------------------------------------------
  // Lectura y validación del archivo
  // ---------------------------------------------------------------------------

  /**
   * Lee y valida el archivo. Lanza ImportFileError si la estructura es inválida;
   * los errores de contenido se devuelven por fila en el resultado.
   */
  async parseFile(file: File): Promise<ParsedImportFile> {
    this.validateFileMeta(file);

    const XLSX = await import('xlsx');
    const workbook = await this.readWorkbook(file, XLSX);
    const sheet = this.pickSheet(workbook);

    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '', blankrows: false });
    if (matrix.length === 0) {
      throw new ImportFileError('El archivo está vacío.');
    }

    const columnIndex = this.mapHeaders(matrix[0]);

    const dataRows = matrix
      .slice(1)
      .map((cells, i) => ({ cells, excelRow: i + 2 }))
      .filter(r => r.cells.some(c => String(c ?? '').trim() !== ''));

    if (dataRows.length === 0) {
      throw new ImportFileError('El archivo no contiene productos debajo de los encabezados.');
    }

    if (dataRows.length > InventoryImportService.MAX_ROWS) {
      throw new ImportFileError(
        `El archivo contiene ${dataRows.length} productos y el máximo por importación es ${InventoryImportService.MAX_ROWS}.`,
        ['Divida el archivo en varios lotes más pequeños.']
      );
    }

    const validItems: BulkImportProductItem[] = [];
    const rowErrors: ImportRowError[] = [];

    for (const { cells, excelRow } of dataRows) {
      const { item, errors } = this.parseRow(cells, columnIndex);
      if (errors.length > 0 || !item) {
        rowErrors.push({ row: excelRow, messages: errors });
      } else {
        validItems.push(item);
      }
    }

    return { fileName: file.name, totalRows: dataRows.length, validItems, rowErrors };
  }

  private validateFileMeta(file: File): void {
    const name = file.name.toLowerCase();
    if (!InventoryImportService.ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))) {
      throw new ImportFileError('Formato de archivo no soportado.', ['Use un archivo .xlsx, .xls o .csv basado en la plantilla oficial.']);
    }

    if (file.size === 0) {
      throw new ImportFileError('El archivo está vacío.');
    }

    if (file.size > InventoryImportService.MAX_FILE_BYTES) {
      throw new ImportFileError('El archivo supera el tamaño máximo permitido de 5 MB.');
    }
  }

  private async readWorkbook(file: File, XLSX: typeof import('xlsx')): Promise<WorkBook> {
    const buffer = await file.arrayBuffer();

    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = this.decodeText(buffer);
        // raw: true evita que SheetJS interprete "25.000" como 25; la normalización la hacemos nosotros.
        return XLSX.read(text, { type: 'string', raw: true, FS: this.detectDelimiter(text) });
      }

      return XLSX.read(buffer, { type: 'array' });
    } catch {
      throw new ImportFileError('No fue posible leer el archivo. Verifique que no esté dañado ni protegido con contraseña.');
    }
  }

  /** Decodifica como UTF-8 y, si falla, como Windows-1252 (CSV guardado por Excel en español). */
  private decodeText(buffer: ArrayBuffer): string {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
    } catch {
      return new TextDecoder('windows-1252').decode(buffer);
    }
  }

  /** Detecta el separador del CSV a partir de la línea de encabezados (; , o tabulación). */
  private detectDelimiter(text: string): string {
    const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
    const candidates = [';', ',', '\t'];
    return candidates.reduce((best, sep) =>
      firstLine.split(sep).length > firstLine.split(best).length ? sep : best, ',');
  }

  /** Usa la hoja "Inventario" si existe; si no, la primera hoja del libro. */
  private pickSheet(workbook: WorkBook): WorkSheet {
    const name = workbook.SheetNames.find(n => this.normalizeHeader(n) === 'inventario') ?? workbook.SheetNames[0];
    const sheet = name ? workbook.Sheets[name] : undefined;
    if (!sheet) {
      throw new ImportFileError('El archivo no contiene hojas de cálculo.');
    }
    return sheet;
  }

  /**
   * Valida los encabezados contra la plantilla oficial y devuelve la posición de cada columna.
   * La comparación ignora mayúsculas, tildes y espacios ("Categoría" = "Categoria"),
   * pero exige que el nombre sea el de la plantilla.
   */
  private mapHeaders(headerRow: unknown[]): Map<keyof BulkImportProductItem, number> {
    const normalized = headerRow.map(h => this.normalizeHeader(String(h ?? '')));
    const index = new Map<keyof BulkImportProductItem, number>();
    const missing: string[] = [];
    const duplicated: string[] = [];

    for (const col of InventoryImportService.COLUMNS) {
      const target = this.normalizeHeader(col.header);
      const positions = normalized.reduce<number[]>((acc, h, i) => (h === target ? [...acc, i] : acc), []);

      if (positions.length > 1) {
        duplicated.push(col.header);
      }

      if (positions.length > 0) {
        index.set(col.key, positions[0]);
      } else if (col.required) {
        missing.push(col.header);
      }
    }

    if (missing.length > 0 || duplicated.length > 0) {
      const details = [
        ...missing.map(h => `Falta la columna obligatoria "${h}".`),
        ...duplicated.map(h => `La columna "${h}" está repetida.`),
        `Encabezados esperados: ${InventoryImportService.COLUMNS.map(c => c.header).join(', ')}.`
      ];
      throw new ImportFileError('El archivo no cumple con el formato de la plantilla oficial.', details);
    }

    return index;
  }

  private normalizeHeader(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s_\-.]/g, '')
      .toLowerCase();
  }

  // ---------------------------------------------------------------------------
  // Validación de filas (espejo de las DataAnnotations del backend)
  // ---------------------------------------------------------------------------

  private parseRow(
    cells: unknown[],
    columnIndex: Map<keyof BulkImportProductItem, number>
  ): { item: BulkImportProductItem | null; errors: string[] } {
    const errors: string[] = [];
    const cell = (key: keyof BulkImportProductItem): unknown => {
      const i = columnIndex.get(key);
      return i === undefined ? '' : cells[i];
    };

    const sku = this.readText(cell('sku'), 'SKU', 30, true, errors);
    const name = this.readText(cell('name'), 'Nombre', 80, true, errors);
    const category = this.readText(cell('category'), 'Categoria', 40, true, errors);
    const description = this.readText(cell('description'), 'Descripcion', 500, false, errors);
    const location = this.readText(cell('location'), 'Ubicacion', 30, false, errors);

    const stock = this.readInt(cell('stock'), 'Cantidad', 0, 100000, true, errors);
    const minStock = this.readInt(cell('minStock'), 'StockMinimo', 0, 100000, false, errors);
    const costPrice = this.readMoney(cell('costPrice'), 'PrecioCosto', 0, errors);
    const salePrice = this.readMoney(cell('salePrice'), 'PrecioVenta', 0.01, errors);

    if (errors.length > 0) {
      return { item: null, errors };
    }

    return {
      item: {
        sku: sku!,
        name: name!,
        category: category!,
        stock: stock!,
        costPrice: costPrice!,
        salePrice: salePrice!,
        ...(description ? { description } : {}),
        ...(location ? { location } : {}),
        ...(minStock !== null ? { minStock } : {})
      },
      errors
    };
  }

  private readText(value: unknown, label: string, maxLength: number, required: boolean, errors: string[]): string | null {
    const text = String(value ?? '').trim();
    if (!text) {
      if (required) errors.push(`"${label}" es obligatorio.`);
      return null;
    }
    if (text.length > maxLength) {
      errors.push(`"${label}" supera ${maxLength} caracteres.`);
      return null;
    }
    return text;
  }

  private readInt(value: unknown, label: string, min: number, max: number, required: boolean, errors: string[]): number | null {
    if (this.isBlank(value)) {
      if (required) errors.push(`"${label}" es obligatoria.`);
      return null;
    }

    const num = parseFlexibleNumber(value);
    if (num === null || !Number.isInteger(num)) {
      errors.push(`"${label}" debe ser un número entero (valor recibido: "${String(value)}").`);
      return null;
    }
    if (num < min || num > max) {
      errors.push(`"${label}" debe estar entre ${min} y ${max.toLocaleString('es-CO')}.`);
      return null;
    }
    return num;
  }

  private readMoney(value: unknown, label: string, min: number, errors: string[]): number | null {
    if (this.isBlank(value)) {
      errors.push(`"${label}" es obligatorio.`);
      return null;
    }

    const num = parseFlexibleNumber(value);
    if (num === null) {
      errors.push(`"${label}" no es un valor numérico válido (valor recibido: "${String(value)}").`);
      return null;
    }
    if (num < min || num > 10_000_000) {
      errors.push(min > 0
        ? `"${label}" debe ser mayor a 0 y no superar 10.000.000.`
        : `"${label}" no puede ser negativo ni superar 10.000.000.`);
      return null;
    }
    return Math.round(num * 100) / 100;
  }

  private isBlank(value: unknown): boolean {
    return value === null || value === undefined || String(value).trim() === '';
  }
}

/**
 * Convierte valores con formato libre a número. Misma lógica que NumberNormalizer del backend:
 *  "$ 25.000" -> 25000 | "$25,000.50" -> 25000.5 | "18.500,25" -> 18500.25 | "25.5" -> 25.5 | "abc" -> null
 * Un separador único seguido de 1-2 dígitos es decimal; con 3 dígitos o repetido es separador de miles.
 */
export function parseFlexibleNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  let str = String(value ?? '').replace(/[^0-9.,-]/g, '');
  if (!/\d/.test(str)) {
    return null;
  }

  const lastDot = str.lastIndexOf('.');
  const lastComma = str.lastIndexOf(',');

  const isDecimalSeparator = (sep: string): boolean => {
    const occurrences = str.split(sep).length - 1;
    if (occurrences !== 1) return false;
    const digitsAfter = str.length - str.indexOf(sep) - 1;
    return digitsAfter >= 1 && digitsAfter <= 2;
  };

  if (lastDot >= 0 && lastComma >= 0) {
    str = lastDot > lastComma
      ? str.replace(/,/g, '')
      : str.replace(/\./g, '').replace(',', '.');
  } else if (lastComma >= 0) {
    str = isDecimalSeparator(',') ? str.replace(',', '.') : str.replace(/,/g, '');
  } else if (lastDot >= 0 && !isDecimalSeparator('.')) {
    str = str.replace(/\./g, '');
  }

  if (!/^-?\d+(\.\d+)?$/.test(str)) {
    return null;
  }

  const parsed = Number(str);
  return Number.isFinite(parsed) ? parsed : null;
}
