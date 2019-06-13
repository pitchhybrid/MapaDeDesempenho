from flask import Flask,request,Response,json
from flask_cors import CORS,cross_origin
from flask_jwt import JWT,jwt_required,current_identity
from classes.orm import Orm
from classes.usuario import Usuario
from datetime import timedelta
from os import urandom

################### CONFIGURAÇOES DA APLICAÇÂO ################################

app = Flask("mapa de desempenho")
app.debug = False
app.secret_key = str(urandom(24))
app.config['JWT_EXPIRATION_DELTA'] = timedelta(seconds=1000)
app.config['JWT_VERIFY_EXPIRATION'] = False
app.config['JWT_AUTH_URL_RULE'] = "/api/auth"
app.config['CORS_HEADERS'] = 'Content-Type'

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

JWT(app,authenticate,identity)
CORS(app)

################## ROTAS (ENDPOINTS) #########################################
#### RAIZ (HOME) #######
@app.route('/')
def home():
    with open("static/index.html") as home:
        return home.read()

###### CONSULTA DE VENDAS #############################

@cross_origin()
@jwt_required()
@app.route('/api/consulta/<codfun>/<data_inicio>/<data_fim>/<hora_inicio>/<hora_fim>')
def api(codfun,data_inicio,data_fim,hora_inicio,hora_fim):
    orm = Orm()
    dado = orm.importaDadosHora(codfun,data_inicio,data_fim,hora_inicio,hora_fim)
    dados = []

    for i in dado:
        dados.append({'codfun':str(i[0]),'timestamp':str(i[1]) + " " + str(i[2])})
    
    json_data = json.dumps(dados)
    return Response(json_data,200,mimetype='application/json')

@cross_origin()
@jwt_required()
@app.route('/api/consulta/<codfun>/<data_inicio>/<data_fim>')
def apiHora(codfun,data_inicio,data_fim):
    orm = Orm()
    dado = orm.importaDadosData(codfun,data_inicio,data_fim)
    dados = []

    for i in dado:
        dados.append({'codfun':str(i[0]),'timestamp':str(i[1]) + " " + str(i[2])})
    
    json_data = json.dumps(dados)
    return Response(json_data,200,mimetype='application/json')
########################## GERENCIA DE FUNCIONARIOS ##############################

@cross_origin()
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

@cross_origin()
@jwt_required()
@app.route('/api/consulta/funcionario/<codfun>',methods=['GET'])
def funcionario(codfun):
    usuarios = Usuario()
    dado = usuarios.getFuncionario(codfun)
    json_data = json.dumps({'codfun':str(dado[0][0]),'nomefun':str(dado[0][1])})
    return Response(json_data,200,mimetype='application/json')

@cross_origin()
@jwt_required()
@app.route('/api/funcionario/cadastrar', methods=['POST'])
def cadastrar_funcionario():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.addFuncionario(json_data["codfun"],json_data["nomefun"])
    return Response("",200)

@cross_origin()
@jwt_required()
@app.route('/api/funcionario/atualizar', methods=['POST'])
def atualizar_funcionario():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.editaFuncionario(json_data["codfun"],json_data["nomefun"])
    return Response("",200)

@cross_origin()
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

@cross_origin()
@jwt_required()
@app.route('/api/user/cadastrar', methods=['POST'])
def cadastrar():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.addUsuario(json_data["login"],json_data["senha"],json_data["nome"], json_data["email"])
    return Response("",200)

@cross_origin()
@jwt_required()
@app.route('/api/user/atualizar', methods=['POST'])
def atualizar():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.editaUsuario(json_data["login"],json_data["senha"],json_data["nome"], json_data["email"],json_data["cod"])
    return Response("",200)

@cross_origin()
@jwt_required()
@app.route('/api/user/deletar', methods=['POST'])
def deletar():
    json_data = request.get_json()
    usuario = Usuario()
    usuario.remUsuario(json_data["cod"])
    return Response("",200)

@cross_origin()
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
