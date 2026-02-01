const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'stats',
            loading: false,
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')) || null,
            showProductModal: false,
            isAlarming: false,
            lastOrdersCount: 0,
            
            // Dados integrados com o site principal
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            
            // Formulários
            prodForm: { id: null, name: '', price: 0, category: '', qty: 0, image: '' }
        }
    },
    computed: {
        revenue() {
            return this.orders
                .filter(o => o.status === 'Entregue')
                .reduce((acc, o) => acc + o.total, 0);
        },
        deliveredCount() {
            return this.orders.filter(o => o.status === 'Entregue').length;
        },
        pendingOrdersCount() {
            return this.orders.filter(o => o.status === 'Pendente').length;
        },
        lowStockCount() {
            return this.products.filter(p => p.qty < 5).length;
        }
    },
    methods: {
        // --- SINCRONIZAÇÃO E ALERTA ---
        checkNewOrders() {
            const currentOrders = JSON.parse(localStorage.getItem('dr_orders')) || [];
            
            // Se o número de pedidos no localStorage for maior que o atual, tem coisa nova!
            if (currentOrders.length > this.lastOrdersCount) {
                this.orders = currentOrders;
                this.lastOrdersCount = currentOrders.length;
                this.playAlarm();
            }
        },
        playAlarm() {
            const alarm = document.getElementById('orderAlarm');
            alarm.play();
            this.isAlarming = true;
        },
        stopAlarm() {
            const alarm = document.getElementById('orderAlarm');
            alarm.pause();
            alarm.currentTime = 0;
            this.isAlarming = false;
        },

        // --- GESTÃO DE ESTOQUE ---
        saveProduct() {
            if (!this.prodForm.id) {
                this.prodForm.id = Date.now();
                this.products.push({ ...this.prodForm });
            } else {
                const idx = this.products.findIndex(p => p.id === this.prodForm.id);
                this.products[idx] = { ...this.prodForm };
            }
            this.syncStock();
            this.showProductModal = false;
            this.prodForm = { id: null, name: '', price: 0, category: '', qty: 0, image: '' };
        },
        deleteProduct(id) {
            if(confirm("Deseja realmente excluir?")) {
                this.products = this.products.filter(p => p.id !== id);
                this.syncStock();
            }
        },
        syncStock() {
            localStorage.setItem('dr_products', JSON.stringify(this.products));
        },

        // --- GESTÃO DE PEDIDOS ---
        updateStatus(orderId, newStatus) {
            const idx = this.orders.findIndex(o => o.id === orderId);
            this.orders[idx].status = newStatus;
            localStorage.setItem('dr_orders', JSON.stringify(this.orders));
            this.stopAlarm(); // Para o som ao interagir
        },
        deleteOrder(id) {
            this.orders = this.orders.filter(o => o.id !== id);
            localStorage.setItem('dr_orders', JSON.stringify(this.orders));
        },

        formatPrice(v) {
            return parseFloat(v).toFixed(2).replace('.', ',');
        },
        logout() {
            sessionStorage.removeItem('dr_logged_admin');
            window.location.href = 'index.html';
        }
    },
    mounted() {
        if (!this.adminSession) window.location.href = 'index.html';
        
        // Inicializa contagem
        this.lastOrdersCount = this.orders.length;
        
        // Ativa os ícones do Tailwind
        lucide.createIcons();

        // Loop de verificação de novos pedidos (a cada 5 segundos)
        setInterval(() => {
            this.checkNewOrders();
        }, 5000);
    },
    updated() {
        lucide.createIcons();
    }
}).mount('#app');