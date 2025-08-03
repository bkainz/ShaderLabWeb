import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register("./_transpiled/loader.js", pathToFileURL("./"))