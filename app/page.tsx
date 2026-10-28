import Portfolio from './portfolio';
import {publicCatalog} from '../lib/public-catalog';
export const dynamic='force-dynamic';
export default async function Page(){return <Portfolio {...await publicCatalog()}/>}
