let ctx:AudioContext|null=null
/** Call from a user gesture (click) so autoplay rules allow the chime later. */
export function unlockAudio(){try{const C=window.AudioContext||(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!C)return;ctx=ctx??new C();void ctx.resume()}catch{/* audio unavailable */}}
export function chime(){try{if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.2,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.6);o.connect(g);g.connect(ctx.destination);o.start();o.stop(t+0.65)}catch{/* blocked */}}
export async function requestNotifyPermission():Promise<NotificationPermission|'unsupported'>{if(!('Notification' in window))return 'unsupported';if(Notification.permission!=='default')return Notification.permission;try{return await Notification.requestPermission()}catch{return 'default'}}
export function systemNotify(title:string,body:string){try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body})}catch{/* ignore */}}
