"use client";

import { useEffect, useState } from "react";
import { galleryPhotos } from "./GallerySphere";

const assetUrls = [
  "/birthday_cake.glb",
  "/hbd.mp3",
  "/fonts/GeneralSans-Variable.woff2",
  "/fonts/GeneralSans-VariableItalic.woff2",
  ...galleryPhotos.map((photo) => photo.src),
];

function loadAsset(url) {
  if (url.startsWith("http")) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = () => reject(new Error(`Failed to load ${url}`));
      image.src = url;
    });
  }

  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }

    return response.blob();
  });
}

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    let completed = 0;
    let failed = 0;

    const updateProgress = () => {
      completed += 1;
      setProgress(Math.round((completed / assetUrls.length) * 100));
    };

    const preload = async () => {
      await Promise.all(
        assetUrls.map((url) =>
          loadAsset(url).catch(() => {
            failed += 1;
          }).finally(updateProgress),
        ),
      );

      setErrorCount(failed);

      if (failed === 0) {
        onComplete();
      }
    };

    preload();

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [onComplete]);

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__content">
        <p className="loading-screen__label">Preparing your day</p>
        <p className="loading-screen__percentage">{progress}%</p>
        <div
          className="loading-screen__bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        {errorCount > 0 && (
          <>
            <p className="loading-screen__error">
              {errorCount} asset gagal dimuat. Periksa koneksi lalu coba lagi.
            </p>
            <button
              className="loading-screen__retry"
              onClick={() => window.location.reload()}
            >
              Coba lagi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
