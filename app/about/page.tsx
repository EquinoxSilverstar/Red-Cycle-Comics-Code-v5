import Portfolio from '../portfolio';
import {publicCatalog} from '../../lib/public-catalog';
export const dynamic='force-dynamic';
export const metadata={title:'About | Red Cycle Comics Co.'};
export default async function About(){return <Portfolio about {...await publicCatalog()}/>}
