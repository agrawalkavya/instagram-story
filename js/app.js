const canvas = document.getElementById('canvas-container');
const doodleContainer = document.getElementById('doodle-container');
const trashCan = document.getElementById('trashCan');

// 1️⃣ Add doodles (path fixed to 'images/')
const doodles = ['doodle1.png', 'doodle2.png', 'doodle3.png'];
doodles.forEach(src => {
  const img = document.createElement('img');
  img.src = `images/${src}`;
  img.style.top = Math.random() * window.innerHeight + 'px';
  img.style.left = Math.random() * window.innerWidth + 'px';
  doodleContainer.appendChild(img);

  img.addEventListener('click', () => {
    const clone = document.createElement('img');
    clone.src = img.src;
    clone.classList.add('uploaded');
    clone.style.left = '100px';
    clone.style.top = '100px';
    document.body.appendChild(clone);
    makeDraggable(clone);
  });
});

// 2️⃣ Upload + Crop image
document.getElementById('imageUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => openCropper(reader.result);
  reader.readAsDataURL(file);
});

function openCropper(src) {
  const modal = document.createElement('div');
  modal.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0008;z-index:9999;display:flex;justify-content:center;align-items:center;';
  
  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = '80vw';
  img.style.maxHeight = '80vh';

  const btn = document.createElement('button');
  btn.innerText = 'Crop & Add';
  btn.style = 'display:block;margin-top:10px;';

  const wrap = document.createElement('div');
  wrap.appendChild(img);
  wrap.appendChild(btn);
  modal.appendChild(wrap);
  document.body.appendChild(modal);

  const cropper = new Cropper(img, { aspectRatio: NaN });

  btn.onclick = () => {
    const cropped = cropper.getCroppedCanvas();
    const newImg = document.createElement('img');
    newImg.src = cropped.toDataURL();
    newImg.classList.add('uploaded');
    newImg.style.left = '100px';
    newImg.style.top = '100px';
    document.body.appendChild(newImg);
    makeDraggable(newImg);
    document.body.removeChild(modal);
  };
}

// 3️⃣ Add text
document.getElementById('addTextBtn').addEventListener('click', () => {
  const text = document.getElementById('textInput').value;
  const font = document.getElementById('fontSelect').value;
  if (!text) return;
  const el = document.createElement('div');
  el.textContent = text;
  el.style.fontFamily = font;
  el.style.fontSize = '24px';
  el.style.background = 'rgba(255,255,255,0.7)';
  el.style.padding = '5px';
  el.classList.add('uploaded');
  el.style.left = '100px';
  el.style.top = '100px';
  document.body.appendChild(el);
  makeDraggable(el);
});

// 4️⃣ Make draggable
function makeDraggable(el) {
  interact(el).draggable({
    listeners: {
      move (event) {
        const x = (parseFloat(el.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(el.getAttribute('data-y')) || 0) + event.dy;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.setAttribute('data-x', x);
        el.setAttribute('data-y', y);

        animateTrash(el);
      },
      end() {
        checkTrash(el);
      }
    }
  });
}

// 5️⃣ Trash logic
function animateTrash(el) {
  const elRect = el.getBoundingClientRect();
  const trashRect = trashCan.getBoundingClientRect();
  const overlap = !(elRect.right < trashRect.left || elRect.left > trashRect.right || elRect.bottom < trashRect.top || elRect.top > trashRect.bottom);
  trashCan.classList.toggle('active', overlap);
}

function checkTrash(el) {
  const elRect = el.getBoundingClientRect();
  const trashRect = trashCan.getBoundingClientRect();
  const overlap = !(elRect.right < trashRect.left || elRect.left > trashRect.right || elRect.bottom < trashRect.top || elRect.top > trashRect.bottom);
  if (overlap) el.remove();
  trashCan.classList.remove('active');
}

// 6️⃣ Export
document.getElementById('downloadBtn').addEventListener('click', () => {
  const clones = [];
  document.querySelectorAll('.uploaded').forEach(el => {
    const rect = el.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const overlap = !(rect.right < canvasRect.left || rect.left > canvasRect.right || rect.bottom < canvasRect.top || rect.top > canvasRect.bottom);

    if (overlap) {
      const clone = el.cloneNode(true);
      clone.style.position = 'absolute';
      clone.style.left = (rect.left - canvasRect.left) + 'px';
      clone.style.top = (rect.top - canvasRect.top) + 'px';
      clone.style.transform = 'none';
      canvas.appendChild(clone);
      clones.push(clone);
    }
  });

  html2canvas(canvas).then(canvasImg => {
    clones.forEach(c => c.remove());
    const link = document.createElement('a');
    link.download = 'story.png';
    link.href = canvasImg.toDataURL();
    link.click();
  });
});
