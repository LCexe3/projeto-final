const CHAVE_LOGADO = 'castraprev_logado';
const CHAVE_USUARIO = 'castraprev_usuario';
const CHAVE_USUARIO_EMAIL = 'castraprev_usuario_email';
const CHAVE_USUARIO_APELIDO = 'castraprev_usuario_apelido';
const CHAVE_TIPO_USUARIO = 'castraprev_tipo_usuario';
const CHAVE_USUARIOS = 'castraprev_usuarios';

function carregarUsuarios() {
    try {
        const usuariosSalvos = JSON.parse(localStorage.getItem(CHAVE_USUARIOS));
        return Array.isArray(usuariosSalvos) ? usuariosSalvos : [];
    } catch (erro) {
        console.warn('Não foi possível carregar os usuários salvos:', erro);
        return [];
    }
}

function salvarUsuarios(usuarios) {
    try {
        localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
        return true;
    } catch (erro) {
        console.warn('Não foi possível salvar os usuários:', erro);
        return false;
    }
}

function estaLogado() {
    return localStorage.getItem(CHAVE_LOGADO) === 'true';
}

function pegarUsuario() {
    return localStorage.getItem(CHAVE_USUARIO) || '';
}

function pegarApelidoUsuario() {
    return localStorage.getItem(CHAVE_USUARIO_APELIDO) || '';
}

function obterPrimeiroNome(nome = '') {
    return String(nome).trim().split(/\s+/)[0] || 'Usuário';
}

function obterApelidoUsuario(usuario = null) {
    return (usuario?.apelido || pegarApelidoUsuario() || obterPrimeiroNome(usuario?.nome || pegarUsuario())).trim();
}

function pegarEmailUsuario() {
    return localStorage.getItem(CHAVE_USUARIO_EMAIL) || '';
}

function pegarTipoUsuario() {
    return localStorage.getItem(CHAVE_TIPO_USUARIO) || 'tutor';
}

function nomeTipoUsuario(tipo = pegarTipoUsuario()) {
    return tipo === 'doador' ? 'Doador' : 'Tutor';
}

function salvarSessao(nome, tipo, email = '', apelido = '') {
    const apelidoFinal = (apelido || obterPrimeiroNome(nome)).trim();

    localStorage.setItem(CHAVE_LOGADO, 'true');
    localStorage.setItem(CHAVE_USUARIO, nome);
    localStorage.setItem(CHAVE_USUARIO_APELIDO, apelidoFinal);
    localStorage.setItem(CHAVE_TIPO_USUARIO, tipo || 'tutor');

    if (email) {
        localStorage.setItem(CHAVE_USUARIO_EMAIL, email);
    }
}

function sair() {
    localStorage.removeItem(CHAVE_LOGADO);
    localStorage.removeItem(CHAVE_USUARIO);
    localStorage.removeItem(CHAVE_USUARIO_EMAIL);
    localStorage.removeItem(CHAVE_USUARIO_APELIDO);
    localStorage.removeItem(CHAVE_TIPO_USUARIO);
    window.location.href = 'index.html';
}

function limparTexto(texto = '') {
    return String(texto)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function pegarPaginaAtual() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

function obterMarkupAvatar(usuario, classeExtra = '') {
    const classe = classeExtra ? ` ${classeExtra}` : '';
    const nome = limparTexto(usuario?.nome || obterApelidoUsuario(usuario) || 'Usuário CastraPrev');

    if (usuario?.fotoPerfil) {
        return `<span class="avatar-box${classe}"><img src="${usuario.fotoPerfil}" alt="Foto de perfil de ${nome}"></span>`;
    }

    return `<span class="avatar-box avatar-fallback${classe}"><i class="fas fa-user"></i></span>`;
}

function atualizarPreviewAvatarPerfil(fotoPerfil = '', nome = '') {
    ['perfil-resumo-avatar', 'perfil-foto-preview'].forEach(id => {
        const avatar = document.getElementById(id);
        if (avatar) {
            avatar.innerHTML = obterMarkupAvatar({ fotoPerfil, nome });
        }
    });
}

function atualizarPreviewFotoCadastro(fotoPerfil = '') {
    const preview = document.getElementById('cadastro-foto-preview');
    if (!preview) return;

    if (fotoPerfil) {
        preview.innerHTML = `<img src="${fotoPerfil}" alt="Prévia da foto de perfil">`;
    } else {
        preview.innerHTML = '<i class="fas fa-user"></i>';
    }
}

function converterImagemPerfilParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
        if (!arquivo) {
            resolve('');
            return;
        }

        if (!arquivo.type.startsWith('image/')) {
            reject(new Error('arquivo-invalido'));
            return;
        }

        const leitor = new FileReader();

        leitor.onload = function (evento) {
            const imagemOriginal = evento.target?.result || '';
            const imagem = new Image();

            imagem.onload = function () {
                const tamanhoMaximo = 520;
                const proporcao = Math.min(1, tamanhoMaximo / Math.max(imagem.width, imagem.height));
                const largura = Math.max(1, Math.round(imagem.width * proporcao));
                const altura = Math.max(1, Math.round(imagem.height * proporcao));

                const canvas = document.createElement('canvas');
                canvas.width = largura;
                canvas.height = altura;

                const contexto = canvas.getContext('2d');
                contexto.drawImage(imagem, 0, 0, largura, altura);

                resolve(canvas.toDataURL('image/jpeg', 0.86));
            };

            imagem.onerror = function () {
                resolve(imagemOriginal);
            };

            imagem.src = imagemOriginal;
        };

        leitor.onerror = function () {
            reject(new Error('erro-leitura'));
        };

        leitor.readAsDataURL(arquivo);
    });
}


function pegarUsuarioLogadoCompleto() {
    const usuarios = carregarUsuarios();
    const emailSessao = pegarEmailUsuario().toLowerCase();
    const nomeSessao = pegarUsuario().toLowerCase();

    let usuario = null;

    if (emailSessao) {
        usuario = usuarios.find(item => (item.email || '').toLowerCase() === emailSessao);
    }

    if (!usuario && nomeSessao) {
        usuario = usuarios.find(item => (item.nome || '').toLowerCase() === nomeSessao);
    }

    return usuario || null;
}

function formatarTelefoneCampo(campo) {
    if (!campo) return;

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
}

function formatarCepCampo(campo) {
    if (!campo) return;

    let valor = campo.value.replace(/\D/g, '').slice(0, 8);

    if (valor.length > 5) {
        valor = valor.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
    }

    campo.value = valor;
}

function definirStatusCep(prefixo, mensagem = '', tipo = '') {
    const status = document.getElementById(`${prefixo}-cep-status`);
    if (!status) return;

    status.textContent = mensagem;
    status.classList.remove('sucesso', 'erro');

    if (tipo) {
        status.classList.add(tipo);
    }
}

function preencherCampoEndereco(id, valor) {
    const campo = document.getElementById(id);
    if (campo && valor) {
        campo.value = valor;
        campo.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

async function buscarEnderecoPorCep(campoCep) {
    if (!campoCep) return;

    const cepLimpo = campoCep.value.replace(/\D/g, '');
    const prefixo = campoCep.id.startsWith('perfil-') ? 'perfil' : 'cadastro';

    if (cepLimpo.length < 8) {
        definirStatusCep(prefixo);
        campoCep.dataset.ultimoCepBuscado = '';
        return;
    }

    if (campoCep.dataset.ultimoCepBuscado === cepLimpo) return;

    campoCep.dataset.ultimoCepBuscado = cepLimpo;
    definirStatusCep(prefixo, 'Buscando endereço pelo CEP...', '');

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

        if (!resposta.ok) {
            throw new Error('falha-na-busca');
        }

        const dados = await resposta.json();

        if (dados.erro) {
            throw new Error('cep-nao-encontrado');
        }

        preencherCampoEndereco(`${prefixo}-endereco`, dados.logradouro || '');
        preencherCampoEndereco(`${prefixo}-bairro`, dados.bairro || '');
        preencherCampoEndereco(`${prefixo}-cidade`, dados.localidade || '');
        preencherCampoEndereco(`${prefixo}-uf`, dados.uf || '');

        definirStatusCep(prefixo, 'Endereço encontrado automaticamente. Confira o número e o complemento.', 'sucesso');

        const campoNumero = document.getElementById(`${prefixo}-numero`);
        if (campoNumero && !campoNumero.value) {
            campoNumero.focus();
        }
    } catch (erro) {
        campoCep.dataset.ultimoCepBuscado = '';
        definirStatusCep(prefixo, 'CEP não encontrado. Confira os números ou preencha o endereço manualmente.', 'erro');
    }
}

function configurarMascarasAuth() {
    document.querySelectorAll('[data-telefone-mask]').forEach(campo => {
        campo.addEventListener('input', () => formatarTelefoneCampo(campo));
    });

    document.querySelectorAll('[data-cep-mask]').forEach(campo => {
        let tempoBuscaCep;

        campo.addEventListener('input', () => {
            formatarCepCampo(campo);
            clearTimeout(tempoBuscaCep);
            tempoBuscaCep = setTimeout(() => buscarEnderecoPorCep(campo), 450);
        });

        campo.addEventListener('blur', () => buscarEnderecoPorCep(campo));
    });
}

function atualizarAreaLogin() {
    const areaLogin = document.getElementById('area-login');
    if (!areaLogin) return;

    if (estaLogado()) {
        const usuarioCompleto = pegarUsuarioLogadoCompleto();
        const nome = usuarioCompleto?.nome || pegarUsuario();
        const apelido = obterApelidoUsuario(usuarioCompleto);
        const tipo = usuarioCompleto?.tipo || pegarTipoUsuario();

        areaLogin.innerHTML = `
            <a href="perfil.html" class="usuario-logado" title="${limparTexto(nome)} - ${nomeTipoUsuario(tipo)}">
                ${obterMarkupAvatar(usuarioCompleto, 'avatar-mini')}
                <span class="usuario-texto"><strong>Olá, ${limparTexto(apelido)}</strong><small>${nomeTipoUsuario(tipo)}</small></span>
            </a>
            <button type="button" class="btn-sair" onclick="sair()">Sair</button>
        `;
    } else {
        areaLogin.innerHTML = `
            <a href="login.html" class="btn-login"><i class="fas fa-user"></i> Entrar</a>
        `;
    }
}

function controlarConteudoRestrito() {
    const somenteLogado = document.querySelectorAll('.somente-logado');
    const somenteVisitante = document.querySelectorAll('.somente-visitante');

    somenteLogado.forEach(item => {
        item.style.display = estaLogado() ? '' : 'none';
    });

    somenteVisitante.forEach(item => {
        item.style.display = estaLogado() ? 'none' : '';
    });
}

function protegerLinksDeAgendamento() {
    const linksProtegidos = document.querySelectorAll('[data-requer-login]');

    linksProtegidos.forEach(link => {
        link.addEventListener('click', function (event) {
            if (!estaLogado()) {
                event.preventDefault();
                const destino = link.getAttribute('href') || 'agendamento.html';
                window.location.href = `login.html?from=${encodeURIComponent(destino)}`;
            }
        });
    });
}

function mostrarAbaAcesso(aba) {
    const botoes = document.querySelectorAll('[data-auth-tab]');
    const secoes = document.querySelectorAll('[data-auth-section]');

    botoes.forEach(botao => {
        botao.classList.toggle('active', botao.dataset.authTab === aba);
    });

    secoes.forEach(secao => {
        secao.classList.toggle('active', secao.dataset.authSection === aba);
    });
}

function configurarAbasAcesso() {
    const botoes = document.querySelectorAll('[data-auth-tab]');
    if (!botoes.length) return;

    botoes.forEach(botao => {
        botao.addEventListener('click', () => mostrarAbaAcesso(botao.dataset.authTab));
    });

    const parametros = new URLSearchParams(window.location.search);
    if (parametros.get('tab') === 'cadastro') {
        mostrarAbaAcesso('cadastro');
    }
}

function configurarFormularioLogin() {
    const formLogin = document.getElementById('form-login');
    if (!formLogin) return;

    formLogin.addEventListener('submit', function (event) {
        event.preventDefault();

        const identificacao = document.getElementById('login-identificacao').value.trim().toLowerCase();
        const senha = document.getElementById('login-senha').value.trim();
        const erro = document.getElementById('erro-login');
        const usuarios = carregarUsuarios();

        const usuarioEncontrado = usuarios.find(usuario => {
            const mesmoEmail = (usuario.email || '').toLowerCase() === identificacao;
            const mesmoNome = (usuario.nome || '').toLowerCase() === identificacao;
            const mesmoApelido = (usuario.apelido || '').toLowerCase() === identificacao;
            return (mesmoEmail || mesmoNome || mesmoApelido) && usuario.senha === senha;
        });

        if (!usuarioEncontrado) {
            erro.textContent = 'Cadastro não encontrado. Confira os dados ou crie uma conta.';
            return;
        }

        erro.textContent = '';
        salvarSessao(usuarioEncontrado.nome, usuarioEncontrado.tipo, usuarioEncontrado.email, usuarioEncontrado.apelido);

        const parametros = new URLSearchParams(window.location.search);
        const destino = parametros.get('from') || 'agendamento.html';
        window.location.href = destino;
    });
}

function configurarFormularioCadastro() {
    const formCadastro = document.getElementById('form-cadastro');
    if (!formCadastro) return;

    const inputFotoCadastro = document.getElementById('cadastro-foto');
    const erroCadastro = document.getElementById('erro-cadastro');
    let fotoPerfilCadastro = '';

    if (inputFotoCadastro) {
        inputFotoCadastro.addEventListener('change', async function () {
            const arquivo = inputFotoCadastro.files && inputFotoCadastro.files[0];

            if (!arquivo) {
                fotoPerfilCadastro = '';
                atualizarPreviewFotoCadastro('');
                return;
            }

            try {
                fotoPerfilCadastro = await converterImagemPerfilParaBase64(arquivo);
                atualizarPreviewFotoCadastro(fotoPerfilCadastro);
                if (erroCadastro) erroCadastro.textContent = '';
            } catch (erro) {
                fotoPerfilCadastro = '';
                atualizarPreviewFotoCadastro('');
                inputFotoCadastro.value = '';
                if (erroCadastro) erroCadastro.textContent = 'Escolha um arquivo de imagem válido para a foto de perfil.';
            }
        });
    }

    formCadastro.addEventListener('submit', async function (event) {
        event.preventDefault();

        const nome = document.getElementById('cadastro-nome').value.trim();
        const apelido = document.getElementById('cadastro-apelido')?.value.trim() || obterPrimeiroNome(nome);
        const email = document.getElementById('cadastro-email').value.trim().toLowerCase();
        const telefone = document.getElementById('cadastro-telefone')?.value.trim() || '';
        const cep = document.getElementById('cadastro-cep')?.value.trim() || '';
        const endereco = document.getElementById('cadastro-endereco')?.value.trim() || '';
        const numero = document.getElementById('cadastro-numero')?.value.trim() || '';
        const bairro = document.getElementById('cadastro-bairro')?.value.trim() || '';
        const complemento = document.getElementById('cadastro-complemento')?.value.trim() || '';
        const cidade = document.getElementById('cadastro-cidade')?.value.trim() || '';
        const uf = document.getElementById('cadastro-uf')?.value.trim() || '';
        const senha = document.getElementById('cadastro-senha').value.trim();
        const tipoSelecionado = document.querySelector('input[name="cadastro-tipo"]:checked');
        const erro = erroCadastro || document.getElementById('erro-cadastro');

        if (inputFotoCadastro?.files?.[0] && !fotoPerfilCadastro) {
            try {
                fotoPerfilCadastro = await converterImagemPerfilParaBase64(inputFotoCadastro.files[0]);
                atualizarPreviewFotoCadastro(fotoPerfilCadastro);
            } catch (erroImagem) {
                fotoPerfilCadastro = '';
                if (erro) erro.textContent = 'Escolha um arquivo de imagem válido para a foto de perfil.';
                return;
            }
        }

        if (nome.length < 3) {
            erro.textContent = 'Digite um nome com pelo menos 3 letras.';
            return;
        }

        if (apelido.length < 2) {
            erro.textContent = 'Digite um apelido com pelo menos 2 letras. Esse nome aparecerá no topo do site.';
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            erro.textContent = 'Digite um e-mail válido.';
            return;
        }

        if (cep.replace(/\D/g, '').length !== 8) {
            erro.textContent = 'Digite um CEP válido com 8 números.';
            return;
        }

        if (!endereco || !numero || !bairro || !cidade || !uf) {
            erro.textContent = 'Preencha o endereço completo: endereço, número, bairro, cidade, UF e CEP.';
            return;
        }

        if (senha.length < 4) {
            erro.textContent = 'A senha precisa ter pelo menos 4 caracteres.';
            return;
        }

        if (!tipoSelecionado) {
            erro.textContent = 'Escolha se você é tutor ou doador.';
            return;
        }

        const usuarios = carregarUsuarios();
        const emailJaExiste = usuarios.some(usuario => (usuario.email || '').toLowerCase() === email);

        if (emailJaExiste) {
            erro.textContent = 'Este e-mail já foi cadastrado. Use a área de login.';
            return;
        }

        const novoUsuario = {
            id: Date.now(),
            nome,
            apelido,
            email,
            telefone,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            uf,
            complemento,
            fotoPerfil: fotoPerfilCadastro,
            senha,
            tipo: tipoSelecionado.value,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString()
        };

        usuarios.push(novoUsuario);

        if (!salvarUsuarios(usuarios)) {
            erro.textContent = 'Não foi possível salvar o cadastro. Tente usar uma foto menor ou limpe o armazenamento do navegador.';
            return;
        }

        salvarSessao(nome, novoUsuario.tipo, email, apelido);

        const parametros = new URLSearchParams(window.location.search);
        const destino = parametros.get('from') || 'agendamento.html';
        window.location.href = destino;
    });
}

function preencherDadosDoUsuarioLogado() {
    if (!estaLogado()) return;

    const usuarioCompleto = pegarUsuarioLogadoCompleto();
    const nome = usuarioCompleto?.nome || pegarUsuario();
    const tipo = usuarioCompleto?.tipo || pegarTipoUsuario();

    const resumo = document.getElementById('resumo-usuario-logado');
    if (resumo) {
        resumo.textContent = `Login confirmado: ${nome} (${nomeTipoUsuario(tipo)}). Escolha abaixo se deseja solicitar atendimento para um animal ou realizar uma doação.`;
    }

    const preenchimentos = {
        '[data-preencher-nome]': usuarioCompleto?.nome || nome,
        '[data-preencher-apelido]': obterApelidoUsuario(usuarioCompleto),
        '[data-preencher-email]': usuarioCompleto?.email || '',
        '[data-preencher-telefone]': usuarioCompleto?.telefone || '',
        '[data-preencher-endereco]': usuarioCompleto?.endereco || '',
        '[data-preencher-cep]': usuarioCompleto?.cep || '',
        '[data-preencher-numero]': usuarioCompleto?.numero || '',
        '[data-preencher-bairro]': usuarioCompleto?.bairro || '',
        '[data-preencher-cidade]': usuarioCompleto?.cidade || '',
        '[data-preencher-uf]': usuarioCompleto?.uf || ''
    };

    Object.entries(preenchimentos).forEach(([seletor, valor]) => {
        document.querySelectorAll(seletor).forEach(campo => {
            if (!campo.value && valor) {
                campo.value = valor;
            }
        });
    });

    const seletorTipo = document.getElementById('tipo-atendimento');
    if (seletorTipo) {
        seletorTipo.value = tipo;
        seletorTipo.dispatchEvent(new Event('change'));
    }
}

function preencherResumoPerfil(usuario) {
    const nomeResumo = document.getElementById('perfil-resumo-nome');
    const apelidoResumo = document.getElementById('perfil-resumo-apelido');
    const tipoResumo = document.getElementById('perfil-resumo-tipo');
    const emailResumo = document.getElementById('perfil-resumo-email');
    const telefoneResumo = document.getElementById('perfil-resumo-telefone');
    const enderecoResumo = document.getElementById('perfil-resumo-endereco');

    const apelido = obterApelidoUsuario(usuario);

    if (nomeResumo) nomeResumo.textContent = usuario.nome || 'Usuário CastraPrev';
    if (apelidoResumo) apelidoResumo.textContent = `@${apelido}`;
    if (tipoResumo) tipoResumo.textContent = nomeTipoUsuario(usuario.tipo);
    if (emailResumo) emailResumo.textContent = usuario.email || 'E-mail não informado';
    if (telefoneResumo) telefoneResumo.textContent = usuario.telefone || 'Telefone não informado';

    const partesEndereco = [
        usuario.endereco,
        usuario.numero ? `Nº ${usuario.numero}` : '',
        usuario.bairro,
        usuario.cidade,
        usuario.uf,
        usuario.cep ? `CEP ${usuario.cep}` : ''
    ].filter(Boolean).join(', ');

    if (enderecoResumo) enderecoResumo.textContent = partesEndereco || 'Endereço ainda não informado';
    atualizarPreviewAvatarPerfil(usuario.fotoPerfil || '', usuario.nome || 'Usuário CastraPrev');
}

function configurarPerfilUsuario() {
    const formPerfil = document.getElementById('form-perfil');
    if (!formPerfil) return;

    const mensagem = document.getElementById('mensagem-perfil');
    const erro = document.getElementById('erro-perfil');
    const usuarioLogado = pegarUsuarioLogadoCompleto();

    if (!usuarioLogado) {
        if (erro) erro.textContent = 'Não encontrei os dados do seu cadastro. Saia e entre novamente para atualizar a sessão.';
        return;
    }

    preencherResumoPerfil(usuarioLogado);

    document.getElementById('perfil-nome').value = usuarioLogado.nome || '';
    document.getElementById('perfil-apelido').value = obterApelidoUsuario(usuarioLogado);
    document.getElementById('perfil-email').value = usuarioLogado.email || '';
    document.getElementById('perfil-telefone').value = usuarioLogado.telefone || '';
    document.getElementById('perfil-tipo').value = usuarioLogado.tipo || 'tutor';
    document.getElementById('perfil-cep').value = usuarioLogado.cep || '';
    document.getElementById('perfil-uf').value = usuarioLogado.uf || '';
    document.getElementById('perfil-endereco').value = usuarioLogado.endereco || '';
    document.getElementById('perfil-numero').value = usuarioLogado.numero || '';
    document.getElementById('perfil-bairro').value = usuarioLogado.bairro || '';
    document.getElementById('perfil-cidade').value = usuarioLogado.cidade || '';
    document.getElementById('perfil-complemento').value = usuarioLogado.complemento || '';

    const campoNome = document.getElementById('perfil-nome');
    const campoApelido = document.getElementById('perfil-apelido');
    const inputFoto = document.getElementById('perfil-foto');
    const botaoRemoverFoto = document.getElementById('perfil-remover-foto');
    let fotoPerfilAtual = usuarioLogado.fotoPerfil || '';
    let promessaFotoPerfil = Promise.resolve(fotoPerfilAtual);

    atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value || usuarioLogado.nome || 'Usuário CastraPrev');

    if (campoNome) {
        campoNome.addEventListener('input', function () {
            atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value.trim() || 'Usuário CastraPrev');
        });
    }

    if (campoApelido) {
        campoApelido.addEventListener('input', function () {
            const apelidoResumo = document.getElementById('perfil-resumo-apelido');
            if (apelidoResumo) {
                apelidoResumo.textContent = `@${campoApelido.value.trim() || obterPrimeiroNome(campoNome.value)}`;
            }
        });
    }

    if (inputFoto) {
        inputFoto.addEventListener('change', function () {
            const arquivo = inputFoto.files && inputFoto.files[0];
            if (!arquivo) return;

            if (!arquivo.type.startsWith('image/')) {
                if (erro) erro.textContent = 'Escolha um arquivo de imagem válido para a foto de perfil.';
                inputFoto.value = '';
                return;
            }

            promessaFotoPerfil = converterImagemPerfilParaBase64(arquivo)
                .then(function (imagemConvertida) {
                    fotoPerfilAtual = imagemConvertida;
                    atualizarPreviewAvatarPerfil(fotoPerfilAtual, campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
                    if (erro) erro.textContent = '';
                    return fotoPerfilAtual;
                })
                .catch(function () {
                    fotoPerfilAtual = '';
                    inputFoto.value = '';
                    atualizarPreviewAvatarPerfil('', campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
                    if (erro) erro.textContent = 'Não foi possível carregar essa imagem. Escolha outra foto menor.';
                    return '';
                });
        });
    }

    if (botaoRemoverFoto) {
        botaoRemoverFoto.addEventListener('click', function () {
            fotoPerfilAtual = '';
            promessaFotoPerfil = Promise.resolve('');
            if (inputFoto) inputFoto.value = '';
            atualizarPreviewAvatarPerfil('', campoNome.value.trim() || usuarioLogado.nome || 'Usuário CastraPrev');
            if (erro) erro.textContent = '';
        });
    }

    formPerfil.addEventListener('submit', async function (event) {
        event.preventDefault();

        fotoPerfilAtual = await promessaFotoPerfil;

        const nome = document.getElementById('perfil-nome').value.trim();
        const apelido = document.getElementById('perfil-apelido').value.trim();
        const email = document.getElementById('perfil-email').value.trim().toLowerCase();
        const telefone = document.getElementById('perfil-telefone').value.trim();
        const tipo = document.getElementById('perfil-tipo').value;
        const cep = document.getElementById('perfil-cep').value.trim();
        const uf = document.getElementById('perfil-uf').value.trim();
        const endereco = document.getElementById('perfil-endereco').value.trim();
        const numero = document.getElementById('perfil-numero').value.trim();
        const bairro = document.getElementById('perfil-bairro').value.trim();
        const cidade = document.getElementById('perfil-cidade').value.trim();
        const complemento = document.getElementById('perfil-complemento').value.trim();
        const senhaAtual = document.getElementById('perfil-senha-atual').value.trim();
        const novaSenha = document.getElementById('perfil-nova-senha').value.trim();
        const confirmarSenha = document.getElementById('perfil-confirmar-senha').value.trim();

        if (erro) erro.textContent = '';
        if (mensagem) {
            mensagem.textContent = '';
            mensagem.classList.remove('show');
        }

        if (nome.length < 3) {
            if (erro) erro.textContent = 'Digite um nome com pelo menos 3 letras.';
            return;
        }

        if (apelido.length < 2) {
            if (erro) erro.textContent = 'Digite um apelido com pelo menos 2 letras. Esse nome aparecerá no topo do site.';
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            if (erro) erro.textContent = 'Digite um e-mail válido.';
            return;
        }

        if (cep.replace(/\D/g, '').length !== 8) {
            if (erro) erro.textContent = 'Digite um CEP válido com 8 números.';
            return;
        }

        if (!endereco || !numero || !bairro || !cidade || !uf) {
            if (erro) erro.textContent = 'Preencha o endereço completo: endereço, número, bairro, cidade, UF e CEP.';
            return;
        }

        const usuarios = carregarUsuarios();
        const indiceUsuario = usuarios.findIndex(usuario => {
            if (usuarioLogado.email) {
                return (usuario.email || '').toLowerCase() === usuarioLogado.email.toLowerCase();
            }
            return usuario.id === usuarioLogado.id;
        });

        if (indiceUsuario === -1) {
            if (erro) erro.textContent = 'Não foi possível localizar seu cadastro para salvar as alterações.';
            return;
        }

        const emailJaExiste = usuarios.some((usuario, indice) => {
            return indice !== indiceUsuario && (usuario.email || '').toLowerCase() === email;
        });

        if (emailJaExiste) {
            if (erro) erro.textContent = 'Este e-mail já está sendo usado em outro cadastro.';
            return;
        }

        let senhaFinal = usuarios[indiceUsuario].senha;

        if (novaSenha || confirmarSenha || senhaAtual) {
            if (senhaAtual !== usuarios[indiceUsuario].senha) {
                if (erro) erro.textContent = 'Para trocar a senha, digite sua senha atual corretamente.';
                return;
            }

            if (novaSenha.length < 4) {
                if (erro) erro.textContent = 'A nova senha precisa ter pelo menos 4 caracteres.';
                return;
            }

            if (novaSenha !== confirmarSenha) {
                if (erro) erro.textContent = 'A confirmação da nova senha não confere.';
                return;
            }

            senhaFinal = novaSenha;
        }

        const usuarioAtualizado = {
            ...usuarios[indiceUsuario],
            nome,
            apelido,
            email,
            telefone,
            tipo,
            cep,
            endereco,
            numero,
            bairro,
            cidade,
            uf,
            complemento,
            fotoPerfil: fotoPerfilAtual,
            senha: senhaFinal,
            atualizadoEm: new Date().toISOString()
        };

        usuarios[indiceUsuario] = usuarioAtualizado;

        if (!salvarUsuarios(usuarios)) {
            if (erro) erro.textContent = 'Não foi possível salvar o perfil. Tente usar uma foto menor ou limpe o armazenamento do navegador.';
            return;
        }

        salvarSessao(usuarioAtualizado.nome, usuarioAtualizado.tipo, usuarioAtualizado.email, usuarioAtualizado.apelido);
        preencherResumoPerfil(usuarioAtualizado);
        atualizarAreaLogin();

        document.getElementById('perfil-senha-atual').value = '';
        document.getElementById('perfil-nova-senha').value = '';
        document.getElementById('perfil-confirmar-senha').value = '';

        if (mensagem) {
            mensagem.textContent = 'Perfil atualizado com sucesso! Seus novos dados já foram salvos.';
            mensagem.classList.add('show');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const paginaProtegida = document.body.dataset.protegida === 'true';

    if (paginaProtegida && !estaLogado()) {
        const paginaAtual = pegarPaginaAtual();
        window.location.href = `login.html?from=${encodeURIComponent(paginaAtual)}`;
        return;
    }

    atualizarAreaLogin();
    controlarConteudoRestrito();
    protegerLinksDeAgendamento();
    configurarAbasAcesso();
    configurarMascarasAuth();
    configurarFormularioLogin();
    configurarFormularioCadastro();
    preencherDadosDoUsuarioLogado();
    configurarPerfilUsuario();
});
