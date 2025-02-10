document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for navbar links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offset = 70; // Navbar height
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Contact Form Submission with Email Opener and Custom Modal
  const contactForms = document.querySelectorAll('form');
  
  contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('nameInput');
      const subjectInput = document.getElementById('subjectInput');
      const messageInput = document.getElementById('messageInput');

      const name = nameInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      // Validate inputs with animated indicators
      const inputs = [nameInput, subjectInput, messageInput];
      let isValid = true;

      inputs.forEach(input => {
        if (!input.value.trim()) {
          triggerMandatoryAnimation(input);
          isValid = false;
        }
      });

      if (isValid) {
        // Prepare email body with new format
        const emailBody = `I am ${name}

${message}`;

        // Open default email client
        window.location.href = `mailto:southdelhitutors@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        
        // Show custom modal
        showCustomModal(`Thank you, ${name}!`, 'Your message will be sent to South Delhi Tutors.');
        
        // Reset form
        form.reset();
      }
    });
  });

  // Animated Mandatory Field Indicator
  function triggerMandatoryAnimation(input) {
    input.classList.add('mandatory-shake');
    input.addEventListener('animationend', () => {
      input.classList.remove('mandatory-shake');
    }, { once: true });
  }

  // Remove mandatory animation when user starts typing
  ['nameInput', 'subjectInput', 'messageInput'].forEach(inputId => {
    const input = document.getElementById(inputId);
    input.addEventListener('input', () => {
      input.classList.remove('mandatory-shake');
    });
  });

  // Testimonial Slider (using Bootstrap Carousel)
  const testimonialCarousel = new bootstrap.Carousel(document.getElementById('testimonialCarousel'), {
    interval: 3000,
    ride: true
  });

  // Enhanced button hover effects with smoother transitions
  const primaryButtons = document.querySelectorAll('.btn-primary');
  primaryButtons.forEach(button => {
    button.addEventListener('mouseenter', (e) => {
      button.style.transform = 'translateY(-10px)';
      button.style.transition = 'all 0.3s ease-out';
    });

    button.addEventListener('mouseleave', (e) => {
      button.style.transform = 'translateY(0)';
      button.style.transition = 'all 0.3s ease-in';
    });
  });
});

// Custom Modal Functions
function showCustomModal(title, message) {
  const modal = document.getElementById('customModal');
  const modalTitle = document.getElementById('customModalTitle');
  const modalMessage = document.getElementById('customModalMessage');

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  modal.classList.add('show');
}

function closeCustomModal() {
  const modal = document.getElementById('customModal');
  modal.classList.remove('show');
}