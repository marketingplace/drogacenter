const { createApp } = Vue;

createApp({
    data() {
        return {
            view: 'orders',
            loading: false,
            showUserModal: false,
            adminSession: JSON.parse(sessionStorage.getItem('dr_logged_admin')),
            
            // BANCO DE DADOS
            admins: JSON.parse(localStorage.getItem('dr_admins')) || [],
            products: JSON.parse(localStorage.getItem('dr_products')) || [],
            orders: JSON.parse(localStorage.getItem('dr_orders')) || [],
            
            // FORMULÁRIOS
            userForm: { user: '', pass: '', role: 'subadmin', permissions: [], isEdit: false }
        }
    },
    methods: {
        // --- SISTEMA DE PERMISSÕES ---
        hasPermission(module) {
            if (!this.adminSession) return false;
            // Theo tem acesso total sempre
            if (this.adminSession.user === 'Theo') return true;
            // Verifica se o módulo está na lista de permissões do usuário
            return this.adminSession.permissions.includes(module);
        },

        // --- GESTÃO DE USUÁRIOS ---
        openUserModal() {
            this.userForm = { user: '', pass: '', role: 'subadmin', permissions: ['pedidos'], isEdit: false };
            this.showUserModal = true;
        },
        editUser(u) {
            this.userForm = { ...u, isEdit: true };
            this.showUserModal = true;
        },
        saveUser() {
            if (!this.userForm.user || !this.userForm.pass) return alert("Preencha todos os campos");

            let admins = [...this.admins];
            if (this.userForm.isEdit) {
                const idx = admins.findIndex(a => a.user === this.userForm.user);
                admins[idx] = { ...this.userForm };
            } else {
                if (admins.find(a => a.user === this.userForm.user)) return alert("Usuário já existe");
                admins.push({ ...this.userForm });
            }

            localStorage.setItem('dr_admins', JSON.stringify(admins));
            this.admins = admins;
            this.showUserModal = false;
            alert("Usuário atualizado com sucesso!");
        },
        deleteUser(username) {
            if (confirm(`Remover acesso de ${username}?`)) {
                this.admins = this.admins.filter(a => a.user !== username);
                localStorage.setItem('dr_admins', JSON.stringify(this.admins));
            }
        },
        canDelete(targetUser) {
            // Theo nunca pode ser deletado
            if (targetUser.user === 'Theo') return false;
            // Usuário não pode deletar a si mesmo
            if (targetUser.user === this.adminSession.user) return false;
            // Apenas Masters podem deletar
            return this.adminSession.role.includes('master');
        },

        // --- UTILITÁRIOS ---
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

        // Garante que a view inicial respeite a primeira permissão disponível
        if (!this.hasPermission('pedidos')) {
            if (this.hasPermission('estoque')) this.view = 'stock';
            else if (this.hasPermission('usuarios')) this.view = 'users';
        }

        lucide.createIcons();
        
        // Sincronização automática
        setInterval(() => {
            this.admins = JSON.parse(localStorage.getItem('dr_admins')) || [];
            this.orders = JSON.parse(localStorage.getItem('dr_orders')) || [];
        }, 3000);
    },
    updated() { lucide.createIcons(); }
}).mount('#app');
