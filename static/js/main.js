var dados = [];
var myChart;

var headers = {
    "Content-Type": 'application/json',
    "Authorization": "JWT " + sessionStorage.getItem("AUTH_TOKEN")
}

var login = Vue.component("login",{
    template:"#login",
    data(){
        return{
            username: "",
            password: ""
        }
    },
    methods:{
        login(){
            vm = this
            $.ajax({
                type: "POST",
                url: "/api/auth",
                data: JSON.stringify({username:vm.username,password:vm.password}),
                headers: {
                        "Content-Type": 'application/json'
                    },
                success: function(response){
                    let AUTH_TOKEN = response.access_token
                    sessionStorage.setItem("AUTH_TOKEN",AUTH_TOKEN)
                    sessionStorage.setItem("USUARIO",vm.username)
                    app.$data.login = sessionStorage.getItem("AUTH_TOKEN")
                },
                dataType: "",
                error:function(response){
                    $("#erro").modal("toggle")
                }
                });
            }
    }});

var media = Vue.component("media-global",{ template:"#media-global", props:{ entrada:Array } })
var relatorio_gen =  Vue.component("relatorio-gen",{ template:"#relatorio-gen", props:{ titulo:String, entrada:Array, cabecalho:Array,classe:String } } )
var relatorio = Vue.component("relatorio",{
    template:"#relatorio",
    data(){
        return{
            funcionarios:[],
            funcionariosSel:[],
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
        $.ajax({
                type: "GET",
                url: "/api/consulta/funcionarios",
                headers: window.headers,
                success: function(response){
                    vm.funcionarios = response
                },
                dataType: ""
                });
    },
    updated(){
        graficoFun(this.toArray(),this.totais())
        
        if(this.cabecalho.length != 0){
            if(this.cabecalho.length < 20){
                $(".VENDAS_POR_DIA")[0].style.width = "500px"
                $(".VENDAS_POR_HORA")[0].style.width = "500px"
            }
            if(this.cabecalho.length < 10){
                $(".VENDAS_POR_DIA")[0].style.width = "300px"
                $(".VENDAS_POR_HORA")[0].style.width = "300px"
            }
        }
       
    },
    methods:{
        selecionarTodos(){
            this.funcionariosSel = []
            for(i of this.funcionarios){
                this.funcionariosSel.push(i.codfun)
            }
        },
        capturar(){
            $("#GerarRelatorio").modal("toggle")
            var vm = window
            var vm2 = this
            var fun = [];
            for(i of this.funcionariosSel)
            fun.push(i)

            if(this.horaInicio && this.horaFim){
                $.ajax({
                        type: "GET",
                        url: '/api/consulta/['+ fun.toString() +']/'+ this.dataInicio + '/' + this.dataFim + '/' + this.horaInicio + '/' + this.horaFim,
                        headers: window.headers,
                        success: function(response){
                            vm.dados = response
                            vm2.popular()
                        },
                        dataType: ""
                        });
            }
            else{
                $.ajax({
                    type: "GET",
                    url: '/api/consulta/['+ fun.toString() +']/'+ this.dataInicio + '/' + this.dataFim,
                    headers: window.headers,
                    success: function(response){
                        vm.dados = response
                        vm2.popular()
                    },
                    dataType: ""
                    });
            }
        },
        popular(){
            this.mesRel = getMes(this.dataInicio)
            window.mesRel = getMes(this.dataInicio)
            this.cabecalho = ["ID","FUNCIONARIO"].concat(getDays(this.dataInicio,this.dataFim))
            this.dadosMedia = this.mediaGlobal(this.dataInicio,this.dataFim)
            
            for(i of this.funcionariosSel){
                let cod = String(i)
                this.dadostempo.push({codfun:cod,nomefun:this.getNome(i),dados:totalHoras(dados,this.dataInicio,this.dataFim,cod)})
            }

            for(i of this.funcionariosSel){
                let cod = String(i)
                this.dadosqtd.push({codfun:cod,nomefun:this.getNome(i),dados:totalVendas(dados,this.dataInicio,this.dataFim,cod)})
            }
            
            for(i of this.funcionariosSel){
                let cod = String(i)
                this.dadosvenda.push({codfun:cod,nomefun:this.getNome(i),dados:this.vendasHora(cod)})
            }
        },
        limpar(){
            this.dadosqtd= []
            this.dadostempo= []
            this.dadosvenda= []
            this.mesRel= ""
            this.cabecalho= []
            this.dadosMedia = []
            this.dataInicio = ""
            this.dataFim = ""
            this.horaInicio = ""
            this.horaFim = ""
            this.funcionariosSel = []
            window.myChart.destroy()
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
            for(i of this.funcionariosSel)
                arr.push(this.getNome(i))
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
            let venda = [],tempo = [],final = []
            for(i of this.dadosqtd){
                if(i.codfun == cod)
                venda = i.dados
            }
            for(i of this.dadostempo){
                if(i.codfun == cod)
                tempo = i.dados
            }
            let d,t,v
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
            for (i of this.funcionariosSel){
                let cod = String(i)
                b.push({codfun:cod,nomefun:this.getNome(i),dados:mediaG(dados,dataI,dataF,cod)})
            }
            return b
            
        },
        getNome(cod){
            for(i of this.funcionarios){
                if(i.codfun == cod){
                    return i.nomefun
                    break;
                }
            }
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
                var vm = this
                $.ajax({
                    type: "POST",
                    url: "/api/user/cadastrar",
                    data: JSON.stringify({login:vm.usuario, senha:vm.senha, nome:vm.nome, email:vm.email}),
                    headers: window.headers,
                    success: function(response){
                       
                    },
                    dataType: ""
                  });
            location.reload(true)
            }else{
                alert("senhas incorretas")
            }
            
        },
        altUsuario(){
            if(this.senha == this.repeticao_senha){
                var vm = this
                $.ajax({
                    type: "POST",
                    url: "/api/user/atualizar",
                    data: JSON.stringify({login:vm.usuario, senha:vm.senha, nome:vm.nome, email:vm.email,cod:vm.coduser}),
                    headers: window.headers,
                    success: function(response){
                        
                    },
                    dataType: ""
                  });
                location.reload(true)
            }else{
                alert("senhas incorretas")
            }
        },
        remUsuario(cod){
            $.ajax({
                type: "POST",
                url: "/api/user/deletar",
                data: JSON.stringify({
                    cod:cod
                }),
                headers: window.headers,
                success: function(response){
                },
                dataType: ""
              });
            location.reload(true)
            
        },
        addFuncionario(){
            var vm = this
            $.ajax({
                type: "POST",
                url: "/api/funcionario/cadastrar",
                data: JSON.stringify({
                    codfun:vm.codfun,
                    nomefun:vm.funcionario
            }),
                headers: window.headers,
                success: function(response){
                    
                },
                dataType: ""
              });
            location.reload(true)
        },
        altFuncionario(){
            var vm = this
            $.ajax({
                type: "POST",
                url: "/api/funcionario/atualizar",
                data: JSON.stringify({ codfun:vm.codfun, nomefun:vm.funcionario } ),
                headers: window.headers,
                success: function(response){
                },
                dataType: ""
              });
            location.reload(true)
        },
        remFuncionario(cod){
        var vm = this
        $.ajax({
            type: "POST",
            url: "/api/funcionario/deletar",
            data: JSON.stringify({ codfun:cod }),
            headers: window.headers,
            success: function(response){
                
            },
            dataType: ""
            });
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
        $.ajax({
            type: "GET",
            url: "/api/consulta/funcionarios",
            headers: window.headers,
            success: function(response){
                vm.funcionarios = response
            },
            dataType: ""
          });
        
        $.ajax({
            type: "GET",
            url: "/api/consulta/usuarios",
            headers: window.headers,
            success: function(response){
                vm.usuarios = response
            },
            dataType: ""
          });
        
        }
        
});

var lateralmenu = Vue.component("lateralmenu",{ 
    template:"#lateralmenu",
    data(){
        return{
            usuario:sessionStorage.getItem("USUARIO")
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
            sessionStorage.removeItem("AUTH_TOKEN")
            sessionStorage.removeItem("USUARIO")
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

var app = new Vue({ el:"#app", router, data:{ login: sessionStorage.getItem("AUTH_TOKEN") } });

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
    for(i=dataInicio[2];i<=dataFim[2];i++){
        if(i != "01"){
            arr.push(i)
        }else{
            arr.push(1)
        }
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
    const ctx = document.getElementById('chart');
    myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: nomes,
            datasets: [{
                label: "MEDIA DE RENDIMENTO",
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
}

function mediaG(dados,dataI,dataF,cod){
    var a = totalVendasRel(dados,dataI,dataF,cod)
    var b = totalHorasSum(dados,dataI,dataF,cod)

    return (a/b).toFixed(2)
}


