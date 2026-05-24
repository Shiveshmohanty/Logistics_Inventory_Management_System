
    export const fadeInVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };

    export const scaleInVariants = {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
    };

    export function createRippleEffect(event: React.MouseEvent<HTMLElement>) {
      const button = event.currentTarget;
      
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
      circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
      circle.classList.add('ripple-effect');
      
      const ripple = button.querySelector('.ripple-effect');
      if (ripple) {
        ripple.remove();
      }
      
      button.appendChild(circle);
      
      // Remove the ripple element after animation completes
      setTimeout(() => {
        if (circle) {
          circle.remove();
        }
      }, 600);
    }
  