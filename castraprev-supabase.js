(function () {
    if (!window.supabaseClient) {
        console.warn('Supabase não carregado. Verifique supabaseClient.js e a CDN @supabase/supabase-js.');
        return;
    }

    const sb = window.supabaseClient;
    const LS_LOGADO = 'castraprev_logado';
    const LS_NOME = 'castraprev_usuario';
    const LS_EMAIL = 'castraprev_usuario_email';
    const LS_APELIDO = 'castraprev_usuario_apelido';
    const LS_TIPO = 'castraprev_tipo_usuario';
    const LS_VET = 'castraprev_veterinario_sessao';

    const qs = (id) => document.getElementById(id);
    const val = (id) => (qs(id)?.value || '').trim();
    const safe = (txt = '') => String(txt).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    const primeiroNome = (nome = '') => String(nome).trim().split(/\s+/)[0] || 'Usuário';
    const moedaBR = (valor = 0) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    function numeroMoeda(valor = '') {
        const texto = String(valor).trim().replace(/\s/g, '');
        if (!texto) return 0;

        const normalizado = texto
            .replace(/R\$/gi, '')
            .replace(/\./g, '')
            .replace(',', '.');

        const numero = Number(normalizado);
        return Number.isFinite(numero) ? numero : 0;
    }

    function setMsg(id, texto, ok = false) {
        const el = qs(id);
        if (!el) return;
        el.textContent = texto;
        el.classList.toggle('show', Boolean(texto));
        el.classList.toggle('sucesso', Boolean(ok));
    }

    async function obterSessaoUsuario() {
        const { data } = await sb.auth.getUser();
        return data?.user || null;
    }

    async function carregarPerfil(userId) {
        if (!userId) return null;
        const { data } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
        return data || null;
    }

    async function carregarVeterinario(userId) {
        if (!userId) return null;
        const { data, error } = await sb
            .from('veterinarians')
            .select('*')
            .eq('user_id', userId)
            .eq('ativo', true)
            .maybeSingle();
        if (error) {
            console.warn('Erro ao buscar sessão do veterinário:', error.message);
            return null;
        }
        return data || null;
    }

    function salvarSessaoLocal(user, perfil, tipo = 'tutor') {
        const nome = perfil?.nome || user?.user_metadata?.nome || user?.email || 'Usuário';
        const apelido = perfil?.apelido || user?.user_metadata?.apelido || primeiroNome(nome);
        localStorage.setItem(LS_LOGADO, 'true');
        localStorage.setItem(LS_NOME, nome);
        localStorage.setItem(LS_APELIDO, apelido);
        localStorage.setItem(LS_EMAIL, perfil?.email || user?.email || '');
        localStorage.setItem(LS_TIPO, tipo || perfil?.tipo || 'tutor');
    }

    function salvarSessaoVeterinarioLocal(user, veterinario, perfil = null) {
        const nome = veterinario?.nome || perfil?.nome || user?.user_metadata?.nome || user?.email || 'Veterinário CastraPrev';
        const apelido = perfil?.apelido || user?.user_metadata?.apelido || primeiroNome(nome);
        const email = veterinario?.email || perfil?.email || user?.email || '';

        localStorage.setItem(LS_LOGADO, 'true');
        localStorage.setItem(LS_NOME, nome);
        localStorage.setItem(LS_APELIDO, apelido);
        localStorage.setItem(LS_EMAIL, email);
        localStorage.setItem(LS_TIPO, 'veterinario');
        localStorage.setItem(LS_VET, JSON.stringify({
            id: veterinario?.id || '',
            userId: user?.id || veterinario?.user_id || '',
            nome,
            email,
            crmv: veterinario?.crmv || '',
            clinica: veterinario?.clinica || ''
        }));
        localStorage.setItem('castraprev_usuario_perfil', JSON.stringify({
            id: user?.id || veterinario?.user_id || '',
            veterinarioId: veterinario?.id || '',
            nome,
            apelido,
            email,
            telefone: veterinario?.telefone || perfil?.telefone || '',
            cidade: veterinario?.cidade || perfil?.cidade || '',
            uf: veterinario?.uf || perfil?.uf || '',
            tipo: 'veterinario',
            crmv: veterinario?.crmv || '',
            clinica: veterinario?.clinica || ''
        }));
    }

    async function sincronizarSessaoLocal() {
        const user = await obterSessaoUsuario();
        if (!user) return null;
        const [perfil, veterinario] = await Promise.all([
            carregarPerfil(user.id),
            carregarVeterinario(user.id)
        ]);

        if (veterinario) {
            salvarSessaoVeterinarioLocal(user, veterinario, perfil);
            return { user, perfil, veterinario };
        }

        salvarSessaoLocal(user, perfil, perfil?.tipo || 'tutor');
        return { user, perfil };
    }

    async function onSubmitCapture(formId, handler) {
        const form = qs(formId);
        if (!form) return;
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            try {
                await handler(event);
            } catch (err) {
                console.error(err);
                alert(err.message || 'Ocorreu um erro ao conversar com o Supabase.');
            }
        }, true);
    }

    function irDestino(defaultPage) {
        const p = new URLSearchParams(window.location.search);
        window.location.href = p.get('from') || defaultPage;
    }

    function instalarLogoutSupabase() {
        const sairAntigo = window.sair;
        window.sair = async function () {
            try { await sb.auth.signOut(); } catch (e) { console.warn(e); }
            localStorage.removeItem(LS_LOGADO);
            localStorage.removeItem(LS_NOME);
            localStorage.removeItem(LS_EMAIL);
            localStorage.removeItem(LS_APELIDO);
            localStorage.removeItem(LS_TIPO);
            localStorage.removeItem(LS_VET);
            localStorage.removeItem('castraprev_usuario_perfil');
            if (typeof sairAntigo === 'function') return sairAntigo();
            window.location.href = 'index.html';
        };
    }

    async function configurarLoginTutor() {
        await onSubmitCapture('form-login', async () => {
            const email = val('login-identificacao').toLowerCase();
            const senha = val('login-senha');
            const erroId = 'erro-login';
            setMsg(erroId, '');

            if (!email.includes('@')) {
                setMsg(erroId, 'Digite o e-mail cadastrado. No Supabase o login é feito por e-mail.');
                return;
            }

            const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
            if (error) {
                setMsg(erroId, 'Cadastro não encontrado ou senha incorreta.');
                return;
            }

            const perfil = await carregarPerfil(data.user.id);
            salvarSessaoLocal(data.user, perfil, 'tutor');
            irDestino('agendamento.html');
        });
    }

    async function configurarCadastroTutor() {
        await onSubmitCapture('form-cadastro', async () => {
            const nome = val('cadastro-nome');
            const apelido = val('cadastro-apelido') || primeiroNome(nome);
            const email = val('cadastro-email').toLowerCase();
            const senha = val('cadastro-senha');
            const cep = val('cadastro-cep');
            const endereco = val('cadastro-endereco');
            const numero = val('cadastro-numero');
            const bairro = val('cadastro-bairro');
            const cidade = val('cadastro-cidade');
            const uf = val('cadastro-uf').toUpperCase();
            const erroId = 'erro-cadastro';
            setMsg(erroId, '');

            if (nome.length < 3) return setMsg(erroId, 'Digite um nome com pelo menos 3 letras.');
            if (!email.includes('@') || !email.includes('.')) return setMsg(erroId, 'Digite um e-mail válido.');
            if (senha.length < 4) return setMsg(erroId, 'A senha precisa ter pelo menos 4 caracteres.');
            if (cep.replace(/\D/g, '').length !== 8) return setMsg(erroId, 'Digite um CEP válido com 8 números.');

            const { data, error } = await sb.auth.signUp({
                email,
                password: senha,
                options: { data: { nome, apelido, tipo: 'tutor' } }
            });
            if (error) return setMsg(erroId, error.message);
            if (!data.user) return setMsg(erroId, 'Cadastro criado. Confirme seu e-mail antes de entrar.');

            const perfil = {
                id: data.user.id,
                nome,
                apelido,
                email,
                telefone: val('cadastro-telefone'),
                cep,
                endereco,
                numero,
                bairro,
                cidade,
                uf,
                complemento: val('cadastro-complemento'),
                foto_perfil: '',
                tipo: 'tutor'
            };

            const { error: perfilError } = await sb.from('profiles').upsert(perfil, { onConflict: 'id' });
            if (perfilError) return setMsg(erroId, perfilError.message);

            salvarSessaoLocal(data.user, perfil, 'tutor');
            irDestino('agendamento.html');
        });
    }

    async function configurarAgendamento() {
        await onSubmitCapture('form-agendar', async () => {
            const msgId = 'mensagem-form';
            setMsg(msgId, '');
            const user = await obterSessaoUsuario();
            if (!user) {
                alert('Você precisa estar logado para agendar.');
                window.location.href = 'login.html?from=agendamento.html';
                return;
            }
            const perfil = await carregarPerfil(user.id);
            salvarSessaoLocal(user, perfil, 'tutor');

            const petNome = val('pet');
            const especieValor = val('especie');
            const especieTexto = qs('especie')?.selectedOptions?.[0]?.textContent?.trim() || especieValor;
            const servicoValor = val('servico');
            const servicoTexto = qs('servico')?.selectedOptions?.[0]?.textContent?.trim() || servicoValor;
            const observacoes = val('observacoes');

            if (!petNome || !especieValor || !servicoValor) {
                setMsg(msgId, 'Preencha os dados do animal e selecione o serviço.');
                return;
            }

            const { data: pet, error: petError } = await sb.from('pets').insert({
                tutor_id: user.id,
                nome: petNome,
                especie_valor: especieValor,
                especie: especieTexto
            }).select().single();
            if (petError) return setMsg(msgId, petError.message);

            const { error } = await sb.from('appointments').insert({
                tutor_id: user.id,
                pet_id: pet.id,
                servico_valor: servicoValor,
                servico: servicoTexto,
                observacoes_tutor: observacoes,
                status: 'Aguardando análise'
            });
            if (error) return setMsg(msgId, error.message);

            const el = qs(msgId);
            if (el) {
                el.innerHTML = `${safe(petNome)}, solicitação salva no Supabase e enviada ao painel do veterinário. <a href="acompanhamento.html">Acompanhar processo</a>`;
                el.classList.add('show');
            }
            qs('form-agendar')?.reset();
        });
    }

    function mapAgendamento(row) {
        const perfil = row.profiles || {};
        const pet = row.pets || {};
        return {
            id: row.id,
            tutorId: row.tutor_id,
            tutorNome: perfil.nome,
            tutorEmail: perfil.email,
            tutorTelefone: perfil.telefone,
            tutorCep: perfil.cep,
            tutorEndereco: perfil.endereco,
            tutorNumero: perfil.numero,
            tutorBairro: perfil.bairro,
            tutorCidade: perfil.cidade,
            tutorUf: perfil.uf,
            tutorComplemento: perfil.complemento,
            tutorFotoPerfil: perfil.foto_perfil,
            petId: row.pet_id,
            petNome: pet.nome,
            petEspecie: pet.especie,
            servico: row.servico,
            status: row.status,
            observacoesTutor: row.observacoes_tutor,
            observacoesVeterinario: row.observacoes_veterinario,
            criadoEm: row.created_at,
            atualizadoEm: row.updated_at
        };
    }

    async function buscarAgendamentosTodos() {
        const { data, error } = await sb
            .from('appointments')
            .select('*, profiles:tutor_id(*), pets:pet_id(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapAgendamento);
    }

    async function buscarTutores() {
        const { data, error } = await sb.from('profiles').select('*').eq('tipo', 'tutor').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function configurarCadastroLoginVeterinario() {
        // O arquivo veterinario.js já possui a rotina completa do login/cadastro veterinário.
        // Evita eventos duplicados e conflito de handlers quando ele estiver carregado.
        if (window.vetConfigurarLogin) return;

        await onSubmitCapture('form-vet-login', async () => {
            const email = val('vet-login-email').toLowerCase();
            const password = val('vet-login-senha');
            setMsg('vet-login-erro', '');
            const { data, error } = await sb.auth.signInWithPassword({ email, password });
            if (error) return setMsg('vet-login-erro', 'Veterinário não encontrado. Confira o e-mail e a senha.');
            const { data: vet, error: vetError } = await sb.from('veterinarians').select('*').eq('user_id', data.user.id).maybeSingle();
            if (vetError || !vet) return setMsg('vet-login-erro', 'Este usuário não possui cadastro de veterinário.');
            salvarSessaoVeterinarioLocal(data.user, vet);
            window.location.href = 'veterinario-dashboard.html';
        });

        await onSubmitCapture('form-vet-cadastro', async () => {
            const nome = val('vet-cadastro-nome');
            const email = val('vet-cadastro-email').toLowerCase();
            const crmv = val('vet-cadastro-crmv').toUpperCase();
            const senha = val('vet-cadastro-senha');
            setMsg('vet-cadastro-erro', '');
            if (nome.length < 3) return setMsg('vet-cadastro-erro', 'Digite o nome completo do veterinário.');
            if (!email.includes('@') || !email.includes('.')) return setMsg('vet-cadastro-erro', 'Digite um e-mail profissional válido.');
            if (crmv.length < 5) return setMsg('vet-cadastro-erro', 'Informe o CRMV do veterinário.');
            if (senha.length < 4) return setMsg('vet-cadastro-erro', 'A senha precisa ter pelo menos 4 caracteres.');

            const { data, error } = await sb.auth.signUp({ email, password: senha, options: { data: { nome, tipo: 'veterinario' } } });
            if (error) return setMsg('vet-cadastro-erro', error.message);
            if (!data.user) return setMsg('vet-cadastro-erro', 'Cadastro criado. Confirme seu e-mail antes de entrar.');

            const vet = {
                user_id: data.user.id,
                nome,
                email,
                crmv,
                telefone: val('vet-cadastro-telefone'),
                clinica: val('vet-cadastro-clinica'),
                cidade: val('vet-cadastro-cidade'),
                uf: val('vet-cadastro-uf').toUpperCase(),
                ativo: true
            };
            const { data: vetCriado, error: vetError } = await sb.from('veterinarians').insert(vet).select().single();
            if (vetError) return setMsg('vet-cadastro-erro', vetError.message);
            salvarSessaoVeterinarioLocal(data.user, vetCriado);
            window.location.href = 'veterinario-dashboard.html';
        });
    }

    async function configurarDashboardVeterinario() {
        if (!document.body.classList.contains('vet-dashboard-page')) return;

        // O painel veterinário é controlado pelo veterinario.js.
        // Antes havia uma sobrescrita aqui que zerava tutores/solicitações e quebrava os botões “Ver detalhes” e “Ver cadastro”.
        if (window.vetConfigurarDashboard) return;
        const user = await obterSessaoUsuario();
        if (!user) {
            window.location.href = 'veterinario-login.html';
            return;
        }
        const { data: vet } = await sb.from('veterinarians').select('*').eq('user_id', user.id).maybeSingle();
        if (!vet) {
            window.location.href = 'veterinario-login.html';
            return;
        }
        localStorage.setItem(LS_VET, JSON.stringify({ id: vet.id, nome: vet.nome, email: vet.email, crmv: vet.crmv, clinica: vet.clinica }));

        if (window.vetAlterarStatus) {
            window.vetAlterarStatus = async function (id, status) {
                const { error } = await sb.from('appointments').update({ status }).eq('id', id);
                if (error) return alert(error.message);
                await window.vetAtualizarDashboard?.();
            };
        }
        window.vetSalvarObservacao = async function (id) {
            const texto = val('observacao-veterinario');
            const { error } = await sb.from('appointments').update({ observacoes_veterinario: texto }).eq('id', id);
            if (error) return alert(error.message);
            await window.vetAtualizarDashboard?.(false);
            setMsg('mensagem-observacao', 'Observação salva com sucesso.', true);
        };
        window.vetObterDadosDashboard = function () { return { usuarios: [], tutores: [], solicitacoes: [] }; };
        window.vetAtualizarDashboard = async function (fecharDetalhes = false) {
            const [tutores, solicitacoes] = await Promise.all([buscarTutores(), buscarAgendamentosTodos()]);
            window.vetAtualizarStats?.(tutores, solicitacoes);
            window.vetRenderizarSolicitacoes?.(solicitacoes);
            window.vetRenderizarTutores?.(tutores, solicitacoes);
            if (fecharDetalhes) window.vetFecharDrawer?.();
        };
        await window.vetAtualizarDashboard();
    }

    async function carregarResumoArrecadacao() {
        const totalEl = qs('arrecadacao-total');
        const metaEl = qs('arrecadacao-meta');
        const contadorEl = qs('arrecadacao-contador');
        const barraEl = qs('arrecadacao-barra');
        const listaEl = qs('arrecadacao-lista');
        const statusEl = qs('arrecadacao-mensagem-status');

        if (!totalEl && !listaEl) return;

        const meta = 5000;
        if (metaEl) metaEl.textContent = moedaBR(meta);

        const { data, error } = await sb
            .from('fundraising_contributions')
            .select('nome, valor, forma_pagamento, mensagem, status, created_at')
            .in('status', ['Registrada', 'Confirmada'])
            .order('created_at', { ascending: false });

        if (error) {
            const texto = 'Não foi possível carregar a arrecadação. Confira se a tabela fundraising_contributions foi criada no Supabase.';
            if (statusEl) setMsg('arrecadacao-mensagem-status', texto);
            if (listaEl) listaEl.innerHTML = `<p>${safe(texto)}</p>`;
            console.warn(error);
            return;
        }

        const itens = data || [];
        const total = itens.reduce((soma, item) => soma + Number(item.valor || 0), 0);
        const progresso = Math.max(0, Math.min(100, (total / meta) * 100));

        if (totalEl) totalEl.textContent = moedaBR(total);
        if (contadorEl) contadorEl.textContent = `${itens.length} contribuição(ões) registradas`;
        if (barraEl) barraEl.style.width = `${progresso}%`;
        if (statusEl) setMsg('arrecadacao-mensagem-status', '');

        if (listaEl) {
            listaEl.innerHTML = itens.length ? itens.slice(0, 6).map(item => `
                <article class="arrecadacao-item">
                    <div class="arrecadacao-item-topo">
                        <div>
                            <strong>${safe(item.nome || 'Contribuidor')}</strong>
                            <small>${safe(item.forma_pagamento || 'Forma não informada')} • ${new Date(item.created_at).toLocaleDateString('pt-BR')}</small>
                        </div>
                        <span>${moedaBR(item.valor)}</span>
                    </div>
                    <p>${safe(item.mensagem || 'Sem observação.')}</p>
                </article>
            `).join('') : '<p>Nenhuma contribuição registrada ainda.</p>';
        }
    }

    async function preencherDadosArrecadacao() {
        const form = qs('form-arrecadacao');
        if (!form) return;

        const user = await obterSessaoUsuario();
        if (!user) return;

        const perfil = await carregarPerfil(user.id);
        if (!perfil) return;

        if (qs('arrecadacao-nome') && !val('arrecadacao-nome')) qs('arrecadacao-nome').value = perfil.nome || '';
        if (qs('arrecadacao-email') && !val('arrecadacao-email')) qs('arrecadacao-email').value = perfil.email || user.email || '';
        if (qs('arrecadacao-telefone') && !val('arrecadacao-telefone')) qs('arrecadacao-telefone').value = perfil.telefone || '';
    }

    async function configurarArrecadacao() {
        if (!qs('form-arrecadacao') && !qs('arrecadacao-total')) return;

        await preencherDadosArrecadacao();
        await carregarResumoArrecadacao();

        await onSubmitCapture('form-arrecadacao', async () => {
            const msgId = 'mensagem-arrecadacao';
            setMsg(msgId, '');

            const valor = numeroMoeda(val('arrecadacao-valor'));
            if (valor <= 0) {
                setMsg(msgId, 'Digite um valor válido para a contribuição.');
                return;
            }

            const user = await obterSessaoUsuario();
            const perfil = user ? await carregarPerfil(user.id) : null;
            const nome = val('arrecadacao-nome') || perfil?.nome || 'Contribuidor CastraPrev';
            const email = val('arrecadacao-email') || perfil?.email || user?.email || '';

            const { error } = await sb.from('fundraising_contributions').insert({
                tutor_id: user?.id || null,
                nome,
                email,
                telefone: val('arrecadacao-telefone') || perfil?.telefone || '',
                valor,
                forma_pagamento: val('arrecadacao-forma') || 'Pix',
                mensagem: val('arrecadacao-mensagem'),
                status: val('arrecadacao-status') || 'Registrada'
            });

            if (error) {
                setMsg(msgId, error.message);
                return;
            }

            setMsg(msgId, 'Contribuição salva no Supabase com sucesso.', true);
            qs('form-arrecadacao')?.reset();
            await preencherDadosArrecadacao();
            await carregarResumoArrecadacao();
        });
    }


    async function configurarClinicasLocalidade() {
        const lista = qs('lista-clinicas-localidade');
        if (!lista) return;

        const campoCidade = qs('busca-clinica-cidade');
        const botaoBuscar = qs('btn-buscar-clinicas');
        const status = qs('clinicas-localidade-status');
        const setStatus = (texto, ok = false) => {
            if (!status) return;
            status.textContent = texto || '';
            status.classList.toggle('show', Boolean(texto));
            status.classList.toggle('sucesso', Boolean(ok));
        };

        const user = await obterSessaoUsuario();
        const perfil = user ? await carregarPerfil(user.id) : null;
        const cidadeSalva = perfil?.cidade || localStorage.getItem('castraprev_busca_clinicas_cidade') || '';

        if (campoCidade && !campoCidade.value && cidadeSalva) campoCidade.value = cidadeSalva;

        async function carregarClinicas() {
            const cidade = (campoCidade?.value || '').trim();
            if (cidade) localStorage.setItem('castraprev_busca_clinicas_cidade', cidade);

            lista.innerHTML = '<p class="clinicas-vazio">Carregando clínicas cadastradas...</p>';
            setStatus('');

            let consulta = sb
                .from('veterinarians')
                .select('nome,email,telefone,crmv,clinica,cidade,uf')
                .eq('ativo', true)
                .order('clinica', { ascending: true })
                .limit(12);

            if (cidade) consulta = consulta.ilike('cidade', `%${cidade}%`);

            const { data, error } = await consulta;

            if (error) {
                lista.innerHTML = '<p class="clinicas-vazio">Não foi possível carregar as clínicas agora.</p>';
                setStatus('Se os veterinários já foram cadastrados e não aparecem, rode o arquivo supabase-veterinario-localidade-update.sql no Supabase.', false);
                return;
            }

            const clinicas = data || [];

            if (!clinicas.length) {
                lista.innerHTML = `<p class="clinicas-vazio">Nenhuma clínica encontrada${cidade ? ` para ${safe(cidade)}` : ''}. O veterinário pode atualizar a cidade no perfil profissional para aparecer aqui.</p>`;
                return;
            }

            setStatus(cidade ? `${clinicas.length} resultado(s) encontrado(s) para ${cidade}.` : `${clinicas.length} clínica(s) cadastrada(s) no CastraPrev.`, true);

            lista.innerHTML = clinicas.map(vet => {
                const localidade = [vet.cidade, vet.uf].filter(Boolean).join(' / ') || 'Localidade não informada';
                return `
                    <article class="clinica-card">
                        <div class="clinica-card-topo">
                            <span class="clinica-card-icone"><i class="fas fa-hospital-user"></i></span>
                            <div>
                                <h3>${safe(vet.clinica || 'Clínica veterinária')}</h3>
                                <small>${safe(vet.nome || 'Veterinário CastraPrev')} • ${safe(vet.crmv || 'CRMV não informado')}</small>
                            </div>
                        </div>
                        <div class="clinica-card-info">
                            <p><i class="fas fa-location-dot"></i> <span>${safe(localidade)}</span></p>
                            <p><i class="fab fa-whatsapp"></i> <span>${safe(vet.telefone || 'Telefone não informado')}</span></p>
                            <p><i class="fas fa-envelope"></i> <span>${safe(vet.email || 'E-mail não informado')}</span></p>
                        </div>
                    </article>
                `;
            }).join('');
        }

        let tempoBusca;
        campoCidade?.addEventListener('input', () => {
            clearTimeout(tempoBusca);
            tempoBusca = setTimeout(carregarClinicas, 500);
        });
        botaoBuscar?.addEventListener('click', carregarClinicas);
        await carregarClinicas();
    }

    async function configurarAcompanhamento() {
        const lista = qs('lista-acompanhamento');
        if (!lista) return;
        const vazio = qs('sem-acompanhamento');
        const user = await obterSessaoUsuario();
        if (!user) {
            if (vazio) vazio.style.display = 'block';
            return;
        }
        const { data, error } = await sb
            .from('appointments')
            .select('*, pets:pet_id(*)')
            .eq('tutor_id', user.id)
            .order('created_at', { ascending: false });
        if (error) {
            lista.innerHTML = `<p class="form-message show">${safe(error.message)}</p>`;
            return;
        }
        const itens = data || [];
        if (vazio) vazio.style.display = itens.length ? 'none' : 'block';
        lista.innerHTML = itens.map(row => `
            <article class="acompanhamento-card">
                <div class="acompanhamento-topo">
                    <div><span class="card-label">Animal</span><h3>${safe(row.pets?.nome || 'Pet')}</h3><p>${safe(row.pets?.especie || 'Espécie não informada')} • ${safe(row.servico || '')}</p></div>
                    <span class="status-badge">${safe(row.status || 'Aguardando análise')}</span>
                </div>
                <div class="acompanhamento-dados">
                    <p><i class="fas fa-calendar-plus"></i> Solicitado em: <strong>${new Date(row.created_at).toLocaleString('pt-BR')}</strong></p>
                    <p><i class="fas fa-rotate"></i> Última atualização: <strong>${new Date(row.updated_at || row.created_at).toLocaleString('pt-BR')}</strong></p>
                </div>
                <div class="acompanhamento-observacoes">
                    <strong>Observações do veterinário</strong>
                    <p>${safe(row.observacoes_veterinario || 'Ainda não há observações do veterinário.')}</p>
                </div>
            </article>
        `).join('');
    }

    document.addEventListener('DOMContentLoaded', async () => {
        instalarLogoutSupabase();
        await sincronizarSessaoLocal();
        await configurarLoginTutor();
        await configurarCadastroTutor();
        await configurarAgendamento();
        await configurarCadastroLoginVeterinario();
        await configurarArrecadacao();
        await configurarDashboardVeterinario();
        await configurarClinicasLocalidade();
        await configurarAcompanhamento();
    });
})();
