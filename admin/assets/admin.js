const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'orders',
            loading: false,
            showModal: false,
            showUserModal: false,
            modalType: 'product',
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')),
            
            // BANCO DE DADOS LOCAL
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            banners: JSON.parse(localStorage.getItem('dr_banners')) || [],
            admins: JSON.parse(localStorage.getItem('dr_admins')) || [],
            
            // FORMULÁRIOS
            prodForm: { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' },
            bannerForm: { title: '', subtitle: '', image: '', active: true },
            userForm: { user: '', pass: '', role: 'subadmin', permissions: ['pedidos'] }
        }
    },
    methods: {
        // --- SISTEMA DE PERMISSÕES ---
        hasPermission(module) {
            if (!this.adminSession) return false;
            if (this.adminSession.user === 'Theo') return true;
            return this.adminSession.permissions?.includes(module);
        },

        // --- GESTÃO DE ESTOQUE (RESTAURADA) ---
        openProductModal() {
            this.modalType = 'product';
            this.prodForm = { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' };
            this.showModal = true;
        },
        editProduct(p) {
            this.modalType = 'product';
            this.prodForm = { ...p };
            this.showModal = true;
        },
        async saveProduct() {
            if (!this.prodForm.name) return alert("Preencha o nome!");
            
            if (this.prodForm.id) {
                const idx = this.products.findIndex(p => p.id === this.prodForm.id);
                this.products[idx] = { ...this.prodForm };
            } else {
                this.prodForm.id = Date.now();
                this.products.push({ ...this.prodForm });
            }
            
            this.syncData('dr_products', this.products);
            this.showModal = false;
            alert("Estoque atualizado!");
        },

        // --- GESTÃO DE BANNERS (RESTAURADA) ---
        openBannerModal() {
            this.modalType = 'banner';
            this.bannerForm = { title: '', subtitle: '', image: '', active: true };
            this.showModal = true;
        },
        saveBanner() {
            if (!this.bannerForm.image) return alert("Selecione uma imagem!");
            this.banners.push({ ...this.bannerForm, id: Date.now() });
            this.syncData('dr_banners', this.banners);
            this.showModal = false;
        },
        toggleBannerStatus(idx) {
            this.banners[idx].active = !this.banners[idx].active;
            this.syncData('dr_banners', this.banners);
        },
        deleteBanner(idx) {
            if (confirm("Remover este banner?")) {
                this.banners.splice(idx, 1);
                this.syncData('dr_banners', this.banners);
            }
        },

        // --- UPLOAD DE IMAGEM BASE64 ---
        handleUpload(event, target) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (target === 'prod') this.prodForm.image = e.target.result;
                else if (target === 'banner') this.bannerForm.image = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        // --- GESTÃO DE USUÁRIOS ---
        openUserModal() { this.showUserModal = true; },
        saveUser() {
            this.admins.push({ ...this.userForm });
            this.syncData('dr_admins', this.admins);
            this.showUserModal = false;
            alert("Usuário criado!");
        },
        deleteUser(username) {
            if (confirm("Remover usuário?")) {
                this.admins = this.admins.filter(a => a.user !== username);
                this.syncData('dr_admins', this.admins);
            }
        },

        // --- CORE & SINCRONIZAÇÃO ---
        updateStatus(id, status) {
            const idx = this.orders.findIndex(o => o.id === id);
            if (idx !== -1) {
                this.orders[idx].status = status;
                this.syncData('dr_orders', this.orders);
            }
        },
        deleteItem(key, id) {
            if (confirm("Deseja excluir permanentemente?")) {
                this.products = this.products.filter(p => p.id !== id);
                this.syncData(key, this.products);
            }
        },
        syncData(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
            this.refreshLocalData();
        },
        refreshLocalData() {
            this.products = JSON.parse(localStorage.getItem('dr_products')) || [];
            this.orders = JSON.parse(localStorage.getItem('dr_orders')) || [];
            this.banners = JSON.parse(localStorage.getItem('dr_banners')) || [];
            this.admins = JSON.parse(localStorage.getItem('dr_admins')) || [];
        },
        formatPrice(v) { return parseFloat(v || 0).toFixed(2).replace('.', ','); },
        logout() {
            sessionStorage.removeItem('dr_logged_admin');
            window.location.href = 'index.html';
        }
    },
    mounted() {
        if (!this.adminSession) { window.location.href = 'index.html'; return; }
        
        lucide.createIcons();
        this.refreshLocalData();

        // Auto-refresh a cada 5 segundos para novos pedidos
        setInterval(this.refreshLocalData, 5000);
    },
    updated() { lucide.createIcons(); }
}).mount('#app');
