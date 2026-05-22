// galerie_animata_control.js
// controlul animatiei din galerie_animata.css
// se poate face si din CSS, dar aici e mai usor de controlat dinamica in functie de nr de imagini (figures.length) sau slotSec (durata fiecarui slot)
//
document.addEventListener('DOMContentLoaded', function () {//
  try {
    const slotSec = 3; 
    const figures = Array.from(document.querySelectorAll('#galerie-animata figure'));
    if (!figures.length) return;
    const totalSec = figures.length * slotSec;

    figures.forEach((fig, idx) => {
        
      fig.style.clipPath = 'inset(0 50% 0 50%)';
      fig.style.opacity = '0';
      fig.style.willChange = 'clip-path, opacity';

      
      const delay = idx * slotSec;
      fig.style.animation = `gal_clip ${totalSec}s linear ${delay}s infinite both`;
    });
  } catch (e) {
   
    console.error('galerie_animata_control error', e);
  }
});
