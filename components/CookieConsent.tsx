"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ConsentState = "accepted" | "essential" | null;

interface ConsentCtxValue {
  consent: ConsentState;
  accept: () => void;
  decline: () => void;
}

const ConsentCtx = createContext<ConsentCtxValue>({
  consent: null,
  accept: () => {},
  decline: () => {},
});

export function useConsent() {
  return useContext(ConsentCtx);
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("cm_cookie_consent") as ConsentState | null;
    if (stored === "accepted" || stored === "essential") setConsent(stored);
  }, []);

  const accept = () => {
    localStorage.setItem("cm_cookie_consent", "accepted");
    setConsent("accepted");
  };

  const decline = () => {
    localStorage.setItem("cm_cookie_consent", "essential");
    setConsent("essential");
  };

  return (
    <ConsentCtx.Provider value={{ consent, accept, decline }}>
      {children}
      {mounted && (
        <AnimatePresence>
          {consent === null && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50"
            >
              <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 shadow-2xl">
                <p className="text-sm text-white font-semibold mb-1">Cookie preferences</p>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  We use analytics cookies to understand how visitors use our site.
                  No personal data is sold or shared with third parties.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={accept}
                    className="flex-1 py-2 rounded-lg bg-[#C87660] text-white text-xs font-semibold hover:bg-[#b5664f] transition-colors"
                  >
                    Accept all
                  </button>
                  <button
                    onClick={decline}
                    className="flex-1 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700 transition-colors"
                  >
                    Essential only
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </ConsentCtx.Provider>
  );
}
