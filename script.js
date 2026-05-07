document.addEventListener('DOMContentLoaded', () => {

    /* Tema claro e escuro do site */
    const CHAVE_TEMA_CASTRAPREV = 'castraprev_tema';

    const obterTemaSalvo = () => {
        try {
            return localStorage.getItem(CHAVE_TEMA_CASTRAPREV) || 'light';
        } catch (erro) {
            return 'light';
        }
    };

    const salvarTema = (tema) => {
        try {
            localStorage.setItem(CHAVE_TEMA_CASTRAPREV, tema);
        } catch (erro) {
            // Se o navegador bloquear o localStorage, o tema ainda muda na página atual.
        }
    };

    const aplicarTema = (tema) => {
        const temaFinal = tema === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', temaFinal);
        salvarTema(temaFinal);
    };

    const criarBotaoTema = () => {
        if (document.querySelector('.theme-toggle')) return;

        const botaoTema = document.createElement('button');
        botaoTema.type = 'button';
        botaoTema.className = 'theme-toggle';
        botaoTema.setAttribute('aria-label', 'Alternar entre tema claro e tema escuro');

        const atualizarBotao = () => {
            const temaAtual = document.documentElement.getAttribute('data-theme') || 'light';
            const temaEscuroAtivo = temaAtual === 'dark';

            // Botão pequeno, apenas com o ícone, para ficar no canto da tela.
            botaoTema.innerHTML = temaEscuroAtivo
                ? '<i class="fas fa-sun"></i>'
                : '<i class="fas fa-moon"></i>';

            botaoTema.title = temaEscuroAtivo ? 'Mudar para tema claro' : 'Mudar para tema escuro';
            botaoTema.setAttribute('aria-label', botaoTema.title);
        };

        botaoTema.addEventListener('click', () => {
            const temaAtual = document.documentElement.getAttribute('data-theme') || 'light';
            aplicarTema(temaAtual === 'dark' ? 'light' : 'dark');
            atualizarBotao();
        });

        // O botão fica flutuando no canto, sem ocupar espaço no menu.
        botaoTema.classList.add('theme-toggle-floating');
        document.body.appendChild(botaoTema);

        atualizarBotao();
    };

    aplicarTema(obterTemaSalvo());
    criarBotaoTema();

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
