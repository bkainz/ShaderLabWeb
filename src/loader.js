/*
MIT License

Copyright (c) 2020 Geoffrey Booth and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { isBuiltin } from 'node:module';
import { dirname } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import resolveCallback from 'resolve/async.js';

const resolveAsync = promisify(resolveCallback);

const baseURL = pathToFileURL(cwd() + '/').href;


export async function resolve(specifier, context, next) {
  const { parentURL = baseURL } = context;

  if (isBuiltin(specifier)) {
    return next(specifier, context);
  }

  // `resolveAsync` works with paths, not URLs
  if (specifier.startsWith('file://')) {
    specifier = fileURLToPath(specifier);
  }
  const parentPath = fileURLToPath(parentURL);

  let url;
  try {
    const resolution = await resolveAsync(specifier, {
      basedir: dirname(parentPath),
      // For whatever reason, --experimental-specifier-resolution=node doesn't search for .mjs extensions
      // but it does search for index.mjs files within directories
      extensions: ['.js', '.json', '.node', '.mjs'],
    });
    url = pathToFileURL(resolution).href;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      // Match Node's error code
      error.code = 'ERR_MODULE_NOT_FOUND';
    }
    throw error;
  }

  return next(url, context);
}