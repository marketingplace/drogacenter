const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'orders',
            showModal: false,
            modalType: 'product',
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')),
            
            // Dados integrados com site principal
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            banners: JSON.parse(localStorage.getItem('dr_banners')) || [],
            
            // Formulários
            prodForm: { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' },
            bannerForm: { title: '', subtitle: '', image: '', active: true }
        }
    },
    methods: {
        // --- MOTOR DE UPLOAD (Regra 1) ---
        processImage(event, type) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'product') this.prodForm.image = e.target.result;
                if (type === 'banner') this.bannerForm.image = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        // --- GESTÃO DE ESTOQUE (Regra 2) ---
        openModal(type) {
            this.modalType = type;
            if(type === 'product') this.prodForm = { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' };
            if(type === 'banner') this.bannerForm = { title: '', subtitle: '', image: '', active: true };
            this.showModal = true;
        },
        saveProduct() {
            if(!this.prodForm.name || !this.prodForm.image) return alert("Preencha nome e imagem!");
            
            if (this.prodForm.id) {
                const idx = this.products.findIndex(p => p.id === this.prodForm.id);
                this.products[idx] = { ...this.prodForm };
            } else {
                this.prodForm.id = Date.now();
                this.products.push({ ...this.prodForm });
            }
            this.sync('dr_products', this.products);
            this.showModal = false;
        },
        editProduct(p) {
            this.modalType = 'product';
            this.prodForm = { ...p };
            this.showModal = true;
        },

        // --- GESTÃO DE BANNERS (Regra 4) ---
        saveBanner() {
            if(!this.bannerForm.image) return alert("Selecione uma imagem!");
            this.banners.push({...this.bannerForm, id: Date.now()});
            this.sync('dr_banners', this.banners);
            this.showModal = false;
        },
        toggleBanner(idx) {
            this.banners[idx].active = !this.banners[idx].active;
            this.sync('dr_banners', this.banners);
        },
        deleteBanner(idx) {
            if(confirm("Excluir banner?")) {
                this.banners.splice(idx, 1);
                this.sync('dr_banners', this.banners);
            }
        },

        // --- CORE ---
        updateStatus(id, status) {
            const idx = this.orders.findIndex(o => o.id === id);
            this.orders[idx].status = status;
            this.sync('dr_orders', this.orders);
        },
        deleteItem(key, id) {
            if(confirm("Confirmar exclusão?")) {
                if(key === 'dr_products') this.products = this.products.filter(p => p.id !== id);
                this.sync(key, eval(`this.${key.split('_')[1]}`));
            }
        },
        sync(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
            this.fetchData();
        },
        fetchData() {
            this.products = JSON.parse(localStorage.getItem('dr_products')) || [];
            this.orders = JSON.parse(localStorage.getItem('dr_orders')) || [];
            this.banners = JSON.parse(localStorage.getItem('dr_banners')) || [];
        },
        formatPrice(v) { return parseFloat(v || 0).toFixed(2).replace('.', ','); },
        logout() {
            sessionStorage.removeItem('dr_logged_admin');
            window.location.href = 'index.html';
        }
    },
    mounted() {
        if (!this.adminSession) window.location.href = 'index.html';
        this.fetchData();
        lucide.createIcons();
    },
    updated() { lucide.createIcons(); }
}).mount('#app');
