// Forum functionality for P5X Community
class ForumManager {
    constructor() {
        this.currentUser = null;
        this.topics = [];
        this.currentTopic = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadTopics();
        this.setupEventListeners();
        this.checkUserSetup();
    }

    loadUserData() {
        const userData = localStorage.getItem('p5x_forum_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('p5x_forum_user', JSON.stringify(this.currentUser));
        }
    }

    loadTopics() {
        const storedTopics = localStorage.getItem('p5x_forum_topics');
        if (storedTopics) {
            this.topics = JSON.parse(storedTopics);
        } else {
            // Initialize with sample topics
            this.topics = [
                {
                    id: 1,
                    title: "Welcome to the P5X Community Forum!",
                    content: "This is the official community forum for Persona 5 The Phantom X. Share your strategies, ask questions, and connect with fellow Phantom Thieves!",
                    author: "BrawlsMons",
                    category: "general",
                    date: new Date().toISOString(),
                    replies: [
                        {
                            id: 1,
                            content: "Thanks for creating this space! Looking forward to discussing strategies.",
                            author: "PhantomThief_01",
                            date: new Date().toISOString()
                        }
                    ]
                },
                {
                    id: 2,
                    title: "Best Character Builds for Palace Exploration?",
                    content: "I'm struggling with some of the tougher palaces. What character builds do you recommend for exploration and combat?",
                    author: "MetaverseExplorer",
                    category: "builds",
                    date: new Date(Date.now() - 86400000).toISOString(),
                    replies: []
                }
            ];
            this.saveTopics();
        }
    }

    saveTopics() {
        localStorage.setItem('p5x_forum_topics', JSON.stringify(this.topics));
    }

    checkUserSetup() {
        const userSetup = document.getElementById('userSetup');
        const forumControls = document.getElementById('forumControls');
        const forumTopics = document.getElementById('forumTopics');

        if (!this.currentUser) {
            userSetup.style.display = 'block';
            forumControls.style.display = 'none';
            forumTopics.style.display = 'none';
        } else {
            userSetup.style.display = 'none';
            forumControls.style.display = 'block';
            forumTopics.style.display = 'block';
            document.getElementById('currentUsername').textContent = this.currentUser.username;
            this.renderTopics();
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

        // New topic
        document.getElementById('newTopicBtn').addEventListener('click', () => this.showNewTopicForm());
        document.getElementById('createTopicBtn').addEventListener('click', () => this.createTopic());
        document.getElementById('cancelTopicBtn').addEventListener('click', () => this.hideNewTopicForm());

        // Topic filters
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterTopics());
        document.getElementById('topicSearch').addEventListener('input', () => this.filterTopics());

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeTopicModal());
        document.getElementById('submitReply').addEventListener('click', () => this.submitReply());

        // Close modal when clicking outside
        document.getElementById('topicModal').addEventListener('click', (e) => {
            if (e.target.id === 'topicModal') this.closeTopicModal();
        });
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
        } else {
            alert('Please enter a valid username');
        }
    }

    changeUsername() {
        this.currentUser = null;
        localStorage.removeItem('p5x_forum_user');
        document.getElementById('usernameInput').value = '';
        this.checkUserSetup();
    }

    showNewTopicForm() {
        document.getElementById('newTopicForm').style.display = 'block';
        document.getElementById('topicTitle').focus();
    }

    hideNewTopicForm() {
        document.getElementById('newTopicForm').style.display = 'none';
        this.clearNewTopicForm();
    }

    clearNewTopicForm() {
        document.getElementById('topicTitle').value = '';
        document.getElementById('topicContent').value = '';
        document.getElementById('topicCategory').value = 'general';
    }

    createTopic() {
        const title = document.getElementById('topicTitle').value.trim();
        const content = document.getElementById('topicContent').value.trim();
        const category = document.getElementById('topicCategory').value;

        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }

        const newTopic = {
            id: Date.now(),
            title: title,
            content: content,
            author: this.currentUser.username,
            category: category,
            date: new Date().toISOString(),
            replies: []
        };

        this.topics.unshift(newTopic);
        this.saveTopics();
        this.renderTopics();
        this.hideNewTopicForm();
    }

    renderTopics() {
        const topicsList = document.getElementById('topicsList');
        const filteredTopics = this.getFilteredTopics();

        if (filteredTopics.length === 0) {
            topicsList.innerHTML = '<div class="no-topics">No topics found. Be the first to create one!</div>';
            return;
        }

        topicsList.innerHTML = filteredTopics.map(topic => `
            <div class="topic-item" onclick="forumManager.openTopic(${topic.id})">
                <div class="topic-header">
                    <h3 class="topic-title">${this.escapeHtml(topic.title)}</h3>
                    <span class="topic-category category-${topic.category}">${this.getCategoryName(topic.category)}</span>
                </div>
                <div class="topic-preview">${this.escapeHtml(topic.content.substring(0, 150))}${topic.content.length > 150 ? '...' : ''}</div>
                <div class="topic-meta">
                    <span class="topic-author">by ${this.escapeHtml(topic.author)}</span>
                    <span class="topic-date">${this.formatDate(topic.date)}</span>
                    <span class="topic-replies">${topic.replies.length} replies</span>
                </div>
            </div>
        `).join('');
    }

    getFilteredTopics() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchTerm = document.getElementById('topicSearch').value.toLowerCase();

        return this.topics.filter(topic => {
            const matchesCategory = categoryFilter === 'all' || topic.category === categoryFilter;
            const matchesSearch = searchTerm === '' || 
                topic.title.toLowerCase().includes(searchTerm) ||
                topic.content.toLowerCase().includes(searchTerm) ||
                topic.author.toLowerCase().includes(searchTerm);
            
            return matchesCategory && matchesSearch;
        });
    }

    filterTopics() {
        this.renderTopics();
    }

    openTopic(topicId) {
        const topic = this.topics.find(t => t.id === topicId);
        if (!topic) return;

        this.currentTopic = topic;
        
        document.getElementById('modalTopicTitle').textContent = topic.title;
        document.getElementById('modalTopicAuthor').textContent = `by ${topic.author}`;
        document.getElementById('modalTopicDate').textContent = this.formatDate(topic.date);
        document.getElementById('modalTopicCategory').textContent = this.getCategoryName(topic.category);
        document.getElementById('modalTopicContent').innerHTML = this.escapeHtml(topic.content).replace(/\n/g, '<br>');

        this.renderReplies();
        document.getElementById('topicModal').style.display = 'flex';
    }

    closeTopicModal() {
        document.getElementById('topicModal').style.display = 'none';
        this.currentTopic = null;
        document.getElementById('replyContent').value = '';
    }

    renderReplies() {
        const repliesList = document.getElementById('repliesList');
        const replies = this.currentTopic.replies;

        if (replies.length === 0) {
            repliesList.innerHTML = '<div class="no-replies">No replies yet. Be the first to reply!</div>';
            return;
        }

        repliesList.innerHTML = replies.map(reply => `
            <div class="reply-item">
                <div class="reply-meta">
                    <span class="reply-author">${this.escapeHtml(reply.author)}</span>
                    <span class="reply-date">${this.formatDate(reply.date)}</span>
                </div>
                <div class="reply-content">${this.escapeHtml(reply.content).replace(/\n/g, '<br>')}</div>
            </div>
        `).join('');
    }

    submitReply() {
        const content = document.getElementById('replyContent').value.trim();
        if (!content) {
            alert('Please enter a reply');
            return;
        }

        const newReply = {
            id: Date.now(),
            content: content,
            author: this.currentUser.username,
            date: new Date().toISOString()
        };

        this.currentTopic.replies.push(newReply);
        this.saveTopics();
        this.renderReplies();
        this.renderTopics(); // Update reply count in topic list
        document.getElementById('replyContent').value = '';
    }

    getCategoryName(category) {
        const categories = {
            general: 'General Discussion',
            strategies: 'Strategies & Tips',
            builds: 'Character Builds',
            palace: 'Palace & Dungeons',
            romance: 'Romance & Relationships',
            questions: 'Questions & Help'
        };
        return categories[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
            }
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize forum when DOM is loaded
let forumManager;
document.addEventListener('DOMContentLoaded', function() {
    if (document.body.contains(document.getElementById('forumTopics'))) {
        forumManager = new ForumManager();
    }
});