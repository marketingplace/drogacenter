const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'orders',
            loading: false,
            showModal: false,
            showBannerModal: false,
            modalType: 'product',
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')),
            
            // BANCO DE DADOS
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            banners: JSON.parse(localStorage.getItem('dr_banners')) || [],
            admins: JSON.parse(localStorage.getItem('dr_admins')) || [],
            
            // FORMULÁRIOS
            prodForm: { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' },
            bannerForm: { title: '', subtitle: '', image: '', active: true, order: 1 }
        }
    },
    methods: {
        // --- PERMISSÕES ---
        hasPermission(module) {
            if (!this.adminSession) return false;
            if (this.adminSession.user === 'Theo') return true;
            return this.adminSession.permissions?.includes(module);
        },

        // --- GESTÃO DE BANNERS (SISTEMAwindow.Banners) ---
        openBannerModal() {
            this.bannerForm = { title: '', subtitle: '', image: '', active: true, order: this.banners.length + 1 };
            this.showBannerModal = true;
        },

        handleBannerUpload(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.bannerForm.image = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        saveBanner() {
            if (!this.bannerForm.image) return alert("A imagem do banner é obrigatória!");
            
            this.banners.push({ ...this.bannerForm, id: Date.now() });
            // Ordenar banners por prioridade
            this.banners.sort((a, b) => a.order - b.order);
            
            this.syncStorage('dr_banners', this.banners);
            this.showBannerModal = false;
            alert("Banner publicado com sucesso!");
        },

        toggleBannerStatus(idx) {
            this.banners[idx].active = !this.banners[idx].active;
            this.syncStorage('dr_banners', this.banners);
        },

        deleteBanner(idx) {
            if (confirm("Deseja remover este banner permanentemente?")) {
                this.banners.splice(idx, 1);
                this.syncStorage('dr_banners', this.banners);
            }
        },

        // --- GESTÃO DE ESTOQUE ---
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
        saveProduct() {
            if (!this.prodForm.name) return alert("Preencha o nome!");
            if (this.prodForm.id) {
                const idx = this.products.findIndex(p => p.id === this.prodForm.id);
                this.products[idx] = { ...this.prodForm };
            } else {
                this.prodForm.id = Date.now();
                this.products.push({ ...this.prodForm });
            }
            this.syncStorage('dr_products', this.products);
            this.showModal = false;
        },

        // --- CORE & SINCRONIZAÇÃO ---
        handleUpload(event, target) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (target === 'prod') this.prodForm.image = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        deleteItem(key, id) {
            if (confirm("Remover permanentemente?")) {
                this.products = this.products.filter(p => p.id !== id);
                this.syncStorage(key, this.products);
            }
        },
        updateStatus(id, status) {
            const idx = this.orders.findIndex(o => o.id === id);
            if (idx !== -1) {
                this.orders[idx].status = status;
                this.syncStorage('dr_orders', this.orders);
            }
        },
        syncStorage(key, data) {
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
        setInterval(this.refreshLocalData, 5000);
    },
    updated() { lucide.createIcons(); }
}).mount('#app');
