import path = require('path');
import * as pug from 'pug';
import { getServerConfig } from '../../server-config';

export function messageFromTemplate(title: string, message: string): string {
  console.log('DIRNAME: ', __dirname);
  const template = pug.compileFile(path.join(__dirname, 'templates', 'message.pug'));
  const html = template({ title, message, logoUrl: getServerConfig().logoUrl });
  return html;
}
