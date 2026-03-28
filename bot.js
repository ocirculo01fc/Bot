require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    Events,
    MessageFlags,
    PermissionsBitField
} = require("discord.js");

const { createClient } = require("@supabase/supabase-js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ====================== FUNÇÕES AUXILIARES ======================
function isAdmin(member) {
    return member.roles.cache.some(role => role.name === "Admin" || role.name === "ADM");
}

// ====================== COMANDOS ======================
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // ====================== !perfil ======================
    if (message.content === "!perfil") {
        if (message.channel.id !== process.env.ID_CANAL_PERFIL) {
            return message.reply({
                content: "❌ Este comando só pode ser usado no canal de **Perfil**.",
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`ver_perfil_${message.author.id}`)
                .setLabel("Ver Meu Perfil")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("👤")
        );

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("👤 Meu Perfil")
            .setDescription("Clique no botão abaixo para visualizar seu perfil e saldo de coins.")
            .setFooter({ text: "Sistema de Coins • Gerencie seu saldo" });

        return message.reply({ embeds: [embed], components: [row] });
    }

    // ====================== !criarDiario / !diarios ======================
    if (message.content === "!criarDiario" || message.content === "!diarios") {
        if (message.channel.id !== process.env.ID_CANAL_DIARIOS) {
            return message.reply({
                content: "❌ Este comando só pode ser usado no canal de **Diários**.",
                flags: MessageFlags.Ephemeral
            });
        }
        if (!isAdmin(message.member)) {
            return message.reply({
                content: "❌ Apenas **Administradores** podem criar diários.",
                flags: MessageFlags.Ephemeral
            });
        }

        const modoMenu = new StringSelectMenuBuilder()
            .setCustomId("diario_modo")
            .setPlaceholder("Escolha o modo do diário")
            .addOptions([
                { label: "👤 Solo", value: "solo" },
                { label: "👥 Duo", value: "duo" },
                { label: "👥👥 Squad", value: "squad" }
            ]);

        const row = new ActionRowBuilder().addComponents(modoMenu);

        const embed = new EmbedBuilder()
            .setColor(0xffaa00)
            .setTitle("🗓️ Criar Novo Diário")
            .setDescription("Selecione o **modo** do diário:");

        return message.reply({ embeds: [embed], components: [row] });
    }

    // ====================== !criarAP ======================
    if (message.content === "!criarAP") {
        if (message.channel.id !== process.env.ID_CANAL_AP) {
            return message.reply({
                content: "❌ Este comando só pode ser usado no canal de **Apostas**.",
                flags: MessageFlags.Ephemeral
            });
        }
        if (!isAdmin(message.member)) {
            return message.reply({
                content: "❌ Apenas **Administradores** podem criar apostas.",
                flags: MessageFlags.Ephemeral
            });
        }

        const modoMenu = new StringSelectMenuBuilder()
            .setCustomId("ap_modo")
            .setPlaceholder("Escolha o modo da aposta")
            .addOptions([
                { label: "👤 Solo", value: "solo" },
                { label: "👥 Duo", value: "duo" },
                { label: "👥👥 Squad", value: "squad" }
            ]);

        const row = new ActionRowBuilder().addComponents(modoMenu);

        const embed = new EmbedBuilder()
            .setColor(0xffaa00)
            .setTitle("⚔️ Criar Nova Aposta")
            .setDescription("Selecione o **modo** da aposta:");

        return message.reply({ embeds: [embed], components: [row] });
    }
});

// ====================== INTERACTIONS ======================
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    try {
        // ====================== VER PERFIL ======================
        if (interaction.isButton() && interaction.customId.startsWith("ver_perfil_")) {
            const targetId = interaction.customId.split("_")[2];

            if (interaction.user.id !== targetId) {
                return interaction.reply({
                    content: "❌ Você só pode ver o seu próprio perfil!",
                    flags: MessageFlags.Ephemeral
                });
            }

            const { data: user } = await supabase
                .from("usuarios")
                .select("coins")
                .eq("discord_id", targetId)
                .maybeSingle();

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`👤 Perfil de ${interaction.user.username}`)
                .addFields(
                    { name: "🆔 Discord ID", value: targetId, inline: true },
                    { name: "💰 Saldo Atual", value: `${user ? user.coins : 0} coins`, inline: true }
                )
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("abrir_menu_recarga")
                    .setLabel("💰 Fazer Recarga")
                    .setStyle(ButtonStyle.Success)
                    .setEmoji("💎")
            );

            return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
        }

        // ====================== RECARGA (NOVO - AGORA FUNCIONA) ======================
      if (interaction.isButton() && interaction.customId === "abrir_menu_recarga") {

    const { EmbedBuilder, AttachmentBuilder, MessageFlags } = require("discord.js");

    // QR Code PIX (coloque o arquivo dentro da pasta do bot)
    const qrCode = new AttachmentBuilder("./qrcode_pix.png");

    const embedRecarga = new EmbedBuilder()
        .setColor("#00ff88")
        .setTitle("💰 Central de Recarga")
        .setDescription(
            `### 💳 Pagamento via PIX\n` +
            `🔑 **Chave PIX:**\n` +
            `\`${process.env.CHAVE_PIX || "Não configurada"}\`\n\n` +

            `📩 Após pagar:\n` +
            `Envie o comprovante para ${process.env.ADM_MENTION || "<@SEU_ID_AQUI>"}\n\n` +

            `⚡ Seu saldo será adicionado rapidamente!`
        )
        .setThumbnail("attachment://qrcode_pix.png")
        .setFooter({
            text: "Sistema automático de recarga • Atendimento rápido"
        })
        .setTimestamp();

    return interaction.reply({
        content: `${process.env.ADM_MENTION || "<@SEU_ID_AQUI>"}`,
        embeds: [embedRecarga],
        files: [qrCode],
        flags: MessageFlags.Ephemeral
    });
}

        // ====================== DIÁRIOS (mantido exatamente como estava) ======================
        if (interaction.isStringSelectMenu() && interaction.customId === "diario_modo") {
            const modo = interaction.values[0];

            const plataformaMenu = new StringSelectMenuBuilder()
                .setCustomId(`diario_plataforma_${modo}`)
                .setPlaceholder("Escolha a plataforma")
                .addOptions([
                    { label: "📱 Mobile", value: "mobile" },
                    { label: "💻 Emulador", value: "emulador" },
                    { label: "🔀 Misto", value: "misto" }
                ]);

            const row = new ActionRowBuilder().addComponents(plataformaMenu);

            const embed = new EmbedBuilder()
                .setColor(0xffaa00)
                .setTitle(`🗓️ Novo Diário - ${modo.toUpperCase()}`)
                .setDescription("Escolha a **plataforma** do diário:");

            return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
        }

        if (interaction.isStringSelectMenu() && interaction.customId.startsWith("diario_plataforma_")) {
            const modo = interaction.customId.split("_")[2];
            const plataforma = interaction.values[0];

            const maxInscritos = modo === "solo" ? 48 : modo === "duo" ? 24 : 12;

            const modal = new ModalBuilder()
                .setCustomId(`diario_modal_${plataforma}_${modo}`)
                .setTitle("📅 Criar Novo Diário");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("hora").setLabel("Hora (ex: 19:00)").setStyle(TextInputStyle.Short).setPlaceholder("19:00").setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("titulo").setLabel("Título do Diário").setStyle(TextInputStyle.Short).setPlaceholder("Ranqueada Heroico").setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("regras").setLabel("Regras").setStyle(TextInputStyle.Paragraph).setPlaceholder("• Sem camp\n• Sem rush base\n• Respeito mútuo").setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("valor").setLabel("Valor em Coins").setStyle(TextInputStyle.Short).setPlaceholder("50").setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("max_inscritos").setLabel("Máximo de Inscritos").setStyle(TextInputStyle.Short).setValue(maxInscritos.toString()).setRequired(true)
                )
            );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith("diario_modal_")) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const [, , plataforma, modo] = interaction.customId.split("_");

            const hora = interaction.fields.getTextInputValue("hora").trim();
            const titulo = interaction.fields.getTextInputValue("titulo").trim();
            const regras = interaction.fields.getTextInputValue("regras").trim();
            const valor = parseInt(interaction.fields.getTextInputValue("valor"));
            const maxInscritos = parseInt(interaction.fields.getTextInputValue("max_inscritos"));

            if (isNaN(valor) || valor <= 0 || isNaN(maxInscritos) || maxInscritos <= 0) {
                return interaction.editReply({ content: "❌ Valores numéricos inválidos!" });
            }

  const categoriaId = process.env.CATEGORIA_DIARIOS;

const nomeCanal = `diario-${modo}-${hora.replace(/:/g, "h")}-${plataforma}`;

const canalPrivado = await interaction.guild.channels.create({
    name: nomeCanal,
    type: ChannelType.GuildText,
    parent: categoriaId, // define categoria automaticamente

    permissionOverwrites: [
        {
            id: interaction.guild.id,
            deny: ["ViewChannel"]
        },
        {
            id: interaction.user.id,
            allow: ["ViewChannel", "SendMessages", "ManageMessages"]
        }
    ]
});

            const { data: diario, error } = await supabase
                .from("diarios")
                .insert([{
                    discord_id: interaction.user.id,
                    criador_nome: interaction.user.username,
                    plataforma,
                    tipo: modo,
                    hora,
                    titulo,
                    regras,
                    valor,
                    max_inscritos: maxInscritos,
                    canal_id: canalPrivado.id,
                    status: "ativo",
                    criado_em: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error("Erro ao criar diário:", error);
                await canalPrivado.delete().catch(() => {});
                return interaction.editReply({ content: "❌ Erro ao salvar no banco de dados." });
            }

            const canalPublicoId = process.env[`ID_DIARIO_${plataforma.toUpperCase()}`];
            if (canalPublicoId) {
                const canalPublico = interaction.guild.channels.cache.get(canalPublicoId);
                if (canalPublico) {
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`inscrever_${diario.id}`)
                            .setLabel("✅ Inscrever-se")
                            .setStyle(ButtonStyle.Success)
                    );

                    const embed = new EmbedBuilder()
                        .setColor(0x00ff88)
                        .setTitle(`🗓️ Novo Diário - ${plataforma.toUpperCase()} | ${modo.toUpperCase()}`)
                        .setDescription(`**${titulo}**\n\n**Hora:** ${hora}\n**Valor:** ${valor} coins\n**Vagas:** ${maxInscritos}\n\n**Regras:**\n${regras}`)
                        .setFooter({ text: `Criado por ${interaction.user.username}` });

                    await canalPublico.send({ embeds: [embed], components: [row] });
                }
            }

            const rowIniciar = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`iniciar_diario_${diario.id}`)
                    .setLabel("🚀 Iniciar Diário")
                    .setStyle(ButtonStyle.Success)
            );

            const embedPrivado = new EmbedBuilder()
                .setColor(0x00ff88)
                .setTitle(`📌 ${titulo}`)
                .setDescription(
                    `**Modo:** ${modo.toUpperCase()}\n` +
                    `**Plataforma:** ${plataforma.toUpperCase()}\n` +
                    `**Hora:** ${hora}\n` +
                    `**Valor:** ${valor} coins\n\n` +
                    `**Regras:**\n${regras}\n\n` +
                    `Aguardando o Admin iniciar o diário...`
                );

            await canalPrivado.send({ embeds: [embedPrivado], components: [rowIniciar] });

            await interaction.editReply({
                content: `✅ Diário criado com sucesso!\n**Canal privado:** ${canalPrivado}`
            });
        }

        // ====================== INICIAR DIÁRIO ======================
        if (interaction.isButton() && interaction.customId.startsWith("iniciar_diario_")) {
            if (!isAdmin(interaction.member)) {
                return interaction.reply({
                    content: "❌ Apenas **Administradores** podem iniciar o diário.",
                    flags: MessageFlags.Ephemeral
                });
            }

            const diarioId = interaction.customId.split("_")[2];

            const modal = new ModalBuilder()
                .setCustomId(`modal_iniciar_${diarioId}`)
                .setTitle("🚀 Iniciar Diário");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("id_sala").setLabel("ID da Sala").setStyle(TextInputStyle.Short).setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId("senha").setLabel("Senha da Sala").setStyle(TextInputStyle.Short).setRequired(true)
                )
            );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith("modal_iniciar_")) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const diarioId = interaction.customId.split("_")[2];
            const idSala = interaction.fields.getTextInputValue("id_sala").trim();
            const senha = interaction.fields.getTextInputValue("senha").trim();

            const { data: diario } = await supabase
                .from("diarios")
                .select("canal_id")
                .eq("id", diarioId)
                .single();

            if (!diario) return interaction.editReply({ content: "❌ Diário não encontrado." });

            const canalDiario = interaction.guild.channels.cache.get(diario.canal_id);
            if (canalDiario) {
                await canalDiario.send({
                    content: `🚀 **DIÁRIO INICIADO!**\n\n**ID da Sala:** \`${idSala}\`\n**Senha:** \`${senha}\`\n\nBoa sorte a todos! 🎮`
                });
            }

            await interaction.editReply({ content: "✅ Diário iniciado com sucesso!" });
        }

        // ====================== INSCREVER-SE NO DIÁRIO ======================
        if (interaction.isButton() && interaction.customId.startsWith("inscrever_")) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const diarioId = interaction.customId.split("_")[1];

            const { data: diario } = await supabase
                .from("diarios")
                .select("*")
                .eq("id", diarioId)
                .single();

            if (!diario || diario.status !== "ativo") {
                return interaction.editReply({ content: "❌ Este diário não está mais disponível." });
            }

            const { count: inscritosCount } = await supabase
                .from("inscricoes_diario")
                .select("*", { count: "exact", head: true })
                .eq("diario_id", diarioId);

            if (inscritosCount >= diario.max_inscritos) {
                return interaction.editReply({ content: "❌ Todas as vagas já foram preenchidas!" });
            }

            const { data: jaInscrito } = await supabase
                .from("inscricoes_diario")
                .select("*")
                .eq("diario_id", diarioId)
                .eq("discord_id", interaction.user.id)
                .maybeSingle();

            if (jaInscrito) {
                return interaction.editReply({ content: "❌ Você já está inscrito neste diário!" });
            }

            const { data: usuario } = await supabase
                .from("usuarios")
                .select("coins")
                .eq("discord_id", interaction.user.id)
                .maybeSingle();

            const saldoAtual = usuario ? usuario.coins : 0;

            if (saldoAtual < diario.valor) {
                return interaction.editReply({
                    content: `❌ Saldo insuficiente! Você possui **${saldoAtual} coins** e precisa de **${diario.valor}**.`
                });
            }

            const novaPosicao = inscritosCount + 1;

            await supabase.from("inscricoes_diario").insert([{
                diario_id: diarioId,
                discord_id: interaction.user.id,
                nome: interaction.user.username,
                posicao: novaPosicao,
                inscrito_em: new Date().toISOString()
            }]);

            await supabase
                .from("usuarios")
                .update({ coins: saldoAtual - diario.valor })
                .eq("discord_id", interaction.user.id);

            const canalPrivado = interaction.guild.channels.cache.get(diario.canal_id);
            if (canalPrivado) {
                await canalPrivado.permissionOverwrites.create(interaction.user.id, {
                    ViewChannel: true,
                    SendMessages: true
                }).catch(() => {});
            }

            await interaction.editReply({
                content: `✅ **Inscrição confirmada!**\n**Posição:** ${novaPosicao}/${diario.max_inscritos}\n**Debitado:** ${diario.valor} coins`
            });
        }

        // ====================== APOSTAS ======================
        if (interaction.isStringSelectMenu() && interaction.customId === "ap_modo") {
            const modo = interaction.values[0];

            const plataformaMenu = new StringSelectMenuBuilder()
                .setCustomId(`ap_plataforma_${modo}`)
                .setPlaceholder("Escolha a plataforma")
                .addOptions([
                    { label: "📱 Mobile", value: "mobile" },
                    { label: "💻 Emulador", value: "emulador" },
                    { label: "🔀 Misto", value: "misto" }
                ]);

            const row = new ActionRowBuilder().addComponents(plataformaMenu);

            const embed = new EmbedBuilder()
                .setColor(0xffaa00)
                .setTitle(`⚔️ Nova Aposta - ${modo.toUpperCase()}`)
                .setDescription("Escolha a **plataforma** da aposta:");

            return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
        }

        if (interaction.isStringSelectMenu() && interaction.customId.startsWith("ap_plataforma_")) {
            const modo = interaction.customId.split("_")[2];
            const plataforma = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`ap_modal_${plataforma}_${modo}`)
                .setTitle("⚔️ Criar Nova Aposta");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("valor")
                        .setLabel("Valor da Aposta (em coins)")
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder("15.00")
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("regras")
                        .setLabel("Regras da Aposta")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("• Sem camp\n• Sem rush base\n• Respeito mútuo")
                        .setRequired(true)
                )
            );

            await interaction.showModal(modal);
        }

        // ====================== CRIAR APOSTA (AGORA ANUNCIA CORRETAMENTE) ======================
        if (interaction.isModalSubmit() && interaction.customId.startsWith("ap_modal_")) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const [, , plataforma, modo] = interaction.customId.split("_");
            const valor = interaction.fields.getTextInputValue("valor").trim();
            const regras = interaction.fields.getTextInputValue("regras").trim();

            if (isNaN(valor) || Number(valor) <= 0) {
                return interaction.editReply({ content: "❌ Valor inválido. Use apenas números positivos." });
            }

            const canalPublicoId = process.env[`ID_AP_${plataforma.toUpperCase()}`];
            if (!canalPublicoId) {
                return interaction.editReply({ content: `❌ ID_AP_${plataforma.toUpperCase()} não configurado no .env` });
            }

            const canalPublico = interaction.guild.channels.cache.get(canalPublicoId);
            if (!canalPublico) {
                return interaction.editReply({ content: "❌ Canal público de apostas não encontrado!" });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`aceitar_ap_${interaction.user.id}`)
                    .setLabel("✅ ACEITAR DESAFIO")
                    .setStyle(ButtonStyle.Success)
            );

            const embed = new EmbedBuilder()
                .setColor(0x00ff88)
                .setTitle(`⚔️ Novo Desafio - ${plataforma.toUpperCase()} | ${modo.toUpperCase()}`)
                .setDescription(
                    `**Valor:** ${valor} coins\n` +
                    `**Máximo de jogadores:** ${modo === "solo" ? 2 : modo === "duo" ? 4 : 8}\n\n` +
                    `**Regras:**\n${regras}`
                )
                .setFooter({ text: `Criado por ${interaction.user.username}` });

            await canalPublico.send({ embeds: [embed], components: [row] });

            await interaction.editReply({ content: "✅ Aposta anunciada com sucesso no canal público!" });
        }

        // ====================== ACEITAR DESAFIO (AGORA FUNCIONA) ======================
        if (interaction.isButton() && interaction.customId.startsWith("aceitar_ap_")) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const criadorId = interaction.customId.split("_")[2];
            const desafiador = interaction.user;

            if (desafiador.id === criadorId) {
                return interaction.editReply({ content: "❌ Você não pode aceitar sua própria aposta." });
            }

            const guild = interaction.guild;
            const criador = await guild.members.fetch(criadorId).catch(() => null);

            if (!criador) {
                return interaction.editReply({ content: "❌ Criador da aposta não encontrado." });
            }

            const categoriaAPS = guild.channels.cache.find(c =>
                c.type === ChannelType.GuildCategory &&
                (c.name.toLowerCase().includes("aps") || c.name.toLowerCase().includes("aposta"))
            );

            if (!categoriaAPS) {
                return interaction.editReply({ content: "❌ Categoria '⚔️ | APS ROLANDO' não encontrada." });
            }

            const cargoADM = guild.roles.cache.find(role =>
                role.name === "ADM" || role.name === "Admin"
            );

            const canalPrivado = await guild.channels.create({
                name: `ap-${criador.user.username}-${desafiador.username}`.toLowerCase(),
                type: ChannelType.GuildText,
                parent: categoriaAPS.id,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: criador.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: desafiador.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    ...(cargoADM ? [{ id: cargoADM.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }] : [])
                ]
            });

            const embedPix = new EmbedBuilder()
                .setColor(0x00ff88)
                .setTitle("💰 Pagamento da Aposta")
                .setDescription(
                    `**Criador:** ${criador}\n` +
                    `**Desafiante:** ${desafiador}\n\n` +
                    `**Chave PIX:**\n\`${process.env.CHAVE_PIX || "Não configurada"}\`\n\n` +
                    `Envie o comprovante neste canal e aguarde a confirmação da staff.`
                );

            await canalPrivado.send({
                content: `${criador} ${desafiador}`,
                embeds: [embedPix]
            });

            await interaction.editReply({ content: `✅ Canal de aposta criado com sucesso!\n${canalPrivado}` });
        }

    } catch (error) {
        console.error("Erro na interaction:", error);
        const msg = "❌ Ocorreu um erro inesperado. Tente novamente.";

        if (interaction.deferred) {
            await interaction.editReply({ content: msg }).catch(() => {});
        } else if (!interaction.replied) {
            await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
        }
    }
});

// ====================== READY ======================
client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
});

client.login(process.env.TOKEN_DISCORD);
