const loader=document.querySelector('.loader');
window.addEventListener('load',()=>setTimeout(()=>loader?.classList.add('done'),650));

const menu=document.querySelector('.menu');
const nav=document.querySelector('header nav');
menu?.addEventListener('click',()=>{const open=nav?.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});

const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('in')}),{threshold:.1});
reveals.forEach(item=>observer.observe(item));

const slides=[...document.querySelectorAll('.slide')];
const dots=[...document.querySelectorAll('[data-dot]')];
let current=0;
function showSlide(index){if(!slides.length)return;current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>slide.classList.toggle('active',i===current));dots.forEach((dot,i)=>dot.classList.toggle('active',i===current))}
document.querySelector('[data-prev]')?.addEventListener('click',()=>showSlide(current-1));
document.querySelector('[data-next]')?.addEventListener('click',()=>showSlide(current+1));
dots.forEach(dot=>dot.addEventListener('click',()=>showSlide(Number(dot.dataset.dot))));
if(slides.length>1)setInterval(()=>showSlide(current+1),5200);

const cards=[...document.querySelectorAll('.art-card')];
const empty=document.querySelector('.empty');
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(item=>item.classList.remove('chosen'));
  button.classList.add('chosen');
  const filter=button.dataset.filter;
  let shown=0;
  cards.forEach(card=>{const visible=filter==='all'||card.dataset.category===filter;card.hidden=!visible;if(visible)shown++});
  if(empty){empty.hidden=shown!==0;empty.querySelector('h3').textContent=filter==='all'?'New work':filter}
}));

const viewer=document.querySelector('.viewer');
const viewerTrack=document.querySelector('.viewer-gallery>div');
let viewerImages=[];
let viewerIndex=0;
function showViewerImage(index){if(!viewerTrack||!viewerImages.length)return;viewerIndex=(index+viewerImages.length)%viewerImages.length;viewerTrack.scrollTo({left:viewerTrack.clientWidth*viewerIndex,behavior:'smooth'})}
function openViewer(item){
  if(!viewer||!viewerTrack)return;
  viewerImages=(item.dataset.images||'').split('|').filter(Boolean);
  viewerTrack.innerHTML=viewerImages.map((src,index)=>`<figure><img src="${src}" alt="${item.dataset.title||'Artwork'} ${index+1}"></figure>`).join('');
  viewer.querySelector('h2').textContent=item.dataset.title||'Artwork';
  viewer.querySelector('.viewer-series').textContent=item.dataset.series||'To be revealed';
  viewer.querySelector('.viewer-description').textContent=item.dataset.description||'Original artwork from Red Cycle Comics Co.';
  viewer.showModal();viewerIndex=0;
}
document.querySelectorAll('[data-images]').forEach(item=>item.addEventListener('click',()=>openViewer(item)));
document.querySelector('.gallery-prev')?.addEventListener('click',()=>showViewerImage(viewerIndex-1));
document.querySelector('.gallery-next')?.addEventListener('click',()=>showViewerImage(viewerIndex+1));
document.querySelector('.close')?.addEventListener('click',()=>viewer?.close());
viewer?.addEventListener('click',event=>{if(event.target===viewer)viewer.close()});

document.querySelector('[data-contact]')?.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const name=String(data.get('name')||'').trim();
  const email=String(data.get('email')||'').trim();
  const message=String(data.get('message')||'').trim();
  const subject=encodeURIComponent(`Red Cycle Comics enquiry${name?` from ${name}`:''}`);
  const body=encodeURIComponent(`${name?`Name: ${name}\n`:''}Email: ${email}\n\n${message}`);
  location.href=`mailto:equinoxsilverstar@gmail.com?subject=${subject}&body=${body}`;
});
