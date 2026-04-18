import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Phase = "inhale" | "hold1" | "exhale" | "hold2";
type Stage = "idle" | "active" | "done";

const PHASE_SEQUENCE: Phase[] = ["inhale", "hold1", "exhale", "hold2"];
const PHASE_DURATION = 4;

// Each phase has 2 alternating messages shown every 2s inside the circle
const PHASE_MESSAGES: Record<Phase, [string, string]> = {
  inhale: ["שאפי לאט...", "דרך האף"],
  hold1:  ["אחזיקי...",   "שמרי את השקט"],
  exhale: ["נשפי לאט...", "דרך הפה"],
  hold2:  ["נוחי...",     "תני לגוף להירגע"],
};

// Subtitle shown below the circle
const PHASE_SUBTITLE: Record<Phase, string> = {
  inhale: "שאיפה",
  hold1:  "עצירה",
  exhale: "נשיפה",
  hold2:  "עצירה",
};

// Circle scale per phase
const CIRCLE_SCALE: Record<Phase, number> = {
  inhale: 1.45,
  hold1:  1.45,
  exhale: 0.85,
  hold2:  0.85,
};

// Transition duration: animate only on inhale/exhale
const TRANSITION_DURATION: Record<Phase, number> = {
  inhale: PHASE_DURATION - 0.3,
  hold1:  0.15,
  exhale: PHASE_DURATION - 0.3,
  hold2:  0.15,
};

const TIMER_OPTIONS = [
  { label: "דקה",    value: 60  },
  { label: "3 דקות", value: 180 },
  { label: "5 דקות", value: 300 },
];

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

export const BreathingExercise = () => {
  const [stage,            setStage]            = useState<Stage>("idle");
  const [phaseIndex,       setPhaseIndex]       = useState(0);
  const [phaseTimeLeft,    setPhaseTimeLeft]    = useState(PHASE_DURATION);
  const [totalTimeLeft,    setTotalTimeLeft]    = useState(180);
  const [selectedDuration, setSelectedDuration] = useState(180);
  // which of the 2 alternating messages to show (0 or 1)
  const [msgSlot,          setMsgSlot]          = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotion = useReducedMotion();

  const currentPhase = PHASE_SEQUENCE[phaseIndex];

  // Main tick — runs only while active
  useEffect(() => {
    if (stage !== "active") return;

    intervalRef.current = setInterval(() => {
      setTotalTimeLeft(prev => Math.max(0, prev - 1));
      setPhaseTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setPhaseIndex(i => (i + 1) % PHASE_SEQUENCE.length);
          setMsgSlot(0);
          return PHASE_DURATION;
        }
        // flip message slot at halfway point (2s)
        if (next === Math.floor(PHASE_DURATION / 2)) setMsgSlot(1);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stage]);

  // Detect end of session
  useEffect(() => {
    if (stage === "active" && totalTimeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStage("done");
    }
  }, [totalTimeLeft, stage]);

  const startExercise = () => {
    setPhaseIndex(0);
    setPhaseTimeLeft(PHASE_DURATION);
    setTotalTimeLeft(selectedDuration);
    setStage("active");
  };

  const stopExercise = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStage("done");
  };

  const resetExercise = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStage("idle");
    setPhaseIndex(0);
    setPhaseTimeLeft(PHASE_DURATION);
    setMsgSlot(0);
  };

  return (
    <section id="breathing" className="section-padding bg-lavender-soft/30">
      <div className="container mx-auto px-4 md:px-8 max-w-xl text-center">
        <AnimatePresence mode="wait">

          {/* ── IDLE ── */}
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="space-y-4">
                <motion.span
                  className="text-4xl block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  🌿
                </motion.span>
                <h2 className="text-3xl md:text-4xl font-serif text-warm-brown">
                  רגע לנשום
                </h2>
                <div className="divider-elegant" />
              </div>

              {/* Explanation */}
              <div className="space-y-4 text-right">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-warm-brown">נשימות קופסה</strong> — 4 שניות שאיפה,
                  4 שניות עצירה, 4 שניות נשיפה, 4 שניות עצירה.
                  הקצב הסדיר הזה מפעיל את מערכת העצבים הפאראסימפתטית, מאזן את רמות הקורטיזול
                  ומשדר לגוף שהוא בטוח.
                </p>

                {/* Nose / mouth explanation */}
                <div className="bg-card/60 rounded-2xl p-4 space-y-2 border border-border/40">
                  <p className="text-warm-brown font-medium text-sm">כמה מילים לפני שמתחילים:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    🌬️ <strong>שאיפה דרך האף</strong> — האף מסנן, מחמם ולחמה את האוויר.
                    הנשימה דרכו מאטה את הקצב באופן טבעי ומפעילה את תגובת ה״הרגע״ של הגוף.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    💨 <strong>נשיפה דרך הפה</strong> — משחררת את ה-CO₂ מהר יותר ומשדרת למוח
                    שהסכנה עברה. זה מה שגורם לאותו תחושת שחרור אחרי נשיפה ארוכה.
                  </p>
                </div>

                <p className="text-center text-terracotta font-medium text-sm pt-1">
                  ✦ תמיד אפשר לחזור לפה לתרגל ✦
                </p>
              </div>

              {/* Timer selector */}
              <div className="space-y-3">
                <p className="text-warm-brown font-medium text-sm">בחרי משך תרגול:</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {TIMER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedDuration(opt.value)}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedDuration === opt.value
                          ? "bg-terracotta text-white shadow-soft"
                          : "bg-card border border-border text-muted-foreground hover:border-terracotta hover:text-terracotta"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="hero" size="lg" onClick={startExercise}>
                להתחיל
              </Button>
            </motion.div>
          )}

          {/* ── ACTIVE ── */}
          {stage === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Breathing circle */}
              <div className="relative flex items-center justify-center"
                   style={{ height: 220 }}>

                {/* Outer halo — only shown when not reduceMotion */}
                {!reduceMotion && (
                  <motion.div
                    className="absolute rounded-full bg-lavender/20"
                    style={{ width: 140, height: 140 }}
                    animate={{ scale: CIRCLE_SCALE[currentPhase] * 1.35 }}
                    transition={{ duration: TRANSITION_DURATION[currentPhase], ease: "easeInOut" }}
                  />
                )}

                {/* Main circle */}
                <motion.div
                  className="relative rounded-full flex items-center justify-center"
                  style={{
                    width: 140,
                    height: 140,
                    background: "linear-gradient(135deg, hsl(270 30% 80%), hsl(15 35% 88%))",
                    boxShadow: "0 0 50px hsl(270 30% 80% / 0.45)",
                  }}
                  animate={{ scale: CIRCLE_SCALE[currentPhase] }}
                  transition={{ duration: TRANSITION_DURATION[currentPhase], ease: "easeInOut" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${currentPhase}-${msgSlot}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35 }}
                      className="text-warm-brown font-serif text-base font-medium text-center leading-snug px-3"
                    >
                      {PHASE_MESSAGES[currentPhase][msgSlot]}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Phase name + countdown */}
              <div className="space-y-1">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentPhase}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-medium text-terracotta tracking-widest uppercase"
                  >
                    {PHASE_SUBTITLE[currentPhase]}
                  </motion.p>
                </AnimatePresence>
                <motion.p
                  key={phaseTimeLeft}
                  initial={{ scale: 1.3, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-5xl font-mono text-warm-brown"
                >
                  {phaseTimeLeft}
                </motion.p>
                <p className="text-sm text-muted-foreground">שניות</p>
              </div>

              {/* Total time remaining */}
              <p className="text-muted-foreground text-sm font-mono tracking-wide">
                זמן שנותר: {formatTime(totalTimeLeft)}
              </p>

              <Button variant="outline" size="sm" onClick={stopExercise}>
                סיום
              </Button>
            </motion.div>
          )}

          {/* ── DONE ── */}
          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <motion.span
                className="text-5xl block"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                🌸
              </motion.span>
              <h3 className="text-2xl font-serif text-warm-brown">כל הכבוד</h3>
              <p className="text-muted-foreground leading-relaxed">
                הקדשת לעצמך רגע אמיתי של שקט.
                <br />
                הגוף שלך מרגיש את ההבדל.
              </p>
              <p className="text-terracotta text-sm font-medium">
                ✦ תמיד אפשר לחזור לפה לתרגל ✦
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button variant="hero" onClick={resetExercise}>
                  לתרגל שוב
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
};
