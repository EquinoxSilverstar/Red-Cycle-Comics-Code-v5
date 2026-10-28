import {headers} from 'next/headers';
import {hasAdminSession} from '../../lib/admin-auth';
import Admin from './studio';
import AdminLogin from './login';
export const dynamic='force-dynamic';
export const metadata={title:'Studio Admin | Red Cycle Comics Co.'};
async function ProtectedStudio(){const requestHeaders=await headers();if(!await hasAdminSession(requestHeaders.get('cookie')))return <AdminLogin/>;return <Admin/>}
export default function AdminPage(){return <ProtectedStudio/>}

