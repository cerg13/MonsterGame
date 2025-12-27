import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTutorialStore, TUTORIAL_STEPS } from '../../store/useTutorialStore';
import { useTranslations } from '../../localization';
import './TutorialOverlay.css';

export const TutorialOverlay: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslations();

  const {
    isActive,
    currentStepIndex,
    nextStep,
    previousStep,
    skipTutorial,
    getCurrentStep,
    getTotalSteps,
    isLastStep,
    isFirstStep,
  } = useTutorialStore();

  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentStep = getCurrentStep();

  // Navigate to the correct route for the current step
  useEffect(() => {
    if (isActive && currentStep?.route && location.pathname !== currentStep.route) {
      navigate(currentStep.route);
    }
  }, [isActive, currentStep, location.pathname, navigate]);

  // Find and highlight the target element
  const updateHighlight = useCallback(() => {
    if (!isActive || !currentStep?.targetSelector) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);
    } else {
      setHighlightRect(null);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    updateHighlight();
    // Update on resize
    window.addEventListener('resize', updateHighlight);
    // Small delay to ensure elements are rendered
    const timer = setTimeout(updateHighlight, 100);
    return () => {
      window.removeEventListener('resize', updateHighlight);
      clearTimeout(timer);
    };
  }, [updateHighlight, currentStepIndex]);

  if (!isActive || !currentStep) return null;

  const stepContent = t.tutorial.steps[currentStep.id as keyof typeof t.tutorial.steps];
  const totalSteps = getTotalSteps();

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (currentStep.position === 'center' || !highlightRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const margin = 20;
    const style: React.CSSProperties = {};

    switch (currentStep.position) {
      case 'top':
        style.bottom = `${window.innerHeight - highlightRect.top + margin}px`;
        style.left = `${highlightRect.left + highlightRect.width / 2}px`;
        style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        style.top = `${highlightRect.bottom + margin}px`;
        style.left = `${highlightRect.left + highlightRect.width / 2}px`;
        style.transform = 'translateX(-50%)';
        break;
      case 'left':
        style.top = `${highlightRect.top + highlightRect.height / 2}px`;
        style.right = `${window.innerWidth - highlightRect.left + margin}px`;
        style.transform = 'translateY(-50%)';
        break;
      case 'right':
        style.top = `${highlightRect.top + highlightRect.height / 2}px`;
        style.left = `${highlightRect.right + margin}px`;
        style.transform = 'translateY(-50%)';
        break;
    }

    return style;
  };

  return (
    <div className="tutorial-overlay">
      {/* Dark backdrop with highlight cutout */}
      <svg className="tutorial-backdrop" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.x - 8}
                y={highlightRect.y - 8}
                width={highlightRect.width + 16}
                height={highlightRect.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.8)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Highlight border */}
      {highlightRect && (
        <div
          className="tutorial-highlight"
          style={{
            left: highlightRect.x - 8,
            top: highlightRect.y - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
          }}
        />
      )}

      {/* Tooltip */}
      <div className="tutorial-tooltip" style={getTooltipStyle()}>
        <div className="tooltip-header">
          <h3>{stepContent?.title || currentStep.id}</h3>
          <button className="skip-btn" onClick={skipTutorial}>
            {t.tutorial.skip}
          </button>
        </div>

        <p className="tooltip-description">
          {stepContent?.description || ''}
        </p>

        <div className="tooltip-footer">
          <div className="step-indicator">
            {t.tutorial.step} {currentStepIndex + 1} {t.tutorial.of} {totalSteps}
          </div>

          <div className="step-dots">
            {TUTORIAL_STEPS.map((_, index) => (
              <span
                key={index}
                className={`step-dot ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div className="tooltip-buttons">
            {!isFirstStep() && (
              <button className="prev-btn" onClick={previousStep}>
                {t.tutorial.previous}
              </button>
            )}
            <button className="next-btn" onClick={nextStep}>
              {isLastStep() ? t.tutorial.finish : t.tutorial.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
