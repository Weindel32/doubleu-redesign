const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('header nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
    toggle.setAttribute('aria-expanded', nav.style.display === 'block' ? 'true' : 'false');
  });
}
