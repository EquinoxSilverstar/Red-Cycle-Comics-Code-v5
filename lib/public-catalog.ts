import {catalog} from './server';
import {seed} from './catalog';
export async function publicCatalog(){try{return {initialData:await catalog(),initialError:''}}catch(e){console.error('Unable to load public gallery',e);return {initialData:seed,initialError:'Showing the original collection while saved updates are unavailable.'}}}
