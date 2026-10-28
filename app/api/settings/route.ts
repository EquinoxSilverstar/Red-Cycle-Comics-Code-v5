import {z} from 'zod';
import {authorize,runtime,failure} from '../../../lib/server';
const link=z.string().max(500).refine(v=>!v||/^https:\/\//i.test(v)&&URL.canParse(v));
const text=z.string().trim().min(1).max(200);
const schema=z.object({brandName:text,brandSuffix:text,navArtwork:text,navCharacters:text,navAbout:text,navContact:text,navCommission:text,aboutEyebrow:text,aboutHeadline:z.string().trim().min(1).max(500),aboutSectionTitle:z.string().trim().min(1).max(300),about:z.string().max(20000),handles:z.string().max(500),email:z.union([z.string().email().max(200),z.literal('')]),instagram:link,tiktok:link,youtube:link,facebook:link,x:link});
export async function POST(req:Request){try{const denied=await authorize(req);if(denied)return denied;const input=schema.safeParse(await req.json());if(!input.success)return Response.json({error:'Use a valid email and full https:// social profile links.'},{status:400});await runtime().DB.prepare('INSERT INTO settings (id,payload) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').bind('site',JSON.stringify(input.data)).run();return Response.json({ok:true})}catch(e){return failure(e)}}
