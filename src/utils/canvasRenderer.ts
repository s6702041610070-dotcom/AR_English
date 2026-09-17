import {
  FishObject,
  BoatObject,
  Particle,
  Coral,
  Seaweed,
  Bubble,
  HandData,
  HandPoint
} from '../types';

// Calculate wave height at X position given dynamic parameters
export function getWaveY(x: number, width: number, height: number, time: number): number {
  const baseWaterLevel = height * 0.58;
  const wave1 = Math.sin(x * 0.007 + time * 1.8) * 10;
  const wave2 = Math.cos(x * 0.014 - time * 1.2) * 6;
  return baseWaterLevel + wave1 + wave2;
}

// 1. Draw Water Surface and Underwater tint
export function drawWater(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) {
  const baseWaterLevel = height * 0.58;

  // Layer 1: Back secondary wave (slightly darker/deeper)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, baseWaterLevel);
  for (let x = 0; x <= width; x += 12) {
    const waveBack =
      baseWaterLevel - 4 +
      Math.sin(x * 0.009 - time * 1.4 + 1.5) * 8 +
      Math.cos(x * 0.018 + time * 1.1) * 4;
    ctx.lineTo(x, waveBack);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8, 70, 110, 0.42)';
  ctx.fill();
  ctx.restore();

  // Layer 2: Main primary front wave with gradient
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, getWaveY(0, width, height, time));

  for (let x = 0; x <= width; x += 10) {
    ctx.lineTo(x, getWaveY(x, width, height, time));
  }
  ctx.lineTo(width, height);
  ctx.closePath();

  // Underwater gradient (semi-transparent so webcam player is visible)
  const grad = ctx.createLinearGradient(0, baseWaterLevel - 15, 0, height);
  grad.addColorStop(0, 'rgba(6, 120, 170, 0.48)');
  grad.addColorStop(0.3, 'rgba(4, 80, 130, 0.55)');
  grad.addColorStop(0.7, 'rgba(2, 45, 85, 0.68)');
  grad.addColorStop(1, 'rgba(1, 25, 55, 0.82)');
  ctx.fillStyle = grad;
  ctx.fill();

  // Crest Highlight (bright glowing wave top rim)
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(186, 240, 255, 0.85)';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.restore();

  // Underwater Currents (flowing luminous caustic ribbons)
  ctx.save();
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.16)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) {
    const streamY = baseWaterLevel + 40 + i * 55;
    ctx.beginPath();
    ctx.moveTo(0, streamY + Math.sin(time * 1.5 + i) * 12);
    for (let x = 0; x <= width; x += 25) {
      const curY =
        streamY +
        Math.sin(x * 0.005 + time * 1.2 + i * 1.8) * 14 +
        Math.cos(x * 0.012 - time * 0.9 + i) * 6;
      ctx.lineTo(x, curY);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// 2. Draw Underwater Environment: Seaweed, Corals, Bubbles
export function drawUnderwaterEnvironment(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  seaweeds: Seaweed[],
  corals: Coral[],
  bubbles: Bubble[]
) {
  // Swaying Seaweed
  ctx.save();
  seaweeds.forEach((sw) => {
    ctx.beginPath();
    ctx.moveTo(sw.x, sw.baseY);

    const segments = sw.segmentCount;
    const segHeight = sw.height / segments;

    let prevX = sw.x;
    let prevY = sw.baseY;

    for (let s = 1; s <= segments; s++) {
      const currY = sw.baseY - s * segHeight;
      // Greater sway at the top
      const swayFactor = (s / segments) * 22;
      const swayX =
        sw.x + Math.sin(time * sw.speed + sw.phaseOffset + s * 0.4) * swayFactor;

      const cpX = (prevX + swayX) / 2;
      const cpY = (prevY + currY) / 2;
      ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);

      prevX = swayX;
      prevY = currY;
    }

    ctx.strokeStyle = sw.color;
    ctx.lineWidth = sw.width;
    ctx.lineCap = 'round';
    ctx.stroke();
  });
  ctx.restore();

  // Corals (Staghorn, Fan, Brain)
  corals.forEach((coral) => {
    ctx.save();
    ctx.shadowColor = coral.glowColor;
    ctx.shadowBlur = 12;

    if (coral.type === 'staghorn') {
      // Branching staghorn coral with glowing tips
      ctx.strokeStyle = coral.color;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      // Trunk
      ctx.beginPath();
      ctx.moveTo(coral.x, coral.y);
      ctx.lineTo(coral.x, coral.y - coral.height * 0.5);
      ctx.stroke();

      // Left branch
      ctx.beginPath();
      ctx.moveTo(coral.x, coral.y - coral.height * 0.4);
      ctx.lineTo(coral.x - coral.width * 0.35, coral.y - coral.height * 0.75);
      ctx.lineTo(coral.x - coral.width * 0.4, coral.y - coral.height);
      ctx.stroke();

      // Right branch
      ctx.beginPath();
      ctx.moveTo(coral.x, coral.y - coral.height * 0.45);
      ctx.lineTo(coral.x + coral.width * 0.35, coral.y - coral.height * 0.75);
      ctx.lineTo(coral.x + coral.width * 0.45, coral.y - coral.height * 0.95);
      ctx.stroke();

      // Glowing tips
      ctx.fillStyle = coral.glowColor;
      ctx.beginPath();
      ctx.arc(coral.x - coral.width * 0.4, coral.y - coral.height, 4, 0, Math.PI * 2);
      ctx.arc(coral.x + coral.width * 0.45, coral.y - coral.height * 0.95, 4, 0, Math.PI * 2);
      ctx.arc(coral.x, coral.y - coral.height * 0.75, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (coral.type === 'fan') {
      // Fan coral
      ctx.fillStyle = coral.color;
      ctx.beginPath();
      ctx.arc(coral.x, coral.y, coral.width * 0.55, Math.PI, 0, false);
      ctx.fill();

      // Rib lines
      ctx.strokeStyle = coral.glowColor;
      ctx.lineWidth = 2;
      for (let angle = Math.PI * 1.1; angle < Math.PI * 1.9; angle += 0.2) {
        ctx.beginPath();
        ctx.moveTo(coral.x, coral.y);
        ctx.lineTo(
          coral.x + Math.cos(angle) * coral.width * 0.52,
          coral.y + Math.sin(angle) * coral.height * 0.52
        );
        ctx.stroke();
      }
    } else {
      // Brain coral mound
      ctx.fillStyle = coral.color;
      ctx.beginPath();
      ctx.ellipse(coral.x, coral.y, coral.width * 0.45, coral.height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Squiggly patterns
      ctx.strokeStyle = coral.glowColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(coral.x - 10, coral.y - 5, 8, 0, Math.PI);
      ctx.arc(coral.x + 10, coral.y - 5, 8, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  });

  // Bubbles
  bubbles.forEach((b) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(186, 230, 253, ${b.alpha})`;
    ctx.fill();

    // Bubble highlight
    ctx.beginPath();
    ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.9})`;
    ctx.fill();
    ctx.restore();
  });
}

// 3. Draw Boats with Neon Glow Badges & Collected Fish inside Cargo Hold
export function drawBoat(
  ctx: CanvasRenderingContext2D,
  boat: BoatObject,
  width: number,
  height: number,
  time: number,
  boatImg: HTMLCanvasElement | HTMLImageElement | null,
  isTargeted: boolean,
  fishImg?: HTMLCanvasElement | HTMLImageElement | null
) {
  const boatX = width * boat.centerXPercent;
  const waveY = getWaveY(boatX, width, height, time);

  // Bobbing and subtle pitch rocking
  const rockAngle = Math.sin(time * 2 + (boat.type === 'a' ? 0 : 1.2)) * 0.04;
  const dropBob = boat.lastDropEffectTimer > 0 ? Math.sin(boat.lastDropEffectTimer * 20) * 8 : 0;
  const boatY = waveY - 35 + dropBob;

  ctx.save();
  ctx.translate(boatX, boatY);
  ctx.rotate(rockAngle);

  // Highlight glow when dragged item is hovering near
  if (isTargeted) {
    ctx.shadowColor = boat.type === 'a' ? '#38bdf8' : '#fbbf24';
    ctx.shadowBlur = 30;
  }

  // Draw Boat Image
  const boatWidth = Math.min(220, width * 0.28);
  const boatHeight = (boatWidth * 110) / 200;

  if (boatImg) {
    ctx.drawImage(boatImg, -boatWidth / 2, -boatHeight + 35, boatWidth, boatHeight);
  }

  // Draw Collected Fish staying inside the Boat Cargo Deck
  if (boat.collectedFish && boat.collectedFish.length > 0) {
    // Subtle cargo deck basket glow
    ctx.save();
    ctx.fillStyle = boat.type === 'a' ? 'rgba(14, 116, 144, 0.35)' : 'rgba(180, 83, 9, 0.35)';
    ctx.strokeStyle = boat.type === 'a' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, -boatWidth * 0.38, -18, boatWidth * 0.76, 28, 12);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Render each fish resting inside the boat
    const fishCount = boat.collectedFish.length;
    boat.collectedFish.forEach((f, idx) => {
      const bob = Math.sin(time * 3 + f.phase) * 1.5;
      const isNewest = idx === fishCount - 1 && boat.lastDropEffectTimer > 0;

      ctx.save();
      ctx.translate(f.relX, f.relY + bob);
      ctx.rotate(f.rotation + Math.sin(time * 2 + f.phase) * 0.04);
      ctx.scale(f.scale, f.scale);

      if (isNewest) {
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;
      }

      if (fishImg) {
        // Draw miniature fish sprite
        ctx.drawImage(fishImg, -40, -24, 80, 48);
      }
      ctx.restore();

      // Show word badges (show all if <= 10, or show recent + sampled if more to avoid excessive overlap)
      const shouldShowLabel =
        fishCount <= 10 ||
        idx >= fishCount - 6 ||
        idx % 2 === 0;

      if (shouldShowLabel) {
        ctx.save();
        ctx.translate(f.relX, f.relY + bob - 12);

        const wordText = f.word;
        ctx.font = "bold 9px 'Fredoka', 'Plus Jakarta Sans', sans-serif";
        const tw = ctx.measureText(wordText).width;
        const bw = Math.max(26, tw + 6);
        const bh = 14;

        ctx.fillStyle = boat.type === 'a' ? 'rgba(8, 47, 73, 0.92)' : 'rgba(69, 26, 3, 0.92)';
        ctx.strokeStyle = isNewest
          ? '#facc15'
          : boat.type === 'a'
          ? 'rgba(56, 189, 248, 0.65)'
          : 'rgba(251, 191, 36, 0.65)';
        ctx.lineWidth = isNewest ? 1.5 : 1;

        roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isNewest ? '#fef08a' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(wordText, 0, 0);
        ctx.restore();
      }
    });
  }

  // Neon Glow Badge for Boat Label
  const isTypeA = boat.type === 'a';
  const badgeText = `Boat '${boat.type}'`;
  const badgeSub = isTypeA ? 'Consonants (b, c, d...)' : 'Vowels (a, e, i, o, u)';

  ctx.font = "bold 20px 'Fredoka', 'Plus Jakarta Sans', sans-serif";
  const textWidth = ctx.measureText(badgeText).width;
  const badgeW = Math.max(160, textWidth + 50);
  const badgeH = 46;
  const badgeY = -boatHeight - 20;

  // Badge Container Glassmorphism
  ctx.save();
  ctx.shadowColor = isTypeA ? '#06b6d4' : '#f59e0b';
  ctx.shadowBlur = isTargeted ? 25 : 15;

  ctx.fillStyle = isTypeA ? 'rgba(8, 47, 73, 0.92)' : 'rgba(69, 26, 3, 0.92)';
  ctx.strokeStyle = isTypeA ? '#38bdf8' : '#fbbf24';
  ctx.lineWidth = isTargeted ? 3.5 : 2.5;

  roundRect(ctx, -badgeW / 2, badgeY, badgeW, badgeH, 16);
  ctx.fill();
  ctx.stroke();

  // Text inside Badge
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = isTypeA ? '#38bdf8' : '#facc15';
  ctx.shadowBlur = 8;
  ctx.fillText(badgeText, 0, badgeY + 17);

  // Subtitle rule
  ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = isTypeA ? '#7dd3fc' : '#fde68a';
  ctx.shadowBlur = 0;
  ctx.fillText(badgeSub, 0, badgeY + 34);
  ctx.restore();

  // Cargo Count Deck Indicator
  const cargoCount = boat.collectedWords.length;
  const cargoBadgeY = badgeY - 26;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -55, cargoBadgeY, 110, 22, 11);
  ctx.fill();
  ctx.stroke();

  ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Cargo: ${cargoCount} / 30`, 0, cargoBadgeY + 11);
  ctx.restore();

  ctx.restore();
}

// 4. Draw Swimming Fish and Pill Badge
export function drawFish(
  ctx: CanvasRenderingContext2D,
  fish: FishObject,
  fishImg: HTMLCanvasElement | HTMLImageElement | null,
  time: number,
  isGrabbed: boolean
) {
  ctx.save();
  ctx.translate(fish.x, fish.y);

  // Fish body bobbing & swimming wiggle
  const swimWiggle = Math.sin(time * 6 + fish.swimPhase) * 4;
  const tilt = fish.direction === 1 ? swimWiggle * 0.03 : -swimWiggle * 0.03;
  ctx.rotate(tilt);

  // Scale based on direction: flip horizontally if facing left
  ctx.scale(fish.direction, 1);

  // Fish Sprite Size
  const fw = fish.width;
  const fh = fish.height;

  if (fishImg) {
    ctx.drawImage(fishImg, -fw / 2, -fh / 2, fw, fh);
  }

  // Restore scale before drawing text badge so text is never flipped or mirrored
  ctx.restore();

  // High-Contrast Pill Badge: rgba(0,0,0,0.82) with white text
  ctx.save();
  ctx.translate(fish.x, fish.y - fish.height * 0.55 - 12);

  const wordText = fish.vocab.word;
  ctx.font = "bold 15px 'Fredoka', 'Plus Jakarta Sans', sans-serif";
  const metrics = ctx.measureText(wordText);
  const paddingX = 14;
  const badgeW = metrics.width + paddingX * 2;
  const badgeH = 28;

  // Badge glow border when hovered or grabbed
  if (fish.isHovered || isGrabbed) {
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
  } else {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1.2;
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  roundRect(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, 14);
  ctx.fill();
  ctx.stroke();

  // Word Label
  ctx.font = "bold 15px 'Fredoka', 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(wordText, 0, 0);

  ctx.restore();
}

// 5. Draw Hand Skeleton & Cursor
export function drawHand(
  ctx: CanvasRenderingContext2D,
  handData: HandData
) {
  if (!handData.detected || handData.landmarks.length < 21) return;

  const pts = handData.landmarks;

  // MediaPipe Hand Connection Pairs
  const connections: [number, number][] = [
    // Palm base
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
    [9, 13], [13, 14], [14, 15], [15, 16],// Ring
    [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
    [0, 17]                               // Palm base
  ];

  ctx.save();
  // Draw hand bones with glowing cyan lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 8;

  connections.forEach(([i, j]) => {
    ctx.beginPath();
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[j].x, pts[j].y);
    ctx.stroke();
  });

  // Draw joints
  pts.forEach((pt, idx) => {
    ctx.beginPath();
    const isTip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
    const r = isTip ? 4.5 : 3;
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isTip ? '#38bdf8' : 'rgba(224, 242, 254, 0.85)';
    ctx.fill();
  });
  ctx.restore();

  // Draw Cursor at Index Tip (Landmark 8)
  const cx = handData.cursorX;
  const cy = handData.cursorY;
  const state = handData.state;

  ctx.save();
  ctx.translate(cx, cy);

  let mainColor = '#38bdf8'; // normal blue
  let glowColor = '#0284c7';
  let cursorRadius = 18;

  if (state === 'hover') {
    mainColor = '#facc15'; // yellow
    glowColor = '#eab308';
    cursorRadius = 22;
  } else if (state === 'grabbed') {
    mainColor = '#22c55e'; // green
    glowColor = '#16a34a';
    cursorRadius = 24;
  } else if (state === 'missed') {
    mainColor = '#ef4444'; // red
    glowColor = '#dc2626';
    cursorRadius = 16;
  }

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 18;

  // Outer ring
  ctx.beginPath();
  ctx.arc(0, 0, cursorRadius, 0, Math.PI * 2);
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = state === 'hover' ? 3 : 2.5;

  if (state === 'hover') {
    ctx.setLineDash([5, 4]);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Center point
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = mainColor;
  ctx.fill();

  // Pinch line between thumb and index when close
  if (handData.thumbX && handData.thumbY) {
    const tdx = handData.thumbX - cx;
    const tdy = handData.thumbY - cy;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tdx, tdy);
    ctx.strokeStyle = state === 'grabbed' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thumb tip circle
    ctx.beginPath();
    ctx.arc(tdx, tdy, 4, 0, Math.PI * 2);
    ctx.fillStyle = mainColor;
    ctx.fill();
  }

  ctx.restore();
}

// 6. Draw Particles (Splashes and Bubbles)
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fill();
  });
  ctx.restore();
}

// Helper: Rounded Rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
