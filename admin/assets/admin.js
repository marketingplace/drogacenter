const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'stock', // Definido como padrão para teste do botão
            loading: false,
            showModal: false,
            modalType: 'product',
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')),
            
            // BANCO DE DADOS LOCAL
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            banners: JSON.parse(localStorage.getItem('dr_banners')) || [],
            admins: JSON.parse(localStorage.getItem('dr_admins')) || [],
            
            // FORMULÁRIO DE PRODUTO
            prodForm: { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' }
        }
    },
    methods: {
        // --- CONTROLE DE PERMISSÕES ---
        hasPermission(module) {
            if (!this.adminSession) return false;
            if (this.adminSession.user === 'Theo') return true;
            return this.adminSession.permissions?.includes(module);
        },

        // --- FUNÇÕES DE ESTOQUE (O QUE ESTAVA QUEBRADO) ---
        openProductModal() {
            console.log("Abrindo modal de produto..."); // Log para depuração
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
            if (!this.prodForm.name || this.prodForm.price <= 0) {
                alert("Por favor, preencha os dados básicos do produto.");
                return;
            }

            this.loading = true;
            
            if (this.prodForm.id) {
                // Modo Edição
                const idx = this.products.findIndex(p => p.id === this.prodForm.id);
                this.products[idx] = { ...this.prodForm };
            } else {
                // Modo Novo Registro
                const newProduct = { ...this.prodForm, id: Date.now() };
                this.products.push(newProduct);
            }

            this.syncStorage('dr_products', this.products);
            this.showModal = false;
            this.loading = false;
            alert("Produto salvo com sucesso no estoque!");
        },

        // --- UPLOAD DE IMAGEM ---
        handleUpload(event, target) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (target === 'prod') this.prodForm.image = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        // --- CORE & SINCRONIZAÇÃO ---
        deleteItem(key, id) {
            if (confirm("Deseja excluir este item permanentemente?")) {
                this.products = this.products.filter(p => p.id !== id);
                this.syncStorage(key, this.products);
            }
        },

        syncStorage(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
            this.refreshData();
        },

        refreshData() {
            this.products = JSON.parse(localStorage.getItem('dr_products')) || [];
            this.orders = JSON.parse(localStorage.getItem('dr_orders')) || [];
        },

        formatPrice(v) { return parseFloat(v || 0).toFixed(2).replace('.', ','); },

        logout() {
            sessionStorage.removeItem('dr_logged_admin');
            window.location.href = 'index.html';
        }
    },
    mounted() {
        if (!this.adminSession) {
            window.location.href = 'index.html';
            return;
        }
        lucide.createIcons();
        this.refreshData();
    },
    updated() {
        lucide.createIcons();
    }
}).mount('#app');
