const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'orders',
            showModal: false,
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')),
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            prodForm: { id: null, name: '', price: 0, qty: 0 }
        }
    },
    computed: {
        isAdmin() {
            return this.adminSession?.role.includes('master');
        }
    },
    methods: {
        // --- PRODUTOS ---
        openModal() {
            this.prodForm = { id: null, name: '', price: 0, qty: 0 };
            this.showModal = true;
        },
        saveProduct() {
            if(!this.prodForm.name) return alert("Preencha o nome!");
            const newProd = { 
                ...this.prodForm, 
                id: Date.now(), 
                image: '' // Mantendo compatibilidade com site
            };
            this.products.push(newProd);
            this.sync('dr_products', this.products);
            this.showModal = false;
        },
        deleteProduct(id) {
            if(confirm("Deseja remover?")) {
                this.products = this.products.filter(p => p.id !== id);
                this.sync('dr_products', this.products);
            }
        },

        // --- PEDIDOS ---
        updateStatus(id, status) {
            const idx = this.orders.findIndex(o => o.id === id);
            if(idx !== -1) {
                this.orders[idx].status = status;
                this.sync('dr_orders', this.orders);
            }
        },

        // --- CORE ---
        sync(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
        },
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
        
        // Ativa ícones Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Auto-refresh dos dados do localStorage a cada 3 segundos
        setInterval(() => {
            this.orders = JSON.parse(localStorage.getItem('dr_orders')) || [];
            this.products = JSON.parse(localStorage.getItem('dr_products')) || [];
        }, 3000);
    }
}).mount('#app');
