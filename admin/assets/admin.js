const { createApp } = Vue;

const supabase = supabaseJs.createClient(
  'SUA_URL',
  'SUA_KEY'
);

createApp({
data(){
return{
    view:'stock',
    modal:false,
    modalType:'',
    products:[],
    banners:[],
    form:{}
}
},
methods:{
async load(){
    this.products = (await supabase.from('dr_products').select('*')).data || [];
    this.banners  = (await supabase.from('dr_banners').select('*')).data || [];
},
openProduct(){
    this.form={name:'',price:0,description:'',image:''};
    this.modalType='product';
    this.modal=true;
},
openBanner(){
    this.form={title:'',image:''};
    this.modalType='banner';
    this.modal=true;
},
uploadImage(e){
    const r = new FileReader();
    r.onload = ev => this.form.image = ev.target.result;
    r.readAsDataURL(e.target.files[0]);
},
async save(){
    const table = this.modalType==='product'?'dr_products':'dr_banners';
    await supabase.from(table).insert([this.form]);
    this.modal=false;
    this.load();
},
async deleteProduct(id){
    await supabase.from('dr_products').delete().eq('id',id);
    this.load();
},
async deleteBanner(id){
    await supabase.from('dr_banners').delete().eq('id',id);
    this.load();
},
logout(){
    sessionStorage.clear();
    location.href='index.html';
}
},
mounted(){
this.load();
}
}).mount('#app');
