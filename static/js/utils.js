function montarHora(time){
    let tempo = time.split(" ");
    return moment(tempo[1],"HH:mm:ss");
}

function montarData(data){
    let date = data.split(" ");
    return moment(date[0],"YYYY/MM/DD");
} 

function getTimeInterval(tempoMenor,tempoMaior){
    let mascara;

    if(tempoMaior.match("-") && tempoMenor.match("-")){
        mascara = "YYYY-MM-DD HH:mm:ss";
    }else{
        mascara = "HH:mm:ss";
    }
    
    let ms = moment(tempoMaior,mascara).diff(moment(tempoMenor,mascara));
    let d = moment.duration(ms);
    let s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    return s
}

function entre(dataQuestao,dataIni,dataFim){
    return moment(dataQuestao,"YYYY-MM-DD").isBetween(dataIni,dataFim);
}

function getDays(){
    let arr = []
    let max = moment(moment.now()).daysInMonth()
    for(i=1;i<=max;i++)
        arr.push(i)
    
    return arr
}

function getMes(){
    let mes = new Date().getMonth()
    
    switch (mes) {
        
        case 0: return "JANEIRO"
            break;
        
        case 1: return "FERVEREIRO"
            break;
        
        case 2: return "MARÇO"
            break;
        
        case 3: return "ABRIL"
            break;
        
        case 4: return "MAIO"
            break;
        
        case 5: return "JUNHO"
            break;
        
        case 6: return "JULHO"
            break;
        
        case 7: return "AGOSTO"
            break;
        
        case 8: return "SETEMBRO"
            break;
        
        case 9: return "OUTUBRO"
            break;
        
        case 10: return "NOVEMBRO"
            break;
        
        case 11: return "DEZEMBRO"
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
        if(c === periodo)
        d.push(c);
    }
    return d;
}

function filtroHora(dados,periodo){
    let a,b,c,e;
    let d = [];
    for(i of dados){
        a = i.timestamp;
        b = a.split(" ");
        c = b[0];
        e = b[1];
        if (c === periodo)
        d.push(e);
    }
    return d;
}