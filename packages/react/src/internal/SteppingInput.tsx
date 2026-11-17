import { forwardRef, useEffect, useRef, type ComponentPropsWithRef } from "react";
import { motion, useAnimationControls } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";

interface SteppingInputProps extends Omit<
  ComponentPropsWithRef<"input">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
> {
  numericValue: number | null;
  stepChange: boolean;
}

/** Unlike NumberTransition's replaceable readout, editing must keep the SAME
 * native input. Only accepted step changes move; typed text/caret never remount. */
export const SteppingInput = forwardRef<HTMLInputElement, SteppingInputProps>(
  function SteppingInput({ numericValue, stepChange, ...props }, ref) {
    const previous = useRef(numericValue);
    const controls = useAnimationControls();
    const reducedMotion = useReducedMotion();
    useEffect(() => {
      const before = previous.current;
      previous.current = numericValue;
      controls.stop();
      if (
        before === numericValue ||
        before === null ||
        numericValue === null ||
        !stepChange ||
        reducedMotion ||
        props.disabled
      ) {
        controls.set({ y: "0%", opacity: 1 });
        return;
      }
      controls.set({ y: numericValue > before ? "35%" : "-35%", opacity: 0.65 });
      void controls.start({ y: "0%", opacity: 1, transition: springs.snap });
    }, [numericValue, stepChange, reducedMotion, props.disabled, controls]);
    return (
      <motion.input
        {...props}
        ref={ref}
        initial={false}
        animate={controls}
        onBeforeInput={(event) => {
          // A user can start editing while a step is still settling. Stop the
          // decorative movement before native editing/composition changes text.
          controls.stop();
          controls.set({ y: "0%", opacity: 1 });
          props.onBeforeInput?.(event);
        }}
      />
    );
  },
);
