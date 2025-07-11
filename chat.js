// Chat functionality for P5X Community
class ChatManager {
    constructor() {
        this.currentUser = null;
        this.messages = [];
        this.onlineUsers = new Set();
        this.lastActivity = Date.now();
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadMessages();
        this.setupEventListeners();
        this.checkUserSetup();
        this.startActivityCheck();
    }

    loadUserData() {
        const userData = localStorage.getItem('p5x_chat_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('p5x_chat_user', JSON.stringify(this.currentUser));
        }
    }

    loadMessages() {
        const storedMessages = localStorage.getItem('p5x_chat_messages');
        if (storedMessages) {
            this.messages = JSON.parse(storedMessages);
        } else {
            // Initialize with welcome message
            this.messages = [
                {
                    id: 1,
                    content: "Welcome to the P5X Community Chat! Share your strategies and connect with fellow Phantom Thieves.",
                    author: "System",
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            ];
            this.saveMessages();
        }
    }

    saveMessages() {
        localStorage.setItem('p5x_chat_messages', JSON.stringify(this.messages));
    }

    loadOnlineUsers() {
        const storedUsers = localStorage.getItem('p5x_chat_online_users');
        if (storedUsers) {
            const userData = JSON.parse(storedUsers);
            const now = Date.now();
            
            // Remove users inactive for more than 5 minutes
            Object.keys(userData).forEach(username => {
                if (now - userData[username].lastActivity < 5 * 60 * 1000) {
                    this.onlineUsers.add(username);
                }
            });
        }
    }

    saveOnlineUsers() {
        const userData = {};
        this.onlineUsers.forEach(username => {
            userData[username] = {
                lastActivity: this.currentUser && this.currentUser.username === username ? Date.now() : this.lastActivity
            };
        });
        localStorage.setItem('p5x_chat_online_users', JSON.stringify(userData));
    }

    checkUserSetup() {
        const userSetup = document.getElementById('userSetup');
        const chatContainer = document.getElementById('chatContainer');

        if (!this.currentUser) {
            userSetup.style.display = 'block';
            chatContainer.style.display = 'none';
        } else {
            userSetup.style.display = 'none';
            chatContainer.style.display = 'flex';
            document.getElementById('currentUsername').textContent = this.currentUser.username;
            
            this.loadOnlineUsers();
            this.onlineUsers.add(this.currentUser.username);
            this.saveOnlineUsers();
            
            this.renderMessages();
            this.renderOnlineUsers();
            this.startMessageRefresh();
        }
    }

    setupEventListeners() {
        // User setup
        document.getElementById('setUsernameBtn').addEventListener('click', () => this.setUsername());
        document.getElementById('usernameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setUsername();
        });

        // Change username
        document.getElementById('changeUsernameBtn').addEventListener('click', () => this.changeUsername());

        // Message sending
        document.getElementById('sendMessageBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Chat controls
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());

        // Settings
        document.getElementById('soundEnabled').addEventListener('change', () => this.saveChatSettings());
        document.getElementById('timestampsEnabled').addEventListener('change', () => this.renderMessages());

        // Typing indicator
        let typingTimeout;
        document.getElementById('messageInput').addEventListener('input', () => {
            clearTimeout(typingTimeout);
            this.showTypingIndicator();
            typingTimeout = setTimeout(() => this.hideTypingIndicator(), 2000);
        });

        // Load chat settings
        this.loadChatSettings();
    }

    setUsername() {
        const username = document.getElementById('usernameInput').value.trim();
        if (username && username.length > 0) {
            this.currentUser = {
                username: username,
                joinDate: new Date().toISOString()
            };
            this.saveUserData();
            this.checkUserSetup();
            this.addSystemMessage(`${username} joined the chat`);
        } else {
            alert('Please enter a valid username');
        }
    }

    changeUsername() {
        if (this.currentUser) {
            this.addSystemMessage(`${this.currentUser.username} left the chat`);
            this.onlineUsers.delete(this.currentUser.username);
            this.saveOnlineUsers();
        }
        
        this.currentUser = null;
        localStorage.removeItem('p5x_chat_user');
        document.getElementById('usernameInput').value = '';
        this.checkUserSetup();
        
        if (this.messageRefreshInterval) {
            clearInterval(this.messageRefreshInterval);
        }
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content) return;

        const message = {
            id: Date.now(),
            content: content,
            author: this.currentUser.username,
            timestamp: new Date().toISOString(),
            type: 'user'
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        messageInput.value = '';
        this.updateActivity();
        this.playNotificationSound();
    }

    addSystemMessage(content) {
        const message = {
            id: Date.now(),
            content: content,
            author: 'System',
            timestamp: new Date().toISOString(),
            type: 'system'
        };

        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
    }

    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        const showTimestamps = document.getElementById('timestampsEnabled').checked;

        if (this.messages.length === 0) {
            chatMessages.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
            return;
        }

        chatMessages.innerHTML = this.messages.map(message => {
            const isOwnMessage = this.currentUser && message.author === this.currentUser.username;
            const messageClass = message.type === 'system' ? 'message-system' : 
                                isOwnMessage ? 'message-own' : 'message-other';

            return `
                <div class="message ${messageClass}">
                    <div class="message-header">
                        <span class="message-author">${this.escapeHtml(message.author)}</span>
                        ${showTimestamps ? `<span class="message-time">${this.formatTime(message.timestamp)}</span>` : ''}
                    </div>
                    <div class="message-content">${this.escapeHtml(message.content)}</div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    renderOnlineUsers() {
        const onlineUsersList = document.getElementById('onlineUsersList');
        
        if (this.onlineUsers.size === 0) {
            onlineUsersList.innerHTML = '<div class="no-users">No users online</div>';
            return;
        }

        const users = Array.from(this.onlineUsers).sort();
        onlineUsersList.innerHTML = users.map(username => {
            const isCurrentUser = this.currentUser && username === this.currentUser.username;
            return `
                <div class="online-user ${isCurrentUser ? 'current-user' : ''}">
                    <div class="user-status"></div>
                    <span class="username">${this.escapeHtml(username)}</span>
                    ${isCurrentUser ? '<span class="user-label">(You)</span>' : ''}
                </div>
            `;
        }).join('');
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat? This will remove all messages.')) {
            this.messages = [
                {
                    id: Date.now(),
                    content: "Chat cleared",
                    author: "System",
                    timestamp: new Date().toISOString(),
                    type: 'system'
                }
            ];
            this.saveMessages();
            this.renderMessages();
        }
    }

    startMessageRefresh() {
        // Refresh messages and online users every 5 seconds
        this.messageRefreshInterval = setInterval(() => {
            this.loadMessages();
            this.loadOnlineUsers();
            this.renderMessages();
            this.renderOnlineUsers();
            this.updateActivity();
        }, 5000);
    }

    startActivityCheck() {
        // Update activity every 30 seconds
        setInterval(() => {
            if (this.currentUser) {
                this.updateActivity();
            }
        }, 30000);
    }

    updateActivity() {
        this.lastActivity = Date.now();
        if (this.currentUser) {
            this.onlineUsers.add(this.currentUser.username);
            this.saveOnlineUsers();
        }
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (this.onlineUsers.size > 1) {
            indicator.style.display = 'block';
        }
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').style.display = 'none';
    }

    playNotificationSound() {
        if (document.getElementById('soundEnabled').checked) {
            // Create a simple beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }

    loadChatSettings() {
        const settings = localStorage.getItem('p5x_chat_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            document.getElementById('soundEnabled').checked = parsed.soundEnabled !== false;
            document.getElementById('timestampsEnabled').checked = parsed.timestampsEnabled !== false;
        }
    }

    saveChatSettings() {
        const settings = {
            soundEnabled: document.getElementById('soundEnabled').checked,
            timestampsEnabled: document.getElementById('timestampsEnabled').checked
        };
        localStorage.setItem('p5x_chat_settings', JSON.stringify(settings));
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chat when DOM is loaded
let chatManager;
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.contains(document.getElementById('chatContainer'))) {
        chatManager = new ChatManager();
    }
});