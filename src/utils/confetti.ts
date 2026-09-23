import confetti from 'canvas-confetti';

export const triggerFestiveConfetti = () => {
  // Fire multi-stage sketch style confetti
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#FDE047', '#60A5FA', '#F472B6', '#4ADE80', '#A78BFA', '#FB923C']
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.2, y: 0.65 },
      colors: ['#FBBF24', '#38BDF8', '#FB7185', '#34D399']
    });
  }, 150);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.8, y: 0.65 },
      colors: ['#FBBF24', '#38BDF8', '#FB7185', '#34D399']
    });
  }, 300);
};

export const triggerStarBurst = () => {
  confetti({
    particleCount: 40,
    spread: 100,
    origin: { y: 0.4 },
    shapes: ['star', 'circle'],
    colors: ['#FACC15', '#F59E0B', '#FDE047']
  });
};
