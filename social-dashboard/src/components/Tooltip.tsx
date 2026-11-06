import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface Tip {
  x: number;
  y: number;
  content: ReactNode;
}

const Ctx = createContext<{ show: (x: number, y: number, c: ReactNode) => void; hide: () => void }>({
  show: () => {},
  hide: () => {},
});

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<Tip | null>(null);
  const show = useCallback((x: number, y: number, content: ReactNode) => setTip({ x, y, content }), []);
  const hide = useCallback(() => setTip(null), []);
  const left = tip ? Math.min(tip.x + 14, window.innerWidth - 260) : 0;
  return (
    <Ctx.Provider value={{ show, hide }}>
      {children}
      {tip && (
        <div className="tooltip" role="tooltip" style={{ left, top: tip.y + 14 }}>
          {tip.content}
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useTooltip = () => useContext(Ctx);

/** Props that make any element show a tooltip on hover and keyboard focus. */
export function useTipProps() {
  const { show, hide } = useTooltip();
  return (content: ReactNode) => ({
    onPointerMove: (e: React.PointerEvent) => show(e.clientX, e.clientY, content),
    onPointerLeave: hide,
    onFocus: (e: React.FocusEvent) => {
      const r = (e.currentTarget as Element).getBoundingClientRect();
      show(r.right, r.top, content);
    },
    onBlur: hide,
    tabIndex: 0,
  });
}

export function TipRow({ value, label, color }: { value: ReactNode; label: ReactNode; color?: string }) {
  return (
    <div className="tip-row">
      {color && <span className="tip-key" style={{ background: color }} />}
      <strong>{value}</strong>
      <span className="muted">{label}</span>
    </div>
  );
}
