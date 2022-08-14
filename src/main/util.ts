/* eslint import/prefer-default-export: off */
import { app } from 'electron';
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(`http://localhost:${process.env.PORT || 1212}`);
    return url.href;
  }
  return `file://${path.resolve(
    __dirname,
    '../renderer/',
    (app.isPackaged ? 'index.html' : '') || htmlFileName
  )}`;
}
