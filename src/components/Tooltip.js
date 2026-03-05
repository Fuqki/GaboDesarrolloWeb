import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const CURSOR_GAP = 14;
const VIEWPORT_MARGIN = 8;
const SHOW_DELAY_MS = 140;

function Tooltip({ text, children, position = 'top' }) {
  const wrapperRef = useRef(null);
  const bubbleRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const moveFrameRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, hasPointer: false });
  const [visible, setVisible] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [placement, setPlacement] = useState(position);
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  const getAnchorPosition = (candidate, triggerRect, bubbleRect) => {
    const centeredLeft = triggerRect.left + (triggerRect.width - bubbleRect.width) / 2;
    const centeredTop = triggerRect.top + (triggerRect.height - bubbleRect.height) / 2;

    switch (candidate) {
      case 'bottom':
        return { left: centeredLeft, top: triggerRect.bottom + CURSOR_GAP };
      case 'right':
        return { left: triggerRect.right + CURSOR_GAP, top: centeredTop };
      case 'left':
        return { left: triggerRect.left - bubbleRect.width - CURSOR_GAP, top: centeredTop };
      case 'top':
      default:
        return { left: centeredLeft, top: triggerRect.top - bubbleRect.height - CURSOR_GAP };
    }
  };

  const fitsViewport = (candidateCoords, bubbleRect) => {
    return (
      candidateCoords.left >= VIEWPORT_MARGIN &&
      candidateCoords.top >= VIEWPORT_MARGIN &&
      candidateCoords.left + bubbleRect.width <= window.innerWidth - VIEWPORT_MARGIN &&
      candidateCoords.top + bubbleRect.height <= window.innerHeight - VIEWPORT_MARGIN
    );
  };

  const clampToViewport = (candidateCoords, bubbleRect) => {
    return {
      left: Math.max(
        VIEWPORT_MARGIN,
        Math.min(candidateCoords.left, window.innerWidth - bubbleRect.width - VIEWPORT_MARGIN)
      ),
      top: Math.max(
        VIEWPORT_MARGIN,
        Math.min(candidateCoords.top, window.innerHeight - bubbleRect.height - VIEWPORT_MARGIN)
      ),
    };
  };

  const getCoordsNearPointer = (x, y, bubbleRect) => {
    let left = x + CURSOR_GAP;
    let top = y + CURSOR_GAP;

    if (left + bubbleRect.width > window.innerWidth - VIEWPORT_MARGIN) {
      left = x - bubbleRect.width - CURSOR_GAP;
    }
    if (top + bubbleRect.height > window.innerHeight - VIEWPORT_MARGIN) {
      top = y - bubbleRect.height - CURSOR_GAP;
    }

    return clampToViewport({ left, top }, bubbleRect);
  };

  const updatePosition = () => {
    if (!wrapperRef.current || !bubbleRef.current) return;

    const triggerRect = wrapperRef.current.getBoundingClientRect();
    const bubbleRect = bubbleRef.current.getBoundingClientRect();

    if (pointerRef.current.hasPointer) {
      setPlacement('cursor');
      setCoords(getCoordsNearPointer(pointerRef.current.x, pointerRef.current.y, bubbleRect));
      setPositioned(true);
      return;
    }

    const candidates = [position, 'top', 'bottom', 'right', 'left'];
    const uniqueCandidates = [...new Set(candidates)];

    let chosenPlacement = uniqueCandidates[0];
    let chosenCoords = getAnchorPosition(chosenPlacement, triggerRect, bubbleRect);

    for (const candidate of uniqueCandidates) {
      const candidateCoords = getAnchorPosition(candidate, triggerRect, bubbleRect);
      if (fitsViewport(candidateCoords, bubbleRect)) {
        chosenPlacement = candidate;
        chosenCoords = candidateCoords;
        break;
      }
    }

    setPlacement(chosenPlacement);
    setCoords(clampToViewport(chosenCoords, bubbleRect));
    setPositioned(true);
  };

  const showTooltip = (event) => {
    if (event?.clientX && event?.clientY) {
      pointerRef.current = { x: event.clientX, y: event.clientY, hasPointer: true };
    } else {
      pointerRef.current.hasPointer = false;
    }

    clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setPositioned(false);
      setVisible(true);
    }, SHOW_DELAY_MS);
  };

  const hideTooltip = () => {
    clearTimeout(showTimeoutRef.current);
    cancelAnimationFrame(moveFrameRef.current);
    pointerRef.current.hasPointer = false;
    setPositioned(false);
    setVisible(false);
  };

  const handleMouseMove = (event) => {
    pointerRef.current = { x: event.clientX, y: event.clientY, hasPointer: true };
    if (!visible) return;
    cancelAnimationFrame(moveFrameRef.current);
    moveFrameRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frame);
  }, [visible]);

  useEffect(() => {
    return () => {
      clearTimeout(showTimeoutRef.current);
      cancelAnimationFrame(moveFrameRef.current);
    };
  }, []);

  if (!text) return children;

  return (
    <span
      ref={wrapperRef}
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseMove={handleMouseMove}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {visible &&
        createPortal(
          <span
            ref={bubbleRef}
            className={`tooltip-bubble tooltip-bubble-${placement}`}
            style={{
              left: `${coords.left}px`,
              top: `${coords.top}px`,
              visibility: positioned ? 'visible' : 'hidden',
            }}
            role="tooltip"
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}

export default Tooltip;
