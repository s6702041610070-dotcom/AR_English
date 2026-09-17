// Image loader with automatic white background die-cut (chroma-key removal)

export interface GameImages {
  boat: HTMLCanvasElement | HTMLImageElement | null;
  fish: HTMLCanvasElement | HTMLImageElement | null;
}

export function loadAndKeyImage(src: string): Promise<HTMLCanvasElement | HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.naturalWidth || img.width || 300;
        offCanvas.height = img.naturalHeight || img.height || 200;
        const ctx = offCanvas.getContext('2d');

        if (!ctx) {
          resolve(img);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        // Die-cut white/near-white background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is near-white (threshold > 230)
          if (r > 225 && g > 225 && b > 225) {
            // Check if very bright white
            const brightness = (r + g + b) / 3;
            if (brightness > 245) {
              data[i + 3] = 0; // completely transparent
            } else {
              // Smooth feathering
              const factor = (245 - brightness) / 20;
              data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, factor)));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(offCanvas);
      } catch (err) {
        // If tainted canvas due to CORS, return original image
        console.warn('CORS or canvas processing fallback for', src, err);
        resolve(img);
      }
    };

    img.onerror = () => {
      console.warn('Failed to load image from', src, 'using procedural fallback.');
      // Create a fallback procedural element
      resolve(createProceduralFallback(src.includes('boat') ? 'boat' : 'fish'));
    };

    img.src = src;
  });
}

function createProceduralFallback(type: 'boat' | 'fish'): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = type === 'boat' ? 240 : 120;
  c.height = type === 'boat' ? 140 : 80;
  const ctx = c.getContext('2d')!;

  if (type === 'boat') {
    // Stylized wooden sailboat
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(30, 90);
    ctx.lineTo(210, 90);
    ctx.lineTo(180, 130);
    ctx.lineTo(60, 130);
    ctx.closePath();
    ctx.fill();

    // Mast
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(120, 90);
    ctx.lineTo(120, 20);
    ctx.stroke();

    // Sail
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(120, 25);
    ctx.lineTo(185, 75);
    ctx.lineTo(120, 75);
    ctx.closePath();
    ctx.fill();
  } else {
    // Stylized orange clownfish
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(60, 40, 40, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin
    ctx.beginPath();
    ctx.moveTo(95, 40);
    ctx.lineTo(115, 20);
    ctx.lineTo(115, 60);
    ctx.closePath();
    ctx.fill();

    // White stripes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(55, 40, 8, 23, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(35, 36, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  return c;
}
