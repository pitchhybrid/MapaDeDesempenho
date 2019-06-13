var dados = []
var user = localStorage.getItem("USUARIO")
axios.defaults.baseURL = 'http://127.0.0.1:5000/api';
axios.defaults.headers.common['Authorization'] = "JWT " + localStorage.getItem("AUTH_TOKEN");

var login = Vue.component("login",{
    template:"#login",
    data(){
        return{
            username: null,
            password: null
        }
    },
    methods:{
        login(){
            vm = this
            axios({
                    method: 'post',
                    url: '/auth',
                    data: {
                        username: this.username,
                        password: this.password
                }
                }).then(function(response){
                        let AUTH_TOKEN = response.data.access_token;
                        localStorage.setItem("AUTH_TOKEN",AUTH_TOKEN)
                        localStorage.setItem("USUARIO",vm.username)
                        window.user = localStorage.getItem("USUARIO");
                        app.$data.login = localStorage.getItem("AUTH_TOKEN")
                        axios.defaults.headers.common['Authorization'] = "JWT " + localStorage.getItem("AUTH_TOKEN");
                        axios.defaults.headers.common['Content-Type'] = 'application/json';
                }).catch(err => {
                    $("#erro").modal("toggle")
                    console.error(err)
                })
            }
    }});

var media = Vue.component("media-global",{ template:"#media-global", props:{ entrada:Array } })
var relatorio_gen =  Vue.component("relatorio-gen",{ template:"#relatorio-gen", props:{ titulo:String, entrada:Array, cabecalho:Array } } )
var relatorio = Vue.component("relatorio",{
    template:"#relatorio",
    data(){
        return{
            funcionarios:[],
            dadosqtd:[],
            dadostempo:[],
            dadosvenda:[],
            dataInicio:"",
            dataFim:"",
            horaInicio:"",
            horaFim:"",
            mesRel:"",
            cabecalho:[],
            dadosMedia:[]
        }
    },
    created(){
        let vm = this
        axios({
                method: 'get',
                url: '/consulta/funcionarios'
                }).then(function(response){
                        vm.funcionarios = response.data
                }).catch(err => console.error(err))
    },
    beforeUpdate(){
        graficoFun(this.toArray(),this.totais())
    },
    updated(){
        graficoFun(this.toArray(),this.totais())
    },
    methods:{
        capturar(){
            var vm = window
            var vm2 = this
            var fun = [];
            for(i of this.funcionarios)
            fun.push(i.codfun)

            if(this.horaInicio && this.horaFim){
            axios({
                    method: 'get',
                    url: '/consulta/['+ fun.toString() +']/'+ this.dataInicio + '/' + this.dataFim + '/' + this.horaInicio + '/' + this.horaFim
                    }).then(function(response){
                            vm.dados = response.data
                            vm2.popular()
                    }).catch(err =>console.log(err))
            }
            else{
            axios({
                method: 'get',
                url: '/consulta/['+ fun.toString() +']/'+ this.dataInicio + '/' + this.dataFim
                }).then(function(response){
                        vm.dados = response.data
                        vm2.popular()
                }).catch(err =>console.log(err))
            }
            },
        popular(){
            this.mesRel = getMes(this.dataInicio)
            window.mesRel = getMes(this.dataInicio)
            this.cabecalho = ["ID","FUNCIONARIO"].concat(getDays(this.dataInicio,this.dataFim))
            this.dadosMedia = this.mediaGlobal(this.dataInicio,this.dataFim)
            for(i of this.funcionarios){
                this.dadosqtd.push({codfun:i.codfun,nomefun:i.nomefun,dados:totalVendas(dados,this.dataInicio,this.dataFim,i.codfun)})
            }
            
            for(i of this.funcionarios){
                this.dadostempo.push({codfun:i.codfun,nomefun:i.nomefun,dados:totalHoras(dados,this.dataInicio,this.dataFim,i.codfun)})
            }
            
            for(i of this.funcionarios){
                this.dadosvenda.push({codfun:i.codfun,nomefun:i.nomefun,dados:this.vendasHora(i.codfun)})
            }
        },
        limpar(){
            this.dadosqtd= []
            this.dadostempo= []
            this.dadosvenda= []
            this.mesRel= null
            this.cabecalho= []
            this.dadosMedia = []
            graficoFun(null,null)
        },
        exportar(){
            var element = document.getElementById("relatorioExportar")
            var opt = {
            margin:       [0,0,0,0],
            filename:     'relatorio.pdf',
            image:        { type: 'jpeg', quality: 0.95 },
            html2canvas:  { width:1500 },
            jsPDF:        { orientation: 'landscape' }
            }
            html2pdf().set(opt).from(element).save()
        },
        toArray(){
            let arr = []
            for(i of this.funcionarios)
                arr.push(String(i.nomefun))
            return arr
        },
        totais(){
            let arr =[]
                for (i of this.dadosMedia){
                    arr.push(i.dados)
                }
            return arr
        },
        vendasHora(cod){
            let venda = []
            let tempo = []
            let final = []
                for(i of this.dadosqtd){
                    if(i.codfun == cod)
                    venda = i.dados
                }
                
                for(i of this.dadostempo){
                    if(i.codfun == cod)
                    tempo = i.dados
                }
                let d 
                let t
                let v
                for(i in tempo){
                    v = venda[i]
                    t = timeToDecimal(tempo[i])
                    if(t < 1){
                        t = 0;
                    }
                    d = Math.ceil( v / t)
                    if(!isFinite(d)){
                        final.push(0)
                    }else{
                        final.push(d)
                    }
                }
                
            return final                  
        },
        mediaGlobal(dataI,dataF){
            let b = []
            for (i of this.funcionarios){
                b.push({codfun:i.codfun,nomefun:i.nomefun,dados:mediaG(dados,dataI,dataF,i.codfun)})
            }
            return b
            
        }
    }
});

var grafico = Vue.component("grafico",{ template:"#grafico" })

var gerenciamento_gen = Vue.component("gerenciamento-gen",{
    template:"#gerenciamento-gen",
    data(){
        return{
            codfun:"",
            funcionario:"",
            usuario:"",
            senha:"",
            nome:"",
            repeticao_senha:"",
            email:"",
            coduser:""
        }
    },
    props:{
        titulo:String,
        funcionarios:Array,
        usuarios:Array,
        id:String
    },
    mounted(){
        let vm = this
        $('#novousuario').on('show.bs.modal', function () {
            vm.coduser = "";
            vm.usuario = "";
            vm.nome = "";
            vm.email = "";
          })
        $('#novofuncionario').on('show.bs.modal', function () {
            vm.funcionario = "";
            vm.codfun = "";
        })
    },
    methods:{
        getCodUser(a,b,c,d){
            this.coduser = a;
            this.usuario = b;
            this.nome = c;
            this.email = d;
            $('#usuario').modal('toggle')
        },
        getCodFun(a,b){
            this.codfun = a;
            this.funcionario = b;
            $('#funcionario').modal('toggle')
        },
        addUsuario(){
            if(this.senha == this.repeticao_senha){
                axios({
                method: 'post',
                url: '/user/cadastrar',
                data:{ login:this.usuario, senha:this.senha, nome:this.nome, email:this.email }
                }).then(function(response){
                        console.log(response)
                }).catch(err => console.error(err))
            location.reload(true)
            }else{
                alert("senhas incorretas")
            }
            
        },
        altUsuario(){
            if(this.senha == this.repeticao_senha){
                axios({
                method: 'post',
                url: '/user/atualizar',
                data:{
                        login:this.usuario,
                        senha:this.senha,
                        nome:this.nome,
                        email:this.email,
                        cod:this.coduser
                }
                }).then(function(response){
                        console.log(response.data)
                }).catch(err => console.error(err))
                location.reload(true)
            }else{
                alert("senhas incorretas")
            }
        },
        remUsuario(cod){
            axios({
                method: 'post',
                url: '/user/deletar',
                data:{
                        cod:cod
                }
                }).then(function(response){
                        console.log(response)
                }).catch(err => console.error(err)) 
                location.reload(true)
            
        },
        addFuncionario(){
            axios({
                method: 'post',
                url: '/funcionario/cadastrar',
                data:{
                        codfun:this.codfun,
                        nomefun:this.funcionario,
                }
                }).then(function(response){
                        console.log(response)
                }).catch(err => console.error(err))
            location.reload(true)
        },
        altFuncionario(){
            axios({
                method: 'post',
                url: '/funcionario/atualizar',
                data:{
                        codfun:this.codfun,
                        nomefun:this.funcionario
                }
                }).then(function(response){
                        console.log(response)
                }).catch(err => console.error(err))
            location.reload(true)
        },
        remFuncionario(cod){
            axios({
                method: 'post',
                url: '/funcionario/deletar',
                data:{
                    codfun:cod
                }
                }).then(function(response){
                        console.log(response)
                }).catch(err => console.error(err)) 
                location.reload(true)
        }
    }
});

var gerenciamento = Vue.component("gerenciamento",{ 
    template:"#gerenciamento",
    data(){
        return{
            funcionarios:[],
            usuarios:[]
        }
    },
    mounted(){
        let vm = this
        axios({
                method: 'get',
                url: '/consulta/funcionarios'
                }).then(function(response){
                    vm.funcionarios = response.data
                }).catch(err => console.error(err))
        
        axios({
                method: 'get',
                url: '/consulta/usuarios'
                }).then(function(response){ 
                    vm.usuarios = response.data
                }).catch(err => console.error(err))
        
        }
        
});

var lateralmenu = Vue.component("lateralmenu",{ 
    template:"#lateralmenu",
    data(){
        return{
            usuario:localStorage.getItem("USUARIO")
        }
    },
    filters:{
        toUpper(str){
            return str.toUpperCase()
        }
    },
    methods:{
        logout(){
            app.login = null;
            localStorage.removeItem("AUTH_TOKEN")
            localStorage.removeItem("USUARIO")
            AUTH_TOKEN = null;
            axios.defaults.headers.common['Authorization'] = null;
            window.location.href = "/"; 
        }    
    } });

var navbar = Vue.component("navbar",{ 
    template:"#navbar",
    methods:{
        toggle(){
            $("#wrapper").toggleClass("toggled");
        }
    }
});

var router = new VueRouter({
    routes:[
        { 
            path:"/", 
            name:"Relatorio",
            component:relatorio ,
            meta:{
                title:"Relatorio"
            } 
        },
        { 
            path:"/gerenciamento",
            name:"Gerenciamento",
            component: gerenciamento,
            meta:{
                title:"Gerenciamento"
            }
            }
    ]
});

var app = new Vue({ el:"#app", router, data:{ login: localStorage.getItem("AUTH_TOKEN") } });

function getTimeInterval(tempoMenor,tempoMaior){
    let a = String(tempoMenor).split(" ")
    let b = String(tempoMaior).split(" ")
    let mascara = "HH:mm:ss";
    let ms = moment(b[1],mascara).diff(moment(a[1],mascara));
    let d = moment.duration(ms);
    let s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    if(s == "NaNInvalid date"){
        return "00:00:00"
    }else{
        return s
    }
}

function getDays(dataI,dataF){
    let arr = []
    let dataInicio = String(dataI).split("-")
    let dataFim = String(dataF).split("-")
    // let max = moment(data,"YYYY-MM-DD").daysInMonth()
    for(i=dataInicio[2].replace("0","");i<=dataFim[2];i++){
        arr.push(i)
    }    
    return arr
}

function getMes(data){
    let a = moment(data,"YYYY-MM-DD")
    let mes = a.month()
    let ano = a.year()
    switch (mes) {
        case 0: return "JANEIRO - " + ano
            break;
        case 1: return "FEVEREIRO - " + ano
            break;
        case 2: return "MARÇO - " + ano
            break;
        case 3: return "ABRIL - " + ano
            break;
        case 4: return "MAIO - " + ano
            break;
        case 5: return "JUNHO - " + ano
            break;
        case 6: return "JULHO - " + ano
            break;
        case 7: return "AGOSTO - " + ano
            break;
        case 8: return "SETEMBRO - " + ano
            break;
        case 9: return "OUTUBRO - " + ano
            break;
        case 10: return "NOVEMBRO - " + ano
            break;
        case 11: return "DEZEMBRO - " + ano
            break;
        default: return "FALHA"
            break;
    }
}

function filtroData(dados,periodo){
    let a,b,c;
    let d = [];
    for(i of dados){
        a = i.timestamp;
        b = a.split(" ");
        c = b[0];
        if(c == periodo)
        d.push(c);
    }
    return d;
}

function filtroHora(dados,periodo,cod){
    let a,b,c,e;
    let d = [];
    for(i of dados){
        if(i.codfun == cod){
            a = i.timestamp;
            b = a.split(" ");
            c = b[0];
            e = b[1];
            if (c == periodo)
            d.push(a);  
        }
    }
    return d;
}

function totalVendasUnitario(dados,periodo,cod){
    let a,b,c,e;
    let d = [];
    for(i of dados){
        if(i.codfun == cod){
        a = i.timestamp;
        b = a.split(" ");
        c = b[0];
        e = b[1];
        if (c == periodo)
        d.push(e);
        }
    }
    return d.length;
}

function totalVendasRel(dados,dataI,dataF,cod){
    let a = totalVendas(dados,dataI,dataF,cod)
    let total = 0;
    for(i of a){
        total = total + i
    }
    return total
}

function totalVendas(dados,dataI,dataF,cod){

    let a = [];
    let b = [],c;
    let d = String(dataI).split("-")
    let e = String(dataF).split("-")
    for(let i = d[2].replace("0","");i<=e[2];i++){
        if(i<10){
            c = `${d[0]}-${d[1]}-0${i}`
        }else{
            c = `${d[0]}-${d[1]}-${i}`
        }
        b.push(totalVendasUnitario(dados,c,cod))
    }
    return b
}

function totalHoras(dados,dataI,dataF,cod){
    let a = [];
    let b = [],c;
    let d = String(dataI).split("-")
    let e = String(dataF).split("-")
    for(let i = d[2].replace("0","");i<=e[2];i++){
        if(i<10){
            c = `${d[0]}-${d[1]}-0${i}`
        }else{
            c = `${d[0]}-${d[1]}-${i}`
        }

        a = filtroHora(dados,c,cod)
        b.push(getTimeInterval(a[0],a[(a.length - 1)]))
    }
        return b
    }

function totalHorasSum(dados,dataI,dataF,cod){
    let a = totalHoras(dados,dataI,dataF,cod)
    let total = 0;
    for(i of a){
        total = total + timeToDecimal(i)
    }
    return Math.ceil(total)
}

function timeToDecimal(t) {
    var arr = t.split(':');
    var dec = parseInt((arr[1]/6)*10, 10);
    return parseFloat(parseInt(arr[0], 10) + '.' + (dec<10?'0':'') + dec);
} 

function graficoFun(nomes,dados){
    var ctx = document.getElementById('chart');
    var myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: nomes,
            datasets: [{
                label: "Media Global",
                data: dados,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(60, 99, 70, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(60, 99, 70, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive:true,
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })
    myChart.update()
    if(!nomes && !dados){
        myChart.destroy()
    }
}

function mediaG(dados,dataI,dataF,cod){
    var a = totalVendasRel(dados,dataI,dataF,cod)
    var b = totalHorasSum(dados,dataI,dataF,cod)

    return (a/b).toFixed(2)
}


