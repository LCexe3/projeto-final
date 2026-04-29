document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');

    const atualizarHeader = () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 20);
    };

    atualizarHeader();
    window.addEventListener('scroll', atualizarHeader);

    if (window.AOS) {
        AOS.init({
            duration: 850,
            once: true,
            offset: 80
        });
    }

    const formatarTelefone = (campo) => {
        let valor = campo.value.replace(/\D/g, '').slice(0, 11);

        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (valor.length > 6) {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        } else if (valor.length > 0) {
            valor = valor.replace(/^(\d*)$/, '($1');
        }

        campo.value = valor;
    };

    document.querySelectorAll('[data-telefone-mask]').forEach(campo => {
        campo.addEventListener('input', () => formatarTelefone(campo));
    });

    const seletorTipo = document.getElementById('tipo-atendimento');
    const areasTipo = document.querySelectorAll('[data-tipo-form]');

    if (seletorTipo && areasTipo.length) {
        const atualizarTipo = () => {
            const tipoEscolhido = seletorTipo.value;

            areasTipo.forEach(area => {
                area.classList.toggle('active', area.dataset.tipoForm === tipoEscolhido);
            });
        };

        seletorTipo.addEventListener('change', atualizarTipo);
        atualizarTipo();
    }

    const agendarForm = document.getElementById('form-agendar');
    const mensagemForm = document.getElementById('mensagem-form');

    if (agendarForm) {
        agendarForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!agendarForm.checkValidity()) {
                agendarForm.reportValidity();
                return;
            }

            const nome = document.getElementById('nome')?.value.trim() || 'Tutor';
            const pet = document.getElementById('pet')?.value.trim() || 'pet';

            if (mensagemForm) {
                mensagemForm.textContent = `${nome}, recebemos a solicitação de atendimento para ${pet}! Nossa equipe entrará em contato para confirmar o agendamento.`;
                mensagemForm.classList.add('show');
            } else {
                alert('Recebemos sua solicitação! Nossa equipe entrará em contato para confirmar o atendimento.');
            }

            agendarForm.reset();
        });
    }

    const formDoacao = document.getElementById('form-doacao');
    const mensagemDoacao = document.getElementById('mensagem-doacao');

    if (formDoacao) {
        formDoacao.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!formDoacao.checkValidity()) {
                formDoacao.reportValidity();
                return;
            }

            const nome = document.getElementById('doador-nome')?.value.trim() || 'Doador';
            const tipo = document.getElementById('tipo-doacao')?.selectedOptions[0]?.textContent || 'doação';

            if (mensagemDoacao) {
                mensagemDoacao.textContent = `${nome}, sua doação de ${tipo.toLowerCase()} foi registrada! A equipe do CastraPrev entrará em contato para combinar os detalhes.`;
                mensagemDoacao.classList.add('show');
            } else {
                alert('Sua doação foi registrada! A equipe entrará em contato.');
            }

            formDoacao.reset();
        });
    }
});
