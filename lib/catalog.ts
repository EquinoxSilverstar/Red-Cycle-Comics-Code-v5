export const categories = ['All work','Character design','Comic art','Fan art','Art','Symbols / Logos','Backgrounds','Animation','Commission showcase'] as const;

export type Work = {
  id:string; title:string; category:string; image:string; design:string;
  images:string[]; series:string; story:string; description:string;
  kind:'image'|'video'; sortOrder:number;
};

export type SiteSettings = {
  brandName:string; brandSuffix:string;
  navArtwork:string; navCharacters:string; navAbout:string; navContact:string; navCommission:string;
  aboutEyebrow:string; aboutHeadline:string; aboutSectionTitle:string; about:string;
  email:string; handles:string; instagram:string; tiktok:string; youtube:string; facebook:string; x:string;
};

export type Catalog = {works:Work[];settings:SiteSettings};

export const seed:Catalog={settings:{
  brandName:'RED CYCLE',brandSuffix:'COMICS CO.',
  navArtwork:'The artwork',navCharacters:'Characters',navAbout:'About',navContact:'Contact',navCommission:'Let’s create',
  aboutEyebrow:'BEHIND THE PANELS',aboutHeadline:'EVERY WORLD\nSTARTS WITH\nA VISION.',aboutSectionTitle:'Red Cycle\nComics Co.',
  about:'Red Cycle Comics Co. is a home for original characters, comic worlds and visual storytelling. Explore the artwork, meet the characters, and discover the worlds taking shape.',
  email:'equinoxsilverstar@gmail.com',handles:'@equinox_silverstar, @the_real_redcyclecomics',instagram:'',tiktok:'',youtube:'',facebook:'',x:''
},works:[
  {id:'raiden',title:'Raiden Xanakin',category:'Character design',image:'/art/raiden-portrait.jpeg',design:'/art/raiden-design.jpeg',images:[],series:'World of Dark Arts · Dawn of the Sun',story:'',description:'Character portrait and full design.',kind:'image',sortOrder:0},
  {id:'white-haired',title:'White-haired character',category:'Character design',image:'/art/white-haired.jpeg',design:'',images:[],series:'',story:'',description:'Original character portrait.',kind:'image',sortOrder:1},
  {id:'dawn',title:'Dawn of the Sun',category:'Comic art',image:'/art/raiden-design.jpeg',design:'',images:[],series:'World of Dark Arts',story:'',description:'Raiden Xanakin — character illustration.',kind:'image',sortOrder:2}
]};
