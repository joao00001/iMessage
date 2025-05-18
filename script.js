// Selecionar elementos do DOM (sem alterações)
const chatArea = document.getElementById('chat-area');
const messageInput = document.getElementById('message-input');
const fileOptionsBtn = document.querySelector('.file-options-btn');
const contactsList = document.getElementById('contacts-list');
const newGroupBtn = document.getElementById('new-group-btn');
const groupModal = document.getElementById('group-modal');
const groupNameInput = document.getElementById('group-name');
const groupParticipants = document.getElementById('group-participants');
const createGroupBtn = document.getElementById('create-group-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const chatHeaderContent = document.getElementById('chat-header-content');
const groupPhotoInput = document.getElementById('group-photo-input');
const groupPhotoPreview = document.getElementById('group-photo-preview');
const emojiBtn = document.getElementById('emoji-btn');
const scrollToBottomBtn = document.getElementById('scroll-to-bottom-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const deleteChatBtn = document.getElementById('delete-chat-btn');
const themeBtn = document.getElementById('theme-btn');
const wallpaperBtn = document.getElementById('wallpaper-btn');
const groupMembersSection = document.getElementById('group-members-section');
const groupMembersList = document.getElementById('group-members-list');
const addMemberBtn = document.getElementById('add-member-btn');
const addToGroupBtn = document.getElementById('add-to-group-btn');
const searchBar = document.getElementById('search-bar');

// Carrega myProfile do localStorage, se existir, ou usa valores padrão
const savedProfile = JSON.parse(localStorage.getItem('myProfile')) || {
    id: 0,
    name: "Meu Perfil",
    phone: "+5511998888777",
    photo: "my_profile.jpg",
    bio: "Olá, sou eu!"
};

// Lista de contatos com myProfile incluído
let contacts = [
    savedProfile,
    { id: 1, name: "João da Silva", phone: "+5511999999999", photo: "img_397.jpg" },
    { id: 2, name: "Maria Aparecida", phone: "+5511888888888", photo: "img_209.jpg" },
    { id: 3, name: "Carlos Oliveira", phone: "+5511777777777", photo: "img_141.jpg" },
    { id: 4, name: "Joana Gomes", phone: "+5511666666666", photo: "img_429.jpg" },
    { id: 5, name: "Ana Pereira", phone: "+5511555555555", photo: "img_432.jpg" },
    { id: 6, name: "Pedro Souza", phone: "+5511444444444", photo: "img_445.jpg" },
    { id: 7, name: "Lucas Mendes", phone: "+5511333333333", photo: "img_463.jpg" },
    { id: 8, name: "Fernanda Lima", phone: "+5511222222222", photo: "img_488.jpg" },
    { id: 9, name: "Clara Martins", phone: "+5511111111111", photo: "img_491.jpg" },
    { id: 10, name: "Rafael Borges", phone: "+5511000000000", photo: "img_499.jpg" },
    { id: 11, name: "Gabriel Almeida", phone: "+5511991111222", photo: "img_552.jpg" },
    { id: 12, name: "Paula Nascimento", phone: "+5511882222333", photo: "img_561.jpg" },
    { id: 13, name: "Ricardo Silva", phone: "+5511773333444", photo: "img_576.jpg" },
    { id: 14, name: "Tatiana Souza", phone: "+5511664444555", photo: "img_581.jpg" },
    { id: 15, name: "Fábio Pereira", phone: "+5511555555666", photo: "img_582.jpg" },
    { id: 16, name: "Juliana Costa", phone: "+5511446666777", photo: "img_607.jpg" },
    { id: 17, name: "Thiago Rocha", phone: "+5511337777888", photo: "img_630.jpg" },
    { id: 18, name: "Maria Clara ❤️❤️", phone: "+5511337777898", photo: "maria.jpg" },
    {id: 0, name: "Ana Castela", phone: "+5511995588777", photo: "WIN_20250219_14_01_02_Pro.jpg", bio: "Olá, sou eu!", status: 'online'}
];

// Referência ao meu perfil
const myProfile = contacts[0];

// Carrega grupos e favoritos do localStorage ao iniciar
let groups = JSON.parse(localStorage.getItem('chatGroups')) || [];
let activeChat = null;
let favorites = JSON.parse(localStorage.getItem('chatFavorites')) || [];
let lastMessageDate = null;
let messages = JSON.parse(localStorage.getItem('chatMessages')) || {};

// Função auxiliar para formatar tamanho do arquivo
function formatFileSize(file) {
    const bytes = file.size;
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Função auxiliar para converter arquivo em Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Função auxiliar para salvar grupos no localStorage
function saveGroups() {
    localStorage.setItem('chatGroups', JSON.stringify(groups));
}

// Função auxiliar para salvar favoritos no localStorage
function saveFavorites() {
    localStorage.setItem('chatFavorites', JSON.stringify(favorites));
}

// Criar menu fixo à esquerda
const sideMenu = document.createElement('div');
sideMenu.className = 'side-menu';
sideMenu.innerHTML = `
    <button id="conversations-btn" title="Conversas"><i class="fa-solid fa-comment"></i></button>
    <button id="groups-btn" title="Grupos"><i class="fa-solid fa-users"></i></button>
    <button id="favorites-btn" title="Favoritos"><i class="fa-solid fa-star"></i></button>
    <button id="profile-btn" title="Meu Perfil"><i class="fa-solid fa-user"></i></button>
`;
document.body.insertBefore(sideMenu, document.body.firstChild);

// Funções principais

function sendMessage(sender = 'you') {
    const text = messageInput.value.trim();
    if (text && activeChat) {
        const messageId = Date.now();
        const messageData = { id: messageId, content: text, sender, timestamp: new Date().toISOString() };
        addMessage(messageData.content, sender, true, messageId); // Envia como HTML
        saveMessage(activeChat.id, messageData);
        messageInput.value = '';
        const currentFilter = document.querySelector('.side-menu button.active')?.id || 'conversations-btn';
        const filterMap = {
            'conversations-btn': 'all',
            'groups-btn': 'groups',
            'favorites-btn': 'favorites'
        };
        renderContacts(filterMap[currentFilter] || 'all', searchBar.value);
    }
}

async function handleFileUpload(input) {
    const files = Array.from(input.files);
    if (!files.length || !activeChat) return;

    let selectedImages = [];
    let currentPreviewIndex = 0;
    let isSingleView = false;

    for (const file of files) {
        const fileType = getFileType(file);
        const fileUrl = URL.createObjectURL(file);
        const messageId = Date.now();
        const fileSize = formatFileSize(file); // Define fileSize aqui

        try {
            if (fileType === 'image') {
                selectedImages.push({ fileUrl, file, id: messageId });
                if (selectedImages.length === 1) {
                    const modal = document.createElement('div');
                    modal.className = 'image-preview-modal';
                    modal.innerHTML = `
                        <div class="image-preview-header">
                            <h3>Enviar Imagem</h3>
                            <button class="image-preview-close"><i class="fa-solid fa-times"></i></button>
                        </div>
                        <div class="image-preview-content">
                            <div class="image-preview">
                                <img src="${fileUrl}" alt="Image Preview" class="preview-image">
                                <input type="text" class="image-preview-input" placeholder="Adicione uma legenda..." />
                            </div>
                            <div class="image-preview-add">
                                <button class="add-more-btn"><i class="fa-solid fa-plus"></i></button>
                                <div class="image-preview-thumbnails"></div>
                            </div>
                        </div>
                        <div class="image-preview-actions">
                            <button class="add-emoji-btn"><i class="fa-solid fa-face-smile"></i></button>
                            <button class="add-file-btn"><i class="fa-solid fa-paperclip"></i></button>
                            <button class="single-view-btn" ${selectedImages.length > 1 ? 'disabled' : ''}><i class="fa-solid fa-eye-slash"></i></button>
                            <button class="image-preview-send"><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    setTimeout(() => modal.classList.add('visible'), 10);

                    const previewImage = modal.querySelector('.preview-image');
                    const singleViewBtn = modal.querySelector('.single-view-btn');

                    singleViewBtn.addEventListener('click', () => {
                        if (selectedImages.length === 1) {
                            isSingleView = !isSingleView;
                            singleViewBtn.classList.toggle('active', isSingleView);
                        }
                    });

                    const closeBtn = modal.querySelector('.image-preview-close');
                    closeBtn.addEventListener('click', () => {
                        modal.classList.remove('visible');
                        setTimeout(() => modal.remove(), 300);
                    });

                    const addMoreBtn = modal.querySelector('.add-more-btn');
                    addMoreBtn.addEventListener('click', () => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.multiple = true;
                        fileInput.style.display = 'none';
                        document.body.appendChild(fileInput);

                        fileInput.addEventListener('change', () => {
                            const newFiles = Array.from(fileInput.files);
                            newFiles.forEach(file => {
                                const newUrl = URL.createObjectURL(file);
                                selectedImages.push({ fileUrl: newUrl, file, id: Date.now() });
                            });
                            updateThumbnails(modal, selectedImages, previewImage, currentPreviewIndex);
                            singleViewBtn.disabled = selectedImages.length > 1;
                            if (selectedImages.length > 1) {
                                isSingleView = false;
                                singleViewBtn.classList.remove('active');
                            }
                            document.body.removeChild(fileInput);
                        });
                        fileInput.click();
                    });

                    const sendBtn = modal.querySelector('.image-preview-send');
                    const captionInput = modal.querySelector('.image-preview-input');
                    sendBtn.addEventListener('click', async () => {
                        const caption = captionInput.value.trim();
                        selectedImages.forEach((image, index) => {
                            let messageContent;
                            if (isSingleView && index === 0) {
                                messageContent = `
                                    <div class="single-view-message" data-url="${image.fileUrl}" data-viewed="false">
                                        <span class="single-view-text"><i class="fa-solid fa-eye"></i> Foto</span>
                                        ${caption ? `<div class="caption">${caption}</div>` : ''}
                                    </div>
                                `;
                            } else {
                                messageContent = `
                                    <div class="image-message" data-url="${image.fileUrl}">
                                        <img src="${image.fileUrl}" alt="Uploaded Image">
                                        ${index === 0 && caption ? `<div class="caption">${caption}</div>` : ''}
                                    </div>
                                `;
                            }
                            const messageData = {
                                id: image.id,
                                content: messageContent,
                                sender: 'you',
                                timestamp: new Date().toISOString(),
                                isSingleView: isSingleView && index === 0
                            };
                            addMessage(messageData.content, 'you', true, image.id);
                            saveMessage(activeChat.id, messageData);
                        });

                        modal.classList.remove('visible');
                        setTimeout(() => modal.remove(), 300);
                        renderContacts();
                    });

                    captionInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendBtn.click();
                        }
                    });

                    const emojiBtn = modal.querySelector('.add-emoji-btn');
                    emojiBtn.addEventListener('click', () => {
                        const emojiPicker = document.querySelector('.emoji-picker');
                        if (emojiPicker) {
                            emojiPicker.classList.add('visible');
                            emojiPicker.style.bottom = 'calc(60% + 10px)';
                            emojiPicker.style.left = 'calc(30% + 50%)';

                            document.addEventListener('click', (e) => {
                                if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
                                    emojiPicker.classList.remove('visible');
                                }
                            }, { once: true });
                        }
                    });

                    const addFileBtn = modal.querySelector('.add-file-btn');
                    addFileBtn.addEventListener('click', () => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt';
                        fileInput.multiple = true;
                        fileInput.style.display = 'none';
                        document.body.appendChild(fileInput);

                        fileInput.addEventListener('change', () => {
                            handleFileUpload(fileInput);
                            document.body.removeChild(fileInput);
                        });
                        fileInput.click();
                    });
                } else {
                    updateThumbnails(modal, selectedImages, modal.querySelector('.preview-image'), currentPreviewIndex);
                }
            } else if (fileType === 'video') {
                const thumbnail = await generateVideoThumbnail(file);
                const messageData = { id: messageId, content: `<div class="video-message" data-url="${fileUrl}"><img src="${thumbnail}" alt="Video Thumbnail"><div class="play-icon"><i class="fa-solid fa-play"></i></div></div>`, sender: 'you', timestamp: new Date().toISOString() };
                addMessage(messageData.content, 'you', true, messageId);
                saveMessage(activeChat.id, messageData);
            } else if (fileType === 'pdf') {
                const previewImage = await generatePDFPreview(file);
                const fileCount = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise.then(pdf => pdf.numPages);
                const messageData = { id: messageId, content: `<div class="pdf-message" data-url="${fileUrl}"><img src="${previewImage}" alt="PDF Preview"><div class="pdf-info"><div class="pdf-title">${file.name}</div><div class="pdf-details">${fileCount} páginas • PDF • ${fileSize}</div></div><div class="download-icon"><a href="${fileUrl}" download><i class="fa-solid fa-arrow-down"></i></a></div></div>`, sender: 'you', timestamp: new Date().toISOString() };
                addMessage(messageData.content, 'you', true, messageId);
                saveMessage(activeChat.id, messageData);
            } else if (fileType === 'audio') {
                const messageData = { id: messageId, content: `<div class="file-message" data-url="${fileUrl}"><div class="file-icon"><i class="fa-solid fa-music"></i></div><div class="file-info"><div class="file-title">${file.name}</div><div class="file-details">Áudio • ${fileSize}</div></div></div>`, sender: 'you', timestamp: new Date().toISOString() };
                addMessage(messageData.content, 'you', true, messageId);
                saveMessage(activeChat.id, messageData);
            } else if (['word', 'excel', 'powerpoint', 'text'].includes(fileType)) {
                const iconMap = { word: 'fa-file-word', excel: 'fa-file-excel', powerpoint: 'fa-file-powerpoint', text: 'fa-file-lines' };
                const messageData = { id: messageId, content: `<div class="file-message" data-url="${fileUrl}"><div class="file-icon"><i class="fa-solid ${iconMap[fileType]}"></i></div><div class="file-info"><div class="file-title">${file.name}</div><div class="file-details">${fileType.toUpperCase()} • ${fileSize}</div></div></div>`, sender: 'you', timestamp: new Date().toISOString() };
                addMessage(messageData.content, 'you', true, messageId);
                saveMessage(activeChat.id, messageData);
            } else if (fileType === 'code') {
                const messageData = { id: messageId, content: `<div class="file-message" data-url="${fileUrl}"><div class="file-icon"><i class="fa-solid fa-code"></i></div><div class="file-info"><div class="file-title">${file.name}</div><div class="file-details">Código • ${fileSize}</div></div></div>`, sender: 'you', timestamp: new Date().toISOString() };
                addMessage(messageData.content, 'you', true, messageId);
                saveMessage(activeChat.id, messageData);
            } else if (fileType === 'archive') {
                const messageData = { id: messageId, content: `<div class="file-message" data-url="${fileUrl}"><div class="file-icon"><i class="fa-solid fa-file-zipper"></i></div><div class="file-info"><div class="file-title">${file.name}</div><div class="file-details">Arquivo Compactado • ${fileSize}</div></div></div>`, sender: 'you', timestamp: new Date().toISOString() };
                addMessage(messageData.content, 'you', true, messageId);
                saveMessage(activeChat.id, messageData);
            } else {
                const messageData = { id: messageId, content: `<div class="file-message" data-url="${fileUrl}"><div class="file-icon"><i class="fa-solid fa-file"></i></div><div class="file-info"><div class="file-title">${file.name}</div><div class="file-details">Arquivo • ${fileSize}</div></div></div>`, sender: 'you', timestamp: new Date().toISOString() };
                addMessage(messageData.content, 'you', true, messageId);
                saveMessage(activeChat.id, messageData);
            }
        } catch (error) {
            console.error(`Erro ao processar arquivo ${file.name} (${fileType}):`, error);
        }
    }

    const currentFilter = document.querySelector('.side-menu button.active')?.id || 'conversations-btn';
    const filterMap = {
        'conversations-btn': 'all',
        'groups-btn': 'groups',
        'favorites-btn': 'favorites'
    };
    renderContacts(filterMap[currentFilter] || 'all', searchBar.value);
}

function updateThumbnails(modal, images, previewImage, currentPreviewIndex) {
    const thumbnailsContainer = modal.querySelector('.image-preview-thumbnails');
    const sendBtn = modal.querySelector('.image-preview-send');
    const singleViewBtn = modal.querySelector('.single-view-btn');

    if (thumbnailsContainer && previewImage && sendBtn) {
        thumbnailsContainer.innerHTML = '';

        if (images.length === 0) {
            previewImage.src = 'modal.png';
            previewImage.alt = 'Skeleton Screen';
            let message = modal.querySelector('.no-image-message');
            if (!message) {
                message = document.createElement('div');
                message.className = 'no-image-message';
                message.textContent = 'Adicione uma imagem';
                previewImage.parentNode.insertBefore(message, previewImage);
            }
            sendBtn.disabled = true;
            singleViewBtn.disabled = true;
        } else {
            const existingMessage = modal.querySelector('.no-image-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            sendBtn.disabled = false;
            singleViewBtn.disabled = images.length > 1;

            images.forEach((image, index) => {
                const img = document.createElement('img');
                img.src = image.fileUrl;
                img.alt = 'Thumbnail';
                img.dataset.index = index;
                thumbnailsContainer.appendChild(img);

                img.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log(`Clicou na imagem ${index} para remover`);
                    if (images.length > index) {
                        const removedImageIndex = parseInt(img.dataset.index);
                        images.splice(removedImageIndex, 1);

                        if (removedImageIndex === currentPreviewIndex && images.length > 0) {
                            if (removedImageIndex >= images.length) {
                                currentPreviewIndex = images.length - 1;
                            } else {
                                currentPreviewIndex = removedImageIndex;
                            }
                            previewImage.src = images[currentPreviewIndex].fileUrl;
                        } else if (images.length === 0) {
                            currentPreviewIndex = 0;
                        } else if (removedImageIndex < currentPreviewIndex) {
                            currentPreviewIndex--;
                        }

                        updateThumbnails(modal, images, previewImage, currentPreviewIndex);
                        console.log(`Imagem ${removedImageIndex} removida, restam ${images.length} imagens, prévia agora em ${currentPreviewIndex}`);
                    } else {
                        console.error('Índice inválido ou array vazio');
                    }
                });

                img.addEventListener('mouseenter', () => {
                    img.style.borderColor = '#ff4444';
                    console.log(`Hover na imagem ${index}`);
                });
                img.addEventListener('mouseleave', () => {
                    img.style.borderColor = '#2c2c2c';
                    console.log(`Saiu da imagem ${index}`);
                });
            });

            if (images.length > 0) {
                previewImage.src = images[currentPreviewIndex].fileUrl;
            }
        }
    } else {
        console.error('Contêiner de thumbnails, prévia ou botão de envio não encontrado');
    }
}

function saveMessage(chatId, messageData) {
    if (!messages[chatId]) {
        messages[chatId] = [];
    }
    messages[chatId].push(messageData);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function loadMessages(chatId) {
    if (messages[chatId]) {
        messages[chatId].forEach(msg => {
            addMessage(msg.content, msg.sender, msg.content.includes('<'), msg.id, new Date(msg.timestamp));
        });
    }
}

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (event.ctrlKey) {
            sendMessage('other');
        } else {
            sendMessage('you');
        }
    }
});

function renderContacts(filter = 'all', searchQuery = '') {
    contactsList.innerHTML = '';
    const query = searchQuery.toLowerCase();

    let filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(query) || contact.phone.includes(query) ||
        (messages[contact.id] && messages[contact.id].some(msg => msg.content.toLowerCase().includes(query)))
    );

    let filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(query) ||
        (messages[group.id] && messages[group.id].some(msg => msg.content.toLowerCase().includes(query)))
    );

    const getLastMessageTime = (item) => {
        const lastMessage = messages[item.id]?.slice(-1)[0];
        return lastMessage ? new Date(lastMessage.timestamp).getTime() : 0;
    };

    filteredContacts.sort((a, b) => {
        const aPinned = favorites.some(fav => fav.id === a.id && fav.pinned);
        const bPinned = favorites.some(fav => fav.id === b.id && fav.pinned);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return getLastMessageTime(b) - getLastMessageTime(a);
    });

    filteredGroups.sort((a, b) => {
        const aPinned = favorites.some(fav => fav.id === a.id && fav.pinned);
        const bPinned = favorites.some(fav => fav.id === b.id && fav.pinned);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return getLastMessageTime(b) - getLastMessageTime(a);
    });

    if (filter === 'groups') {
        filteredGroups.forEach(group => renderGroupItem(group));
    } else if (filter === 'favorites') {
        favorites.forEach(item => {
            if ((item.participants && filteredGroups.some(g => g.id === item.id)) || 
                (!item.participants && filteredContacts.some(c => c.id === item.id))) {
                renderItem(item, item.participants);
            }
        });
    } else {
        filteredContacts.forEach(contact => renderItem(contact, false));
        filteredGroups.forEach(group => renderGroupItem(group));
    }
}

function renderItem(item, isGroup) {
    const lastMessage = messages[item.id]?.slice(-1)[0];
    const lastMessageTime = lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const isPinned = favorites.some(fav => fav.id === item.id && fav.pinned);

    let messagePreview = '';
    if (lastMessage && !isGroup) {
        const isYou = lastMessage.sender === 'you';
        const prefix = isYou ? 'Você: ' : '';
        if (lastMessage.content.includes('video-message')) {
            messagePreview = `${prefix}<i class="fa-solid fa-video"></i> Vídeo`;
        } else if (lastMessage.content.includes('image-message')) {
            messagePreview = `${prefix}<i class="fa-solid fa-image"></i> Foto`;
        } else if (lastMessage.content.includes('file-message') || lastMessage.content.includes('pdf-message')) {
            messagePreview = `${prefix}<i class="fa-solid fa-file"></i> Arquivo`;
        } else {
            messagePreview = `${prefix}${truncateMessage(lastMessage.content, 30)}`;
        }
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = isGroup ? 'group-item' : 'contact-item';
    if (favorites.some(fav => fav.id === item.id)) itemDiv.classList.add('favorite-item');
    itemDiv.innerHTML = `
        <img src="${item.photo || 'https://via.placeholder.com/40'}" alt="${item.name}" class="profile-photo">
        <div class="${isGroup ? 'group-info' : 'contact-info'}">
            <div class="name-time">
                <div class="name">${item.name}</div>
                <div class="time-container">
                    ${isPinned ? '<i class="fa-solid fa-thumbtack pinned-icon"></i>' : ''}
                    ${lastMessageTime ? `<span class="last-message-time">${lastMessageTime}</span>` : ''}
                </div>
            </div>
            <div class="preview-or-participants">
                ${isGroup ? `${item.participants.length} participantes` : (messagePreview || item.status || item.phone)}
            </div>
        </div>
    `;
    const photo = itemDiv.querySelector('.profile-photo');
    photo.addEventListener('click', (e) => {
        e.stopPropagation();
        openProfilePhotoPreview(item.photo);
    });
    itemDiv.addEventListener('click', () => openChat(item));
    itemDiv.addEventListener('contextmenu', (e) => showContextMenu(e, item, isGroup));
    contactsList.appendChild(itemDiv);
}

function renderGroupItem(group) {
    renderItem(group, true);
}

function truncateMessage(content, maxLength) {
    const text = content.replace(/<[^>]+>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function initializeChatSkeleton() {
    const chatSkeleton = document.createElement('div');
    chatSkeleton.className = 'chat-skeleton';
    chatSkeleton.innerHTML = `
        <div class="skeleton-header">
            <div class="skeleton-photo"></div>
            <div class="skeleton-title"></div>
        </div>
        <div class="skeleton-content">
            <div class="skeleton-message">Selecione um contato ou grupo para iniciar uma conversa</div>
            <img src="chat.png" alt="Chat Icon" class="skeleton-chat-icon" />
        </div>
        <div class="skeleton-input">
            <div class="skeleton-input-field"></div>
            <div class="skeleton-button"></div>
        </div>
    `;
    document.body.appendChild(chatSkeleton);
    chatArea.style.display = 'none';

    const chatIcon = chatSkeleton.querySelector('.skeleton-chat-icon');
    chatIcon.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

function openChat(target) {
    document.querySelectorAll('.contact-item, .group-item').forEach(item => {
        item.classList.remove('selected');
    });

    const targetElement = Array.from(document.querySelectorAll('.contact-item, .group-item')).find(item => {
        const name = item.querySelector('.name').textContent;
        return name === target.name;
    });
    if (targetElement) {
        targetElement.classList.add('selected');
    }

    const settingsMenu = document.getElementById('settings-menu');
    if (settingsMenu.classList.contains('visible')) {
        settingsMenu.classList.remove('visible');
    }

    activeChat = target;

    const isGroup = target.participants && target.participants.length > 0;
    let membersList = '';
    if (isGroup) {
        const maxLength = 100;
        const memberNames = target.participants.map(member => member.name).join(', ');
        membersList = memberNames.length > maxLength 
            ? memberNames.substring(0, maxLength - 3) + '...' 
            : memberNames;
    }

    chatHeaderContent.innerHTML = `
        <img src="${target.photo || 'https://via.placeholder.com/40'}" alt="${target.name}" class="chat-header-photo">
        <div class="chat-header-info">
            <h3 class="chat-header-title">${target.name}</h3>
            ${isGroup && membersList ? `<span class="chat-header-members">${membersList}</span>` : ''}
        </div>
        <input type="text" id="chat-search" placeholder="Pesquisar no chat" style="margin-left: auto; padding: 5px;">
    `;
    chatArea.innerHTML = '';
    lastMessageDate = null;
    loadMessages(target.id);

    chatArea.style.display = 'block';
    const chatSkeleton = document.querySelector('.chat-skeleton');
    if (chatSkeleton) chatSkeleton.style.display = 'none';

    const headerPhoto = chatHeaderContent.querySelector('.chat-header-photo');
    headerPhoto.addEventListener('click', () => openProfilePhotoPreview(target.photo));

    // Adicionar lógica de pesquisa
    const chatSearch = document.getElementById('chat-search');
    chatSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.message-wrapper').forEach(wrapper => {
            const msgContent = wrapper.querySelector('.message').innerText.toLowerCase();
            wrapper.style.display = msgContent.includes(query) ? 'block' : 'none';
        });
    });
}

function addDateSeparator(messageDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messageDay = new Date(messageDate);
    messageDay.setHours(0, 0, 0, 0);
    
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((today - messageDay) / oneDay);
    let dateText;

    switch (diffDays) {
        case 0:
            dateText = 'Hoje';
            break;
        case 1:
            dateText = 'Ontem';
            break;
        case 2:
            dateText = 'Segunda-feira';
            break;
        case 3:
            dateText = 'Terça-feira';
            break;
        case 4:
            dateText = 'Quarta-feira';
            break;
        case 5:
            dateText = 'Quinta-feira';
            break;
        case 6:
            dateText = 'Sexta-feira';
            break;
        default:
            dateText = messageDate.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
    }

    if (diffDays >= 2 && diffDays <= 6) {
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const messageDayOfWeek = messageDay.getDay();
        dateText = dayNames[messageDayOfWeek];
    }

    const dateSeparator = document.createElement('div');
    dateSeparator.className = 'date-separator';
    dateSeparator.innerHTML = `<span>${dateText}</span>`;
    chatArea.appendChild(dateSeparator);
}

let globalSelectionMode = false;

function addMessage(content, sender, isHtml = false, messageId = Date.now(), date = new Date(), isTemporary = false) {    
    const messageDate = date;
    if (!lastMessageDate || lastMessageDate.toDateString() !== messageDate.toDateString()) {
        addDateSeparator(messageDate);
        lastMessageDate = messageDate;
    }
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper');
    messageWrapper.dataset.messageId = messageId;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (isTemporary) {
        messageDiv.classList.add('temporary-message');
    }

    const timestamp = document.createElement('span');
    timestamp.classList.add('timestamp');
    timestamp.textContent = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const statusSpan = document.createElement('span');
    statusSpan.classList.add('message-status');
    if (sender === 'you') {
        statusSpan.innerHTML = '✓'; // Enviado
        setTimeout(() => statusSpan.innerHTML = '✓✓', 1000); // Entregue após 1s
        setTimeout(() => {
            statusSpan.innerHTML = '✓✓';
            statusSpan.style.color = '#00f'; // Lido após 2s (azul)
        }, 2000);
    }

    const timeStatusContainer = document.createElement('span');
    timeStatusContainer.classList.add('time-status-container');
    timeStatusContainer.appendChild(timestamp);
    if (sender === 'you') timeStatusContainer.appendChild(statusSpan);
    if (isTemporary) {
        const tempIcon = document.createElement('span');
        tempIcon.classList.add('temporary-icon');
        tempIcon.innerHTML = '<i class="fa-solid fa-clock"></i>';
        timeStatusContainer.appendChild(tempIcon);
    }

    const reactionsContainer = document.createElement('div');
    reactionsContainer.classList.add('reactions-container');

    const reactionIcon = document.createElement('span');
    reactionIcon.classList.add('reaction-icon');
    reactionIcon.innerHTML = '<i class="fa-solid fa-face-smile"></i>';
    reactionIcon.style.display = 'none'; // Escondido por padrão

    messageDiv.appendChild(timeStatusContainer);
    messageDiv.appendChild(reactionsContainer);
    messageDiv.appendChild(reactionIcon);

    const arrow = document.createElement('span');
    arrow.classList.add('arrow');
    arrow.innerHTML = '▾';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('message-checkbox');
    checkbox.style.display = 'none';

    const menu = document.createElement('div');
    menu.classList.add('message-menu');
    menu.style.display = 'none';

    const hasImage = isHtml && content.includes('<img');
    const isSingleViewMessage = isHtml && content.includes('single-view-message');

    const defaultMenuContent = `
        <button class="copy-btn">Copiar<i class="fas fa-copy icon copy-icon"></i></button>
        <button class="delete-btn">Apagar<i class="fa-solid fa-trash delete-icon"></i></button>
        <button class="select-btn">Selecionar<i class="fa-solid fa-circle-check select-icon"></i></button>
        ${(hasImage || content.includes('video-message')) && !isSingleViewMessage ? '<button class="download-btn">Baixar<i class="fa-solid fa-arrow-down download-icon"></i></button>' : ''}
        <button class="forward-btn">Encaminhar<i class="fa-solid fa-share"></i></button>
        <button class="pin-message-btn">Fixar Mensagem<i class="fa-solid fa-thumbtack"></i></button>
    `;
    const baseSelectionMenuContent = `
        <button class="delete-all-btn">Apagar Todas<i class="fa-solid fa-trash delete-icon"></i></button>
        <button class="cancel-btn">Cancelar<i class="fa-solid fa-times cancel-icon"></i></button>
    `;
    const downloadAllButton = `<button class="download-all-btn">Baixar Tudo<i class="fa-solid fa-arrow-down download-icon1"></i></button>`;

    menu.innerHTML = defaultMenuContent;

    if (!isHtml) {
        const words = content.trim().split(/\s+/);
        const maxWords = 70;

        if (words.length > maxWords) {
            const shortText = words.slice(0, maxWords).join(' ');
            const fullText = content;

            const textContainer = document.createElement('span');
            textContainer.classList.add('message-text');

            const shortTextSpan = document.createElement('span');
            shortTextSpan.textContent = shortText;

            const readMoreBtn = document.createElement('span');
            readMoreBtn.classList.add('read-more');
            readMoreBtn.textContent = '...ler mais';
            readMoreBtn.style.cursor = 'pointer';
            readMoreBtn.style.color = '#00f';
            readMoreBtn.style.textDecoration = 'underline';

            textContainer.appendChild(shortTextSpan);
            textContainer.appendChild(readMoreBtn);

            messageDiv.appendChild(textContainer);
            messageDiv.appendChild(timeStatusContainer);
            messageDiv.appendChild(reactionsContainer);
            messageDiv.appendChild(reactionIcon);

            readMoreBtn.addEventListener('click', () => {
                textContainer.innerHTML = fullText;
                chatArea.scrollTo({
                    top: chatArea.scrollHeight,
                    behavior: 'smooth'
                });
            });
        } else {
            messageDiv.textContent = content;
            messageDiv.appendChild(timeStatusContainer);
            messageDiv.appendChild(reactionsContainer);
            messageDiv.appendChild(reactionIcon);
        }
    } else {
        messageDiv.innerHTML = content;
        messageDiv.appendChild(timeStatusContainer);
        messageDiv.appendChild(reactionsContainer);
        messageDiv.appendChild(reactionIcon);
    }

    if (isSingleViewMessage) {
        messageDiv.innerHTML = content;
        const singleViewText = messageDiv.querySelector('.single-view-text');
        singleViewText.addEventListener('click', () => {
            const singleViewDiv = messageDiv.querySelector('.single-view-message');
            const viewed = singleViewDiv.dataset.viewed === 'true';
            const imageUrl = singleViewDiv.dataset.url;

            if (!viewed) {
                openSingleViewModal(imageUrl, messageId);
                singleViewDiv.dataset.viewed = 'true';
                singleViewText.innerHTML = '<i class="fa-solid fa-eye-slash"></i> <em> Mensagem aberta</em>';
                saveMessage(activeChat.id, {
                    id: messageId,
                    content: messageDiv.outerHTML,
                    sender,
                    timestamp: date.toISOString(),
                    isSingleView: true
                });
            }
        });
    }
    
    function updateSelectionMenu() {
        const selectedCheckboxes = document.querySelectorAll('.message-checkbox:checked');
        const selectedMessages = Array.from(selectedCheckboxes).map(cb => cb.closest('.message-wrapper'));
        const allAreMedia = selectedMessages.length > 0 && selectedMessages.every(wrapper => {
            const msg = wrapper.querySelector('.message');
            return msg.querySelector('.image-message') || msg.querySelector('.video-message');
        });

        menu.innerHTML = allAreMedia && selectedMessages.length > 0
            ? baseSelectionMenuContent.replace('</button>', '</button>' + downloadAllButton)
            : baseSelectionMenuContent;

        menu.querySelector('.delete-all-btn').addEventListener('click', () => {
            selectedCheckboxes.forEach(checkbox => {
                const wrapper = checkbox.closest('.message-wrapper');
                const messageId = wrapper.dataset.messageId;
                if (activeChat && messages[activeChat.id]) {
                    messages[activeChat.id] = messages[activeChat.id].filter(msg => msg.id != messageId);
                    localStorage.setItem('chatMessages', JSON.stringify(messages));
                }
                wrapper.classList.add('fade-out');
                setTimeout(() => wrapper.remove(), 300);
            });
            toggleSelectionMode(false);
        });

        menu.querySelector('.cancel-btn').addEventListener('click', () => toggleSelectionMode(false));

        const downloadAllBtn = menu.querySelector('.download-all-btn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => {
                const selectedMedia = Array.from(selectedCheckboxes).map(cb => {
                    const msg = cb.closest('.message-wrapper').querySelector('.message');
                    const img = msg.querySelector('.image-message img');
                    const video = msg.querySelector('.video-message img');
                    return img ? { src: img.src, isVideo: false } : { src: video.closest('.video-message').getAttribute('data-url'), isVideo: true };
                });
                downloadAllImages(selectedMedia);
                toggleSelectionMode(false);
            });
        }
    }

    function toggleSelectionMode(enable) {
        const checkboxes = document.querySelectorAll('.message-checkbox');
        globalSelectionMode = enable;

        if (enable) {
            checkboxes.forEach(cb => {
                cb.style.display = 'block';
                cb.style.opacity = '0';
                setTimeout(() => {
                    cb.style.opacity = '1';
                    cb.style.transform = 'translateY(-50%) scale(1)';
                }, 10);
                cb.addEventListener('change', updateSelectionMenu);
            });
            updateSelectionMenu();
            chatArea.style.overflowY = 'auto';
        } else {
            checkboxes.forEach(cb => {
                cb.style.opacity = '0';
                cb.style.transform = 'translateY(-50%) scale(0.8)';
                setTimeout(() => {
                    cb.checked = false;
                    cb.removeEventListener('change', updateSelectionMenu);
                    cb.style.display = 'none';
                }, 300);
            });
            menu.innerHTML = defaultMenuContent;
            menu.style.display = 'none';
            addDefaultMenuEvents(); // Chamado apenas uma vez aqui
        }
        chatArea.style.pointerEvents = 'auto';
    }

    function addDefaultMenuEvents() {
        menu.querySelector('.select-btn').addEventListener('click', () => toggleSelectionMode(true));
        menu.querySelector('.delete-btn').addEventListener('click', () => {
            const messageId = messageWrapper.dataset.messageId;
            if (activeChat && messages[activeChat.id]) {
                messages[activeChat.id] = messages[activeChat.id].filter(msg => msg.id != messageId);
                localStorage.setItem('chatMessages', JSON.stringify(messages));
            }
            messageWrapper.classList.add('fade-out');
            setTimeout(() => chatArea.removeChild(messageWrapper), 300);
        });

        const copyBtn = menu.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const textToCopy = isHtml ? messageDiv.innerText : content;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    copyBtn.innerHTML = 'Copiado<i class="fas fa-check icon copy-icon2"></i>';
                });
            });
        }

        const downloadBtn = menu.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const img = messageDiv.querySelector('img');
                if (img) {
                    const url = img.closest('.image-message, .video-message').getAttribute('data-url');
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = url.split('/').pop() || (content.includes('video-message') ? 'video' : 'image');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        }

        const forwardBtn = menu.querySelector('.forward-btn');
        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                const messageContent = isHtml ? messageDiv.innerHTML : content;
                openForwardModal(messageContent);
            });
        }

        const replyBtn = menu.querySelector('.reply-btn');
        if (replyBtn) {
            replyBtn.addEventListener('click', () => {
                const replyContent = isHtml ? messageDiv.innerHTML : content;
                messageInput.value = `<blockquote data-reply-id="${messageId}">${replyContent}</blockquote>\n`;
                messageInput.focus();
            });
        }

        const pinnedArea = document.querySelector('.pinned-messages');
        const isPinned = pinnedArea && Array.from(pinnedArea.querySelectorAll('.pinned-message')).some(
            msg => msg.dataset.messageId === messageId.toString()
        );

        const updatedMenuContent = isSingleViewMessage 
            ? `
                <button class="copy-btn">Copiar<i class="fas fa-copy icon copy-icon"></i></button>
                <button class="delete-btn">Apagar<i class="fa-solid fa-trash delete-icon"></i></button>
                <button class="select-btn">Selecionar<i class="fa-solid fa-circle-check select-icon"></i></button>
                ${(hasImage || content.includes('video-message')) && !isSingleViewMessage ? '<button class="download-btn">Baixar<i class="fa-solid fa-arrow-down download-icon"></i></button>' : ''}
                <button class="forward-btn">Encaminhar<i class="fa-solid fa-share"></i></button>
              `
            : isPinned 
                ? `
                    <button class="copy-btn">Copiar<i class="fas fa-copy icon copy-icon"></i></button>
                    <button class="delete-btn">Apagar<i class="fa-solid fa-trash delete-icon"></i></button>
                    <button class="select-btn">Selecionar<i class="fa-solid fa-circle-check select-icon"></i></button>
                    ${(hasImage || content.includes('video-message')) && !isSingleViewMessage ? '<button class="download-btn">Baixar<i class="fa-solid fa-arrow-down download-icon"></i></button>' : ''}
                    <button class="forward-btn">Encaminhar<i class="fa-solid fa-share"></i></button>
                    <button class="unpin-message-btn">Desfixar<i class="fa-solid fa-thumbtack-slash"></i></button>
                  `
                : defaultMenuContent;

        menu.innerHTML = updatedMenuContent;

        const pinBtn = menu.querySelector('.pin-message-btn');
        if (pinBtn) {
            pinBtn.addEventListener('click', () => {
                const pinnedArea = document.querySelector('.pinned-messages') || document.createElement('div');
                if (!pinnedArea.className) {
                    pinnedArea.className = 'pinned-messages';
                    chatArea.insertBefore(pinnedArea, chatArea.firstChild);

                    pinnedArea.addEventListener('click', (e) => {
                        const clickedMessage = e.target.closest('.pinned-message');
                        if (!clickedMessage || e.target.className === 'pinned-options-icon') return;

                        const allWrappers = Array.from(pinnedArea.querySelectorAll('.pinned-wrapper'));
                        const currentIndex = allWrappers.findIndex(wrapper => wrapper.querySelector('.pinned-message') === clickedMessage);
                        if (currentIndex === -1) return;

                        const nextIndex = (currentIndex + 1) % allWrappers.length;
                        allWrappers.forEach((wrapper, index) => {
                            wrapper.style.display = index === nextIndex ? 'flex' : 'none';
                        });
                        updatePinnedView(nextIndex);
                    });
                }

                const pinnedMessages = pinnedArea.querySelectorAll('.pinned-wrapper');
                if (pinnedMessages.length >= 3) {
                    alert('Você atingiu o limite de 3 mensagens fixadas.');
                    return;
                }

                const pinnedWrapper = document.createElement('div');
                pinnedWrapper.className = 'pinned-wrapper';

                const pinIcon = document.createElement('span');
                pinIcon.className = 'pin-icon';
                pinIcon.innerHTML = '<i class="fa-solid fa-thumbtack"></i>';

                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'pinned-dots';
                for (let i = 0; i < 3; i++) {
                    const dot = document.createElement('span');
                    dot.className = 'pinned-dot';
                    dot.dataset.index = i;
                    dotsContainer.appendChild(dot);
                }

                const pinnedMessage = document.createElement('div');
                pinnedMessage.className = 'pinned-message';
                pinnedMessage.dataset.messageId = messageId;

                const maxPinnedLength = 300;
                let pinnedContentBase;
                if (content.includes('<blockquote')) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');
                    const replyContent = doc.body.textContent.replace(doc.querySelector('blockquote')?.textContent || '', '').trim();
                    pinnedContentBase = sender === 'you' ? `<span class="sender-you">Você:</span> ${replyContent}` : replyContent;
                } else if (content.includes('video-message')) {
                    const videoTitle = content.match(/<div class="video-title">(.+?)<\/div>/)?.[1] || '';
                    pinnedContentBase = `<span class="file-icon"><i class="fa-solid fa-video"></i></span> ${videoTitle || 'Vídeo'}`;
                } else if (content.includes('image-message')) {
                    const imageTitle = content.match(/<div class="caption">(.+?)<\/div>/)?.[1] || '';
                    pinnedContentBase = `<span class="file-icon"><i class="fa-solid fa-image"></i></span> ${imageTitle || 'Foto'}`;
                } else if (content.includes('file-message') || content.includes('pdf-message')) {
                    const fileTitle = content.match(/<div class="file-title">(.+?)<\/div>/)?.[1] || content.match(/<div class="pdf-title">(.+?)<\/div>/)?.[1] || '';
                    pinnedContentBase = `<span class="file-icon"><i class="fa-solid fa-file"></i></span> ${fileTitle || 'Arquivo'}`;
                } else {
                    pinnedContentBase = sender === 'you' ? `<span class="sender-you">Você:</span> ${content}` : content;
                }

                const pinnedContent = pinnedContentBase.length > maxPinnedLength 
                    ? pinnedContentBase.substring(0, maxPinnedLength - 3) + '...' 
                    : pinnedContentBase;

                pinnedMessage.innerHTML = `
                    <div class="pinned-content">${pinnedContent}</div>
                    <span class="pinned-options-icon">⁝</span>
                `;
                const optionsMenu = document.createElement('div');
                optionsMenu.className = 'pinned-options-menu';
                optionsMenu.style.display = 'none';
                optionsMenu.innerHTML = `
                    <button class="unpin-btn">Desfixar</button>
                    <button class="goto-message-btn">Ir para Mensagem</button>
                `;

                pinnedWrapper.appendChild(pinIcon);
                pinnedWrapper.appendChild(dotsContainer);
                pinnedWrapper.appendChild(pinnedMessage);
                pinnedArea.appendChild(pinnedWrapper);
                document.body.appendChild(optionsMenu);

                function updatePinnedView(activeIndex) {
                    const allWrappers = Array.from(pinnedArea.querySelectorAll('.pinned-wrapper'));
                    allWrappers.forEach((wrapper, index) => {
                        wrapper.style.display = index === activeIndex ? 'flex' : 'none';
                        const dots = wrapper.querySelectorAll('.pinned-dot');
                        dots.forEach(dot => dot.classList.remove('active'));
                        if (index < allWrappers.length) {
                            dots[index].classList.add('active');
                        }
                    });
                }

                const allWrappers = Array.from(pinnedArea.querySelectorAll('.pinned-wrapper'));
                const newIndex = allWrappers.indexOf(pinnedWrapper);
                updatePinnedView(newIndex);

                const optionsIcon = pinnedMessage.querySelector('.pinned-options-icon');
                optionsIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = optionsIcon.getBoundingClientRect();
                    optionsMenu.style.top = `${rect.bottom + window.scrollY}px`;
                    optionsMenu.style.left = `${rect.left + window.scrollX}px`;
                    optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
                });

                const closeMenu = (e) => {
                    if (!optionsMenu.contains(e.target) && !optionsIcon.contains(e.target)) {
                        optionsMenu.style.display = 'none';
                    }
                };
                document.addEventListener('click', closeMenu);

                optionsMenu.querySelector('.unpin-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    pinnedWrapper.remove();
                    optionsMenu.remove();
                    document.removeEventListener('click', closeMenu);
                    const remainingWrappers = Array.from(pinnedArea.querySelectorAll('.pinned-wrapper'));
                    if (remainingWrappers.length > 0) {
                        updatePinnedView(0);
                    } else {
                        pinnedArea.remove();
                    }
                });

                optionsMenu.querySelector('.goto-message-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const originalMessage = document.querySelector(`.message-wrapper[data-message-id="${messageId}"]`);
                    if (originalMessage) {
                        originalMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    optionsMenu.style.display = 'none';
                });

                menu.style.display = 'none';
                arrow.classList.remove('rotate');
            });
        }

        const unpinBtn = menu.querySelector('.unpin-message-btn');
        if (unpinBtn) {
            unpinBtn.addEventListener('click', () => {
                const pinnedArea = document.querySelector('.pinned-messages');
                if (pinnedArea) {
                    const pinnedWrapperToRemove = Array.from(pinnedArea.querySelectorAll('.pinned-wrapper'))
                        .find(wrapper => wrapper.querySelector('.pinned-message').dataset.messageId === messageId.toString());
                    if (pinnedWrapperToRemove) {
                        pinnedWrapperToRemove.remove();
                        const remainingWrappers = Array.from(pinnedArea.querySelectorAll('.pinned-wrapper'));
                        if (remainingWrappers.length > 0) {
                            function updatePinnedView(activeIndex) {
                                remainingWrappers.forEach((wrapper, index) => {
                                    wrapper.style.display = index === activeIndex ? 'flex' : 'none';
                                    const dots = wrapper.querySelectorAll('.pinned-dot');
                                    dots.forEach(dot => dot.classList.remove('active'));
                                    if (index < remainingWrappers.length) {
                                        dots[index].classList.add('active');
                                    }
                                });
                            }
                            updatePinnedView(0);
                        } else {
                            pinnedArea.remove();
                        }
                    }
                }
                menu.style.display = 'none';
                arrow.classList.remove('rotate');
            });
        }
    }

    addDefaultMenuEvents();

    arrow.addEventListener('click', (event) => {
        event.stopPropagation();
        if (globalSelectionMode) return;
        const isVisible = menu.style.display === 'block';
        document.querySelectorAll('.message-menu').forEach(m => m.style.display = 'none');
        document.querySelectorAll('.arrow').forEach(a => a.classList.remove('rotate'));
        menu.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            arrow.classList.add('rotate');
        } else {
            arrow.classList.remove('rotate');
        }
    });

    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && !arrow.contains(event.target) && !globalSelectionMode) {
            menu.style.display = 'none';
            arrow.classList.remove('rotate');
        }
    });

    messageWrapper.addEventListener('mouseover', () => {
        if (!globalSelectionMode) {
            arrow.style.opacity = '1';
            reactionIcon.style.display = 'inline-block';
        }
    });
    messageWrapper.addEventListener('mouseout', () => {
        if (!globalSelectionMode && menu.style.display === 'none') {
            arrow.style.opacity = '0';
            reactionIcon.style.display = 'none';
        }
    });

    reactionIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        const reactionMenu = document.createElement('div');
        reactionMenu.className = 'reaction-menu';
        reactionMenu.innerHTML = `
            <span data-reaction="👍">👍</span>
            <span data-reaction="😂">😂</span>
            <span data-reaction="❤️">❤️</span>
            <span data-reaction="😢">😢</span>
            <span data-reaction="😡">😡</span>
        `;
        reactionMenu.style.position = 'absolute';
        const rect = reactionIcon.getBoundingClientRect();
        reactionMenu.style.top = `${rect.bottom + window.scrollY}px`;
        reactionMenu.style.left = `${rect.left + window.scrollX}px`;
        document.body.appendChild(reactionMenu);

        reactionMenu.querySelectorAll('span').forEach(span => {
            span.addEventListener('click', () => {
                const reaction = span.dataset.reaction;
                addReaction(messageId, reaction);
                reactionMenu.remove();
            });
        });

        document.addEventListener('click', () => reactionMenu.remove(), { once: true });
    });

    if (hasImage || content.includes('video-message')) {
        messageDiv.addEventListener('click', (e) => {
            const img = e.target.closest('img');
            if (img) {
                const isVideo = img.closest('.video-message') !== null;
                openMediaPreview(img.closest('.image-message, .video-message').getAttribute('data-url'), isVideo);
            }
        });
    } else if (!content.includes('pdf-message')) {
        const fileContainer = messageDiv.querySelector('.file-message');
        if (fileContainer) {
            fileContainer.addEventListener('click', () => {
                const url = fileContainer.getAttribute('data-url');
                if (url) {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = url.split('/').pop() || 'file';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
        }
    }

    messageWrapper.appendChild(checkbox);
    messageWrapper.appendChild(arrow);
    messageWrapper.appendChild(menu);
    messageWrapper.appendChild(messageDiv);
    chatArea.appendChild(messageWrapper);

    const chatMessages = messages[activeChat?.id] || [];
    const messageData = chatMessages.find(msg => msg.id === messageId);
    if (messageData?.reactions) {
        messageData.reactions.forEach(reaction => {
            const reactionSpan = document.createElement('span');
            reactionSpan.className = 'reaction';
            reactionSpan.textContent = reaction;
            reactionsContainer.appendChild(reactionSpan);
        });
    }

    const scrollToBottomSmooth = () => {
        chatArea.scrollTo({ top: chatArea.scrollHeight, behavior: 'smooth' });
    };

    const images = messageWrapper.querySelectorAll('img');
    const videos = messageWrapper.querySelectorAll('video');
    let loadCount = 0;
    const totalLoads = images.length + videos.length;

    if (totalLoads > 0 && !isSingleViewMessage) {
        const handleLoad = () => {
            loadCount++;
            if (loadCount === totalLoads) scrollToBottomSmooth();
        };

        images.forEach(img => {
            if (img.complete) handleLoad();
            else {
                img.onload = handleLoad;
                img.onerror = handleLoad;
            }
        });

        videos.forEach(video => {
            if (video.readyState >= 2) handleLoad();
            else {
                video.onloadeddata = handleLoad;
                video.onerror = handleLoad;
            }
        });
    } else {
        scrollToBottomSmooth();
    }
}

function addReaction(messageId, reaction) {
    const messageWrapper = chatArea.querySelector(`.message-wrapper[data-message-id="${messageId}"]`);
    if (!messageWrapper) return;

    const reactionsContainer = messageWrapper.querySelector('.reactions-container');
    const reactionSpan = document.createElement('span');
    reactionSpan.className = 'reaction';
    reactionSpan.textContent = reaction;
    reactionsContainer.appendChild(reactionSpan);

    const chatMessages = messages[activeChat.id] || [];
    const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
        if (!chatMessages[messageIndex].reactions) {
            chatMessages[messageIndex].reactions = [];
        }
        chatMessages[messageIndex].reactions.push(reaction);
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
}

function openSingleViewModal(imageUrl, messageId) {
    const modal = document.createElement('div');
    modal.className = 'single-view-modal';
    modal.innerHTML = `
        <div class="single-view-content">
            <img src="${imageUrl}" alt="Imagem de Visualização Única" class="single-view-image">
            <button class="single-view-close"><i class="fa-solid fa-times"></i></button>
            <div class="progress-container">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('visible'), 10);

    const closeBtn = modal.querySelector('.single-view-close');
    const progressBar = modal.querySelector('.progress-bar');

    progressBar.style.width = '100%';
    progressBar.style.transition = 'width 10s linear';
    setTimeout(() => progressBar.style.width = '0%', 50);

    // Adiciona bolhas
    const addBubble = () => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.width = `${Math.random() * 4 + 2}px`;
        bubble.style.height = bubble.style.width;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.bottom = '-10px';
        progressBar.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1000);
    };
    const bubbleInterval = setInterval(addBubble, 200);

    const closeModal = () => {
        modal.classList.remove('visible');
        clearInterval(bubbleInterval);
        setTimeout(() => modal.remove(), 300);
    };

    closeBtn.addEventListener('click', closeModal);
    const autoCloseTimeout = setTimeout(closeModal, 10000);
    closeBtn.addEventListener('click', () => clearTimeout(autoCloseTimeout));
}

function openForwardModal(messageContent, messageId) {
    const forwardModal = document.createElement('div');
    forwardModal.className = 'modal';
    forwardModal.id = 'forward-modal';
    forwardModal.innerHTML = `
        <div class="modal-content">
            <h2>Encaminhar Mensagem</h2>
            <div id="forward-options" class="group-participants"></div>
            <div class="modal-buttons">
                <button id="forward-confirm-btn">Encaminhar</button>
                <button id="forward-cancel-btn">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(forwardModal);

    const forwardOptions = document.getElementById('forward-options');

    contacts.filter(c => c.id !== 0).forEach(contact => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'participant-option';
        optionDiv.innerHTML = `
            <input type="checkbox" value="${contact.id}" data-type="contact">
            <img src="${contact.photo || 'https://via.placeholder.com/40'}" alt="${contact.name}" class="member-photo">
            <span>${contact.name} (${contact.phone})</span>
        `;
        forwardOptions.appendChild(optionDiv);
    });

    groups.forEach(group => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'participant-option';
        optionDiv.innerHTML = `
            <input type="checkbox" value="${group.id}" data-type="group">
            <img src="${group.photo || 'https://via.placeholder.com/40'}" alt="${group.name}" class="member-photo">
            <span>${group.name} (${group.participants.length} participantes)</span>
        `;
        forwardOptions.appendChild(optionDiv);
    });

    document.getElementById('forward-cancel-btn').addEventListener('click', () => {
        forwardModal.remove();
    });

    document.getElementById('forward-confirm-btn').addEventListener('click', () => {
        const selectedOptions = Array.from(forwardOptions.querySelectorAll('input:checked'));
        selectedOptions.forEach(option => {
            const targetId = parseInt(option.value);
            const targetType = option.getAttribute('data-type');
            const target = targetType === 'contact' 
                ? contacts.find(c => c.id === targetId) 
                : groups.find(g => g.id === targetId);

            if (target) {
                const forwardedMessage = {
                    id: Date.now() + Math.random(),
                    content: messageContent,
                    sender: 'you',
                    timestamp: new Date().toISOString()
                };
                saveMessage(target.id, forwardedMessage);
                if (activeChat && activeChat.id === target.id) {
                    addMessage(messageContent, 'you', messageContent.includes('<'), forwardedMessage.id);
                }
            }
        });

        forwardModal.remove();
        renderContacts();
    });

    forwardModal.style.display = 'flex';
}

function showContextMenu(event, item, isGroup) {
    event.preventDefault();

    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const isFavorited = favorites.some(fav => fav.id === item.id);
    const isPinned = favorites.some(fav => fav.id === item.id && fav.pinned);

    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = `${event.pageX}px`;

    contextMenu.innerHTML = isGroup ? `
        <button class="favorite-group-btn">${isFavorited ? 'Desfavoritar Grupo' : 'Favoritar Grupo'} <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-star"></i></button>
        <button class="pin-group-btn">${isPinned ? 'Desafixar Grupo' : 'Fixar Grupo'} <i class="fa-solid fa-thumbtack"></i></button>
        <button class="leave-group-btn">Sair do Grupo <i class="fa-solid fa-xmark"></i></button>
    ` : `
        <button class="favorite-contact-btn">${isFavorited ? 'Desfavoritar Contato' : 'Favoritar Contato'} <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-star"></i></button>
        <button class="pin-contact-btn">${isPinned ? 'Desafixar Contato' : 'Fixar Contato'} <i class="fa-solid fa-thumbtack"></i></button>
        <button class="delete-contact-btn">Excluir Contato <i class="fa-solid fa-trash"></i></button>
    `;
    document.body.appendChild(contextMenu);

    // O restante da lógica de showContextMenu foi cortado no original, completar conforme necessário
}

function openProfileModal() {
    const profileModal = document.createElement('div');
    profileModal.className = 'modal';
    profileModal.id = 'profile-modal';
    profileModal.innerHTML = `
        <div class="modal-content">
            <h2>Editar Perfil</h2>
            <label>Foto de Perfil:</label>
            <input type="file" id="profile-photo-input" accept="image/*">
            <img src="${myProfile.photo || 'https://via.placeholder.com/100'}" id="profile-photo-preview" alt="Profile Photo" style="width: 100px; height: 100px; border-radius: 50%;">
            <label>Nome:</label>
            <input type="text" id="profile-name" value="${myProfile.name}">
            <label>Telefone:</label>
            <input type="text" id="profile-phone" value="${myProfile.phone}">
            <label>Bio:</label>
            <textarea id="profile-bio">${myProfile.bio}</textarea>
            <div class="modal-buttons">
                <button id="save-profile-btn">Salvar</button>
                <button id="close-profile-btn">Fechar</button>
            </div>
        </div>
    `;
    document.body.appendChild(profileModal);

    const photoInput = document.getElementById('profile-photo-input');
    const photoPreview = document.getElementById('profile-photo-preview');
    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (file) {
            photoPreview.src = URL.createObjectURL(file);
        }
    });

    document.getElementById('save-profile-btn').addEventListener('click', async () => {
        const file = photoInput.files[0];
        let newPhoto = myProfile.photo;

        if (file) {
            newPhoto = await fileToBase64(file);
        }

        myProfile.photo = newPhoto;
        myProfile.name = document.getElementById('profile-name').value;
        myProfile.phone = document.getElementById('profile-phone').value;
        myProfile.bio = document.getElementById('profile-bio').value;

        contacts[0] = { ...myProfile };
        localStorage.setItem('myProfile', JSON.stringify(myProfile));
        renderContacts();
        profileModal.remove();
    });

    document.getElementById('close-profile-btn').addEventListener('click', () => {
        profileModal.remove();
    });
}

document.getElementById('conversations-btn').addEventListener('click', () => renderContacts('all'));
document.getElementById('groups-btn').addEventListener('click', () => renderContacts('groups'));
document.getElementById('favorites-btn').addEventListener('click', () => renderContacts('favorites'));
document.getElementById('profile-btn').addEventListener('click', () => openProfileModal());

searchBar.addEventListener('input', (e) => {
    const query = e.target.value;
    const currentFilter = document.querySelector('.side-menu button.active')?.id || 'conversations-btn';
    const filterMap = {
        'conversations-btn': 'all',
        'groups-btn': 'groups',
        'favorites-btn': 'favorites'
    };
    renderContacts(filterMap[currentFilter] || 'all', query);
});

document.querySelectorAll('.side-menu button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.side-menu button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

async function generatePDFPreview(file) {
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return canvas.toDataURL();
}

async function generateVideoThumbnail(file, time = 2) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.preload = 'metadata';

    return new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = Math.min(time, video.duration || time);
        });
        video.addEventListener('seeked', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg'));
        });
        video.addEventListener('error', (e) => reject(new Error('Erro ao carregar vídeo: ' + e.message)));
    });
}

function getFileType(file) {
    const type = file.type;
    const ext = file.name.split('.').pop().toLowerCase();
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image';
    if (type.startsWith('video/') || ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) return 'video';
    if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
    if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ['doc', 'docx'].includes(ext)) return 'word';
    if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || ['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
    if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || ['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) return 'audio';
    if (type === 'text/plain' || ['txt', 'log', 'md'].includes(ext)) return 'text';
    if (['js', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css', 'php', 'rb', 'go', 'ts'].includes(ext)) return 'code';
    if (type === 'application/zip' || type === 'application/x-rar-compressed' || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
    return 'file';
}

newGroupBtn.addEventListener('click', () => {
    groupModal.style.display = 'flex';
    groupNameInput.value = '';
    groupPhotoInput.value = '';
    groupPhotoPreview.src = '';
    groupParticipants.innerHTML = '';
    const selectedMembersPhotos = document.getElementById('selected-members-photos');
    selectedMembersPhotos.innerHTML = '';

    contacts.forEach(contact => {
        const participantDiv = document.createElement('div');
        participantDiv.className = 'participant-option';
        participantDiv.innerHTML = `
            <input type="checkbox" value="${contact.id}" data-contact-id="${contact.id}">
            <img src="${contact.photo || 'https://via.placeholder.com/40'}" alt="${contact.name}" class="member-photo">
            <span>${contact.name} (${contact.phone})</span>
        `;
        groupParticipants.appendChild(participantDiv);

        const checkbox = participantDiv.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            updateSelectedMembersPreview();
        });
    });
});

groupPhotoInput.addEventListener('change', async () => {
    const file = groupPhotoInput.files[0];
    if (file) {
        const base64Photo = await fileToBase64(file);
        groupPhotoPreview.src = base64Photo;
    } else {
        groupPhotoPreview.src = 'https://via.placeholder.com/40';
    }
});

closeModalBtn.addEventListener('click', () => {
    groupModal.style.display = 'none';
    groupNameInput.value = '';
    groupPhotoInput.value = '';
    groupPhotoPreview.src = '';
    const selectedMembersPhotos = document.getElementById('selected-members-photos');
    selectedMembersPhotos.innerHTML = '';
});

createGroupBtn.addEventListener('click', async () => {
    const groupName = groupNameInput.value.trim();
    
    const selectedParticipants = Array.from(groupParticipants.querySelectorAll('input:checked'))
        .map(input => contacts.find(c => c.id === parseInt(input.value)));

    if (selectedParticipants.length < 1) {
        alert('Selecione pelo menos um participante.');
        return;
    }

    const groupPhotoFile = groupPhotoInput.files[0];
    const groupPhotoUrl = groupPhotoFile ? await fileToBase64(groupPhotoFile) : 'https://via.placeholder.com/40';

    const newGroup = {
        id: groups.length + 1,
        name: groupName,
        participants: selectedParticipants,
        photo: groupPhotoUrl
    };

    groups.push(newGroup);
    saveGroups();
    renderContacts();
    groupModal.style.display = 'none';
    groupNameInput.value = '';
    groupPhotoInput.value = '';
    groupPhotoPreview.src = '';
    const selectedMembersPhotos = document.getElementById('selected-members-photos');
    selectedMembersPhotos.innerHTML = '';
});

function updateSelectedMembersPreview() {
    const selectedCheckboxes = Array.from(groupParticipants.querySelectorAll('input:checked'));
    const selectedMembers = selectedCheckboxes.map(cb => contacts.find(c => c.id === parseInt(cb.value)));
    const selectedMembersPhotos = document.getElementById('selected-members-photos');
    selectedMembersPhotos.innerHTML = '';
    selectedMembers.forEach(member => {
        const photoImg = document.createElement('img');
        photoImg.src = member.photo || 'https://via.placeholder.com/30';
        photoImg.alt = member.name;
        selectedMembersPhotos.appendChild(photoImg);
    });
}

messageInput.addEventListener('dragover', (e) => e.preventDefault());
messageInput.addEventListener('dragenter', (e) => {
    e.preventDefault();
    messageInput.classList.add('drag-over');
});
messageInput.addEventListener('dragleave', (e) => {
    e.preventDefault();
    messageInput.classList.remove('drag-over');
});
messageInput.addEventListener('drop', (e) => {
    e.preventDefault();
    messageInput.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.files = files;
        handleFileUpload(fileInput);
        document.body.removeChild(fileInput);
    }
});

chatArea.addEventListener('scroll', () => {
    const isAtBottom = chatArea.scrollTop + chatArea.clientHeight >= chatArea.scrollHeight - 50;
    const hasNewMessages = chatArea.scrollHeight > chatArea.clientHeight;

    if (!isAtBottom && hasNewMessages) {
        scrollToBottomBtn.style.display = 'block';
    } else {
        scrollToBottomBtn.style.display = 'none';
    }
});

scrollToBottomBtn.addEventListener('click', () => {
    chatArea.scrollTo({
        top: chatArea.scrollHeight,
        behavior: 'smooth'
    });
    scrollToBottomBtn.style.display = 'none';
});

scrollToBottomBtn.style.display = 'none';

function createFileOptionsMenu() {
    const menu = document.createElement('div');
    menu.className = 'file-options-menu';
    menu.innerHTML = `
        <button data-type="image"><i class="fa-solid fa-image"></i> Imagem</button>
        <button data-type="video"><i class="fa-solid fa-video"></i> Vídeo</button>
        <button data-type="pdf"><i class="fa-solid fa-file-pdf"></i> PDF</button>
        <button data-type="word"><i class="fa-solid fa-file-word"></i> Documento Word</button>
        <button data-type="excel"><i class="fa-solid fa-file-excel"></i> Excel</button>
        <button data-type="text"><i class="fa-solid fa-file-lines"></i> Texto</button>
    `;
    fileOptionsBtn.appendChild(menu);
    return menu;
}

const fileOptionsMenu = createFileOptionsMenu();

fileOptionsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileOptionsMenu.classList.toggle('visible');
});

document.addEventListener('click', (e) => {
    if (!fileOptionsBtn.contains(e.target)) {
        fileOptionsMenu.classList.remove('visible');
    }
});

const fileTypes = {
    image: 'image/*',
    video: 'video/*',
    pdf: 'application/pdf',
    word: '.doc,.docx',
    excel: '.xls,.xlsx',
    text: '.txt'
};

fileOptionsMenu.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        const type = button.getAttribute('data-type');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = fileTypes[type];
        input.multiple = true;
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', () => {
            handleFileUpload(input);
            document.body.removeChild(input);
        });
        input.click();
        fileOptionsMenu.classList.remove('visible');
    });
});

const emojis = [
    '😊', '😂', '😍', '😢', '😡', '😁', '😎', '🤔', '😴', '🙃',
    '😜', '🤩', '😭', '😤', '🤗', '❤️', '🥰', '😞', '😳', '😇',
    '😏', '😀', '😅', '😆', '😋', '😮', '😯', '😰', '😱', '😫',
    '😬', '😣', '😒', '😔', '😕', '😖', '😨', '😚', '😙', '😗',
    '😝', '😛', '😶', '😐', '😷', '🤐', '🤒', '🤕', '🤮', '🤢',
    '🤧', '🥱', '🥲', '🥳', '🥴', '🥵', '🥶', '🤓', '🤠', '🥸',
    '🤡', '🤯', '🤬', '😈', '👿', '😺', '😸', '😹', '😻', '😼',
    '😽', '🙀', '😿', '😾', '💋', '💘', '💝', '💖', '💗', '💓',
    '💞', '💕', '💟', '❣️', '💔', '💥', '💫', '💦', '💨', '💤',
    '👍', '👎', '🤷', '🤦', '🙌', '👏', '👀', '👋', '✌️', '👌',
    '💪', '🙏', '👨‍💻', '👩‍💻', '👨‍🎤', '👩‍🎤', '🧑‍💼', '🧑‍🏫', '👮‍♂️', '👮‍♀️',
    '👨‍🚒', '👩‍🚒', '👨‍✈️', '👩‍✈️', '👨‍🚀', '👩‍🚀', '👨‍⚖️', '👩‍⚖️', '👨‍🌾', '👩‍🌾',
    '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🏭', '👩‍🏭', '👨‍💼', '👩‍💼', '👨‍🎨', '👩‍🎨',
    '🐱', '🐶', '🐴', '🐢', '🐦', '🐟', '🦜', '🦁', '🐧', '🐵',
    '🐍', '🕷️', '🐞', '🌱', '🌹', '🌴', '🌵', '🍂', '☘️', '🌾',
    '🐘', '🐯', '🐻', '🐀', '🐇', '🐐', '🐏', '🐑', '🐊', '🦎',
    '🦂', '🦀', '🦑', '🐠', '🐡', '🐺', '🦅', '🦆', '🦉', '🦇',
    '🐾', '🌲', '🌳', '🌿', '🍁', '🍃', '🌸', '🌼', '🌺', '🌻',
    '🍕', '🍔', '🍟', '🌮', '🌭', '🍩', '🍪', '🍉', '🍓', '🍌',
    '🥑', '🥦', '🌽', '🌶', '🎂', '🍬', '🍼', '☕', '🍵', '🍺',
    '🍷', '🍸', '🍹', '🍻', '🥂', '🥃', '🥤', '🧃', '🥛', '🍶',
    '🍴', '🥄', '🥢', '🍳', '🥓', '🥞', '🥐', '🥖', '🥨', '🥯',
    '🥟', '🥠', '🥡', '🍿', '🧂', '🥫', '🍑', '🍒', '🥭', '🍍',
    '🚀', '🚗', '🚲', '✈️', '🚢', '🏠', '🏢', '🏖️', '🏔️', '🗻',
    '🌋', '🗽', '🏰', '⛵', '🚦', '🚧', '🗿', '🌍', '🌏', '🌎',
    '🚙', '🚑', '🚒', '🚓', '🛻', '🚚', '🚜', '🏍️', '🛴', '🛵',
    '🚅', '🚆', '🚇', '🚊', '🚉', '🛫', '🛬', '🛳️', '⛽', '🚨',
    '🚩', '🏁', '🏳️', '🏴', '🏠', '🏡', '🏚️', '🏘️', '🏗️', '🏞️',
    '🎉', '🎧', '🎮', '🕹️', '🎵', '🎤', '🎹', '🥁', '🎷', '🎺',
    '🏆', '⚽', '🏀', '🏈', '🎾', '🥎', '🏐', '🏉', '🥊', '🏓',
    '🥋', '⛳', '🏸', '🏒', '🏑', '🥅', '🏂', '🏃‍♂️', '🏃‍♀️', '🏄‍♂️',
    '🏄‍♀️', '🏋️‍♂️', '🏋️‍♀️', '🤸‍♂️', '🤸‍♀️', '⛸️', '🏹', '🎣', '🎱', '🧩',
    '📸', '💻', '📱', '⌚', '📚', '📝', '📖', '🔒', '🔑', '🔨',
    '⚙️', '💣', '🛡️', '🛠️', '🗜️', '⚖️', '🔧', '🔗', '⚓', '🔮',
    '📺', '📻', '🎙️', '📡', '🔋', '🔌', '💡', '🛋️', '🛏️', '🛒',
    '🧳', '🧨', '🧂', '🧱', '🧪', '🧫', '🧬', '🧭', '🧹', '🧺',
    '🧻', '🧼', '🧽', '🧴', '🧸', '🛍️', '🎀', '🎁', '🧧', '🎮',
    '💡', '✨', '⚡', '☀️', '🌙', '🔋', '🔌', '💵', '💰', '💳',
    '📂', '🗝️', '💼', '📇', '🔦', '🏮', '📍', '📎', '✂️', '♟️',
    '⚠️', '🚫', '⛔', '❌', '✅', '✔️', '✨', '⭐', '🌟', '💫',
    '🇧🇷', '🇺🇸', '🇯🇵', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇨🇳', '🇷🇺',
    '🇦🇷', '🇦🇺', '🇨🇦', '🇨🇴', '🇪🇬', '🇮🇳', '🇲🇽', '🇳🇱', '🇳🇴', '🇵🇹',
    '🇸🇪', '🇸🇦', '🇰🇷', '🇿🇦', '🇹🇷', '🇬🇷', '🇮🇱', '🇵🇱', '🇨🇿', '🇭🇺',
    '🇦🇹', '🇧🇪', '🇨🇭', '🇩🇰', '🇫🇮', '🇮🇪', '🇳🇿', '🇵🇭', '🇸🇬', '🇹🇭',
    '🇻🇳', '🇲🇾', '🇮🇩', '🇸🇷', '🇺🇦', '🇵🇷', '🇨🇷', '🇵🇪', '🇪🇨', '🇧🇴'
];

const emojiPicker = document.createElement('div');
emojiPicker.className = 'emoji-picker';
const emojiGrid = document.createElement('div');
emojiGrid.className = 'emoji-grid';
emojis.forEach(emoji => {
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = emoji;
    emojiSpan.addEventListener('click', () => {
        messageInput.value += emoji;
        messageInput.focus();
    });
    emojiGrid.appendChild(emojiSpan);
});
emojiPicker.appendChild(emojiGrid);
document.body.appendChild(emojiPicker);

const categoryLimits = [
    100, 180, 230, 280, 330, 370, 420, 450, 500
];

emojis.forEach((emoji, index) => {
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = emoji;
    emojiSpan.addEventListener('click', () => {
        document.getElementById('message-input').value += emoji;
        document.getElementById('message-input').focus();
    });
    
    if (categoryLimits.some(limit => index === limit - 1)) {
        emojiSpan.classList.add('emoji-category-end');
    }
    
    emojiGrid.appendChild(emojiSpan);
});

emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('visible');
});

document.addEventListener('click', (e) => {
    if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.classList.remove('visible');
    }
});

if (!settingsBtn || !settingsMenu) {
    console.error('Elementos settingsBtn ou settingsMenu não encontrados!');
} else {
    settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Botão de configurações clicado');
    settingsMenu.classList.toggle('visible');
    
    if (settingsMenu.classList.contains('visible')) {
        const contactInfoSection = document.getElementById('contact-info-section');
        const settingsOptions = document.querySelector('.settings-options');
        
        settingsOptions.innerHTML = '';

        if (activeChat) {
            const isGroup = activeChat.participants && activeChat.participants.length > 0;
            const isFavorited = favorites.some(fav => fav.id === activeChat.id);
            const isPinned = favorites.some(fav => fav.id === activeChat.id && fav.pinned);

            if (!isGroup) {
                contactInfoSection.style.display = 'block';
                contactInfoSection.innerHTML = `
                    <img src="${activeChat.photo || 'https://via.placeholder.com/100'}" alt="${activeChat.name}" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 10px;">
                    <h3>${activeChat.name}</h3>
                    <p>${activeChat.phone}</p>
                `;
                addToGroupBtn.style.display = 'block';
                groupMembersSection.style.display = 'none';
            } else {
                renderGroupMembers();
                groupMembersSection.style.display = 'block';
                addToGroupBtn.style.display = 'none';
                contactInfoSection.style.display = 'none';
            }

            settingsOptions.innerHTML = `
                <button id="delete-chat-btn">Apagar Chat <i class="fa-solid fa-trash"></i></button>
                <button id="theme-btn">Mudar Tema <i class="fa-solid fa-palette"></i></button>
                <button id="wallpaper-btn">Mudar Papel de Parede <i class="fa-solid fa-image"></i></button>
                <button id="temp-messages-btn">Mensagens Temporárias <i class="fa-solid fa-clock"></i></button>
                ${isGroup ? `
                    <button class="favorite-group-btn">${isFavorited ? 'Desfavoritar Grupo' : 'Favoritar Grupo'} <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-star"></i></button>
                    <button class="pin-group-btn">${isPinned ? 'Desafixar Grupo' : 'Fixar Grupo'} <i class="fa-solid fa-thumbtack"></i></button>
                    <button class="leave-group-btn">Sair do Grupo <i class="fa-solid fa-xmark"></i></button>
                ` : `
                    <button class="favorite-contact-btn">${isFavorited ? 'Desfavoritar Contato' : 'Favoritar Contato'} <i class="${isFavorited ? 'fa-solid' : 'fa-regular'} fa-star"></i></button>
                    <button class="pin-contact-btn">${isPinned ? 'Desafixar Contato' : 'Fixar Contato'} <i class="fa-solid fa-thumbtack"></i></button>
                    <button class="delete-contact-btn">Excluir Contato <i class="fa-solid fa-trash"></i></button>
                `}
            `;

                settingsOptions.querySelector('#delete-chat-btn').addEventListener('click', () => {
                    if (activeChat) {
                        chatArea.innerHTML = '';
                        if (messages[activeChat.id]) {
                            delete messages[activeChat.id];
                            localStorage.setItem('chatMessages', JSON.stringify(messages));
                        }
                    }
                });

                // Evento ajustado do botão Mudar Tema
                const themeBtn = settingsOptions.querySelector('#theme-btn');
                themeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    const existingThemeMenu = document.querySelector('.theme-menu');
                    if (existingThemeMenu) existingThemeMenu.remove();

                    const themes = [
                        { 
                            name: 'Cinza', 
                            background: '#333', 
                            chatBg: 'url(grey_wlpp.jpg)', 
                            headerBg: '#232323', 
                            inputArea: '#232323', 
                            inputBg: '#636363', 
                            iconBg: '#ccc', 
                            emojiBg: '#ccc', 
                            btnBg: '#ccc', 
                            msgYou: '#1c1919', 
                            msgOther: '#fff', 
                            msgYouAf: '#1c1919', 
                            msgOtherAf: '#fff',
                            previewImg: 'Captura de tela 2025-02-26 141640.png'
                        },
                        { 
                            name: 'Rosa', 
                            background: '#333', 
                            chatBg: 'url(pink_wlpp.jpg)', 
                            headerBg: '#75053f', 
                            inputArea: '#75053f', 
                            inputBg: '#824263', 
                            iconBg: '#f50a83', 
                            emojiBg: '#f50a83', 
                            btnBg: '#f50a83', 
                            msgYou: '#75053f', 
                            msgOther: '#fff', 
                            msgYouAf: '#75053f', 
                            msgOtherAf: '#fff',
                            previewImg: 'Captura de tela 2025-02-26 141702.png'
                        },
                        { 
                            name: 'Azul', 
                            background: '#333', 
                            chatBg: 'url(blue_wlpp.jpg)', 
                            headerBg: '#0d024f', 
                            inputArea: '#0d024f', 
                            inputBg: '#2f2859', 
                            iconBg: '#452be0', 
                            emojiBg: '#452be0', 
                            btnBg: '#452be0', 
                            msgYou: '#201947', 
                            msgOther: '#fff', 
                            msgYouAf: '#201947', 
                            msgOtherAf: '#fff',
                            previewImg: 'Captura de tela 2025-02-26 141717.png'
                        },
                        { 
                            name: 'Verde', 
                            background: '#333', 
                            chatBg: 'url(green_wlpp.jpg)', 
                            headerBg: '#104206', 
                            inputArea: '#104206', 
                            inputBg: '#395e31', 
                            iconBg: '#23b806', 
                            emojiBg: '#23b806', 
                            btnBg: '#23b806', 
                            msgYou: '#1d4027', 
                            msgOther: '#fff', 
                            msgYouAf: '#1d4027', 
                            msgOtherAf: '#fff',
                            previewImg: 'Captura de tela 2025-02-26 141740.png'
                        }
                    ];

                    const themeMenu = document.createElement('div');
                    themeMenu.className = 'theme-menu';
                    themeMenu.style.position = 'absolute';
                    themeMenu.style.left = `${themeBtn.offsetLeft}px`;
                    themeMenu.style.top = `${themeBtn.offsetTop + themeBtn.offsetHeight}px`;

                    themes.forEach((theme, index) => {
                        const themeOption = document.createElement('button');
                        themeOption.textContent = theme.name;
                        themeOption.className = 'theme-option';
                        themeOption.dataset.themeIndex = index;
                        themeMenu.appendChild(themeOption);

                        themeOption.addEventListener('mouseenter', (e) => {
                            const previewTooltip = document.createElement('div');
                            previewTooltip.className = 'theme-preview-tooltip';
                            previewTooltip.innerHTML = `<img src="${theme.previewImg}" alt="${theme.name} preview" />`;
                            document.body.appendChild(previewTooltip);

                            const rect = themeOption.getBoundingClientRect();
                            previewTooltip.style.position = 'absolute';
                            previewTooltip.style.left = `${rect.right + 10}px`;
                            previewTooltip.style.top = `${rect.top}px`;

                            themeOption.addEventListener('mouseleave', () => {
                                previewTooltip.remove();
                            }, { once: true });
                        });

                        themeOption.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const selectedTheme = themes[index];
                            localStorage.setItem('chatTheme', index);

                            document.body.style.backgroundColor = selectedTheme.background;
                            document.querySelector('.chat-area').style.backgroundImage = selectedTheme.chatBg;
                            document.querySelector('.header').style.backgroundColor = selectedTheme.headerBg;
                            document.querySelector('.input-area').style.backgroundColor = selectedTheme.inputArea;
                            document.querySelector('.input-area input').style.backgroundColor = selectedTheme.inputBg;

                            document.querySelectorAll('.file-options-btn, .button').forEach(el => {
                                el.style.color = selectedTheme.iconBg;
                            });
                            document.querySelector('.emoji-btn').style.color = selectedTheme.emojiBg;
                            document.querySelector('.send-button').style.color = selectedTheme.btnBg;

                            document.querySelectorAll('.message.you').forEach(el => {
                                el.style.backgroundColor = selectedTheme.msgYou;
                            });
                            document.querySelectorAll('.message.other').forEach(el => {
                                el.style.backgroundColor = selectedTheme.msgOther;
                            });

                            let styleSheet = document.getElementById('dynamic-theme-styles');
                            if (!styleSheet) {
                                styleSheet = document.createElement('style');
                                styleSheet.id = 'dynamic-theme-styles';
                                document.head.appendChild(styleSheet);
                            }
                            styleSheet.textContent = `
                                .message.you::after {
                                    border-left-color: ${selectedTheme.msgYouAf};
                                }
                                .message.other::after {
                                    border-right-color: ${selectedTheme.msgOtherAf};
                                }
                                .message.you {
                                    background-color: ${selectedTheme.msgYou};
                                }
                                .message.other {
                                    background-color: ${selectedTheme.msgOther};
                                }
                            `;

                            // Remove qualquer tooltip de prévia antes de fechar o menu
                            const existingTooltip = document.querySelector('.theme-preview-tooltip');
                            if (existingTooltip) existingTooltip.remove();

                            themeMenu.remove(); // Fecha o menu após a seleção
                        });
                    });

                    settingsMenu.appendChild(themeMenu);

                    document.addEventListener('click', function closeThemeMenu(e) {
                        if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
                            // Remove o tooltip ao fechar o menu clicando fora
                            const existingTooltip = document.querySelector('.theme-preview-tooltip');
                            if (existingTooltip) existingTooltip.remove();
                            themeMenu.remove();
                            document.removeEventListener('click', closeThemeMenu);
                        }
                    }, { once: true });
                });

                settingsOptions.querySelector('#wallpaper-btn').addEventListener('click', () => {
                    const wallpapers = [
                        'url(grey_wlpp.jpg)',
                        'url(pink_wlpp.jpg)',
                        'url(blue_wlpp.jpg)',
                        'url(green_wlpp.jpg)'
                    ];
                    let currentWallpaper = localStorage.getItem('chatWallpaper') || 0;
                    currentWallpaper = (parseInt(currentWallpaper) + 1) % wallpapers.length;
                    localStorage.setItem('chatWallpaper', currentWallpaper);

                    chatArea.style.backgroundImage = wallpapers[currentWallpaper];
                    chatArea.style.backgroundSize = '300px 300px';
                    chatArea.style.imageRendering = 'optimizeSpeed';
                    chatArea.style.backgroundPosition = 'center';
                    chatArea.style.backgroundRepeat = 'no-repeat';
                });

                const favoriteBtn = settingsOptions.querySelector(isGroup ? '.favorite-group-btn' : '.favorite-contact-btn');
                favoriteBtn.addEventListener('click', () => {
                    if (isFavorited) {
                        favorites = favorites.filter(fav => fav.id !== activeChat.id);
                    } else {
                        if (!favorites.some(fav => fav.id === activeChat.id)) {
                            favorites.push({ ...activeChat, pinned: false });
                        }
                    }
                    saveFavorites();
                    renderContacts();
                    favoriteBtn.innerHTML = `${favorites.some(fav => fav.id === activeChat.id) ? 'Desfavoritar' : 'Favoritar'} ${isGroup ? 'Grupo' : 'Contato'} <i class="${favorites.some(fav => fav.id === activeChat.id) ? 'fa-solid' : 'fa-regular'} fa-star"></i>`;
                });

                const pinBtn = settingsOptions.querySelector(isGroup ? '.pin-group-btn' : '.pin-contact-btn');
                pinBtn.addEventListener('click', () => {
                    if (isFavorited) {
                        const favIndex = favorites.findIndex(fav => fav.id === activeChat.id);
                        if (isPinned) {
                            favorites[favIndex].pinned = false;
                        } else {
                            favorites[favIndex].pinned = true;
                        }
                    } else {
                        favorites.push({ ...activeChat, pinned: true });
                    }
                    saveFavorites();
                    renderContacts();
                    pinBtn.innerHTML = `${favorites.some(fav => fav.id === activeChat.id && fav.pinned) ? 'Desafixar' : 'Fixar'} ${isGroup ? 'Grupo' : 'Contato'} <i class="fa-solid fa-thumbtack"></i>`;
                });

                const actionBtn = settingsOptions.querySelector(isGroup ? '.leave-group-btn' : '.delete-contact-btn');
                actionBtn.addEventListener('click', () => {
                    if (isGroup) {
                        groups = groups.filter(g => g.id !== activeChat.id);
                        delete messages[activeChat.id];
                        saveGroups();
                    } else {
                        contacts = contacts.filter(c => c.id !== activeChat.id);
                        favorites = favorites.filter(fav => fav.id !== activeChat.id);
                        delete messages[activeChat.id];
                        saveFavorites();
                    }
                    localStorage.setItem('chatMessages', JSON.stringify(messages));
                    renderContacts();
                    settingsMenu.classList.remove('visible');
                    activeChat = null;
                    chatArea.innerHTML = '';
                });
            } else {
                settingsOptions.innerHTML = `
                    <button id="theme-btn">Mudar Tema <i class="fa-solid fa-palette"></i></button>
                    <button id="wallpaper-btn">Mudar Papel de Parede <i class="fa-solid fa-image"></i></button>
                    <p>Selecione um chat para mais opções</p>
                `;

                const themeBtn = settingsOptions.querySelector('#theme-btn');
                themeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    const existingThemeMenu = document.querySelector('.theme-menu');
                    if (existingThemeMenu) existingThemeMenu.remove();

                    const themes = [
                        { 
                            name: 'Cinza', 
                            background: '#333', 
                            chatBg: 'url(grey_wlpp.jpg)', 
                            headerBg: '#232323', 
                            inputArea: '#232323', 
                            inputBg: '#636363', 
                            iconBg: '#ccc', 
                            emojiBg: '#ccc', 
                            btnBg: '#ccc', 
                            msgYou: '', 
                            msgOther: '#fff',
                            previewImg: 'Captura de tela 2025-02-26 141640.png'
                        },
                        { 
                            name: 'Rosa', 
                            background: '#333', 
                            chatBg: 'url(pink_wlpp.jpg)', 
                            headerBg: '#75053f', 
                            inputArea: '#75053f', 
                            inputBg: '#824263', 
                            iconBg: '#f50a83', 
                            emojiBg: '#f50a83', 
                            btnBg: '#f50a83', 
                            msgYou: '#75053f', 
                            msgOther: '#fff',
                            previewImg: 'Captura de tela 2025-02-26 141702.png'
                        },
                        { 
                            name: 'Azul', 
                            background: '#333', 
                            chatBg: 'url(blue_wlpp.jpg)', 
                            headerBg: '#0d024f', 
                            inputArea: '#0d024f', 
                            inputBg: '#2f2859', 
                            iconBg: '#452be0', 
                            emojiBg: '#452be0', 
                            btnBg: '#452be0', 
                            msgYou: '', 
                            msgOther: '#fff',
                            previewImg: 'Captura de tela 2025-02-26 141717.png'
                        },
                        { 
                            name: 'Verde', 
                            background: '#333', 
                            chatBg: 'url(green_wlpp.jpg)', 
                            headerBg: '#104206', 
                            inputArea: '#104206', 
                            inputBg: '#395e31', 
                            iconBg: '#23b806', 
                            emojiBg: '#23b806', 
                            btnBg: '#23b806', 
                            msgYou: '', 
                            msgOther: '',
                            previewImg: 'Captura de tela 2025-02-26 141740.png'
                        }
                    ];

                    const themeMenu = document.createElement('div');
                    themeMenu.className = 'theme-menu';
                    themeMenu.style.position = 'absolute';
                    themeMenu.style.left = `${themeBtn.offsetLeft}px`;
                    themeMenu.style.top = `${themeBtn.offsetTop + themeBtn.offsetHeight}px`;

                    themes.forEach((theme, index) => {
                        const themeOption = document.createElement('button');
                        themeOption.textContent = theme.name;
                        themeOption.className = 'theme-option';
                        themeOption.dataset.themeIndex = index;
                        themeMenu.appendChild(themeOption);

                        themeOption.addEventListener('mouseenter', (e) => {
                            const previewTooltip = document.createElement('div');
                            previewTooltip.className = 'theme-preview-tooltip';
                            previewTooltip.innerHTML = `<img src="${theme.previewImg}" alt="${theme.name} preview" />`;
                            document.body.appendChild(previewTooltip);

                            const rect = themeOption.getBoundingClientRect();
                            previewTooltip.style.position = 'absolute';
                            previewTooltip.style.left = `${rect.right + 10}px`;
                            previewTooltip.style.top = `${rect.top}px`;

                            themeOption.addEventListener('mouseleave', () => {
                                previewTooltip.remove();
                            }, { once: true });
                        });

                        themeOption.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const selectedTheme = themes[index];
                            localStorage.setItem('chatTheme', index);

                            document.body.style.backgroundColor = selectedTheme.background;
                            document.querySelector('.chat-area').style.setProperty('--chat-background', selectedTheme.chatBg);
                            document.querySelector('.header').style.backgroundColor = selectedTheme.headerBg;
                            document.querySelector('.input-area').style.backgroundColor = selectedTheme.inputArea;
                            document.querySelector('.input-area input').style.backgroundColor = selectedTheme.inputBg;
                            document.querySelectorAll('.file-options-btn, .button').forEach(el => {
                                el.style.color = selectedTheme.iconBg;
                            });
                            document.querySelector('.emoji-btn').style.color = selectedTheme.emojiBg;
                            document.querySelector('.send-button').style.color = selectedTheme.btnBg;
                            document.querySelector('.message.you').style.backgroundColor = selectedTheme.msgYou;
                            document.querySelector('.message.other').style.backgroundColor = selectedTheme.msgOther;

                            // Remove qualquer tooltip de prévia antes de fechar o menu
                            const existingTooltip = document.querySelector('.theme-preview-tooltip');
                            if (existingTooltip) existingTooltip.remove();

                            themeMenu.remove();
                        });
                    });

                    settingsMenu.appendChild(themeMenu);

                    document.addEventListener('click', function closeThemeMenu(e) {
                        if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
                            const existingTooltip = document.querySelector('.theme-preview-tooltip');
                            if (existingTooltip) existingTooltip.remove();
                            themeMenu.remove();
                            document.removeEventListener('click', closeThemeMenu);
                        }
                    }, { once: true });
                });

                settingsOptions.querySelector('#wallpaper-btn').addEventListener('click', () => {
                    const wallpapers = [
                        'url(grey_wlpp.jpg)',
                        'url(pink_wlpp.jpg)',
                        'url(blue_wlpp.jpg)',
                        'url(green_wlpp.jpg)'
                    ];
                    let currentWallpaper = localStorage.getItem('chatWallpaper') || 0;
                    currentWallpaper = (parseInt(currentWallpaper) + 1) % wallpapers.length;
                    localStorage.setItem('chatWallpaper', currentWallpaper);

                    chatArea.style.backgroundImage = wallpapers[currentWallpaper];
                    chatArea.style.backgroundSize = '200px 200px';
                    chatArea.style.imageRendering = 'optimizeSpeed';
                    chatArea.style.backgroundPosition = 'center';
                    chatArea.style.backgroundRepeat = 'no-repeat';
                });

                addToGroupBtn.style.display = 'none';
                groupMembersSection.style.display = 'none';
                contactInfoSection.style.display = 'none';
            }

            closeSettingsBtn.onclick = () => {
                settingsMenu.classList.remove('visible');
            };
        }
    });
}


    function openAddMemberModal() {
        if (activeChat && activeChat.participants) {
            const addMemberModal = document.createElement('div');
            addMemberModal.className = 'modal';
            addMemberModal.id = 'add-member-modal';
            addMemberModal.innerHTML = `
                <div class="modal-content">
                    <h2>Adicionar Membro ao Grupo</h2>
                    <div id="available-members" class="group-participants"></div>
                    <div class="modal-buttons">
                        <button id="add-members-btn">Adicionar</button>
                        <button id="close-add-member-btn">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(addMemberModal);

            const availableMembers = contacts.filter(contact => 
                !activeChat.participants.some(member => member.id === contact.id)
            );
            const availableMembersDiv = document.getElementById('available-members');
            availableMembers.forEach(contact => {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'participant-option';
                contactDiv.innerHTML = `
                    <input type="checkbox" value="${contact.id}">
                    <img src="${contact.photo || 'https://via.placeholder.com/40'}" alt="${contact.name}" class="member-photo">
                    <span>${contact.name} (${contact.phone})</span>
                `;
                availableMembersDiv.appendChild(contactDiv);
            });

            document.getElementById('close-add-member-btn').addEventListener('click', () => {
                addMemberModal.remove();
            });

            document.getElementById('add-members-btn').addEventListener('click', () => {
                const selectedMembers = Array.from(availableMembersDiv.querySelectorAll('input:checked'))
                    .map(input => contacts.find(c => c.id === parseInt(input.value)));
                activeChat.participants = [...activeChat.participants, ...selectedMembers];
                saveGroups();
                renderGroupMembers();
                renderContacts();
                addMemberModal.remove();
            });

            addMemberModal.style.display = 'flex';
        }
    }
    
    function renderGroupMembers() {
        if (activeChat && activeChat.participants) {
            groupMembersList.innerHTML = '';
            activeChat.participants.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'member-item';
                memberDiv.innerHTML = `
                    <img src="${member.photo || 'https://via.placeholder.com/40'}" alt="${member.name}" class="member-photo">
                    <span class="member-name">${member.name}</span>
                    <button class="remove-member-btn" data-member-id="${member.id}">Remover</button>
                `;
                groupMembersList.appendChild(memberDiv);

                document.querySelectorAll('.remove-member-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        console.log('Botão Remover clicado para membro ID:', e.target.getAttribute('data-member-id'));
                        const memberId = parseInt(e.target.getAttribute('data-member-id'));
                        activeChat.participants = activeChat.participants.filter(p => p.id !== memberId);
                        saveGroups();
                        renderGroupMembers();
                        renderContacts();
                    });
                });
            });
        }
    }

    addMemberBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Botão Adicionar Membro clicado');
        if (activeChat && activeChat.participants) {
            const addMemberModal = document.createElement('div');
            addMemberModal.className = 'modal';
            addMemberModal.id = 'add-member-modal';
            addMemberModal.innerHTML = `
                <div class="modal-content">
                    <h2>Adicionar Membro ao Grupo</h2>
                    <div id="available-members" class="group-participants"></div>
                    <div class="modal-buttons">
                        <button id="add-members-btn">Adicionar</button>
                        <button id="close-add-member-btn">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(addMemberModal);

            const availableMembers = contacts.filter(contact => 
                !activeChat.participants.some(member => member.id === contact.id)
            );
            const availableMembersDiv = document.getElementById('available-members');
            availableMembers.forEach(contact => {
                const contactDiv = document.createElement('div');
                contactDiv.className = 'participant-option';
                contactDiv.innerHTML = `
                    <input type="checkbox" value="${contact.id}">
                    <img src="${contact.photo || 'https://via.placeholder.com/40'}" alt="${contact.name}" class="member-photo">
                    <span>${contact.name} (${contact.phone})</span>
                `;
                availableMembersDiv.appendChild(contactDiv);
            });

            document.getElementById('close-add-member-btn').addEventListener('click', () => {
                addMemberModal.remove();
            });

            document.getElementById('add-members-btn').addEventListener('click', () => {
                const selectedMembers = Array.from(availableMembersDiv.querySelectorAll('input:checked'))
                    .map(input => contacts.find(c => c.id === parseInt(input.value)));
                activeChat.participants = [...activeChat.participants, ...selectedMembers];
                saveGroups();
                renderGroupMembers();
                renderContacts();
                addMemberModal.remove();
            });
        }
    });

    addToGroupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Botão Adicionar a Grupo clicado');
        if (activeChat && !activeChat.participants) {
            const contact = activeChat;
            const addToGroupModal = document.createElement('div');
            addToGroupModal.className = 'modal';
            addToGroupModal.id = 'add-to-group-modal';
            addToGroupModal.innerHTML = `
                <div class="modal-content">
                    <h2>Adicionar ${contact.name} a um Grupo</h2>
                    <div class="group-actions">
                        <button id="add-to-existing-group-btn">Adicionar a Grupo Existente</button>
                        <button id="create-new-group-btn">Criar Novo Grupo com ${contact.name}</button>
                    </div>
                    <div id="existing-groups" class="group-participants" style="display: none;"></div>
                    <div class="modal-buttons" style="display: block;" id="group-action-buttons">
                        <button id="confirm-group-action-btn">Confirmar</button>
                        <button id="cancel-group-action-btn">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(addToGroupModal);

            function renderExistingGroups() {
                const existingGroupsDiv = document.getElementById('existing-groups');
                existingGroupsDiv.innerHTML = '';
                groups.forEach(group => {
                    const groupDiv = document.createElement('div');
                    groupDiv.className = 'participant-option';
                    groupDiv.innerHTML = `
                        <input type="radio" name="existing-group" value="${group.id}">
                        <img src="${group.photo || 'https://via.placeholder.com/40'}" alt="${group.name}" class="member-photo">
                        <span>${group.name} (${group.participants.length} participantes)</span>
                    `;
                    existingGroupsDiv.appendChild(groupDiv);
                });
            }

            document.getElementById('add-to-existing-group-btn').addEventListener('click', () => {
                renderExistingGroups();
                document.getElementById('existing-groups').style.display = 'block';
                const groupActions = document.querySelector('.group-actions');
                if (groupActions) groupActions.style.display = 'none';
                document.getElementById('group-action-buttons').style.display = 'block';
            });

            document.getElementById('create-new-group-btn').addEventListener('click', () => {
                const groupModal = document.getElementById('group-modal');
                if (groupModal) {
                    groupModal.style.display = 'flex';
                    groupNameInput.value = '';
                    groupPhotoInput.value = '';
                    groupPhotoPreview.src = '';
                    groupParticipants.innerHTML = '';
                    const selectedMembersPhotos = document.getElementById('selected-members-photos');
                    selectedMembersPhotos.innerHTML = '';

                    contacts.forEach(contact => {
                        const participantDiv = document.createElement('div');
                        participantDiv.className = 'participant-option';
                        const isSelected = contact.id === activeChat.id;
                        participantDiv.innerHTML = `
                            <input type="checkbox" value="${contact.id}" data-contact-id="${contact.id}" ${isSelected ? 'checked' : ''}>
                            <img src="${contact.photo || 'https://via.placeholder.com/40'}" alt="${contact.name}" class="member-photo">
                            <span>${contact.name} (${contact.phone})</span>
                        `;
                        groupParticipants.appendChild(participantDiv);

                        const checkbox = participantDiv.querySelector('input[type="checkbox"]');
                        checkbox.addEventListener('change', () => {
                            updateSelectedMembersPreview();
                        });
                    });

                    document.getElementById('close-modal-btn').addEventListener('click', () => {
                        groupModal.style.display = 'none';
                    });

                    document.getElementById('create-group-btn').addEventListener('click', async () => {
                        const groupName = groupNameInput.value.trim();
                        const selectedParticipants = Array.from(groupParticipants.querySelectorAll('input:checked'))
                            .map(input => contacts.find(c => c.id === parseInt(input.value)));

                        if (selectedParticipants.length < 1) {
                            alert('Selecione pelo menos um participante.');
                            return;
                        }

                        const groupPhotoFile = groupPhotoInput.files[0];
                        const groupPhotoUrl = groupPhotoFile ? await fileToBase64(groupPhotoFile) : 'https://via.placeholder.com/40';

                        const newGroup = {
                            id: groups.length + 1,
                            name: groupName,
                            participants: selectedParticipants,
                            photo: groupPhotoUrl
                        };

                        groups.push(newGroup);
                        saveGroups();
                        renderContacts();
                        groupModal.style.display = 'none';
                        groupNameInput.value = '';
                        groupPhotoInput.value = '';
                        groupPhotoPreview.src = '';
                        selectedMembersPhotos.innerHTML = '';
                    });
                }
                addToGroupModal.remove();
            });

            document.getElementById('confirm-group-action-btn').addEventListener('click', () => {
                const selectedGroupId = document.querySelector('input[name="existing-group"]:checked')?.value;
                if (selectedGroupId) {
                    const group = groups.find(g => g.id === parseInt(selectedGroupId));
                    if (group) {
                        group.participants.push(contact);
                        saveGroups();
                        renderContacts();
                    }
                    addToGroupModal.remove();
                }
            });

            document.getElementById('cancel-group-action-btn').addEventListener('click', () => {
                addToGroupModal.remove();
            });
        }
    });

    initializeChatSkeleton();
    renderContacts();