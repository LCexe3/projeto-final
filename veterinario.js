const VET_CHAVE_USUARIOS = 'castraprev_usuarios';
const VET_CHAVE_SOLICITACOES = 'castraprev_solicitacoes';
const VET_CHAVE_VETERINARIOS = 'castraprev_veterinarios';
const VET_CHAVE_SESSAO = 'castraprev_veterinario_logado';

function vetLerArray(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        console.warn(`Erro ao ler ${chave}:`, erro);
        return [];
    }
}

function vetSalvarArray(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

function vetLimpar(texto = '') {
    return String(texto)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function vetFormatarData(dataIso = '') {
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
}

function vetEnderecoCompleto(item = {}) {
    const partes = [
        item.endereco || item.tutorEndereco,
        item.numero || item.tutorNumero ? `Nº ${item.numero || item.tutorNumero}` : '',
        item.bairro || item.tutorBairro,
        item.cidade || item.tutorCidade,
        item.uf || item.tutorUf,
        item.cep || item.tutorCep ? `CEP ${item.cep || item.tutorCep}` : ''
    ].filter(Boolean);

    return partes.join(', ') || 'Endereço não informado';
}

function vetGarantirDemo() {
    const veterinarios = vetLerArray(VET_CHAVE_VETERINARIOS);
    const existeDemo = veterinarios.some(vet => (vet.email || '').toLowerCase() === 'admin@castraprev.com');

    if (!existeDemo) {
        veterinarios.unshift({
            id: 1,
            nome: 'Dr. Administrador CastraPrev',
            email: 'admin@castraprev.com',
            senha: 'admin123',
            crmv: 'CRMV-RJ 00000',
            telefone: '(00) 00000-0000',
            clinica: 'Painel demonstrativo CastraPrev',
            cidade: 'Três Rios',
            uf: 'RJ',
            criadoEm: new Date().toISOString()
        });
        vetSalvarArray(VET_CHAVE_VETERINARIOS, veterinarios);
    }
}

function vetSessaoAtual() {
    try {
        return JSON.parse(localStorage.getItem(VET_CHAVE_SESSAO)) || null;
    } catch (erro) {
        return null;
    }
}

function vetSalvarSessao(veterinario) {
    localStorage.setItem(VET_CHAVE_SESSAO, JSON.stringify({
        id: veterinario.id,
        nome: veterinario.nome,
        email: veterinario.email,
        crmv: veterinario.crmv,
        clinica: veterinario.clinica
    }));
}

function vetSair() {
    localStorage.removeItem(VET_CHAVE_SESSAO);
    window.location.href = 'veterinario-login.html';
}

function vetMostrarAba(aba) {
    document.querySelectorAll('[data-vet-tab]').forEach(botao => {
        botao.classList.toggle('active', botao.dataset.vetTab === aba);
    });

    document.querySelectorAll('[data-vet-section]').forEach(secao => {
        secao.classList.toggle('active', secao.dataset.vetSection === aba);
    });
}

function vetConfigurarLogin() {
    if (!document.body.classList.contains('vet-login-page')) return;

    vetGarantirDemo();

    document.querySelectorAll('[data-vet-tab]').forEach(botao => {
        botao.addEventListener('click', () => vetMostrarAba(botao.dataset.vetTab));
    });

    const formLogin = document.getElementById('form-vet-login');
    const formCadastro = document.getElementById('form-vet-cadastro');

    formLogin?.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('vet-login-email').value.trim().toLowerCase();
        const senha = document.getElementById('vet-login-senha').value.trim();
        const erro = document.getElementById('vet-login-erro');
        const veterinarios = vetLerArray(VET_CHAVE_VETERINARIOS);

        const encontrado = veterinarios.find(vet => (vet.email || '').toLowerCase() === email && vet.senha === senha);

        if (!encontrado) {
            erro.textContent = 'Veterinário não encontrado. Confira o e-mail e a senha.';
            erro.classList.add('show');
            return;
        }

        erro.textContent = '';
        erro.classList.remove('show');
        vetSalvarSessao(encontrado);
        window.location.href = 'veterinario-dashboard.html';
    });

    formCadastro?.addEventListener('submit', function (event) {
        event.preventDefault();

        const nome = document.getElementById('vet-cadastro-nome').value.trim();
        const email = document.getElementById('vet-cadastro-email').value.trim().toLowerCase();
        const crmv = document.getElementById('vet-cadastro-crmv').value.trim().toUpperCase();
        const telefone = document.getElementById('vet-cadastro-telefone').value.trim();
        const clinica = document.getElementById('vet-cadastro-clinica').value.trim();
        const cidade = document.getElementById('vet-cadastro-cidade').value.trim();
        const uf = document.getElementById('vet-cadastro-uf').value.trim().toUpperCase();
        const senha = document.getElementById('vet-cadastro-senha').value.trim();
        const erro = document.getElementById('vet-cadastro-erro');

        if (nome.length < 3) {
            erro.textContent = 'Digite o nome completo do veterinário.';
            erro.classList.add('show');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            erro.textContent = 'Digite um e-mail profissional válido.';
            erro.classList.add('show');
            return;
        }

        if (crmv.length < 5) {
            erro.textContent = 'Informe o CRMV do veterinário.';
            erro.classList.add('show');
            return;
        }

        if (senha.length < 4) {
            erro.textContent = 'A senha precisa ter pelo menos 4 caracteres.';
            erro.classList.add('show');
            return;
        }

        const veterinarios = vetLerArray(VET_CHAVE_VETERINARIOS);
        const emailExiste = veterinarios.some(vet => (vet.email || '').toLowerCase() === email);
        const crmvExiste = veterinarios.some(vet => (vet.crmv || '').toLowerCase() === crmv.toLowerCase());

        if (emailExiste) {
            erro.textContent = 'Este e-mail já está cadastrado como veterinário.';
            erro.classList.add('show');
            return;
        }

        if (crmvExiste) {
            erro.textContent = 'Este CRMV já está cadastrado.';
            erro.classList.add('show');
            return;
        }

        const novoVeterinario = {
            id: Date.now(),
            nome,
            email,
            crmv,
            telefone,
            clinica,
            cidade,
            uf,
            senha,
            criadoEm: new Date().toISOString()
        };

        veterinarios.push(novoVeterinario);
        vetSalvarArray(VET_CHAVE_VETERINARIOS, veterinarios);
        vetSalvarSessao(novoVeterinario);
        window.location.href = 'veterinario-dashboard.html';
    });
}

function vetObterDadosDashboard() {
    const usuarios = vetLerArray(VET_CHAVE_USUARIOS);
    const tutores = usuarios.filter(usuario => (usuario.tipo || 'tutor') === 'tutor');
    const solicitacoes = vetLerArray(VET_CHAVE_SOLICITACOES);

    return { usuarios, tutores, solicitacoes };
}

function vetAtualizarStats(tutores, solicitacoes) {
    const statTutores = document.getElementById('stat-tutores');
    const statAnimais = document.getElementById('stat-animais');
    const statAguardando = document.getElementById('stat-aguardando');
    const statFinalizados = document.getElementById('stat-finalizados');

    if (statTutores) statTutores.textContent = tutores.length;
    if (statAnimais) statAnimais.textContent = solicitacoes.length;
    if (statAguardando) statAguardando.textContent = solicitacoes.filter(item => item.status === 'Aguardando análise').length;
    if (statFinalizados) statFinalizados.textContent = solicitacoes.filter(item => item.status === 'Castração realizada').length;
}

function vetTextoBusca(item = {}) {
    return Object.values(item).join(' ').toLowerCase();
}

function vetRenderizarSolicitacoes(solicitacoes) {
    const lista = document.getElementById('lista-solicitacoes');
    const vazio = document.getElementById('sem-solicitacoes');
    const busca = (document.getElementById('busca-solicitacao')?.value || '').trim().toLowerCase();
    const filtroStatus = document.getElementById('filtro-status')?.value || '';

    if (!lista) return;

    const filtradas = solicitacoes.filter(item => {
        const combinaBusca = !busca || vetTextoBusca(item).includes(busca);
        const combinaStatus = !filtroStatus || item.status === filtroStatus;
        return combinaBusca && combinaStatus;
    });

    lista.innerHTML = filtradas.map(item => {
        const enderecoCurto = [item.tutorCidade, item.tutorUf].filter(Boolean).join(' / ') || 'Não informado';

        return `
            <tr>
                <td>
                    <div class="vet-person-cell">
                        ${item.tutorFotoPerfil ? `<img src="${item.tutorFotoPerfil}" alt="Foto de ${vetLimpar(item.tutorNome)}">` : '<span><i class="fas fa-user"></i></span>'}
                        <div>
                            <strong>${vetLimpar(item.tutorNome || 'Tutor')}</strong>
                            <small>${vetLimpar(item.tutorEmail || 'E-mail não informado')}</small>
                        </div>
                    </div>
                </td>
                <td><strong>${vetLimpar(item.petNome || 'Pet')}</strong><small>${vetLimpar(item.petEspecie || 'Espécie não informada')}</small></td>
                <td>${vetLimpar(item.servico || 'Serviço não informado')}</td>
                <td>${vetLimpar(enderecoCurto)}</td>
                <td>
                    <select class="vet-status-select" data-status-id="${item.id}">
                        ${['Aguardando análise', 'Em atendimento', 'Castração agendada', 'Castração realizada', 'Cancelado'].map(status => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                    </select>
                </td>
                <td><button type="button" class="vet-btn-small" data-detalhes-solicitacao="${item.id}">Ver detalhes</button></td>
            </tr>
        `;
    }).join('');

    if (vazio) vazio.style.display = filtradas.length ? 'none' : 'block';

    lista.querySelectorAll('[data-status-id]').forEach(select => {
        select.addEventListener('change', () => vetAlterarStatus(Number(select.dataset.statusId), select.value));
    });

    lista.querySelectorAll('[data-detalhes-solicitacao]').forEach(botao => {
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(Number(botao.dataset.detalhesSolicitacao)));
    });
}

function vetRenderizarTutores(tutores, solicitacoes) {
    const lista = document.getElementById('lista-tutores');
    const vazio = document.getElementById('sem-tutores');
    const busca = (document.getElementById('busca-tutor')?.value || '').trim().toLowerCase();

    if (!lista) return;

    const filtrados = tutores.filter(item => !busca || vetTextoBusca(item).includes(busca));

    lista.innerHTML = filtrados.map(tutor => {
        const totalPets = solicitacoes.filter(item => {
            const mesmoId = tutor.id && item.tutorId === tutor.id;
            const mesmoEmail = tutor.email && (item.tutorEmail || '').toLowerCase() === tutor.email.toLowerCase();
            return mesmoId || mesmoEmail;
        }).length;

        return `
            <tr>
                <td>
                    <div class="vet-person-cell">
                        ${tutor.fotoPerfil ? `<img src="${tutor.fotoPerfil}" alt="Foto de ${vetLimpar(tutor.nome)}">` : '<span><i class="fas fa-user"></i></span>'}
                        <div>
                            <strong>${vetLimpar(tutor.nome || 'Tutor')}</strong>
                            <small>${totalPets} animal(is) enviado(s)</small>
                        </div>
                    </div>
                </td>
                <td>${vetLimpar(tutor.email || 'E-mail não informado')}<small>${vetLimpar(tutor.telefone || 'Telefone não informado')}</small></td>
                <td>${vetLimpar(vetEnderecoCompleto(tutor))}</td>
                <td><span class="vet-pill">${vetLimpar(tutor.tipo || 'tutor')}</span></td>
                <td><button type="button" class="vet-btn-small" data-detalhes-tutor="${tutor.id}">Ver cadastro</button></td>
            </tr>
        `;
    }).join('');

    if (vazio) vazio.style.display = filtrados.length ? 'none' : 'block';

    lista.querySelectorAll('[data-detalhes-tutor]').forEach(botao => {
        botao.addEventListener('click', () => vetAbrirDetalhesTutor(Number(botao.dataset.detalhesTutor)));
    });
}

function vetAlterarStatus(id, status) {
    const solicitacoes = vetLerArray(VET_CHAVE_SOLICITACOES);
    const indice = solicitacoes.findIndex(item => Number(item.id) === Number(id));

    if (indice === -1) return;

    solicitacoes[indice] = {
        ...solicitacoes[indice],
        status,
        atualizadoEm: new Date().toISOString()
    };

    vetSalvarArray(VET_CHAVE_SOLICITACOES, solicitacoes);
    vetAtualizarDashboard();
}

function vetSalvarObservacao(id) {
    const textarea = document.getElementById('observacao-veterinario');
    const mensagem = document.getElementById('mensagem-observacao');
    const solicitacoes = vetLerArray(VET_CHAVE_SOLICITACOES);
    const indice = solicitacoes.findIndex(item => Number(item.id) === Number(id));

    if (indice === -1 || !textarea) return;

    solicitacoes[indice] = {
        ...solicitacoes[indice],
        observacoesVeterinario: textarea.value.trim(),
        atualizadoEm: new Date().toISOString()
    };

    vetSalvarArray(VET_CHAVE_SOLICITACOES, solicitacoes);
    vetAtualizarDashboard(false);

    if (mensagem) {
        mensagem.textContent = 'Observação salva com sucesso.';
        mensagem.classList.add('show');
    }
}

function vetAbrirDrawer(html) {
    const drawer = document.getElementById('vet-detalhes');
    const conteudo = document.getElementById('conteudo-detalhes');

    if (!drawer || !conteudo) return;

    conteudo.innerHTML = html;
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
}

function vetFecharDrawer() {
    const drawer = document.getElementById('vet-detalhes');
    if (!drawer) return;
    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
}

function vetAbrirDetalhesSolicitacao(id) {
    const { solicitacoes } = vetObterDadosDashboard();
    const item = solicitacoes.find(solicitacao => Number(solicitacao.id) === Number(id));

    if (!item) return;

    vetAbrirDrawer(`
        <span class="vet-badge"><i class="fas fa-paw"></i> Detalhes do animal</span>
        <h2>${vetLimpar(item.petNome || 'Pet')}</h2>
        <p class="vet-drawer-subtitle">Solicitação criada em ${vetFormatarData(item.criadoEm)}</p>

        <div class="vet-detail-grid">
            <article><strong>Tutor</strong><span>${vetLimpar(item.tutorNome || 'Não informado')}</span></article>
            <article><strong>E-mail</strong><span>${vetLimpar(item.tutorEmail || 'Não informado')}</span></article>
            <article><strong>Telefone</strong><span>${vetLimpar(item.tutorTelefone || 'Não informado')}</span></article>
            <article><strong>Animal</strong><span>${vetLimpar(item.petNome || 'Não informado')}</span></article>
            <article><strong>Espécie / sexo</strong><span>${vetLimpar(item.petEspecie || 'Não informado')}</span></article>
            <article><strong>Serviço</strong><span>${vetLimpar(item.servico || 'Não informado')}</span></article>
            <article><strong>Status</strong><span>${vetLimpar(item.status || 'Aguardando análise')}</span></article>
            <article><strong>Endereço</strong><span>${vetLimpar(vetEnderecoCompleto(item))}</span></article>
        </div>

        <div class="vet-detail-block">
            <strong>Observações do tutor</strong>
            <p>${vetLimpar(item.observacoesTutor || 'Nenhuma observação informada.')}</p>
        </div>

        <div class="vet-detail-block">
            <label for="observacao-veterinario"><strong>Observação interna do veterinário</strong></label>
            <textarea id="observacao-veterinario" placeholder="Ex: entrar em contato, solicitar exames, confirmar peso do animal...">${vetLimpar(item.observacoesVeterinario || '')}</textarea>
            <button type="button" class="vet-btn-primary" id="salvar-observacao">Salvar observação</button>
            <p id="mensagem-observacao" class="vet-form-message"></p>
        </div>
    `);

    document.getElementById('salvar-observacao')?.addEventListener('click', () => vetSalvarObservacao(id));
}

function vetAbrirDetalhesTutor(id) {
    const { tutores, solicitacoes } = vetObterDadosDashboard();
    const tutor = tutores.find(usuario => Number(usuario.id) === Number(id));

    if (!tutor) return;

    const petsTutor = solicitacoes.filter(item => {
        const mesmoId = tutor.id && item.tutorId === tutor.id;
        const mesmoEmail = tutor.email && (item.tutorEmail || '').toLowerCase() === tutor.email.toLowerCase();
        return mesmoId || mesmoEmail;
    });

    vetAbrirDrawer(`
        <span class="vet-badge"><i class="fas fa-user"></i> Cadastro do tutor</span>
        <h2>${vetLimpar(tutor.nome || 'Tutor')}</h2>
        <p class="vet-drawer-subtitle">Cadastrado em ${vetFormatarData(tutor.criadoEm)}</p>

        <div class="vet-detail-grid">
            <article><strong>Apelido</strong><span>${vetLimpar(tutor.apelido || 'Não informado')}</span></article>
            <article><strong>E-mail</strong><span>${vetLimpar(tutor.email || 'Não informado')}</span></article>
            <article><strong>Telefone</strong><span>${vetLimpar(tutor.telefone || 'Não informado')}</span></article>
            <article><strong>Tipo</strong><span>${vetLimpar(tutor.tipo || 'tutor')}</span></article>
            <article><strong>Endereço</strong><span>${vetLimpar(vetEnderecoCompleto(tutor))}</span></article>
            <article><strong>Atualizado em</strong><span>${vetFormatarData(tutor.atualizadoEm)}</span></article>
        </div>

        <div class="vet-detail-block">
            <strong>Animais enviados por este tutor</strong>
            ${petsTutor.length ? `
                <div class="vet-pet-list">
                    ${petsTutor.map(pet => `
                        <button type="button" data-abrir-pet="${pet.id}">
                            <strong>${vetLimpar(pet.petNome || 'Pet')}</strong>
                            <span>${vetLimpar(pet.petEspecie || 'Espécie não informada')} • ${vetLimpar(pet.status || 'Aguardando análise')}</span>
                        </button>
                    `).join('')}
                </div>
            ` : '<p>Nenhum animal enviado por este tutor ainda.</p>'}
        </div>
    `);

    document.querySelectorAll('[data-abrir-pet]').forEach(botao => {
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(Number(botao.dataset.abrirPet)));
    });
}

function vetAtualizarDashboard(fecharDetalhes = false) {
    if (!document.body.classList.contains('vet-dashboard-page')) return;

    const { tutores, solicitacoes } = vetObterDadosDashboard();
    vetAtualizarStats(tutores, solicitacoes);
    vetRenderizarSolicitacoes(solicitacoes);
    vetRenderizarTutores(tutores, solicitacoes);

    if (fecharDetalhes) vetFecharDrawer();
}

function vetConfigurarDashboard() {
    if (!document.body.classList.contains('vet-dashboard-page')) return;

    const sessao = vetSessaoAtual();

    if (!sessao) {
        window.location.href = 'veterinario-login.html';
        return;
    }

    const boasVindas = document.getElementById('vet-boas-vindas');
    const adminMini = document.getElementById('vet-admin-mini');

    if (boasVindas) {
        boasVindas.textContent = `Bem-vindo(a), ${sessao.nome}. Aqui você acompanha os cadastros dos tutores e animais do CastraPrev.`;
    }

    if (adminMini) {
        adminMini.innerHTML = `
            <span class="vet-admin-avatar"><i class="fas fa-user-doctor"></i></span>
            <div>
                <strong>${vetLimpar(sessao.nome || 'Veterinário')}</strong>
                <small>${vetLimpar(sessao.crmv || 'CRMV não informado')}</small>
            </div>
        `;
    }

    document.getElementById('vet-sair')?.addEventListener('click', vetSair);
    document.getElementById('fechar-detalhes')?.addEventListener('click', vetFecharDrawer);
    document.getElementById('vet-detalhes')?.addEventListener('click', event => {
        if (event.target.id === 'vet-detalhes') vetFecharDrawer();
    });

    document.getElementById('busca-solicitacao')?.addEventListener('input', () => vetAtualizarDashboard());
    document.getElementById('filtro-status')?.addEventListener('change', () => vetAtualizarDashboard());
    document.getElementById('busca-tutor')?.addEventListener('input', () => vetAtualizarDashboard());

    window.addEventListener('storage', event => {
        if ([VET_CHAVE_USUARIOS, VET_CHAVE_SOLICITACOES].includes(event.key)) {
            vetAtualizarDashboard();
        }
    });

    vetAtualizarDashboard();
}

document.addEventListener('DOMContentLoaded', function () {
    vetConfigurarLogin();
    vetConfigurarDashboard();
});
