import React, { useEffect, useRef, useState } from 'react';

/**
 * BehaviorAlertToast
 * ------------------
 * Renders a stack of non-intrusive floating alert notifications
 * anchored top-right of the interview room. Only critical behavioral
 * events (gaze away >5s, face missing, multiple faces) are shown.
 *
 * Props:
 *   onRegister(fn) — InterviewRoom calls onAlert(fn) from the hook;
 *                    this component exposes a register prop so InterviewRoom
 *                    can wire the two together.
 */

const TOAST_LIFETIME_MS = 4000;
const MAX_TOASTS = 2;

const ALERT_STYLES = {
  gaze_away:      { icon: '👁', label: 'Attention', color: 'amber' },
  face_missing:   { icon: '📷', label: 'Camera',    color: 'red'   },
  multiple_faces: { icon: '👥', label: 'Security',  color: 'red'   },
};

let _toastId = 0;

function BehaviorAlertToast({ alertRef }) {
  const [toasts, setToasts] = useState([]);

  // Expose an `add` function via alertRef so InterviewRoom can forward hook alerts
  useEffect(() => {
    if (!alertRef) return;
    alertRef.current = ({ type, message }) => {
      const style = ALERT_STYLES[type] || { icon: '⚠', label: 'Alert', color: 'amber' };
      const id = ++_toastId;

      setToasts((prev) => {
        const next = [...prev, { id, type, message, style }];
        // Cap at MAX_TOASTS
        return next.slice(-MAX_TOASTS);
      });

      // Auto-dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_LIFETIME_MS);
    };
  }, [alertRef]);

  if (!toasts.length) return null;

  return (
    <div className="behavior-toasts" aria-live="polite" aria-label="Behavioral alerts">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`behavior-toast behavior-toast--${toast.style.color}`}
          role="alert"
        >
          <span className="behavior-toast__icon" aria-hidden="true">
            {toast.style.icon}
          </span>
          <div className="behavior-toast__body">
            <span className="behavior-toast__label">{toast.style.label}</span>
            <span className="behavior-toast__message">{toast.message}</span>
          </div>
          <button
            className="behavior-toast__dismiss"
            aria-label="Dismiss alert"
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default BehaviorAlertToast;
