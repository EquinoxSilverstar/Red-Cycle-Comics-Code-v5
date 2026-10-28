'use client';

import {useEffect,useState,type FormEvent} from 'react';
import {ArrowDown,ArrowUp,ArrowUpRight,GripVertical,PenLine,Plus,Save,Trash2,Upload,X} from 'lucide-react';
import {categories,seed,type Catalog,type Work} from '../../lib/catalog';

const blank:Work={id:'',title:'',category:'Character design',image:'',design:'',images:[],series:'',story:'',description:'',kind:'image',sortOrder:0};

async function request<T={url:string;kind:string}>(url:string,options?:RequestInit):Promise<T>{
  const response=await fetch(url,options);
  const data=await response.json() as T&{error?:string};
  if(!response.ok)throw Error(data.error||'Unable to save. Please try again.');
  return data;
}

export default function Admin(){
  const [data,setData]=useState<Catalog|null>(null);
  const [editing,setEditing]=useState<Work|null>(null);
  const [settings,setSettings]=useState(seed.settings);
  const [tab,setTab]=useState<'art'|'settings'>('art');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [remove,setRemove]=useState<Work|null>(null);

  useEffect(()=>{
    if(!editing&&!remove)return;
    const previous=document.activeElement as HTMLElement;
    const scroll=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const overlay=document.querySelector('.editor-overlay')!;
    const targets=()=>Array.from(overlay.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,textarea,a[href]'));
    targets()[0]?.focus();
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'&&!busy){setEditing(null);setRemove(null)}
      if(event.key==='Tab'){
        const all=targets(),first=all[0],last=all[all.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
      }
    };
    document.addEventListener('keydown',key);
    return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=scroll;previous?.focus()};
  },[!!editing,!!remove,busy]);

  async function refresh(){
    const next=await request<Catalog>('/api/catalog');
    setData(next);setSettings(next.settings);
  }

  useEffect(()=>{refresh().catch(cause=>setError(cause.message))},[]);

  async function upload(file:File,field:'image'|'design'){
    setBusy(true);setError('');
    try{
      const body=new FormData();body.append('file',file);
      const result=await request('/api/upload',{method:'POST',body});
      if(field==='design'&&result.kind==='video')throw Error('Choose an image for the character design.');
      setEditing(old=>old?{...old,[field]:result.url,...(field==='image'?{kind:result.kind as Work['kind']}:{})}:old);
      setMessage('File uploaded. Save the artwork to publish it.');
    }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }

  async function uploadGallery(files:FileList){
    setBusy(true);setError('');
    try{
      const uploaded:string[]=[];
      for(const file of Array.from(files)){
        const body=new FormData();body.append('file',file);
        const result=await request('/api/upload',{method:'POST',body});
        if(result.kind==='video')throw Error('Additional gallery files must be images.');
        uploaded.push(result.url);
      }
      setEditing(old=>old?{...old,images:[...(old.images||[]),...uploaded].slice(0,20)}:old);
      setMessage(`${uploaded.length} gallery image${uploaded.length===1?'':'s'} uploaded. Save the artwork to publish.`);
    }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }

  async function save(event:FormEvent){
    event.preventDefault();if(!editing)return;
    setBusy(true);setError('');
    try{
      const next={...editing,id:editing.id||crypto.randomUUID(),sortOrder:editing.sortOrder??data?.works.length??0};
      await request('/api/catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});
      await refresh();setEditing(null);setMessage('Artwork saved. The portfolio is up to date.');
    }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }

  async function reorder(index:number,direction:-1|1){
    if(!data)return;
    const target=index+direction;if(target<0||target>=data.works.length)return;
    setBusy(true);setError('');
    const works=[...data.works];[works[index],works[target]]=[works[target],works[index]];
    const ordered=works.map((work,position)=>({...work,sortOrder:position}));
    setData({...data,works:ordered});
    try{
      await Promise.all(ordered.map(work=>request('/api/catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(work)})));
      setMessage('Artwork order saved. The gallery and character files now use this order.');
    }catch(cause){setError((cause as Error).message);await refresh().catch(()=>null)}finally{setBusy(false)}
  }

  async function saveSettings(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');
    try{
      await request('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});
      await refresh();setMessage('Brand, navigation and About page saved.');
    }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }

  async function deleteWork(){
    if(!remove)return;setBusy(true);setError('');
    try{
      await request('/api/catalog',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:remove.id})});
      await refresh();setRemove(null);setMessage('Artwork removed from the portfolio.');
    }catch(cause){setError((cause as Error).message)}finally{setBusy(false)}
  }

  return <main className="admin-shell">
    <div className="admin-top"><a className="brand" href="/">{settings.brandName} <small>STUDIO</small></a><a href="/" target="_blank" rel="noreferrer">View portfolio <ArrowUpRight size={16}/></a></div>
    <div className="section-heading"><div><span className="eyebrow">YOUR WORLD. YOUR WORK.</span><h1>THE STUDIO<span>.</span></h1></div><a href="/signout-with-chatgpt?return_to=/" target="_top">Sign out</a></div>
    <div className="admin-tabs"><button className={tab==='art'?'chosen':''} onClick={()=>setTab('art')}>Artwork & order</button><button className={tab==='settings'?'chosen':''} onClick={()=>setTab('settings')}>Brand, navigation & About</button></div>
    {error&&<div className="notice error" role="alert">{error}<button onClick={()=>refresh().then(()=>setError('')).catch(cause=>setError(cause.message))}>Retry loading</button></div>}
    {message&&<p className="notice" role="status">{message}</p>}
    {!data&&!error&&<p>Opening the studio…</p>}

    {data&&tab==='art'&&<>
      <div className="admin-toolbar"><div><p>{data.works.length} artworks in your collection</p><small>Use the arrows to arrange the gallery and character files.</small></div><button className="solid-button" onClick={()=>{setEditing({...blank,id:crypto.randomUUID(),sortOrder:data.works.length});setMessage('');setError('')}}><Plus size={18}/> Add artwork</button></div>
      <div className="admin-art-list">{data.works.map((work,index)=><div key={work.id} className="admin-art-row"><GripVertical className="row-grip" aria-hidden="true"/>{work.kind==='video'?<video src={work.image}/>:<img src={work.image} alt=""/>}<div><h3>{work.title}</h3><p>{work.category} · {work.series||'No series added'} · {[work.image,work.design,...work.images].filter(Boolean).length} file(s)</p></div><div className="order-buttons"><button disabled={busy||index===0} aria-label={`Move ${work.title} up`} onClick={()=>reorder(index,-1)}><ArrowUp/></button><button disabled={busy||index===data.works.length-1} aria-label={`Move ${work.title} down`} onClick={()=>reorder(index,1)}><ArrowDown/></button></div><button aria-label={'Edit '+work.title} onClick={()=>{setEditing({...work,images:work.images||[]});setError('');setMessage('')}}><PenLine size={19}/><span>Edit</span></button><button aria-label={'Delete '+work.title} onClick={()=>setRemove(work)}><Trash2 size={19}/></button></div>)}</div>
    </>}

    {data&&tab==='settings'&&<form className="settings-form" onSubmit={saveSettings}>
      <h2>Brand name</h2><p>These fields update the navigation, loader and footer.</p>
      <div className="settings-grid"><label>Main brand name<input required maxLength={200} value={settings.brandName} onChange={event=>setSettings({...settings,brandName:event.target.value})}/></label><label>Small brand line<input required maxLength={200} value={settings.brandSuffix} onChange={event=>setSettings({...settings,brandSuffix:event.target.value})}/></label></div>
      <h2>Navigation labels</h2><div className="settings-grid">{([['navArtwork','Artwork link'],['navCharacters','Characters link'],['navAbout','About link'],['navContact','Contact link'],['navCommission','Commission button']] as const).map(([key,label])=><label key={key}>{label}<input required maxLength={200} value={settings[key]} onChange={event=>setSettings({...settings,[key]:event.target.value})}/></label>)}</div>
      <h2>About page</h2><label>Small heading<input required maxLength={200} value={settings.aboutEyebrow} onChange={event=>setSettings({...settings,aboutEyebrow:event.target.value})}/></label><label>Large headline <small>Use a new line to control line breaks.</small><textarea required rows={4} maxLength={500} value={settings.aboutHeadline} onChange={event=>setSettings({...settings,aboutHeadline:event.target.value})}/></label><label>Studio title <small>New lines are supported.</small><textarea required rows={3} maxLength={300} value={settings.aboutSectionTitle} onChange={event=>setSettings({...settings,aboutSectionTitle:event.target.value})}/></label><label>About story<textarea rows={8} maxLength={20000} value={settings.about} onChange={event=>setSettings({...settings,about:event.target.value})}/></label>
      <h2>Contact & social profiles</h2><label>Commission email<input type="email" value={settings.email} onChange={event=>setSettings({...settings,email:event.target.value})}/></label><label>Social handles (shown when links are empty)<input value={settings.handles} onChange={event=>setSettings({...settings,handles:event.target.value})}/></label><p>Add the full profile address for each platform. Leave a field blank to hide the link.</p>{(['instagram','tiktok','youtube','facebook','x'] as const).map(key=><label key={key}>{key==='x'?'X / Twitter':key.charAt(0).toUpperCase()+key.slice(1)}<input type="url" placeholder="https://" value={settings[key]} onChange={event=>setSettings({...settings,[key]:event.target.value})}/></label>)}
      <button className="solid-button" disabled={busy}><Save size={17}/>{busy?'Saving…':'Save site details'}</button>
    </form>}

    {editing&&<div className="editor-overlay"><section className="editor" role="dialog" aria-modal="true" aria-label="Artwork editor"><div className="editor-heading"><h2>{data?.works.some(work=>work.id===editing.id)?'Edit artwork':'Add artwork'}</h2><button type="button" aria-label="Close editor" disabled={busy} onClick={()=>setEditing(null)}><X/></button></div>{error&&<p className="notice error" role="alert">{error}</p>}<form onSubmit={save}><div className="editor-columns"><div>
      <label className="upload-area">{editing.image?(editing.kind==='video'?<video src={editing.image} controls/>:<img src={editing.image} alt="Artwork preview"/>):<span><Upload/>Upload cover / front portrait</span>}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={event=>{if(event.target.files?.[0])upload(event.target.files[0],'image')}}/><small>JPG, PNG, WebP, GIF, MP4 or WebM · up to 25 MB</small></label>
      {editing.category==='Character design'&&<label className="upload-area secondary">{editing.design&&<img src={editing.design} alt="Character design preview"/>}<span><Upload size={17}/> Full character design (optional)</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={event=>{if(event.target.files?.[0])upload(event.target.files[0],'design')}}/>{editing.design&&<button type="button" onClick={()=>setEditing({...editing,design:''})}>Remove design image</button>}</label>}
      <label className="upload-area gallery-upload"><span><Plus/> Add multiple gallery images</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={event=>{if(event.target.files?.length)uploadGallery(event.target.files)}}/><small>Choose several images at once. Up to 20 per artwork.</small></label>
      {editing.images.length>0&&<div className="admin-gallery-thumbs">{editing.images.map((image,index)=><div key={image}><img src={image} alt={`Gallery ${index+1}`}/><span>{index+1}</span><button type="button" aria-label={`Remove gallery image ${index+1}`} onClick={()=>setEditing({...editing,images:editing.images.filter((_,item)=>item!==index)})}><X size={15}/></button></div>)}</div>}
    </div><div>
      <label>Title / character name<input required maxLength={200} value={editing.title} onChange={event=>setEditing({...editing,title:event.target.value})}/></label><label>Gallery section<select value={editing.category} onChange={event=>setEditing({...editing,category:event.target.value})}>{categories.slice(1).map(value=><option key={value}>{value}</option>)}</select></label><label>Manga / comic / source<input maxLength={300} placeholder="Which world does this belong to?" value={editing.series} onChange={event=>setEditing({...editing,series:event.target.value})}/></label><label>Description<textarea rows={4} maxLength={5000} value={editing.description} onChange={event=>setEditing({...editing,description:event.target.value})}/></label>{editing.category==='Character design'&&<label>Origin story<textarea rows={8} maxLength={20000} value={editing.story} onChange={event=>setEditing({...editing,story:event.target.value})}/></label>}
    </div></div><div className="editor-actions"><button className="plain-button" type="button" disabled={busy} onClick={()=>setEditing(null)}>Cancel</button><button className="solid-button" disabled={busy||!editing.image}><Save size={17}/>{busy?'Saving / uploading…':'Save artwork'}</button></div></form></section></div>}

    {remove&&<div className="editor-overlay"><section className="delete-dialog" role="alertdialog" aria-modal="true" aria-label="Delete artwork"><h2>Remove {remove.title}?</h2><p>This will remove the artwork from your public galleries.</p>{error&&<p role="alert">{error}</p>}<div className="editor-actions"><button className="plain-button" disabled={busy} onClick={()=>setRemove(null)}>Keep artwork</button><button className="solid-button" disabled={busy} onClick={deleteWork}>{busy?'Removing…':'Delete artwork'}</button></div></section></div>}
  </main>;
}
