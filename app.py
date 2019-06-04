from flask import Flask,request,Response,json
from flask_jwt import JWT,jwt_required,current_identity
from classes.orm import Orm
from classes.usuario import Usuario
from datetime import timedelta

################### CONFIGURAÇOES DA APLICAÇÂO ################################

app = Flask("mapa de desempenho")
app.debug = False
app.secret_key = 'Mht(>0[w[s5a~s*q5[##[3zT^6}rlT'
app.config['JWT_EXPIRATION_DELTA'] = timedelta(seconds=1000)
app.config['JWT_VERIFY_EXPIRATION'] = False
app.config['JWT_AUTH_URL_RULE'] = "/api/auth"

################### METODOS PARA A JWT ########################################

def authenticate(username,password):
    user = Usuario()
    user.id = user.getUsuario(username)
    if user.login(username,password):
        return user

def identity(payload):
    userid = Usuario()
    user = payload['identity']
    identidade = userid.getUsuario(user[1])
    return identidade

jwt = JWT(app,authenticate,identity)

################## ROTAS (ENDPOINTS) #########################################
#### RAIZ (HOME) #######
@app.route('/')
def home():
    return open("static/index.html","r").read()

###### CONSULTA DE VENDAS #############################

@app.route('/api/consulta/<codfun>/<data_inicio>/<data_fim>')
@jwt_required()
def api(codfun,data_inicio,data_fim):
    orm = Orm()
    dado = orm.importaDados(codfun,data_inicio,data_fim)
    dados = []

    for i in dado:
        dados.append({'codfun':str(i[0]),'timestamp':str(i[1]) + " " + str(i[2])})
    
    json_data = json.dumps(dados)
    return Response(json_data,200,mimetype='application/json')

########################## GERENCIA DE FUNCIONARIOS ##############################

@jwt_required()
@app.route('/api/consulta/funcionarios')
def funcionarios():
    usuarios = Usuario()
    dado = usuarios.getFuncionarios()
    dados = []
    
    for i in dado:
        dados.append({'codfun':str(i[0]),'nomefun':str(i[1])})
    
    json_data = json.dumps(dados)
    return Response(json_data,200,mimetype='application/json')

@jwt_required()
@app.route('/api/consulta/funcionario/<codfun>',methods=['GET'])
def funcionario(codfun):
    usuarios = Usuario()
    dado = usuarios.getFuncionario(codfun)
    json_data = json.dumps({'codfun':str(dado[0][0]),'nomefun':str(dado[0][1])})
    return Response(json_data,200,mimetype='application/json')

@jwt_required()
@app.route('/api/funcionario/cadastrar', methods=['POST'])
def cadastrar_funcionario():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.addFuncionario(json_data["codfun"],json_data["nomefun"])
    return Response("",200)

@jwt_required()
@app.route('/api/funcionario/atualizar', methods=['POST'])
def atualizar_funcionario():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.editaFuncionario(json_data["codfun"],json_data["nomefun"])
    return Response("",200)

@jwt_required()
@app.route('/api/funcionario/deletar', methods=['POST'])
def deletar_funcionario():
    json_data =request.get_json()
    usuario = Usuario()
    usuario.remFuncionario(json_data["codfun"])
    return Response("",200)

###################### ENDPOINTS PARA A GERENCIA DE USUARIOS #########################

@app.route('/api/user')
def user():
    return ""

@app.route('/api')
def api_root():
    return ""

@jwt_required()
@app.route('/api/user/cadastrar', methods=['POST'])
def cadastrar():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.addUsuario(json_data["login"],json_data["senha"],json_data["nome"], json_data["email"])
    return Response("",200)

@jwt_required()
@app.route('/api/user/atualizar', methods=['POST'])
def atualizar():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.editaUsuario(json_data["login"],json_data["senha"],json_data["nome"], json_data["email"],json_data["cod"])
    return Response("",200)

@jwt_required()
@app.route('/api/user/deletar', methods=['POST'])
def deletar():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.remUsuario(json_data["cod"])
    return Response("",200)

@jwt_required()
@app.route('/api/consulta/usuarios')
def getUser():
    usuario = Usuario()
    dado = usuario.getUsuarios()
    dados = []
    for i in dado:
        dados.append({'cod_user':str(i[0]),'usuario_login':str(i[1]),'nome_usuario':str(i[3]),'email_usuario':str(i[4])})
    
    json_data = json.dumps(dados)
    return Response(json_data,200,mimetype="application/json")

################### ENDPOINTS PARA A GERENCIA DE RELATORIOS #####################################

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000)
