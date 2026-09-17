import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FishObject,
  BoatObject,
  Particle,
  Coral,
  Seaweed,
  Bubble,
  HandData,
  VocabItem,
  HandPoint
} from './types';
import { createShuffledVocabList } from './data/words';
import { soundFX } from './utils/audio';
import { loadAndKeyImage } from './utils/imageLoader';
import {
  drawWater,
  drawUnderwaterEnvironment,
  drawBoat,
  drawFish,
  drawHand,
  drawParticles
} from './utils/canvasRenderer';
import { HUD } from './components/HUD';
import { StartModal } from './components/StartModal';
import { VictoryModal } from './components/VictoryModal';
import { HandPrompt } from './components/HandPrompt';
import { CargoDeckModal } from './components/CargoDeckModal';

const MAX_ACTIVE_FISH = 20;
const BOAT_A_IMAGE_URL = 'https://img1.pic.in.th/images/25e8f7ece97fdf058.png';
const FISH_IMAGE_URL = 'https://img1.pic.in.th/images/335b8e39efc006430.png';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Game UI State
  const [gameState, setGameState] = useState<'start' | 'playing' | 'victory'>('start');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Collected words
  const [collectedA, setCollectedA] = useState<string[]>([]);
  const [collectedAn, setCollectedAn] = useState<string[]>([]);

  // Simulation & Game references (for high-fps loop)
  const remainingPoolRef = useRef<VocabItem[]>([]);
  const activeFishRef = useRef<FishObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const seaweedsRef = useRef<Seaweed[]>([]);
  const coralsRef = useRef<Coral[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);

  // Images ref
  const boatImgRef = useRef<HTMLCanvasElement | HTMLImageElement | null>(null);
  const fishImgRef = useRef<HTMLCanvasElement | HTMLImageElement | null>(null);

  // Boat states
  const boatARef = useRef<BoatObject>({
    type: 'a',
    label: "Boat 'a'",
    centerXPercent: 0.25,
    collectedWords: [],
    collectedFish: [],
    lastDropEffectTimer: 0
  });

  const boatAnRef = useRef<BoatObject>({
    type: 'an',
    label: "Boat 'an'",
    centerXPercent: 0.75,
    collectedWords: [],
    collectedFish: [],
    lastDropEffectTimer: 0
  });

  // Helper: securely add fish to boat cargo deck so it persists and sits in the boat
  const addFishToBoat = useCallback((boat: BoatObject, vocab: VocabItem) => {
    const count = boat.collectedFish.length;
    const colIndex = count % 6;
    const rowIndex = Math.floor(count / 6);

    const baseX = -52 + colIndex * 21 + (Math.random() * 6 - 3);
    const baseY = 6 - (rowIndex % 4) * 8 + (Math.random() * 4 - 2);
    const rotation = Math.random() * 0.35 - 0.175;
    const scale = 0.44 + Math.random() * 0.06;

    boat.collectedFish.push({
      id: `${vocab.word}-${Date.now()}-${Math.random()}`,
      word: vocab.word,
      type: vocab.type,
      relX: baseX,
      relY: baseY,
      rotation,
      scale,
      phase: Math.random() * Math.PI * 2,
      addedAt: performance.now()
    });
    boat.collectedWords.push(vocab.word);
  }, []);

  // Hand tracking state
  const handDataRef = useRef<HandData>({
    detected: false,
    landmarks: [],
    cursorX: 0,
    cursorY: 0,
    thumbX: 0,
    thumbY: 0,
    isPinching: false,
    state: 'normal'
  });

  const grabbedFishIdRef = useRef<string | null>(null);
  const wasPinchingRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);

  // Initialize Sea Environment (Corals, Seaweeds, Bubbles)
  const initEnvironment = useCallback((width: number, height: number) => {
    // Seaweeds at bottom
    const seaweeds: Seaweed[] = [];
    const seaweedCount = Math.max(12, Math.floor(width / 75));
    for (let i = 0; i < seaweedCount; i++) {
      seaweeds.push({
        x: (i + 0.5) * (width / seaweedCount) + (Math.random() * 20 - 10),
        baseY: height,
        height: 60 + Math.random() * 80,
        segmentCount: 5 + Math.floor(Math.random() * 3),
        width: 6 + Math.random() * 4,
        phaseOffset: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 1.5,
        color: Math.random() > 0.4 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(5, 150, 105, 0.85)'
      });
    }
    seaweedsRef.current = seaweeds;

    // Corals
    const corals: Coral[] = [];
    const coralCount = Math.max(8, Math.floor(width / 130));
    const coralTypes: ('staghorn' | 'fan' | 'brain')[] = ['staghorn', 'fan', 'brain'];
    const coralColors = [
      { color: '#ec4899', glow: '#f472b6' },
      { color: '#8b5cf6', glow: '#a78bfa' },
      { color: '#06b6d4', glow: '#67e8f9' },
      { color: '#f97316', glow: '#fb923c' },
      { color: '#10b981', glow: '#34d399' }
    ];

    for (let i = 0; i < coralCount; i++) {
      const type = coralTypes[i % coralTypes.length];
      const pal = coralColors[i % coralColors.length];
      corals.push({
        x: (i + 0.5) * (width / coralCount) + (Math.random() * 30 - 15),
        y: height - 5,
        width: 50 + Math.random() * 40,
        height: 45 + Math.random() * 45,
        type,
        color: pal.color,
        glowColor: pal.glow
      });
    }
    coralsRef.current = corals;

    // Bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 28; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: height * 0.6 + Math.random() * (height * 0.4),
        radius: 2 + Math.random() * 4.5,
        speed: 0.8 + Math.random() * 1.6,
        wobbleSpeed: 1 + Math.random() * 2,
        wobbleAmp: 0.5 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.3 + Math.random() * 0.45
      });
    }
    bubblesRef.current = bubbles;
  }, []);

  // Spawn an active fish into the swimming zone
  const createFishObject = useCallback((vocab: VocabItem, width: number, height: number): FishObject => {
    const yMin = height * 0.58 + 25;
    const yMax = height * 0.86;
    const xMin = 95;
    const xMax = width - 95;

    const dir = Math.random() > 0.5 ? 1 : -1;
    const fishW = 100;
    const fishH = 60;

    return {
      id: vocab.id,
      vocab,
      x: xMin + Math.random() * (xMax - xMin),
      y: yMin + Math.random() * (yMax - yMin),
      targetY: yMin + Math.random() * (yMax - yMin),
      vx: (0.7 + Math.random() * 0.9) * dir,
      direction: dir as 1 | -1,
      speed: 0.7 + Math.random() * 0.9,
      width: fishW,
      height: fishH,
      swimPhase: Math.random() * Math.PI * 2,
      isHovered: false,
      isGrabbed: false
    };
  }, []);

  // Initialize word pool & active fish (20 active fish)
  const initGameSession = useCallback((w: number, h: number) => {
    const allWords = createShuffledVocabList();
    const initialFishWords = allWords.slice(0, MAX_ACTIVE_FISH);
    const pool = allWords.slice(MAX_ACTIVE_FISH);

    remainingPoolRef.current = pool;
    activeFishRef.current = initialFishWords.map((v) => createFishObject(v, w, h));
    particlesRef.current = [];

    boatARef.current.collectedWords = [];
    boatARef.current.collectedFish = [];
    boatARef.current.lastDropEffectTimer = 0;
    boatAnRef.current.collectedWords = [];
    boatAnRef.current.collectedFish = [];
    boatAnRef.current.lastDropEffectTimer = 0;

    setCollectedA([]);
    setCollectedAn([]);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setClearedCount(0);
    grabbedFishIdRef.current = null;
  }, [createFishObject]);

  // Preload Images
  useEffect(() => {
    loadAndKeyImage(BOAT_A_IMAGE_URL).then((boat) => {
      boatImgRef.current = boat;
    });
    loadAndKeyImage(FISH_IMAGE_URL).then((fish) => {
      fishImgRef.current = fish;
    });
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        initEnvironment(w, h);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initEnvironment]);

  // Particle Emitter
  const spawnParticles = (x: number, y: number, color: string, count = 22) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 4,
        color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }
  };

  // Start MediaPipe Hands & Webcam
  const startCamera = async () => {
    setIsLoadingCamera(true);
    setCameraError(null);

    try {
      // Ensure MediaPipe Hands is loaded
      let attempts = 0;
      while ((!window.Hands || !window.Camera) && attempts < 30) {
        await new Promise((res) => setTimeout(res, 200));
        attempts++;
      }

      if (!window.Hands) {
        throw new Error('MediaPipe Hands script could not be loaded from CDN.');
      }

      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Lite model for ultra-low latency
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarksRaw = results.multiHandLandmarks[0];

          // Mirrored webcam stream: Landmark X is inverted: x = (1 - raw.x) * width
          const landmarks: HandPoint[] = landmarksRaw.map((pt: any) => ({
            x: (1 - pt.x) * width,
            y: pt.y * height
          }));

          const rawIndexTip = landmarks[8];
          const rawThumbTip = landmarks[4];

          // Smooth Lerp (0.75 interpolation)
          const prevX = handDataRef.current.cursorX || rawIndexTip.x;
          const prevY = handDataRef.current.cursorY || rawIndexTip.y;
          const curX = prevX + (rawIndexTip.x - prevX) * 0.75;
          const curY = prevY + (rawIndexTip.y - prevY) * 0.75;

          // Pinch distance calculation
          const pinchDist = Math.hypot(rawThumbTip.x - rawIndexTip.x, rawThumbTip.y - rawIndexTip.y);
          // Scale-adaptive pinch threshold (~50px at 1080p, normalized threshold)
          const pinchThreshold = Math.min(65, Math.max(38, width * 0.04));
          const isPinching = pinchDist < pinchThreshold;

          handDataRef.current = {
            detected: true,
            landmarks,
            cursorX: curX,
            cursorY: curY,
            thumbX: rawThumbTip.x,
            thumbY: rawThumbTip.y,
            isPinching,
            state: handDataRef.current.state
          };
          setHandDetected(true);
        } else {
          handDataRef.current.detected = false;
          setHandDetected(false);
        }
      });

      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      await camera.start();

      // Setup game session
      if (canvasRef.current) {
        initGameSession(canvasRef.current.width, canvasRef.current.height);
      }

      setIsLoadingCamera(false);
      setGameState('playing');
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      setIsLoadingCamera(false);
      setCameraError(err.message || 'ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบการอนุญาตสิทธิ์');
    }
  };

  // Main Game Loop: Physics, Fish Boundary, Pinch Interaction & Canvas Rendering
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const time = now / 1000;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx) {
        const width = canvas.width;
        const height = canvas.height;
        const waterLevel = height * 0.58;

        // 1. Clear & Draw Mirrored Webcam Video as AR Background
        ctx.clearRect(0, 0, width, height);

        if (videoRef.current && videoRef.current.readyState >= 2) {
          ctx.save();
          // Mirror horizontally for intuitive user interaction
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, -width, 0, width, height);
          ctx.restore();
        } else {
          // Fallback dark gradient backdrop if video warming up
          const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
          bgGrad.addColorStop(0, '#020617');
          bgGrad.addColorStop(1, '#082f49');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // 2. Draw Dynamic Harmonic Water Surface & Underwater Ambient
        drawWater(ctx, width, height, time);

        // Update & Draw Bubbles
        bubblesRef.current.forEach((b) => {
          b.y -= b.speed;
          b.phase += b.wobbleSpeed * dt;
          b.x += Math.sin(b.phase) * (b.wobbleAmp * dt * 25);

          // Reset when reaching water surface
          if (b.y <= waterLevel) {
            b.y = height + 5;
            b.x = Math.random() * width;
          }
        });

        drawUnderwaterEnvironment(
          ctx,
          width,
          height,
          time,
          seaweedsRef.current,
          coralsRef.current,
          bubblesRef.current
        );

        // 3. Update Boat Drop Effects
        if (boatARef.current.lastDropEffectTimer > 0) {
          boatARef.current.lastDropEffectTimer -= dt;
        }
        if (boatAnRef.current.lastDropEffectTimer > 0) {
          boatAnRef.current.lastDropEffectTimer -= dt;
        }

        // Determine if cursor is near Boat zones
        const hand = handDataRef.current;
        const boatAZone = {
          x: width * 0.25,
          y: waterLevel - 20,
          radius: Math.min(130, width * 0.16)
        };
        const boatAnZone = {
          x: width * 0.75,
          y: waterLevel - 20,
          radius: Math.min(130, width * 0.16)
        };

        const distToBoatA = Math.hypot(hand.cursorX - boatAZone.x, hand.cursorY - boatAZone.y);
        const distToBoatAn = Math.hypot(hand.cursorX - boatAnZone.x, hand.cursorY - boatAnZone.y);

        const isHoveringBoatA = distToBoatA < boatAZone.radius;
        const isHoveringBoatAn = distToBoatAn < boatAnZone.radius;

        // Draw Boats (pass fishImg so caught fish can be rendered resting inside the boat)
        drawBoat(ctx, boatARef.current, width, height, time, boatImgRef.current, isHoveringBoatA, fishImgRef.current);
        drawBoat(ctx, boatAnRef.current, width, height, time, boatImgRef.current, isHoveringBoatAn, fishImgRef.current);

        // 4. Update Fish Physics & Interaction
        const yMin = height * 0.58 + 20;
        const yMax = height * 0.86;
        const xMin = 85;
        const xMax = width - 85;

        let anyHovered = false;
        const currentGrabbedId = grabbedFishIdRef.current;

        activeFishRef.current.forEach((fish) => {
          if (fish.id === currentGrabbedId) {
            // Fish is grabbed by player hand
            fish.isGrabbed = true;
            fish.isHovered = true;
            // Smoothly stick fish directly to cursor
            fish.x += (hand.cursorX - fish.x) * 0.55;
            fish.y += (hand.cursorY - fish.y) * 0.55;
          } else {
            fish.isGrabbed = false;

            // Autonomous swimming within strictly locked bounds
            fish.x += fish.vx * (fish.speed * 60 * dt);
            fish.swimPhase += dt * 4;

            // Horizontal boundary bounce
            if (fish.x <= xMin) {
              fish.x = xMin;
              fish.vx = Math.abs(fish.vx);
              fish.direction = 1;
            } else if (fish.x >= xMax) {
              fish.x = xMax;
              fish.vx = -Math.abs(fish.vx);
              fish.direction = -1;
            }

            // Vertical boundary soft return
            if (fish.y < yMin) {
              fish.y += 20 * dt;
            } else if (fish.y > yMax) {
              fish.y -= 20 * dt;
            }

            // Check if cursor is hovering this fish
            const distToCursor = Math.hypot(hand.cursorX - fish.x, hand.cursorY - fish.y);
            const hoverRadius = 50;

            if (hand.detected && distToCursor < hoverRadius && !currentGrabbedId) {
              fish.isHovered = true;
              anyHovered = true;
            } else {
              fish.isHovered = false;
            }
          }

          // Draw Fish
          drawFish(ctx, fish, fishImgRef.current, time, fish.id === currentGrabbedId);
        });

        // 5. Pinch State Machine & Drag-and-Drop Classification
        const isPinchingNow = hand.detected && hand.isPinching;
        const justPinched = isPinchingNow && !wasPinchingRef.current;
        const justReleased = !isPinchingNow && wasPinchingRef.current;

        // Determine Cursor Visual State
        if (!hand.detected) {
          hand.state = 'normal';
        } else if (currentGrabbedId) {
          hand.state = 'grabbed'; // Green circle
        } else if (anyHovered) {
          hand.state = 'hover'; // Yellow dashed circle
        } else if (isPinchingNow) {
          hand.state = 'missed'; // Red circle
        } else {
          hand.state = 'normal'; // Blue circle
        }

        // Action 1: Pinch Grab
        if (justPinched && !currentGrabbedId) {
          // Find closest hovered fish
          let targetFish: FishObject | null = null;
          let minDist = 55;

          activeFishRef.current.forEach((fish) => {
            const d = Math.hypot(hand.cursorX - fish.x, hand.cursorY - fish.y);
            if (d < minDist) {
              minDist = d;
              targetFish = fish;
            }
          });

          if (targetFish) {
            grabbedFishIdRef.current = (targetFish as FishObject).id;
            soundFX.playGrabSnap();
          }
        }

        // Action 2: Release / Drop into Boats
        if (justReleased && currentGrabbedId) {
          const droppedFish = activeFishRef.current.find((f) => f.id === currentGrabbedId);

          if (droppedFish) {
            // Check if dropped onto Boat 'a'
            if (isHoveringBoatA) {
              if (droppedFish.vocab.type === 'a') {
                // CORRECT!
                soundFX.playCorrectChime();
                spawnParticles(boatAZone.x, boatAZone.y, '#22c55e', 28);
                boatARef.current.lastDropEffectTimer = 0.5;
                addFishToBoat(boatARef.current, droppedFish.vocab);

                setScore((s) => s + 20);
                setCombo((c) => {
                  const newCombo = c + 1;
                  setMaxCombo((mc) => Math.max(mc, newCombo));
                  return newCombo;
                });
                setCollectedA([...boatARef.current.collectedWords]);
                handleWordCleared(droppedFish.id);
              } else {
                // WRONG!
                soundFX.playWrongBuzzer();
                spawnParticles(hand.cursorX, hand.cursorY, '#ef4444', 24);
                setScore((s) => Math.max(0, s - 10));
                setCombo(0);
                resetFishPosition(droppedFish, width, height);
              }
            } else if (isHoveringBoatAn) {
              // Check if dropped onto Boat 'an'
              if (droppedFish.vocab.type === 'an') {
                // CORRECT!
                soundFX.playCorrectChime();
                spawnParticles(boatAnZone.x, boatAnZone.y, '#22c55e', 28);
                boatAnRef.current.lastDropEffectTimer = 0.5;
                addFishToBoat(boatAnRef.current, droppedFish.vocab);

                setScore((s) => s + 20);
                setCombo((c) => {
                  const newCombo = c + 1;
                  setMaxCombo((mc) => Math.max(mc, newCombo));
                  return newCombo;
                });
                setCollectedAn([...boatAnRef.current.collectedWords]);
                handleWordCleared(droppedFish.id);
              } else {
                // WRONG!
                soundFX.playWrongBuzzer();
                spawnParticles(hand.cursorX, hand.cursorY, '#ef4444', 24);
                setScore((s) => Math.max(0, s - 10));
                setCombo(0);
                resetFishPosition(droppedFish, width, height);
              }
            } else {
              // Released in water
              soundFX.playSplash();
              spawnParticles(droppedFish.x, droppedFish.y, '#38bdf8', 14);
              resetFishPosition(droppedFish, width, height);
            }
          }

          grabbedFishIdRef.current = null;
        }

        wasPinchingRef.current = isPinchingNow;

        // 6. Update and Draw Particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);
        drawParticles(ctx, particlesRef.current);

        // 7. Draw Hand Skeleton & Responsive Cursor
        drawHand(ctx, hand);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Word cleared handler: remove fish, spawn next from pool or declare victory
  const handleWordCleared = (fishId: string) => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : window.innerWidth;
    const h = canvas ? canvas.height : window.innerHeight;

    // Remove from active
    activeFishRef.current = activeFishRef.current.filter((f) => f.id !== fishId);

    // Increment cleared counter
    setClearedCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 60) {
        setGameState('victory');
      }
      return nextCount;
    });

    // Spawn new word if pool has items
    if (remainingPoolRef.current.length > 0) {
      const nextVocab = remainingPoolRef.current.shift()!;
      const newFish = createFishObject(nextVocab, w, h);
      activeFishRef.current.push(newFish);
    }
  };

  // Reset fish to underwater swimming zone when dropped outside boat or wrong answer
  const resetFishPosition = (fish: FishObject, width: number, height: number) => {
    fish.isGrabbed = false;
    const yMin = height * 0.58 + 30;
    const yMax = height * 0.86;
    fish.y = yMin + Math.random() * (yMax - yMin);
    fish.x = Math.max(90, Math.min(width - 90, fish.x));
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = !isMuted;
    setIsMuted(muted);
    soundFX.isMuted = muted;
  };

  // Restart
  const handleRestart = () => {
    if (canvasRef.current) {
      initGameSession(canvasRef.current.width, canvasRef.current.height);
    }
    setGameState('playing');
  };

  // Seamless Pointer Fallback (allows testing & playing with mouse/trackpad if camera hand is not detected)
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      if (!handDataRef.current.detected && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        handDataRef.current.cursorX = e.clientX - rect.left;
        handDataRef.current.cursorY = e.clientY - rect.top;
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (!handDataRef.current.detected && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        handDataRef.current.cursorX = e.clientX - rect.left;
        handDataRef.current.cursorY = e.clientY - rect.top;
        handDataRef.current.isPinching = true;
      }
    };

    const handlePointerUp = () => {
      if (!handDataRef.current.detected) {
        handDataRef.current.isPinching = false;
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Hidden Webcam Video Feed used by MediaPipe Hands */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden"
      />

      {/* Main AR Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-none"
      />

      {/* Top HUD */}
      {gameState === 'playing' && (
        <HUD
          score={score}
          combo={combo}
          clearedCount={clearedCount}
          totalWords={60}
          handDetected={handDetected}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onRestart={handleRestart}
          onOpenDeck={() => setIsDeckOpen(true)}
        />
      )}

      {/* Hand detection prompt overlay */}
      {gameState === 'playing' && (
        <HandPrompt show={!handDetected} />
      )}

      {/* Start Modal */}
      {gameState === 'start' && (
        <StartModal
          onStart={startCamera}
          isLoading={isLoadingCamera}
          cameraError={cameraError}
        />
      )}

      {/* Victory All Clear Modal */}
      {gameState === 'victory' && (
        <VictoryModal
          score={score}
          maxCombo={maxCombo}
          totalWords={60}
          wordsA={collectedA}
          wordsAn={collectedAn}
          onPlayAgain={handleRestart}
        />
      )}

      {/* Cargo Deck Review Modal */}
      <CargoDeckModal
        isOpen={isDeckOpen}
        onClose={() => setIsDeckOpen(false)}
        wordsA={collectedA}
        wordsAn={collectedAn}
      />
    </div>
  );
}
