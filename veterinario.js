<<<<<<< HEAD
=======
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

>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
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
<<<<<<< HEAD
    } catch {
=======
    } catch (erro) {
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
        return 'Data não informada';
    }
}

<<<<<<< HEAD
function vetFormatarMoeda(valor = 0) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

=======
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
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

<<<<<<< HEAD
=======
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

>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
function vetMostrarAba(aba) {
    document.querySelectorAll('[data-vet-tab]').forEach(botao => {
        botao.classList.toggle('active', botao.dataset.vetTab === aba);
    });

    document.querySelectorAll('[data-vet-section]').forEach(secao => {
        secao.classList.toggle('active', secao.dataset.vetSection === aba);
    });
}

<<<<<<< HEAD
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

    return {
        userId: user.id,
        veterinarioId: veterinario.id,
        nome: veterinario.nome,
        email: veterinario.email,
        crmv: veterinario.crmv,
        clinica: veterinario.clinica
    };
}

async function vetSair() {
    await supabaseClient.auth.signOut();
    window.location.href = 'veterinario-login.html';
}

function vetConfigurarLogin() {
    if (!document.body.classList.contains('vet-login-page')) return;

=======
function vetConfigurarLogin() {
    if (!document.body.classList.contains('vet-login-page')) return;

    vetGarantirDemo();

>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
    document.querySelectorAll('[data-vet-tab]').forEach(botao => {
        botao.addEventListener('click', () => vetMostrarAba(botao.dataset.vetTab));
    });

    const formLogin = document.getElementById('form-vet-login');
    const formCadastro = document.getElementById('form-vet-cadastro');

<<<<<<< HEAD
    formLogin?.addEventListener('submit', async function (event) {
=======
    formLogin?.addEventListener('submit', function (event) {
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
        event.preventDefault();

        const email = document.getElementById('vet-login-email').value.trim().toLowerCase();
        const senha = document.getElementById('vet-login-senha').value.trim();
        const erro = document.getElementById('vet-login-erro');
<<<<<<< HEAD

        erro.textContent = '';
        erro.classList.remove('show');

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password: senha
        });

        if (error || !data.user) {
=======
        const veterinarios = vetLerArray(VET_CHAVE_VETERINARIOS);

        const encontrado = veterinarios.find(vet => (vet.email || '').toLowerCase() === email && vet.senha === senha);

        if (!encontrado) {
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
            erro.textContent = 'Veterinário não encontrado. Confira o e-mail e a senha.';
            erro.classList.add('show');
            return;
        }

<<<<<<< HEAD
        const { data: veterinario } = await supabaseClient
            .from('veterinarians')
            .select('*')
            .eq('user_id', data.user.id)
            .eq('ativo', true)
            .maybeSingle();

        if (!veterinario) {
            await supabaseClient.auth.signOut();
            erro.textContent = 'Este login não está cadastrado como veterinário.';
            erro.classList.add('show');
            return;
        }

        window.location.href = 'veterinario-dashboard.html';
    });

    formCadastro?.addEventListener('submit', async function (event) {
=======
        erro.textContent = '';
        erro.classList.remove('show');
        vetSalvarSessao(encontrado);
        window.location.href = 'veterinario-dashboard.html';
    });

    formCadastro?.addEventListener('submit', function (event) {
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
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

<<<<<<< HEAD
        erro.textContent = '';
        erro.classList.remove('show');

=======
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
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

<<<<<<< HEAD
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email,
            password: senha
        });

        if (authError || !authData.user) {
            erro.textContent = authError?.message || 'Erro ao criar login do veterinário.';
            erro.classList.add('show');
            return;
        }

        const { error: vetError } = await supabaseClient
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
            });

        if (vetError) {
            erro.textContent = vetError.message;
            erro.classList.add('show');
            return;
        }

=======
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
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
        window.location.href = 'veterinario-dashboard.html';
    });
}

<<<<<<< HEAD
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
=======
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
    if (statFinalizados) statFinalizados.textContent = solicitacoes.filter(item => ['Procedimento realizado', 'Finalizado', 'Castração realizada'].includes(item.status)).length;
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
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
<<<<<<< HEAD
        return (!busca || vetTextoBusca(item).includes(busca)) &&
               (!filtroStatus || item.status === filtroStatus);
=======
        const combinaBusca = !busca || vetTextoBusca(item).includes(busca);
        const combinaStatus = !filtroStatus || item.status === filtroStatus;
        return combinaBusca && combinaStatus;
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
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
<<<<<<< HEAD
                        ${['Aguardando análise', 'Em atendimento', 'Atendimento agendado', 'Procedimento realizado', 'Finalizado', 'Cancelado']
                            .map(status => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${status}</option>`)
                            .join('')}
=======
                        ${['Aguardando análise', 'Em atendimento', 'Atendimento agendado', 'Procedimento realizado', 'Finalizado', 'Cancelado'].map(status => `<option value="${status}" ${(item.status === status || (item.status === 'Castração agendada' && status === 'Atendimento agendado') || (item.status === 'Castração realizada' && status === 'Procedimento realizado')) ? 'selected' : ''}>${status}</option>`).join('')}
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
                    </select>
                </td>
                <td><button type="button" class="vet-btn-small" data-detalhes-solicitacao="${item.id}">Ver detalhes</button></td>
            </tr>
        `;
    }).join('');

    if (vazio) vazio.style.display = filtradas.length ? 'none' : 'block';

    lista.querySelectorAll('[data-status-id]').forEach(select => {
<<<<<<< HEAD
        select.addEventListener('change', () => vetAlterarStatus(select.dataset.statusId, select.value));
    });

    lista.querySelectorAll('[data-detalhes-solicitacao]').forEach(botao => {
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(botao.dataset.detalhesSolicitacao));
=======
        select.addEventListener('change', () => vetAlterarStatus(Number(select.dataset.statusId), select.value));
    });

    lista.querySelectorAll('[data-detalhes-solicitacao]').forEach(botao => {
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(Number(botao.dataset.detalhesSolicitacao)));
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
    });
}

function vetRenderizarTutores(tutores, solicitacoes) {
    const lista = document.getElementById('lista-tutores');
    const vazio = document.getElementById('sem-tutores');
    const busca = (document.getElementById('busca-tutor')?.value || '').trim().toLowerCase();

    if (!lista) return;

    const filtrados = tutores.filter(item => !busca || vetTextoBusca(item).includes(busca));

    lista.innerHTML = filtrados.map(tutor => {
<<<<<<< HEAD
        const totalPets = solicitacoes.filter(item => item.tutorId === tutor.id).length;
=======
        const totalPets = solicitacoes.filter(item => {
            const mesmoId = tutor.id && item.tutorId === tutor.id;
            const mesmoEmail = tutor.email && (item.tutorEmail || '').toLowerCase() === tutor.email.toLowerCase();
            return mesmoId || mesmoEmail;
        }).length;
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28

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
<<<<<<< HEAD
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
=======
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
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28

    if (mensagem) {
        mensagem.textContent = 'Observação salva com sucesso.';
        mensagem.classList.add('show');
    }
<<<<<<< HEAD

    vetAtualizarDashboard(false);
=======
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
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
<<<<<<< HEAD

=======
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
}

<<<<<<< HEAD
async function vetAbrirDetalhesSolicitacao(id) {
    const { solicitacoes } = await vetObterDadosDashboard();
    const item = solicitacoes.find(solicitacao => solicitacao.id === id);
=======
function vetAbrirDetalhesSolicitacao(id) {
    const { solicitacoes } = vetObterDadosDashboard();
    const item = solicitacoes.find(solicitacao => Number(solicitacao.id) === Number(id));
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28

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

<<<<<<< HEAD
async function vetAbrirDetalhesTutor(id) {
    const { tutores, solicitacoes } = await vetObterDadosDashboard();
    const tutor = tutores.find(usuario => usuario.id === id);

    if (!tutor) return;

    const petsTutor = solicitacoes.filter(item => item.tutorId === tutor.id);
=======
function vetAbrirDetalhesTutor(id) {
    const { tutores, solicitacoes } = vetObterDadosDashboard();
    const tutor = tutores.find(usuario => Number(usuario.id) === Number(id));

    if (!tutor) return;

    const petsTutor = solicitacoes.filter(item => {
        const mesmoId = tutor.id && item.tutorId === tutor.id;
        const mesmoEmail = tutor.email && (item.tutorEmail || '').toLowerCase() === tutor.email.toLowerCase();
        return mesmoId || mesmoEmail;
    });
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28

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
<<<<<<< HEAD
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(botao.dataset.abrirPet));
    });
}

async function vetAtualizarDashboard(fecharDetalhes = false) {
    if (!document.body.classList.contains('vet-dashboard-page')) return;

    const { tutores, solicitacoes, arrecadacoes } = await vetObterDadosDashboard();

    vetAtualizarStats(tutores, solicitacoes, arrecadacoes);
    vetRenderizarSolicitacoes(solicitacoes);
    vetRenderizarTutores(tutores, solicitacoes);
    vetRenderizarArrecadacoes(arrecadacoes);
=======
        botao.addEventListener('click', () => vetAbrirDetalhesSolicitacao(Number(botao.dataset.abrirPet)));
    });
}

function vetAtualizarDashboard(fecharDetalhes = false) {
    if (!document.body.classList.contains('vet-dashboard-page')) return;

    const { tutores, solicitacoes } = vetObterDadosDashboard();
    vetAtualizarStats(tutores, solicitacoes);
    vetRenderizarSolicitacoes(solicitacoes);
    vetRenderizarTutores(tutores, solicitacoes);
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28

    if (fecharDetalhes) vetFecharDrawer();
}

<<<<<<< HEAD
async function vetConfigurarDashboard() {
    if (!document.body.classList.contains('vet-dashboard-page')) return;

    const sessao = await vetSessaoAtual();
=======
function vetConfigurarDashboard() {
    if (!document.body.classList.contains('vet-dashboard-page')) return;

    const sessao = vetSessaoAtual();
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28

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
<<<<<<< HEAD

=======
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
    document.getElementById('vet-detalhes')?.addEventListener('click', event => {
        if (event.target.id === 'vet-detalhes') vetFecharDrawer();
    });

    document.getElementById('busca-solicitacao')?.addEventListener('input', () => vetAtualizarDashboard());
    document.getElementById('filtro-status')?.addEventListener('change', () => vetAtualizarDashboard());
    document.getElementById('busca-tutor')?.addEventListener('input', () => vetAtualizarDashboard());
<<<<<<< HEAD
    document.getElementById('busca-arrecadacao')?.addEventListener('input', () => vetAtualizarDashboard());
    document.getElementById('filtro-status-arrecadacao')?.addEventListener('change', () => vetAtualizarDashboard());
=======

    window.addEventListener('storage', event => {
        if ([VET_CHAVE_USUARIOS, VET_CHAVE_SOLICITACOES].includes(event.key)) {
            vetAtualizarDashboard();
        }
    });
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28

    vetAtualizarDashboard();
}

document.addEventListener('DOMContentLoaded', function () {
<<<<<<< HEAD
    if (!window.supabaseClient) {
        alert('Supabase não carregou. Confira a ordem dos scripts no HTML.');
        return;
    }

    vetConfigurarLogin();
    vetConfigurarDashboard();
});
=======
    vetConfigurarLogin();
    vetConfigurarDashboard();
});
>>>>>>> e7ea820c9b6a56adebe8d2b2a9b624c0c90d3f28
