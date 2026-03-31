window.addEventListener("scroll", function () {
  const header = document.querySelector("header");

  if (window.scrollY > 50) {
    header.style.background = "rgba(0, 0, 0, 0.85)";
  } else {
    header.style.background = "rgba(0, 0, 0, 0.3)";
  }
});

// Menu hambúrguer
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

// Inicializar menu como oculto
navMenu.classList.add('hidden');

menuToggle.addEventListener('click', function () {
  navMenu.classList.toggle('show');
  navMenu.classList.toggle('hidden');
});

// Funcionalidade de pesquisa simples
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

searchBtn.addEventListener('click', function () {
  const query = searchInput.value.toLowerCase();
  const sections = document.querySelectorAll('section');

  sections.forEach(section => {
    const text = section.textContent.toLowerCase();
    if (text.includes(query)) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
});

// Validação do formulário
const form = document.querySelector('form');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const message = form.querySelector('textarea').value;

  if (name && email && message) {
    alert('Mensagem enviada com sucesso!');
    form.reset();
  } else {
    alert('Por favor, preencha todos os campos.');
  }
});