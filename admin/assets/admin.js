const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'stats',
            loading: false,
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')) || null,
            showProductModal: false,
            showBannerModal: false,
            
            // BANCO DE DADOS LOCAL (Mesmas chaves do site)
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            admins: JSON.parse(localStorage.getItem('dr_admins')) || [],
            banners: JSON.parse(localStorage.getItem('dr_banners')) || [
                {title: 'Ofertas de Verão', subtitle: 'Higiene com 20% OFF', image: '', active: true}
            ],
            
            // Formulários
            prodForm: { id: null, name: '', price: 0, category: '', qty: 0, image: '', description: '' },
            bannerForm: { title: '', subtitle: '', image: '', active: true },
            newPass: '',
            
            lastOrdersCount: 0,
            isAlarming: false
        }
    },
    computed: {
        isMaster() {
            return this.adminSession?.role.includes('master');
        },
        revenue() {
            return this.orders.filter(o => o.status === 'Entregue').reduce((acc, o) => acc + o.total, 0);
        },
        lowStockCount() {
            return this.products.filter(p => p.qty < 5).length;
        },
        deliveredCount() {
            return this.orders.filter(o => o.status === 'Entregue').length;
        }
    },
    methods: {
        // --- FUNÇÃO CORE: UPLOAD DE IMAGEM LOCAL ---
        handleFileUpload(event, type) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const base64Image = e.target.result;
                if (type === 'prod') {
                    this.prodForm.image = base64Image;
                } else if (type === 'banner') {
                    this.bannerForm.image = base64Image;
                }
            };
            // Lê o arquivo do computador do usuário
            reader.readAsDataURL(file);
        },

        // --- GESTÃO DE BANNERS ---
        openBannerModal() { this.showBannerModal = true; this.bannerForm = { title: '', subtitle: '', image: '', active: true }; },
        saveBanner() {
            this.banners.push({...this.bannerForm});
            localStorage.setItem('dr_banners', JSON.stringify(this.banners));
            this.showBannerModal = false;
        },
        toggleBanner(idx) {
            this.banners[idx].active = !this.banners[idx].active;
            localStorage.setItem('dr_banners', JSON.stringify(this.banners));
        },
        deleteBanner(idx) {
            if(confirm("Excluir banner?")) {
                this.banners.splice(idx, 1);
                localStorage.setItem('dr_banners', JSON.stringify(this.banners));
            }
        },

        // --- GESTÃO DE ESTOQUE (COM DESCRIÇÃO) ---
        openProductModal() { this.showProductModal = true; this.prodForm = { id: null, name: '', price: 0, category: '', qty: 0, image: '', description: '' }; },
        saveProduct() {
            if (!this.prodForm.id) {
                this.prodForm.id = Date.now();
                this.products.push({ ...this.prodForm });
            } else {
                const idx = this.products.findIndex(p => p.id === this.prodForm.id);
                this.products[idx] = { ...this.prodForm };
            }
            localStorage.setItem('dr_products', JSON.stringify(this.products));
            this.showProductModal = false;
        },
        editProduct(p) { this.prodForm = { ...p }; this.showProductModal = true; },
        deleteProduct(id) {
            if(confirm("Excluir produto?")) {
                this.products = this.products.filter(p => p.id !== id);
                localStorage.setItem('dr_products', JSON.stringify(this.products));
            }
        },

        // --- SEGURANÇA E SENHAS ---
        changeOwnPass() {
            const idx = this.admins.findIndex(a => a.user === this.adminSession.user);
            this.admins[idx].pass = this.newPass;
            localStorage.setItem('dr_admins', JSON.stringify(this.admins));
            alert("Sua senha foi atualizada!");
            this.newPass = '';
        },
        resetUserPass(userObj) {
            const nova = prompt("Digite a nova senha para " + userObj.user);
            if(nova) {
                const idx = this.admins.findIndex(a => a.user === userObj.user);
                this.admins[idx].pass = nova;
                localStorage.setItem('dr_admins', JSON.stringify(this.admins));
                alert("Senha resetada!");
            }
        },
        canManageUser(u) {
            if (this.adminSession.role === 'master_sistema') return true;
            if (this.adminSession.role === 'master_loja' && !u.role.includes('sistema')) return true;
            return false;
        },
        canDeleteUser(u) {
            if (u.user === 'Theo') return false; // Intocável
            return this.canManageUser(u);
        },
        deleteUser(u) {
            if(confirm("Remover " + u.user + "?")) {
                this.admins = this.admins.filter(a => a.user !== u.user);
                localStorage.setItem('dr_admins', JSON.stringify(this.admins));
            }
        },

        // --- UTILITÁRIOS ---
        formatPrice(v) { return parseFloat(v).toFixed(2).replace('.', ','); },
        logout() { sessionStorage.removeItem('dr_logged_admin'); window.location.href = 'index.html'; },
        stopAlarm() { document.getElementById('orderAlarm').pause(); this.isAlarming = false; }
    },
    mounted() {
        if (!this.adminSession) window.location.href = 'index.html';
        lucide.createIcons();
    },
    updated() { lucide.createIcons(); }
}).mount('#app');