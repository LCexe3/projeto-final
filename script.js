document.addEventListener('DOMContentLoaded', () => {
    // Efeito de rolagem suave no Header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        header.style.background = window.scrollY > 50 ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.9)';
    });

    // Manipulação do Formulário
    const agendarForm = document.getElementById('form-agendar');
    if(agendarForm) {
        agendarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Recebemos sua solicitação! Nossa equipe entrará em contato por e-mail.');
            agendarForm.reset();
        });
    }

    // Animação de entrada nas seções
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = `all 0.6s ease ${index * 0.2}s`;
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 100);
    });
});