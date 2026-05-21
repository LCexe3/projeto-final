document.addEventListener('DOMContentLoaded', () => {


    /* Menu hambúrguer/drawer do topo no celular */
    const menuToggle = document.querySelector('.menu-toggle');
    const menuPrincipal = document.querySelector('.nav-menu');
    const menuOverlay = document.querySelector('.menu-overlay');

    const fecharMenuMobile = () => {
        document.body.classList.remove('menu-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
        menuToggle?.setAttribute('aria-label', 'Abrir menu');
    };

    const abrirMenuMobile = () => {
        document.body.classList.add('menu-open');
        menuToggle?.setAttribute('aria-expanded', 'true');
        menuToggle?.setAttribute('aria-label', 'Fechar menu');
    };

    if (menuToggle && menuPrincipal) {
        menuToggle.addEventListener('click', () => {
            const menuAberto = document.body.classList.contains('menu-open');
            menuAberto ? fecharMenuMobile() : abrirMenuMobile();
        });

        menuOverlay?.addEventListener('click', fecharMenuMobile);

        menuPrincipal.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', fecharMenuMobile);
        });

        document.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape') fecharMenuMobile();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) fecharMenuMobile();
        });
    }

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
        atualizarBotoesTema();
    };

    const atualizarBotoesTema = () => {
        const temaAtual = document.documentElement.getAttribute('data-theme') || 'light';
        const temaEscuroAtivo = temaAtual === 'dark';
        const icone = temaEscuroAtivo ? 'fa-sun' : 'fa-moon';
        const titulo = temaEscuroAtivo ? 'Mudar para tema claro' : 'Mudar para tema escuro';
        const estado = temaEscuroAtivo ? 'Modo escuro ativo' : 'Modo claro ativo';
        const textoAcao = temaEscuroAtivo ? 'Tema claro' : 'Tema escuro';

        document.querySelectorAll('[data-theme-toggle]').forEach((botaoTema) => {
            botaoTema.title = titulo;
            botaoTema.setAttribute('aria-label', titulo);
            botaoTema.innerHTML = botaoTema.classList.contains('theme-toggle-menu')
                ? `
                    <span class="theme-toggle-label">
                        <i class="fas ${icone}"></i>
                        <span>
                            <strong>${textoAcao}</strong>
                            <small>${estado}</small>
                        </span>
                    </span>
                    <span class="theme-toggle-state">Trocar</span>
                `
                : `<i class="fas ${icone}"></i>`;
        });
    };

    const alternarTema = () => {
        const temaAtual = document.documentElement.getAttribute('data-theme') || 'light';
        aplicarTema(temaAtual === 'dark' ? 'light' : 'dark');
    };

    const criarBotaoTema = (classesExtras = '') => {
        const botaoTema = document.createElement('button');
        botaoTema.type = 'button';
        botaoTema.className = `theme-toggle ${classesExtras}`.trim();
        botaoTema.dataset.themeToggle = 'true';
        botaoTema.addEventListener('click', alternarTema);
        return botaoTema;
    };

    const criarControlesTema = () => {
        if (!document.querySelector('.theme-toggle-floating')) {
            const botaoFlutuante = criarBotaoTema('theme-toggle-floating');
            document.body.appendChild(botaoFlutuante);
        }

        const navWrapper = document.querySelector('.nav-wrapper');
        const menuToggleHeader = document.querySelector('.menu-toggle');

        if (navWrapper && menuToggleHeader && !document.querySelector('.theme-toggle-header-mobile')) {
            const botaoTopoMobile = criarBotaoTema('theme-toggle-header-mobile');
            navWrapper.insertBefore(botaoTopoMobile, menuToggleHeader);
        }

        const areaLoginMenu = document.getElementById('area-login');
        const menuPrincipalTema = document.querySelector('.nav-menu');

        if (menuPrincipalTema && !document.querySelector('.theme-toggle-menu')) {
            const botaoMenu = criarBotaoTema('theme-toggle-menu');
            if (areaLoginMenu && areaLoginMenu.parentElement === menuPrincipalTema) {
                menuPrincipalTema.insertBefore(botaoMenu, areaLoginMenu);
            } else {
                menuPrincipalTema.appendChild(botaoMenu);
            }
        }

        atualizarBotoesTema();
    };

    aplicarTema(obterTemaSalvo());
    criarControlesTema();

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

    const CHAVE_SOLICITACOES_CASTRAPREV = 'castraprev_solicitacoes';

    const carregarSolicitacoesCastraPrev = () => {
        try {
            const solicitacoes = JSON.parse(localStorage.getItem(CHAVE_SOLICITACOES_CASTRAPREV));
            return Array.isArray(solicitacoes) ? solicitacoes : [];
        } catch (erro) {
            console.warn('Não foi possível carregar as solicitações do CastraPrev:', erro);
            return [];
        }
    };

    const salvarSolicitacoesCastraPrev = (solicitacoes) => {
        try {
            localStorage.setItem(CHAVE_SOLICITACOES_CASTRAPREV, JSON.stringify(solicitacoes));
            return true;
        } catch (erro) {
            console.warn('Não foi possível salvar a solicitação:', erro);
            return false;
        }
    };

    const obterUsuarioLogadoParaSolicitacao = () => {
        if (typeof pegarUsuarioLogadoCompleto === 'function') {
            return pegarUsuarioLogadoCompleto();
        }

        try {
            const usuarios = JSON.parse(localStorage.getItem('castraprev_usuarios')) || [];
            const emailLogado = (localStorage.getItem('castraprev_usuario_email') || '').toLowerCase();
            return usuarios.find(usuario => (usuario.email || '').toLowerCase() === emailLogado) || null;
        } catch (erro) {
            return null;
        }
    };

    const obterTextoOpcaoSelecionada = (id) => {
        const campo = document.getElementById(id);
        return campo?.selectedOptions?.[0]?.textContent?.trim() || campo?.value || '';
    };

    const agendarForm = document.getElementById('form-agendar');
    const mensagemForm = document.getElementById('mensagem-form');

    if (agendarForm) {
        agendarForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!agendarForm.checkValidity()) {
                agendarForm.reportValidity();
                return;
            }

            const usuarioLogado = obterUsuarioLogadoParaSolicitacao();
            const nome = document.getElementById('nome')?.value.trim() || usuarioLogado?.nome || 'Tutor';
            const email = document.getElementById('email')?.value.trim().toLowerCase() || usuarioLogado?.email || '';
            const telefone = document.getElementById('telefone')?.value.trim() || usuarioLogado?.telefone || '';
            const pet = document.getElementById('pet')?.value.trim() || 'pet';
            const especieValor = document.getElementById('especie')?.value || '';
            const servicoValor = document.getElementById('servico')?.value || '';
            const observacoes = document.getElementById('observacoes')?.value.trim() || '';

            const solicitacoes = carregarSolicitacoesCastraPrev();
            const novaSolicitacao = {
                id: Date.now(),
                tutorId: usuarioLogado?.id || null,
                tutorNome: nome,
                tutorEmail: email,
                tutorTelefone: telefone,
                tutorApelido: usuarioLogado?.apelido || '',
                tutorFotoPerfil: usuarioLogado?.fotoPerfil || '',
                tutorCep: usuarioLogado?.cep || '',
                tutorEndereco: usuarioLogado?.endereco || '',
                tutorNumero: usuarioLogado?.numero || '',
                tutorBairro: usuarioLogado?.bairro || '',
                tutorCidade: usuarioLogado?.cidade || '',
                tutorUf: usuarioLogado?.uf || '',
                tutorComplemento: usuarioLogado?.complemento || '',
                petNome: pet,
                petEspecieValor: especieValor,
                petEspecie: obterTextoOpcaoSelecionada('especie'),
                servicoValor,
                servico: obterTextoOpcaoSelecionada('servico'),
                observacoesTutor: observacoes,
                observacoesVeterinario: '',
                status: 'Aguardando análise',
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            };

            solicitacoes.unshift(novaSolicitacao);

            if (!salvarSolicitacoesCastraPrev(solicitacoes)) {
                if (mensagemForm) {
                    mensagemForm.textContent = 'Não foi possível salvar a solicitação. Tente novamente ou reduza o tamanho da foto de perfil.';
                    mensagemForm.classList.add('show');
                } else {
                    alert('Não foi possível salvar a solicitação.');
                }
                return;
            }

            if (mensagemForm) {
                mensagemForm.innerHTML = `${nome}, recebemos a solicitação para ${pet}! Ela já apareceu no painel do veterinário. <a href="acompanhamento.html">Acompanhar processo</a>`;
                mensagemForm.classList.add('show');
            } else {
                alert('Solicitação salva! Ela já apareceu no painel do veterinário e pode ser acompanhada pelo site.');
            }

            agendarForm.reset();

            if (typeof preencherDadosDoUsuarioLogado === 'function') {
                preencherDadosDoUsuarioLogado();
            }
        });
    }

    const limparHtml = (texto = '') => String(texto)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const formatarDataAcompanhamento = (dataIso = '') => {
        if (!dataIso) return 'Data não informada';
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(dataIso));
        } catch (erro) {
            return 'Data não informada';
        }
    };

    const statusProcesso = ['Aguardando análise', 'Em atendimento', 'Atendimento agendado', 'Procedimento realizado', 'Finalizado'];

    const normalizarStatusAcompanhamento = (status = '') => {
        if (status === 'Castração agendada') return 'Atendimento agendado';
        if (status === 'Castração realizada') return 'Procedimento realizado';
        return status || 'Aguardando análise';
    };

    const classeStatusAcompanhamento = (status = '') => {
        const normalizado = normalizarStatusAcompanhamento(status).toLowerCase();
        if (normalizado.includes('cancel')) return 'cancelado';
        if (normalizado.includes('final') || normalizado.includes('realizado')) return 'finalizado';
        if (normalizado.includes('agendado')) return 'agendado';
        if (normalizado.includes('atendimento')) return 'andamento';
        return 'aguardando';
    };

    const etapaConcluida = (statusAtual, etapa) => {
        const status = normalizarStatusAcompanhamento(statusAtual);
        if (status === 'Cancelado') return false;
        const indiceAtual = statusProcesso.indexOf(status);
        const indiceEtapa = statusProcesso.indexOf(etapa);
        return indiceAtual >= indiceEtapa;
    };

    const renderizarAcompanhamentoTutor = () => {
        const lista = document.getElementById('lista-acompanhamento');
        const vazio = document.getElementById('sem-acompanhamento');
        const resumo = document.getElementById('resumo-acompanhamento');

        if (!lista) return;

        const usuarioLogado = obterUsuarioLogadoParaSolicitacao();
        const solicitacoes = carregarSolicitacoesCastraPrev();
        const emailUsuario = (usuarioLogado?.email || '').toLowerCase();

        const minhasSolicitacoes = solicitacoes
            .filter(item => {
                const mesmoId = usuarioLogado?.id && item.tutorId === usuarioLogado.id;
                const mesmoEmail = emailUsuario && (item.tutorEmail || '').toLowerCase() === emailUsuario;
                return mesmoId || mesmoEmail;
            })
            .sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0));

        if (resumo) {
            resumo.textContent = minhasSolicitacoes.length
                ? `Você possui ${minhasSolicitacoes.length} solicitação(ões) cadastrada(s). Acompanhe abaixo a etapa atual de cada animal.`
                : 'Você ainda não possui animais em acompanhamento. Envie uma solicitação de castração ou prevenção para aparecer aqui.';
        }

        if (vazio) vazio.style.display = minhasSolicitacoes.length ? 'none' : 'block';

        lista.innerHTML = minhasSolicitacoes.map(item => {
            const status = normalizarStatusAcompanhamento(item.status);
            const classeStatus = classeStatusAcompanhamento(status);
            const observacaoVet = item.observacoesVeterinario || 'O veterinário ainda não adicionou observações para este atendimento.';

            return `
                <article class="acompanhamento-card">
                    <div class="acompanhamento-card-topo">
                        <div>
                            <span class="badge"><i class="fas fa-paw"></i> ${limparHtml(item.servico || 'Atendimento')}</span>
                            <h2>${limparHtml(item.petNome || 'Animal')}</h2>
                            <p>${limparHtml(item.petEspecie || 'Espécie não informada')}</p>
                        </div>
                        <span class="status-badge status-${classeStatus}">${limparHtml(status)}</span>
                    </div>

                    <div class="acompanhamento-dados">
                        <p><i class="fas fa-calendar-plus"></i> Solicitado em: <strong>${formatarDataAcompanhamento(item.criadoEm)}</strong></p>
                        <p><i class="fas fa-rotate"></i> Última atualização: <strong>${formatarDataAcompanhamento(item.atualizadoEm || item.criadoEm)}</strong></p>
                    </div>

                    <div class="linha-processo" aria-label="Etapas do acompanhamento">
                        ${statusProcesso.map(etapa => `
                            <div class="etapa-processo ${etapaConcluida(status, etapa) ? 'concluida' : ''}">
                                <span><i class="fas fa-check"></i></span>
                                <small>${limparHtml(etapa)}</small>
                            </div>
                        `).join('')}
                    </div>

                    <div class="acompanhamento-observacoes">
                        <div>
                            <strong><i class="fas fa-comment-medical"></i> Suas observações</strong>
                            <p>${limparHtml(item.observacoesTutor || 'Nenhuma observação enviada.')}</p>
                        </div>
                        <div>
                            <strong><i class="fas fa-user-doctor"></i> Retorno do veterinário</strong>
                            <p>${limparHtml(observacaoVet)}</p>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    };

    renderizarAcompanhamentoTutor();

});
