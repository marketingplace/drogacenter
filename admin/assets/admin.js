const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'orders',
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')),
            loading: false,
            
            // Dados integrados com Site Principal
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            banners: JSON.parse(localStorage.getItem('dr_banners')) || [],
            admins: JSON.parse(localStorage.getItem('dr_admins')) || [],

            // Estado dos Modais
            modals: { stock: false, user: false, banner: false },

            // Formulários
            prodForm: { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' },
            userForm: { user: '', pass: '', role: 'subadmin', isEdit: false },
            bannerForm: { title: '', subtitle: '', image: '', active: true, order: 0 }
        }
    },
    methods: {
        // --- NAMESPACE: ESTOQUE ---
        Estoque: {
            render: () => { /* Vue faz automaticamente pelo v-if */ },
            add: function() {
                this.prodForm = { id: null, name: '', price: 0, qty: 0, image: '', description: '', category: '' };
                this.modals.stock = true;
            },
            edit: function(p) {
                this.prodForm = { ...p };
                this.modals.stock = true;
            },
            save: function() {
                if (!this.prodForm.name) return alert("Preencha o nome do produto!");
                
                if (this.prodForm.id) {
                    const index = this.products.findIndex(p => p.id === this.prodForm.id);
                    this.products[index] = { ...this.prodForm };
                } else {
                    this.prodForm.id = Date.now();
                    this.products.push({ ...this.prodForm });
                }
                
                this.persist('dr_products', this.products);
                this.modals.stock = false;
                alert("Estoque atualizado com sucesso!");
            },
            delete: function(id) {
                if(confirm("Deseja realmente excluir este medicamento?")) {
                    this.products = this.products.filter(p => p.id !== id);
                    this.persist('dr_products', this.products);
                }
            }
        },

        // --- NAMESPACE: USUÁRIOS ---
        Usuarios: {
            render: () => {},
            add: function() {
                this.userForm = { user: '', pass: '', role: 'subadmin', isEdit: false };
                this.modals.user = true;
            },
            edit: function(u) {
                this.userForm = { ...u, isEdit: true };
                this.modals.user = true;
            },
            save: function() {
                const index = this.admins.findIndex(a => a.user === this.userForm.user);
                if (index !== -1) {
                    this.admins[index].pass = this.userForm.pass;
                } else {
                    this.admins.push({ ...this.userForm });
                }
                this.persist('dr_admins', this.admins);
                this.modals.user = false;
                alert("Acesso configurado!");
            },
            delete: function(username) {
                if (confirm(`Remover acesso de ${username}?`)) {
                    this.admins = this.admins.filter(a => a.user !== username);
                    this.persist('dr_admins', this.admins);
                }
            }
        },

        // --- NAMESPACE: BANNERS ---
        Banners: {
            render: () => {},
            add: function() {
                this.bannerForm = { title: '', subtitle: '', image: '', active: true, order: this.banners.length };
                this.modals.banner = true;
            },
            save: function() {
                if(!this.bannerForm.image) return alert("Selecione uma imagem!");
                this.banners.push({ ...this.bannerForm, id: Date.now() });
                this.persist('dr_banners', this.banners);
                this.modals.banner = false;
                alert("Banner publicado!");
            },
            toggle: function(index) {
                this.banners[index].active = !this.banners[index].active;
                this.persist('dr_banners', this.banners);
            },
            delete: function(index) {
                if(confirm("Remover este banner?")) {
                    this.banners.splice(index, 1);
                    this.persist('dr_banners', this.banners);
                }
            }
        },

        // --- CORE & UTILS ---
        handleFileUpload(event, target) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (target === 'prod') this.prodForm.image = e.target.result;
                if (target === 'banner') this.bannerForm.image = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        persist(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
            this.sync();
        },
        sync() {
            this.products = JSON.parse(localStorage.getItem('dr_products')) || [];
            this.orders = JSON.parse(localStorage.getItem('dr_orders')) || [];
            this.banners = JSON.parse(localStorage.getItem('dr_banners')) || [];
            this.admins = JSON.parse(localStorage.getItem('dr_admins')) || [];
        },
        changeTab(v) {
            this.view = v;
            // Chamadas explícitas conforme regra 4
            if(v === 'stock') this.Estoque.render();
            if(v === 'users') this.Usuarios.render();
            if(v === 'banners') this.Banners.render();
        },
        updateStatus(id, status) {
            const idx = this.orders.findIndex(o => o.id === id);
            this.orders[idx].status = status;
            this.persist('dr_orders', this.orders);
        },
        formatPrice(v) { return parseFloat(v || 0).toFixed(2).replace('.', ','); },
        logout() { sessionStorage.removeItem('dr_logged_admin'); window.location.href = 'index.html'; }
    },
    created() {
        // Vincula o contexto 'this' aos namespaces (Essencial para Vue)
        this.Estoque.add = this.Estoque.add.bind(this);
        this.Estoque.edit = this.Estoque.edit.bind(this);
        this.Estoque.save = this.Estoque.save.bind(this);
        this.Estoque.delete = this.Estoque.delete.bind(this);

        this.Usuarios.add = this.Usuarios.add.bind(this);
        this.Usuarios.edit = this.Usuarios.edit.bind(this);
        this.Usuarios.save = this.Usuarios.save.bind(this);
        this.Usuarios.delete = this.Usuarios.delete.bind(this);

        this.Banners.add = this.Banners.add.bind(this);
        this.Banners.save = this.Banners.save.bind(this);
        this.Banners.toggle = this.Banners.toggle.bind(this);
        this.Banners.delete = this.Banners.delete.bind(this);
    },
    mounted() {
        if (!this.adminSession) window.location.href = 'index.html';
        lucide.createIcons();
        this.sync();
    }
}).mount('#app');
