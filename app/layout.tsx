import type {Metadata} from 'next';
import './globals.css';
import './enhancements.css';
export const metadata:Metadata={title:'Red Cycle Comics Co. | Art, Characters & Original Worlds',description:'Explore original comic art, character design, animation and commissions from Red Cycle Comics Co.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
