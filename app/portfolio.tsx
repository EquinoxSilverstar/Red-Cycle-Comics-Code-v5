'use client';

import {Fragment,useEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowLeft,ArrowRight,ArrowUpRight,Menu,Play,X} from 'lucide-react';
import {categories,seed,type Catalog,type SiteSettings,type Work} from '../lib/catalog';

function Brand({settings}:{settings:SiteSettings}){
  return <><span className="brand-mark">R<span>c</span></span><span>{settings.brandName}<small>{settings.brandSuffix}</small></span></>;
}

function Headline({text}:{text:string}){
  const lines=text.split(/\r?\n/).filter(Boolean);
  return <>{lines.map((line,index)=><Fragment key={line+index}>{index>0&&<br/>}{index===lines.length-1?<em>{line}</em>:line}</Fragment>)}</>;
}

export default function Portfolio({about=false,initialData=seed,initialError=''}:{about?:boolean;initialData?:Catalog;initialError?:string}){
  const [data,setData]=useState(initialData);
  const [category,setCategory]=useState('All work');
  const [selected,setSelected]=useState<Work|null>(null);
  const [menu,setMenu]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [error,setError]=useState(initialError);
  const [heroIndex,setHeroIndex]=useState(0);
  const dialog=useRef<HTMLDialogElement>(null);
  const gallery=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const timer=setTimeout(()=>setLoaded(true),900);
    fetch('/api/catalog').then(response=>{if(!response.ok)throw Error();return response.json() as Promise<Catalog>}).then(setData).catch(()=>setError('The gallery could not be refreshed. Showing the available collection.'));
    return()=>clearTimeout(timer);
  },[]);

  useEffect(()=>{if(selected)dialog.current?.showModal();else dialog.current?.close()},[selected]);

  const characterWorks=data.works.filter(work=>work.kind!=='video'&&work.category==='Character design');
  const heroWorks=characterWorks.length?characterWorks:data.works.filter(work=>work.kind!=='video');
  const featured=heroWorks[heroIndex%Math.max(heroWorks.length,1)]||data.works.find(work=>work.kind!=='video');

  useEffect(()=>{
    if(heroWorks.length<2)return;
    const timer=setInterval(()=>setHeroIndex(index=>(index+1)%heroWorks.length),5200);
    return()=>clearInterval(timer);
  },[heroWorks.length]);

  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('in-view')}),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
    return()=>observer.disconnect();
  },[data,about]);

  const works=data.works.filter(work=>category==='All work'||work.category===category);
  const social=Object.entries(data.settings).filter(([key,value])=>['instagram','youtube','tiktok','facebook','x'].includes(key)&&value);
  const selectedMedia=selected?[selected.image,selected.design,...(selected.images||[])].filter((value,index,array)=>value&&array.indexOf(value)===index):[];

  function moveGallery(direction:number){
    gallery.current?.scrollBy({left:direction*gallery.current.clientWidth,behavior:'smooth'});
  }

  return <>
    <div className={'loader '+(loaded?'loaded':'')} aria-hidden="true"><span className="loader-ring"/><b>{data.settings.brandName}<span>{data.settings.brandSuffix}</span></b><small>ENTER THE CYCLE</small></div>
    <div className="atmosphere" aria-hidden="true"><i/><i/><i/></div>
    <header id="top">
      <a className="brand" href="/" aria-label={`${data.settings.brandName} ${data.settings.brandSuffix} home`}><Brand settings={data.settings}/></a>
      <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}><Menu/></button>
      <nav className={menu?'nav-open':''}>
        <a className={!about?'active':''} href="/#work">{data.settings.navArtwork}</a>
        <a href="/#characters">{data.settings.navCharacters}</a>
        <a className={about?'active':''} href="/about">{data.settings.navAbout}</a>
        <a href="/contact">{data.settings.navContact}</a>
        <a className="nav-commission" href="/#commissions">{data.settings.navCommission} <ArrowUpRight size={17}/></a>
      </nav>
    </header>
    <main>{about?
      <section className="about-page">
        <span className="eyebrow">{data.settings.aboutEyebrow}</span>
        <h1><Headline text={data.settings.aboutHeadline}/></h1>
        <div className="about-layout reveal"><div className="logo-art"><img src="/art/brand-original.jpeg" alt={`${data.settings.brandName} original logo`}/></div><div><h2 className="pre-line">{data.settings.aboutSectionTitle}</h2><p className="about-copy">{data.settings.about}</p><a className="solid-button" href="/#work">{data.settings.navArtwork} <ArrowRight size={18}/></a></div></div>
      </section>:
      <>
        <section className="hero">
          <div className="hero-copy"><div className="eyebrow"><span/> INDEPENDENT ART. ORIGINAL WORLDS.</div><h1>INK.<br/>IMAGINE.<br/><em>REPEAT.</em></h1><p>Characters with a story.<br/>Worlds without limits.</p><a href="#work" className="solid-button">Enter the collection <ArrowUpRight size={19}/></a><div className="hero-bottom"><span>{data.settings.brandName} {data.settings.brandSuffix}</span><a href="#work" aria-label="Scroll to collection"><ArrowDown size={19}/></a></div></div>
          {featured&&<div className="hero-feature"><button key={featured.id} className="hero-art hero-slide" onClick={()=>setSelected(featured)} aria-label={`Open ${featured.title}`}><span className="issue">CHARACTER FILE / {(heroIndex%heroWorks.length+1).toString().padStart(3,'0')}</span><img src={featured.design||featured.image} alt={featured.title}/><div className="hero-caption"><span><small>{featured.series||featured.category}</small>{featured.title}</span><span className="round-link"><ArrowUpRight/></span></div></button>{heroWorks.length>1&&<div className="hero-controls" aria-label="Featured characters"><button onClick={()=>setHeroIndex(index=>(index-1+heroWorks.length)%heroWorks.length)} aria-label="Previous character"><ArrowLeft/></button><div>{heroWorks.map((work,index)=><button key={work.id} className={index===heroIndex%heroWorks.length?'active':''} onClick={()=>setHeroIndex(index)} aria-label={`Show ${work.title}`}/>)}</div><button onClick={()=>setHeroIndex(index=>(index+1)%heroWorks.length)} aria-label="Next character"><ArrowRight/></button></div>}</div>}
          <span className="vertical-note">ART • COMICS • ANIMATION • CHARACTER DESIGN</span>
        </section>
        <div className="ticker" aria-hidden="true"><div><span>ORIGINAL WORLDS</span><b>✳</b><span>UNFILTERED IMAGINATION</span><b>✳</b><span>{data.settings.brandName}</span><b>✳</b><span>ORIGINAL WORLDS</span><b>✳</b></div></div>
        <section id="work" className="collection reveal"><div className="section-heading"><div><span className="eyebrow">01 / THE COLLECTION</span><h2>BEYOND THE <em>PANEL.</em></h2></div><p>A growing archive of art,<br/>characters and everything in between.</p></div><div className="filters" role="group" aria-label="Artwork categories">{categories.map(value=><button key={value} className={category===value?'chosen':''} onClick={()=>setCategory(value)}>{value}{value==='All work'&&<sup>{data.works.length.toString().padStart(2,'0')}</sup>}</button>)}</div>{error&&<p className="gallery-message" role="status">{error}</p>}<div className="art-grid">{works.map((work,index)=><button key={work.id} className="art-card reveal" style={{transitionDelay:`${Math.min(index,5)*70}ms`}} onClick={()=>setSelected(work)}><div className="art-image">{work.kind==='video'?<><video src={work.image} preload="metadata" muted/><span className="play-icon"><Play/></span></>:<img src={work.image} alt={work.title} loading="lazy"/>}<span className="art-number">{(index+1).toString().padStart(2,'0')}</span>{(work.images.length>0||work.design)&&<span className="image-count">{[work.image,work.design,...work.images].filter(Boolean).length} IMAGES</span>}<span className="view-art">View artwork <ArrowUpRight size={17}/></span></div><div className="art-caption"><div><small>{work.category}</small><h3>{work.title}</h3></div><ArrowUpRight size={21}/></div>{work.series&&<p className="series">{work.series}</p>}</button>)}</div>{works.length===0&&<div className="empty-state"><span>THE NEXT CHAPTER IS COMING</span><h3>{category}</h3><p>New work will appear here as the collection grows.</p></div>}</section>
        <section id="characters" className="character-section reveal"><div className="section-heading"><div><span className="eyebrow">02 / MEET THE CHARACTERS</span><h2>MORE THAN<br/><em>A FACE.</em></h2></div><p>Open a portrait.<br/>Discover the design and the story behind it.</p></div><div className="character-list">{data.works.filter(work=>work.category==='Character design').map(work=><button key={work.id} onClick={()=>setSelected(work)}><img src={work.image} alt={work.title}/><div><small>CHARACTER FILE</small><h3>{work.title}</h3><p>{work.series||'Original character'}</p><span>Open character profile <ArrowUpRight size={18}/></span></div></button>)}</div></section>
        <section id="commissions" className="commissions reveal"><div className="section-heading"><div><span className="eyebrow">03 / LET’S MAKE SOMETHING</span><h2>YOUR IDEA.<br/><em>OUR NEXT PANEL.</em></h2></div><p>Have a character, a story or a brand in mind?<br/>Let’s bring it into the world.</p></div><div className="service-grid">{['Comic','Animation','Art','Logo'].map((service,index)=><a href={data.settings.email?`mailto:${data.settings.email}?subject=${encodeURIComponent(service+' commission enquiry')}`:'#commission-contact'} key={service}><span>0{index+1}<ArrowUpRight size={22}/></span><h3>{service}</h3><p>{['Pages, panels & visual storytelling','Characters & worlds in motion','Illustrations & original pieces','Identity with character'][index]}</p></a>)}</div><div id="commission-contact" className="commission-contact"><span>LET’S TALK ABOUT YOUR PROJECT</span>{data.settings.email?<a href={`mailto:${data.settings.email}`}>{data.settings.email}<ArrowUpRight/></a>:<p>Commission contact details will be announced here.</p>}</div></section>
      </>}
    </main>
    <footer><div className="footer-top"><a className="footer-brand" href="/">{data.settings.brandName}<span>{data.settings.brandSuffix}</span></a><div className="footer-links"><a href="/about">{data.settings.navAbout}</a><a href="/contact">{data.settings.navContact}</a><a href="/#commissions">Commissions</a><a href="/admin">Studio admin <ArrowUpRight size={14}/></a></div><div className="socials">{social.length?social.map(([key,value])=><a key={key} href={value} target="_blank" rel="noreferrer">{key}<ArrowUpRight size={15}/></a>):data.settings.handles.split(',').filter(Boolean).map(handle=><span key={handle}>{handle.trim()}</span>)}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {data.settings.brandName} {data.settings.brandSuffix}</span><span>Created by <strong>equinox silverstar enterprizes</strong></span><a href="#top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>BACK TO TOP ↑</a></div></footer>
    <dialog ref={dialog} className="art-dialog" aria-label="Artwork details" onClose={()=>setSelected(null)} onClick={event=>{if(event.target===dialog.current)setSelected(null)}}>{selected&&<><button className="dialog-close" onClick={()=>setSelected(null)} aria-label="Close artwork"><X/></button><div className="detail-gallery-wrap"><div className="detail-gallery" ref={gallery}>{selectedMedia.map((media,index)=><figure key={media}>{selected.kind==='video'&&index===0?<video src={media} controls autoPlay/>:<img src={media} alt={`${selected.title} ${index+1}`}/>}<span>{index+1} / {selectedMedia.length}</span></figure>)}</div>{selectedMedia.length>1&&<div className="detail-gallery-controls"><button onClick={()=>moveGallery(-1)} aria-label="Previous image"><ArrowLeft/></button><span>SWIPE TO EXPLORE</span><button onClick={()=>moveGallery(1)} aria-label="Next image"><ArrowRight/></button></div>}</div><div className="detail-copy"><span className="eyebrow">{selected.category}</span><h2>{selected.title}</h2><p>{selected.description}</p><h4>MANGA / COMIC</h4><p>{selected.series||'To be revealed'}</p>{selected.category==='Character design'&&<><h4>ORIGIN STORY</h4><p className="story">{selected.story||'The story is still unfolding. Check back for the character’s origin.'}</p></>}</div></>}</dialog>
  </>;
}
