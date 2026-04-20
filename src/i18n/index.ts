import it from './it.json';
import en from './en.json';

export type Lang = 'it' | 'en';
type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = { it, en };

export function t(key: string, lang: Lang, vars: Record<string, string | number> = {}): string {
  const raw = dicts[lang][key];
  if (raw === undefined) {
    throw new Error(`i18n: missing key "${key}" for lang "${lang}"`);
  }
  return raw.replace(/\{(\w+)\}/g, (_, v) => {
    if (!(v in vars)) {
      throw new Error(`i18n: missing variable "${v}" for key "${key}"`);
    }
    return String(vars[v]);
  });
}

export function assertParity(): void {
  const itKeys = Object.keys(it).sort();
  const enKeys = Object.keys(en).sort();
  const missing = itKeys.filter((k) => !(k in en)).concat(enKeys.filter((k) => !(k in it)));
  if (missing.length > 0) {
    throw new Error(`i18n: locale parity violation, keys missing: ${missing.join(', ')}`);
  }
}
