const bgm=document.querySelector('#bgm');
const music=document.querySelector('#music');
let enabled=true;
bgm.volume=.18;
function syncMusic(){
 music.textContent=enabled?'♪ オン':'♪ オフ';
 music.setAttribute('aria-pressed',String(enabled));
 music.setAttribute('aria-label',enabled?'BGMをオフにする':'BGMをオンにする')
}
function playMusic(){
 if(enabled&&!document.hidden&&bgm.paused)bgm.play().catch(()=>{})
}
music.onclick=()=>{enabled=!enabled;syncMusic();if(enabled)playMusic();else bgm.pause()};
document.addEventListener('click',e=>{if(!music.contains(e.target))playMusic()});
document.addEventListener('visibilitychange',()=>document.hidden?bgm.pause():playMusic());
window.addEventListener('pagehide',()=>bgm.pause());
window.addEventListener('pageshow',playMusic);
syncMusic();playMusic();
