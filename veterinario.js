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
    } catch {
        return 'Data não informada';
    }
}

function vetFormatarMoeda(valor = 0) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
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

function vetMostrarAba(aba) {
    document.querySelectorAll('[data-vet-tab]').forEach(botao => {
        botao.classList.toggle('active', botao.dataset.vetTab === aba);
    });

    document.querySelectorAll('[data-vet-section]').forEach(secao => {
        secao.classList.toggle('active', secao.dataset.vetSection === aba);
    });
}


const VET_CHAVES_SESSAO_SITE = {
    logado: 'castraprev_logado',
    usuario: 'castraprev_usuario',
    email: 'castraprev_usuario_email',
    apelido: 'castraprev_usuario_apelido',
    tipo: 'castraprev_tipo_usuario',
    perfil: 'castraprev_usuario_perfil',
    usuarios: 'castraprev_usuarios',
    veterinario: 'castraprev_veterinario_sessao'
};

function vetPrimeiroNome(nome = '') {
    return String(nome).trim().split(/\s+/)[0] || 'Veterinário';
}

function vetMontarPerfilLocal(user = {}, veterinario = {}, perfil = {}) {
    const nome = veterinario.nome || perfil?.nome || user?.user_metadata?.nome || user?.email || 'Veterinário CastraPrev';
    const email = veterinario.email || perfil?.email || user?.email || '';

    return {
        id: user?.id || veterinario.user_id || perfil?.id || '',
        veterinarioId: veterinario.id || '',
        nome,
        apelido: perfil?.apelido || user?.user_metadata?.apelido || vetPrimeiroNome(nome),
        email,
        telefone: veterinario.telefone || perfil?.telefone || '',
        cep: perfil?.cep || '',
        endereco: perfil?.endereco || '',
        numero: perfil?.numero || '',
        bairro: perfil?.bairro || '',
        cidade: veterinario.cidade || perfil?.cidade || '',
        uf: veterinario.uf || perfil?.uf || '',
        complemento: perfil?.complemento || '',
        fotoPerfil: perfil?.foto_perfil || '',
        foto_perfil: perfil?.foto_perfil || '',
        tipo: 'veterinario',
        crmv: veterinario.crmv || '',
        clinica: veterinario.clinica || '',
        ativo: veterinario.ativo !== false,
        criadoEm: perfil?.created_at || veterinario.created_at || '',
        atualizadoEm: perfil?.updated_at || veterinario.updated_at || ''
    };
}

function vetSalvarSessaoSite(user = {}, veterinario = {}, perfilDb = {}) {
    const perfil = vetMontarPerfilLocal(user, veterinario, perfilDb);

    localStorage.setItem(VET_CHAVES_SESSAO_SITE.logado, 'true');
    localStorage.setItem(VET_CHAVES_SESSAO_SITE.usuario, perfil.nome);
    localStorage.setItem(VET_CHAVES_SESSAO_SITE.email, perfil.email);
    localStorage.setItem(VET_CHAVES_SESSAO_SITE.apelido, perfil.apelido);
    localStorage.setItem(VET_CHAVES_SESSAO_SITE.tipo, 'veterinario');
    localStorage.setItem(VET_CHAVES_SESSAO_SITE.perfil, JSON.stringify(perfil));
    localStorage.setItem(VET_CHAVES_SESSAO_SITE.usuarios, JSON.stringify([perfil]));
    localStorage.setItem(VET_CHAVES_SESSAO_SITE.veterinario, JSON.stringify({
        id: perfil.veterinarioId,
        userId: perfil.id,
        nome: perfil.nome,
        email: perfil.email,
        crmv: perfil.crmv,
        clinica: perfil.clinica,
        telefone: perfil.telefone,
        cidade: perfil.cidade,
        uf: perfil.uf
    }));

    return perfil;
}

function vetLimparSessaoSite() {
    Object.values(VET_CHAVES_SESSAO_SITE).forEach(chave => localStorage.removeItem(chave));
}

async function vetGarantirPerfilSite(user = {}, veterinario = {}) {
    if (!window.supabaseClient || !user?.id || !veterinario) return null;

    const { data: perfilAtual } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    const perfil = vetMontarPerfilLocal(user, veterinario, perfilAtual || {});

    const { data, error } = await supabaseClient
        .from('profiles')
        .upsert({
            id: perfil.id,
            nome: perfil.nome,
            apelido: perfil.apelido,
            email: perfil.email,
            telefone: perfil.telefone,
            cep: perfil.cep || '',
            endereco: perfil.endereco || '',
            numero: perfil.numero || '',
            bairro: perfil.bairro || '',
            cidade: perfil.cidade || '',
            uf: perfil.uf || '',
            complemento: perfil.complemento || '',
            foto_perfil: perfil.fotoPerfil || '',
            tipo: 'veterinario'
        }, { onConflict: 'id' })
        .select()
        .maybeSingle();

    if (error) {
        console.warn('Não foi possível criar o perfil de sessão do veterinário:', error.message);
        return perfilAtual || perfil;
    }

    return data || perfilAtual || perfil;
}

async function vetSessaoAtual() {
    if (!window.supabaseClient) return null;

    const { data: authData } = await supabaseClient.auth.getUser();
    const user = authData?.user;

    if (!user) return null;

    const { data: veterinario, error } = await supabaseClient
        .from('veterinarians')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .maybeSingle();

    if (error || !veterinario) return null;

    const perfilDb = await vetGarantirPerfilSite(user, veterinario);
    const perfilLocal = vetSalvarSessaoSite(user, veterinario, perfilDb || {});

    return {
        ...perfilLocal,
        userId: user.id,
        veterinarioId: veterinario.id
    };
}

async function vetSair() {
    try {
        if (window.supabaseClient) await supabaseClient.auth.signOut();
    } catch (erro) {
        console.warn('Erro ao sair do painel veterinário:', erro);
    }
    vetLimparSessaoSite();
    window.location.href = 'veterinario-login.html';
}

function vetConfigurarLogin() {
    if (!document.body.classList.contains('vet-login-page')) return;

    vetSessaoAtual().then(sessao => {
        if (sessao) window.location.replace('veterinario-dashboard.html');
    });

    document.querySelectorAll('[data-vet-tab]').forEach(botao => {
        botao.addEventListener('click', () => vetMostrarAba(botao.dataset.vetTab));
    });

    const formLogin = document.getElementById('form-vet-login');
    const formCadastro = document.getElementById('form-vet-cadastro');

    formLogin?.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('vet-login-email').value.trim().toLowerCase();
        const senha = document.getElementById('vet-login-senha').value.trim();
        const erro = document.getElementById('vet-login-erro');

        erro.textContent = '';
        erro.classList.remove('show');

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password: senha
        });

        if (error || !data.user) {
            erro.textContent = 'Veterinário não encontrado. Confira o e-mail e a senha.';
            erro.classList.add('show');
            return;
        }

        const { data: veterinario, error: vetLoginError } = await supabaseClient
            .from('veterinarians')
            .select('*')
            .eq('user_id', data.user.id)
            .eq('ativo', true)
            .maybeSingle();

        if (vetLoginError) {
            erro.textContent = vetLoginError.message;
            erro.classList.add('show');
            return;
        }

        if (!veterinario) {
            await supabaseClient.auth.signOut();
            erro.textContent = 'Este login não está cadastrado como veterinário.';
            erro.classList.add('show');
            return;
        }

        await vetGarantirPerfilSite(data.user, veterinario);
        vetSalvarSessaoSite(data.user, veterinario);
        window.location.href = 'veterinario-dashboard.html';
    });

    formCadastro?.addEventListener('submit', async function (event) {
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

        erro.textContent = '';
        erro.classList.remove('show');

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

        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email,
            password: senha,
            options: { data: { nome, tipo: 'veterinario' } }
        });

        if (authError || !authData.user) {
            erro.textContent = authError?.message || 'Erro ao criar login do veterinário.';
            erro.classList.add('show');
            return;
        }

        const { data: veterinarioCriado, error: vetError } = await supabaseClient
            .from('veterinarians')
            .insert({
                user_id: authData.user.id,
                nome,
                email,
                crmv,
                telefone,
                clinica,
                cidade,
                uf,
                ativo: true
            })
            .select()
            .single();

        if (vetError) {
            erro.textContent = vetError.message;
            erro.classList.add('show');
            return;
        }

        await vetGarantirPerfilSite(authData.user, veterinarioCriado);
        vetSalvarSessaoSite(authData.user, veterinarioCriado);
        window.location.href = 'veterinario-dashboard.html';
    });
}

async function vetObterDadosDashboard() {
    const { data: tutores = [], error: tutoresError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('tipo', 'tutor')
        .order('created_at', { ascending: false });

    if (tutoresError) {
        console.error('Erro ao buscar tutores:', tutoresError);
    }

    let agendamentos = [];
    let agendamentosError = null;

    // Busca com relacionamento pelo nome das chaves. Se o banco tiver sido criado com outro nome de FK,
    // usa uma segunda consulta mais simples para manter o painel funcionando.
    const consultaPrincipal = await supabaseClient
        .from('appointments')
        .select(`
            *,
            tutor:profiles!appointments_tutor_id_fkey(*),
            pet:pets!appointments_pet_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

    if (consultaPrincipal.error) {
        const consultaAlternativa = await supabaseClient
            .from('appointments')
            .select('*, profiles:tutor_id(*), pets:pet_id(*)')
            .order('created_at', { ascending: false });

        agendamentos = consultaAlternativa.data || [];
        agendamentosError = consultaAlternativa.error;
    } else {
        agendamentos = consultaPrincipal.data || [];
    }

    if (agendamentosError) {
        console.warn('Consulta com relacionamento falhou. Tentando buscar appointments, profiles e pets separadamente:', agendamentosError.message);

        const { data: agendamentosSimples = [], error: simplesError } = await supabaseClient
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false });

        if (simplesError) {
            console.error('Erro ao buscar agendamentos:', simplesError);
            agendamentos = [];
        } else {
            const tutorIds = [...new Set((agendamentosSimples || []).map(item => item.tutor_id).filter(Boolean))];
            const petIds = [...new Set((agendamentosSimples || []).map(item => item.pet_id).filter(Boolean))];

            const { data: perfis = [] } = tutorIds.length
                ? await supabaseClient.from('profiles').select('*').in('id', tutorIds)
                : { data: [] };

            const { data: pets = [] } = petIds.length
                ? await supabaseClient.from('pets').select('*').in('id', petIds)
                : { data: [] };

            const perfilPorId = new Map((perfis || []).map(perfil => [perfil.id, perfil]));
            const petPorId = new Map((pets || []).map(pet => [pet.id, pet]));

            agendamentos = (agendamentosSimples || []).map(item => ({
                ...item,
                tutor: perfilPorId.get(item.tutor_id) || {},
                pet: petPorId.get(item.pet_id) || {}
            }));
        }
    }

    let arrecadacoes = [];
    const { data: dadosArrecadacao, error: arrecadacaoError } = await supabaseClient
        .from('fundraising_contributions')
        .select('*')
        .order('created_at', { ascending: false });

    if (arrecadacaoError) {
        console.warn('Arrecadação não carregada. Confira se a tabela fundraising_contributions existe no Supabase:', arrecadacaoError.message);
    } else {
        arrecadacoes = dadosArrecadacao || [];
    }

    const solicitacoes = (agendamentos || []).map(item => {
        const tutor = item.tutor || item.profiles || {};
        const pet = item.pet || item.pets || {};

        return {
            id: item.id,
            tutorId: item.tutor_id,
            petId: item.pet_id,
            tutorNome: tutor.nome || 'Tutor',
            tutorEmail: tutor.email || '',
            tutorTelefone: tutor.telefone || '',
            tutorFotoPerfil: tutor.foto_perfil || '',
            tutorEndereco: tutor.endereco || '',
            tutorNumero: tutor.numero || '',
            tutorBairro: tutor.bairro || '',
            tutorCidade: tutor.cidade || '',
            tutorUf: tutor.uf || '',
            tutorCep: tutor.cep || '',
            petNome: pet.nome || 'Pet',
            petEspecie: pet.especie || '',
            servico: item.servico || '',
            status: item.status || 'Aguardando análise',
            observacoesTutor: item.observacoes_tutor || '',
            observacoesVeterinario: item.observacoes_veterinario || '',
            criadoEm: item.created_at,
            atualizadoEm: item.updated_at
        };
    });

    const tutoresFormatados = (tutores || []).map(tutor => ({
        id: tutor.id,
        nome: tutor.nome,
        apelido: tutor.apelido,
        email: tutor.email,
        telefone: tutor.telefone,
        tipo: tutor.tipo,
        cep: tutor.cep,
        endereco: tutor.endereco,
        numero: tutor.numero,
        bairro: tutor.bairro,
        cidade: tutor.cidade,
        uf: tutor.uf,
        complemento: tutor.complemento,
        fotoPerfil: tutor.foto_perfil,
        criadoEm: tutor.created_at,
        atualizadoEm: tutor.updated_at
    }));

    return { tutores: tutoresFormatados, solicitacoes, arrecadacoes };
}

function vetAtualizarStats(tutores, solicitacoes, arrecadacoes = []) {
    document.getElementById('stat-tutores').textContent = tutores.length;
    document.getElementById('stat-animais').textContent = solicitacoes.length;
    document.getElementById('stat-aguardando').textContent =
        solicitacoes.filter(item => item.status === 'Aguardando análise').length;
    document.getElementById('stat-finalizados').textContent =
        solicitacoes.filter(item => ['Procedimento realizado', 'Finalizado'].includes(item.status)).length;

    const statArrecadacao = document.getElementById('stat-arrecadacao');
    if (statArrecadacao) {
        const total = arrecadacoes
            .filter(item => item.status !== 'Cancelada')
            .reduce((soma, item) => soma + Number(item.valor || 0), 0);
        statArrecadacao.textContent = vetFormatarMoeda(total);
    }
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
        return (!busca || vetTextoBusca(item).includes(busca)) &&
               (!filtroStatus || item.status === filtroStatus);
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
                        ${['Aguardando análise', 'Em atendimento', 'Atendimento agendado', 'Procedimento realizado', 'Finalizado', 'Cancelado']
                            .map(status => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`)
                            .join('')}
                    </select>
                </td>
                <td><button type="button" class="vet-btn-small" data-detalhes-solicitacao="${item.id}">Ver detalhes</button></td>
            </tr>
        `;
    }).join('');

    if (vazio) vazio.style.display = filtradas.length ? 'none' : 'block';

    lista.querySelectorAll('[data-status-id]').forEach(select => {
        select.addEventListener('change', () => vetAlterarStatus(select.dataset.statusId, select.value));
    });

    lista.querySelectorAll('[data-detalhes-solicitacao]').forEach(botao => {
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(botao.dataset.detalhesSolicitacao));
    });
}

function vetRenderizarTutores(tutores, solicitacoes) {
    const lista = document.getElementById('lista-tutores');
    const vazio = document.getElementById('sem-tutores');
    const busca = (document.getElementById('busca-tutor')?.value || '').trim().toLowerCase();

    if (!lista) return;

    const filtrados = tutores.filter(item => !busca || vetTextoBusca(item).includes(busca));

    lista.innerHTML = filtrados.map(tutor => {
        const totalPets = solicitacoes.filter(item => item.tutorId === tutor.id).length;

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
        botao.addEventListener('click', () => vetAbrirDetalhesTutor(botao.dataset.detalhesTutor));
    });
}

function vetTextoStatusArrecadacao(status = '') {
    if (status === 'Confirmada') return 'vet-pill-success';
    if (status === 'Cancelada') return 'vet-pill-danger';
    return '';
}

function vetRenderizarArrecadacoes(arrecadacoes = []) {
    const lista = document.getElementById('lista-arrecadacoes');
    const vazio = document.getElementById('sem-arrecadacoes');
    const busca = (document.getElementById('busca-arrecadacao')?.value || '').trim().toLowerCase();
    const filtroStatus = document.getElementById('filtro-status-arrecadacao')?.value || '';

    if (!lista) return;

    const filtradas = arrecadacoes.filter(item => {
        return (!busca || vetTextoBusca(item).includes(busca)) &&
               (!filtroStatus || item.status === filtroStatus);
    });

    lista.innerHTML = filtradas.map(item => `
        <tr>
            <td>
                <strong>${vetLimpar(item.nome || 'Contribuidor')}</strong>
                <small>${vetLimpar(item.email || 'E-mail não informado')}</small>
                <small>${vetLimpar(item.telefone || 'Telefone não informado')}</small>
            </td>
            <td><span class="vet-money-value">${vetFormatarMoeda(item.valor)}</span></td>
            <td>${vetLimpar(item.forma_pagamento || 'Não informado')}</td>
            <td>${vetFormatarData(item.created_at)}</td>
            <td>
                <select class="vet-status-select vet-status-arrecadacao" data-status-arrecadacao-id="${item.id}">
                    ${['Registrada', 'Confirmada', 'Cancelada']
                        .map(status => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`)
                        .join('')}
                </select>
                <span class="vet-pill ${vetTextoStatusArrecadacao(item.status)}">${vetLimpar(item.status || 'Registrada')}</span>
            </td>
            <td><p class="vet-donation-message">${vetLimpar(item.mensagem || 'Sem observação.')}</p></td>
        </tr>
    `).join('');

    if (vazio) vazio.style.display = filtradas.length ? 'none' : 'block';

    lista.querySelectorAll('[data-status-arrecadacao-id]').forEach(select => {
        select.addEventListener('change', () => vetAlterarStatusArrecadacao(select.dataset.statusArrecadacaoId, select.value));
    });
}

async function vetAlterarStatusArrecadacao(id, status) {
    const { error } = await supabaseClient
        .from('fundraising_contributions')
        .update({ status })
        .eq('id', id);

    if (error) {
        alert('Erro ao atualizar arrecadação: ' + error.message);
        return;
    }

    vetAtualizarDashboard();
}

async function vetAlterarStatus(id, status) {
    const sessao = await vetSessaoAtual();

    const { error } = await supabaseClient
        .from('appointments')
        .update({
            status,
            veterinarian_id: sessao?.veterinarioId || null
        })
        .eq('id', id);

    if (error) {
        alert('Erro ao atualizar status: ' + error.message);
        return;
    }

    vetAtualizarDashboard();
}

async function vetSalvarObservacao(id) {
    const textarea = document.getElementById('observacao-veterinario');
    const mensagem = document.getElementById('mensagem-observacao');

    if (!textarea) return;

    const { error } = await supabaseClient
        .from('appointments')
        .update({
            observacoes_veterinario: textarea.value.trim()
        })
        .eq('id', id);

    if (error) {
        alert('Erro ao salvar observação: ' + error.message);
        return;
    }

    if (mensagem) {
        mensagem.textContent = 'Observação salva com sucesso.';
        mensagem.classList.add('show');
    }

    vetAtualizarDashboard(false);
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

async function vetAbrirDetalhesSolicitacao(id) {
    const { solicitacoes } = await vetObterDadosDashboard();
    const item = solicitacoes.find(solicitacao => solicitacao.id === id);

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

async function vetAbrirDetalhesTutor(id) {
    const { tutores, solicitacoes } = await vetObterDadosDashboard();
    const tutor = tutores.find(usuario => usuario.id === id);

    if (!tutor) return;

    const petsTutor = solicitacoes.filter(item => item.tutorId === tutor.id);

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
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(botao.dataset.abrirPet));
    });
}


function vetValorCampo(id) {
    return (document.getElementById(id)?.value || '').trim();
}

function vetDefinirMensagem(id, texto = '', sucesso = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = texto;
    el.classList.toggle('show', Boolean(texto));
    el.classList.toggle('vet-form-success', Boolean(sucesso));
}

function vetSetValor(id, valor = '') {
    const el = document.getElementById(id);
    if (el) el.value = valor || '';
}

function vetFormatarLocalidadePerfil(perfil = {}) {
    const cidadeUf = [perfil.cidade, perfil.uf].filter(Boolean).join(' / ');
    const endereco = [perfil.endereco, perfil.numero ? `Nº ${perfil.numero}` : '', perfil.bairro].filter(Boolean).join(', ');
    return [cidadeUf, endereco].filter(Boolean).join(' • ') || 'Localidade não informada';
}

function vetAtualizarResumoPerfil(perfil = {}) {
    const nome = perfil.nome || 'Veterinário CastraPrev';
    const clinica = perfil.clinica || 'Clínica não informada';
    const localidade = vetFormatarLocalidadePerfil(perfil);

    const campos = {
        'vet-resumo-nome': nome,
        'vet-resumo-clinica': clinica,
        'vet-resumo-crmv': perfil.crmv || 'CRMV não informado',
        'vet-resumo-email': perfil.email || 'E-mail não informado',
        'vet-resumo-telefone': perfil.telefone || 'Telefone não informado',
        'vet-resumo-localidade': localidade
    };

    Object.entries(campos).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    });

    const mini = document.getElementById('vet-perfil-mini');
    if (mini) {
        mini.innerHTML = `
            <span class="vet-admin-avatar"><i class="fas fa-user-doctor"></i></span>
            <div>
                <strong>${vetLimpar(nome)}</strong>
                <small>${vetLimpar([perfil.crmv, perfil.cidade, perfil.uf].filter(Boolean).join(' • ') || 'CRMV não informado')}</small>
            </div>
        `;
    }
}

async function vetBuscarEnderecoPerfilPorCep() {
    const campoCep = document.getElementById('vet-perfil-cep');
    if (!campoCep) return;

    const cepLimpo = campoCep.value.replace(/\D/g, '');
    if (cepLimpo.length !== 8 || campoCep.dataset.ultimoCepBuscado === cepLimpo) return;

    campoCep.dataset.ultimoCepBuscado = cepLimpo;

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        if (!resposta.ok) throw new Error('falha');
        const dados = await resposta.json();
        if (dados.erro) throw new Error('cep');

        if (!vetValorCampo('vet-perfil-endereco')) vetSetValor('vet-perfil-endereco', dados.logradouro || '');
        if (!vetValorCampo('vet-perfil-bairro')) vetSetValor('vet-perfil-bairro', dados.bairro || '');
        if (!vetValorCampo('vet-perfil-cidade')) vetSetValor('vet-perfil-cidade', dados.localidade || '');
        if (!vetValorCampo('vet-perfil-uf')) vetSetValor('vet-perfil-uf', dados.uf || '');
        vetDefinirMensagem('vet-perfil-erro', '');
    } catch {
        campoCep.dataset.ultimoCepBuscado = '';
        vetDefinirMensagem('vet-perfil-erro', 'CEP não encontrado. Confira os números ou preencha o endereço manualmente.');
    }
}

function vetInstalarMascarasPerfil() {
    const telefone = document.getElementById('vet-perfil-telefone');
    telefone?.addEventListener('input', () => {
        let valor = telefone.value.replace(/\D/g, '').slice(0, 11);
        if (valor.length > 10) valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        else if (valor.length > 6) valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        else if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        else if (valor.length > 0) valor = valor.replace(/^(\d*)$/, '($1');
        telefone.value = valor;
    });

    const cep = document.getElementById('vet-perfil-cep');
    cep?.addEventListener('input', () => {
        let valor = cep.value.replace(/\D/g, '').slice(0, 8);
        if (valor.length > 5) valor = valor.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
        cep.value = valor;
        clearTimeout(cep._tempoBusca);
        cep._tempoBusca = setTimeout(vetBuscarEnderecoPerfilPorCep, 450);
    });
    cep?.addEventListener('blur', vetBuscarEnderecoPerfilPorCep);
}

async function vetConfigurarPerfilVeterinario() {
    if (!document.body.classList.contains('vet-profile-page')) return;

    const sessao = await vetSessaoAtual();

    if (!sessao) {
        window.location.href = 'veterinario-login.html';
        return;
    }

    document.getElementById('vet-sair')?.addEventListener('click', vetSair);
    vetInstalarMascarasPerfil();
    vetAtualizarResumoPerfil(sessao);

    vetSetValor('vet-perfil-nome', sessao.nome);
    vetSetValor('vet-perfil-apelido', sessao.apelido);
    vetSetValor('vet-perfil-email', sessao.email);
    vetSetValor('vet-perfil-telefone', sessao.telefone);
    vetSetValor('vet-perfil-crmv', sessao.crmv);
    vetSetValor('vet-perfil-clinica', sessao.clinica);
    vetSetValor('vet-perfil-cep', sessao.cep);
    vetSetValor('vet-perfil-endereco', sessao.endereco);
    vetSetValor('vet-perfil-numero', sessao.numero);
    vetSetValor('vet-perfil-bairro', sessao.bairro);
    vetSetValor('vet-perfil-cidade', sessao.cidade);
    vetSetValor('vet-perfil-uf', sessao.uf);
    vetSetValor('vet-perfil-complemento', sessao.complemento);

    ['vet-perfil-nome', 'vet-perfil-clinica', 'vet-perfil-crmv', 'vet-perfil-email', 'vet-perfil-telefone', 'vet-perfil-cidade', 'vet-perfil-uf', 'vet-perfil-endereco', 'vet-perfil-numero', 'vet-perfil-bairro'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            vetAtualizarResumoPerfil({
                ...sessao,
                nome: vetValorCampo('vet-perfil-nome'),
                clinica: vetValorCampo('vet-perfil-clinica'),
                crmv: vetValorCampo('vet-perfil-crmv'),
                email: vetValorCampo('vet-perfil-email'),
                telefone: vetValorCampo('vet-perfil-telefone'),
                cidade: vetValorCampo('vet-perfil-cidade'),
                uf: vetValorCampo('vet-perfil-uf').toUpperCase(),
                endereco: vetValorCampo('vet-perfil-endereco'),
                numero: vetValorCampo('vet-perfil-numero'),
                bairro: vetValorCampo('vet-perfil-bairro')
            });
        });
    });

    document.getElementById('form-vet-perfil')?.addEventListener('submit', async (event) => {
        event.preventDefault();

        vetDefinirMensagem('vet-perfil-erro', '');
        vetDefinirMensagem('vet-perfil-sucesso', '');

        const atualizado = {
            nome: vetValorCampo('vet-perfil-nome'),
            apelido: vetValorCampo('vet-perfil-apelido') || vetPrimeiroNome(vetValorCampo('vet-perfil-nome')),
            email: vetValorCampo('vet-perfil-email').toLowerCase(),
            telefone: vetValorCampo('vet-perfil-telefone'),
            crmv: vetValorCampo('vet-perfil-crmv').toUpperCase(),
            clinica: vetValorCampo('vet-perfil-clinica'),
            cep: vetValorCampo('vet-perfil-cep'),
            endereco: vetValorCampo('vet-perfil-endereco'),
            numero: vetValorCampo('vet-perfil-numero'),
            bairro: vetValorCampo('vet-perfil-bairro'),
            cidade: vetValorCampo('vet-perfil-cidade'),
            uf: vetValorCampo('vet-perfil-uf').toUpperCase(),
            complemento: vetValorCampo('vet-perfil-complemento')
        };

        const novaSenha = vetValorCampo('vet-perfil-nova-senha');
        const confirmarSenha = vetValorCampo('vet-perfil-confirmar-senha');

        if (atualizado.nome.length < 3) return vetDefinirMensagem('vet-perfil-erro', 'Digite o nome completo do veterinário.');
        if (!atualizado.email.includes('@') || !atualizado.email.includes('.')) return vetDefinirMensagem('vet-perfil-erro', 'Digite um e-mail profissional válido.');
        if (atualizado.crmv.length < 5) return vetDefinirMensagem('vet-perfil-erro', 'Informe o CRMV do veterinário.');
        if (!atualizado.clinica) return vetDefinirMensagem('vet-perfil-erro', 'Informe o nome da clínica ou instituição.');
        if (!atualizado.cidade || atualizado.uf.length !== 2) return vetDefinirMensagem('vet-perfil-erro', 'Informe cidade e UF para a localidade da clínica.');
        if (atualizado.cep && atualizado.cep.replace(/\D/g, '').length !== 8) return vetDefinirMensagem('vet-perfil-erro', 'Digite um CEP válido com 8 números ou deixe o campo vazio.');

        if (novaSenha || confirmarSenha) {
            if (novaSenha.length < 4) return vetDefinirMensagem('vet-perfil-erro', 'A nova senha precisa ter pelo menos 4 caracteres.');
            if (novaSenha !== confirmarSenha) return vetDefinirMensagem('vet-perfil-erro', 'A confirmação da nova senha não confere.');
        }

        const { data: authData } = await supabaseClient.auth.getUser();
        const user = authData?.user;
        if (!user) return vetDefinirMensagem('vet-perfil-erro', 'Sua sessão expirou. Faça login novamente.');

        if (novaSenha) {
            const { error: senhaError } = await supabaseClient.auth.updateUser({ password: novaSenha });
            if (senhaError) return vetDefinirMensagem('vet-perfil-erro', senhaError.message);
        }

        const authUpdate = { data: { nome: atualizado.nome, apelido: atualizado.apelido, tipo: 'veterinario' } };
        if (atualizado.email !== user.email) authUpdate.email = atualizado.email;
        const { error: authError } = await supabaseClient.auth.updateUser(authUpdate);
        if (authError) console.warn('Auth não atualizou todos os dados imediatamente:', authError.message);

        const { data: vetSalvo, error: vetError } = await supabaseClient
            .from('veterinarians')
            .update({
                nome: atualizado.nome,
                email: atualizado.email,
                telefone: atualizado.telefone,
                crmv: atualizado.crmv,
                clinica: atualizado.clinica,
                cidade: atualizado.cidade,
                uf: atualizado.uf
            })
            .eq('id', sessao.veterinarioId)
            .select()
            .single();

        if (vetError) return vetDefinirMensagem('vet-perfil-erro', vetError.message);

        const { data: perfilSalvo, error: perfilError } = await supabaseClient
            .from('profiles')
            .upsert({
                id: user.id,
                nome: atualizado.nome,
                apelido: atualizado.apelido,
                email: atualizado.email,
                telefone: atualizado.telefone,
                cep: atualizado.cep,
                endereco: atualizado.endereco,
                numero: atualizado.numero,
                bairro: atualizado.bairro,
                cidade: atualizado.cidade,
                uf: atualizado.uf,
                complemento: atualizado.complemento,
                tipo: 'veterinario'
            }, { onConflict: 'id' })
            .select()
            .single();

        if (perfilError) return vetDefinirMensagem('vet-perfil-erro', perfilError.message);

        const perfilLocal = vetSalvarSessaoSite(user, vetSalvo, perfilSalvo);
        vetAtualizarResumoPerfil(perfilLocal);
        document.getElementById('vet-perfil-nova-senha').value = '';
        document.getElementById('vet-perfil-confirmar-senha').value = '';
        vetDefinirMensagem('vet-perfil-sucesso', 'Perfil profissional atualizado com sucesso. A cidade salva já será usada na área de clínicas da localidade.', true);
    });
}

async function vetAtualizarDashboard(fecharDetalhes = false) {
    if (!document.body.classList.contains('vet-dashboard-page')) return;

    const { tutores, solicitacoes, arrecadacoes } = await vetObterDadosDashboard();

    vetAtualizarStats(tutores, solicitacoes, arrecadacoes);
    vetRenderizarSolicitacoes(solicitacoes);
    vetRenderizarTutores(tutores, solicitacoes);
    vetRenderizarArrecadacoes(arrecadacoes);

    if (fecharDetalhes) vetFecharDrawer();
}

async function vetConfigurarDashboard() {
    if (!document.body.classList.contains('vet-dashboard-page') || document.body.classList.contains('vet-profile-page')) return;

    const sessao = await vetSessaoAtual();

    if (!sessao) {
        window.location.href = 'veterinario-login.html';
        return;
    }

    const boasVindas = document.getElementById('vet-boas-vindas');
    const adminMini = document.getElementById('vet-admin-mini');

    if (boasVindas) {
        boasVindas.textContent = `Bem-vindo(a), ${sessao.nome}. Aqui você acompanha os tutores e atualiza o processo de castração e prevenção dos animais.`;
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
    document.getElementById('busca-arrecadacao')?.addEventListener('input', () => vetAtualizarDashboard());
    document.getElementById('filtro-status-arrecadacao')?.addEventListener('change', () => vetAtualizarDashboard());

    vetAtualizarDashboard();
}

document.addEventListener('DOMContentLoaded', function () {
    if (!window.supabaseClient) {
        alert('Supabase não carregou. Confira a ordem dos scripts no HTML.');
        return;
    }

    vetConfigurarLogin();
    vetConfigurarDashboard();
    vetConfigurarPerfilVeterinario();
});
