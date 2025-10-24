import { useRef, useEffect } from 'react';
import Hls from 'hls.js';

export default function Player({ src }:{src:string}){
  const ref = useRef<HTMLVideoElement|null>(null);
  useEffect(()=>{
    if(!src) return;
    const video = ref.current!;
    if(Hls.isSupported()){
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (e, d)=> console.warn('hls error', e, d));
      return ()=> hls.destroy();
    } else {
      video.src = src;
    }
  },[src]);
  return <video ref={ref} controls style={{width:'100%', maxHeight: '70vh'}} />;
}
