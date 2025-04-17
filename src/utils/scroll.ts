export const scrollToHero = () => {
  const heroElement = document.getElementById('home');
  if (heroElement) {
    heroElement.scrollIntoView({ behavior: 'smooth' });
  }
};
