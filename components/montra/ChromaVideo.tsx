'use client';

import { useEffect, useRef } from 'react';

interface ChromaVideoProps {
  src: string;
}

/**
 * 노란/크림 배경 동영상에서 가장자리부터 flood-fill 로 배경을 알파=0 처리해
 * 여우 마스코트만 떠있는 것처럼 보이게 한다.
 *
 * 화질 최적화:
 * - 표시용 canvas: video 원본 해상도 × devicePixelRatio (HiDPI 대응)
 * - 처리용 off-screen canvas: 1/2 해상도에서 flood-fill (CPU 부담 1/4)
 * - 합성: displayCanvas에 풀해상도 video → processCanvas의 알파만 destination-in
 * - 결과: 영상 픽셀은 1920x1080 그대로, 알파 경계만 살짝 부드러워져 자연스러움
 */
export default function ChromaVideo({ src }: ChromaVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const displayCanvas = canvasRef.current;
    if (!video || !displayCanvas) return;
    const dctx = displayCanvas.getContext('2d');
    if (!dctx) return;
    let raf = 0;

    // 알파 마스크 계산용 off-screen canvas (저해상도)
    const processCanvas = document.createElement('canvas');
    const pctx = processCanvas.getContext('2d', { willReadFrequently: true });
    if (!pctx) return;

    let dispW = 0;
    let dispH = 0;
    let procW = 0;
    let procH = 0;

    const setupBuffers = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      // 표시용: 풀해상도 × DPR (DPR은 2 이하로 클램프 — 3x 이상은 GPU 비용만 늘고 시각 차이 미미)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dispW = Math.round(vw * dpr);
      dispH = Math.round(vh * dpr);
      displayCanvas.width = dispW;
      displayCanvas.height = dispH;

      // 처리용: 1/2 해상도, 짝수 보정 (drawImage 보간 손실 최소화)
      procW = Math.max(2, Math.round(vw / 2));
      procH = Math.max(2, Math.round(vh / 2));
      if (procW % 2 === 1) procW += 1;
      if (procH % 2 === 1) procH += 1;
      processCanvas.width = procW;
      processCanvas.height = procH;

      // 보간 품질: 풀해상도 video drawImage 시 부드러운 다운샘플
      dctx.imageSmoothingEnabled = true;
      dctx.imageSmoothingQuality = 'high';
      pctx.imageSmoothingEnabled = true;
      pctx.imageSmoothingQuality = 'medium';
    };

    const onMeta = () => {
      setupBuffers();
    };
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    const onCanPlay = () => {
      // canplay는 readyState>=3 시점이라 videoWidth/Height가 확실히 잡혀있음.
      // 캐시 hit / StrictMode 더블 mount 등으로 loadedmetadata 가 누락된 케이스 보강.
      setupBuffers();
      tryPlay();
    };
    const onEnded = () => {
      try {
        video.currentTime = 0;
        tryPlay();
      } catch {
        /* noop */
      }
    };
    const onFirstClick = () => {
      tryPlay();
      window.removeEventListener('click', onFirstClick);
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('ended', onEnded);
    window.addEventListener('click', onFirstClick, { once: true });

    // 컴포넌트 mount 시점에 이미 video metadata가 로드되어 있으면(캐시 hit / StrictMode 재실행 등)
    // loadedmetadata 이벤트가 영원히 안 올 수 있다. 즉시 한 번 시도.
    if (video.videoWidth && video.videoHeight) {
      setupBuffers();
      if (video.readyState >= 2) tryPlay();
    }

    const draw = () => {
      // 자가 복구: 어떤 이유로 setupBuffers가 누락됐는데 video는 재생 가능한 상태라면 즉시 복구.
      if (video.readyState >= 2 && (dispW === 0 || procW === 0)) {
        setupBuffers();
      }
      if (video.readyState >= 2 && dispW > 0 && procW > 0) {
        try {
          // 1) 표시용 캔버스: 풀해상도로 video를 그린다 (이게 사용자가 보게 될 픽셀)
          dctx.globalCompositeOperation = 'source-over';
          dctx.clearRect(0, 0, dispW, dispH);
          dctx.drawImage(video, 0, 0, dispW, dispH);

          // 2) 처리용 캔버스: 1/2 해상도로 flood-fill 해서 알파 마스크만 만든다
          pctx.drawImage(video, 0, 0, procW, procH);
          const img = pctx.getImageData(0, 0, procW, procH);
          const px = img.data;
          const W = procW;
          const H = procH;
          const visited = new Uint8Array(W * H);
          const stack: number[] = [];
          for (let x = 0; x < W; x++) {
            stack.push(x);
            stack.push((H - 1) * W + x);
          }
          for (let y = 0; y < H; y++) {
            stack.push(y * W);
            stack.push(y * W + W - 1);
          }
          const isBg = (i4: number) => {
            const r = px[i4];
            const g = px[i4 + 1];
            const b = px[i4 + 2];
            return (
              r > 235 &&
              g > 230 &&
              b > 200 &&
              r - b < 50 &&
              g - b < 50 &&
              Math.abs(r - g) < 20
            );
          };
          while (stack.length) {
            const idx = stack.pop()!;
            if (idx < 0 || idx >= W * H || visited[idx]) continue;
            const i4 = idx * 4;
            if (!isBg(i4)) continue;
            visited[idx] = 1;
            px[i4 + 3] = 0;
            const x = idx % W;
            const y = (idx / W) | 0;
            if (x > 0) stack.push(idx - 1);
            if (x < W - 1) stack.push(idx + 1);
            if (y > 0) stack.push(idx - W);
            if (y < H - 1) stack.push(idx + W);
          }
          pctx.putImageData(img, 0, 0);

          // 3) 표시용 캔버스에 처리용 알파 마스크를 stretch 합성 (RGB는 무시, 알파만 적용)
          dctx.globalCompositeOperation = 'destination-in';
          dctx.drawImage(processCanvas, 0, 0, dispW, dispH);
          dctx.globalCompositeOperation = 'source-over';
        } catch {
          /* tainted or not ready */
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('ended', onEnded);
      window.removeEventListener('click', onFirstClick);
    };
  }, [src]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      <canvas ref={canvasRef} className="chroma-canvas" />
    </>
  );
}
