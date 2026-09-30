import { BackButton, ProgressDots } from "@/components/ui/controls";

/** Back button + 4-step progress, as on screens 18–20 and onboarding 02. */
export function OnboardingHeader({ step, back = true }: { step?: number; back?: boolean }) {
  return (
    <div className="relative flex h-11 items-center px-5">
      {back && <BackButton />}
      {step && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ProgressDots step={step} />
        </div>
      )}
    </div>
  );
}
