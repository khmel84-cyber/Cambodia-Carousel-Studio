import type {SlideNumber} from './Carousel';
const open = () => new Promise<IDBDatabase>((resolve,reject)=>{
  const request=indexedDB.open('cambodia-carousel-photos',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('photos');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
});
export async function savePhoto(slide:SlideNumber,photo:Blob|null) {
  const db=await open();
  try {await new Promise<void>((resolve,reject)=>{
    const tx=db.transaction('photos','readwrite');
    const store=tx.objectStore('photos');
    if(photo)store.put(photo,slide);else store.delete(slide);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });}finally{db.close();}
}
export async function loadPhotos() {
  const db=await open();
  try{return await new Promise<Partial<Record<SlideNumber,string>>>((resolve,reject)=>{
    const values:Partial<Record<SlideNumber,string>>={};
    const tx=db.transaction('photos');
    for(const n of [1,2,3,4] as const){const request=tx.objectStore('photos').get(n);request.onsuccess=()=>{if(request.result instanceof Blob)values[n]=URL.createObjectURL(request.result);};}
    tx.oncomplete=()=>resolve(values);tx.onerror=()=>reject(tx.error);
  });}finally{db.close();}
}
