from flask import Flask,request,Response,json
from flask_cors import CORS ,cross_origin
from flask_jwt import JWT,jwt_required,current_identity
from classes.orm import Orm
from classes.usuario import Usuario
from datetime import timedelta

################### CONFIGURAÇOES DA APLICAÇÂO ################################

app = Flask("mapa de desempenho")
app.debug = True
app.secret_key = 'Mht(>0[w[s5a~s*q5[##[3zT^6}rlT'
app.config['JWT_EXPIRATION_DELTA'] = timedelta(seconds=900)

cors = CORS(app, resources={r'/api/*': {"origins": "http://localhost:5000"}})

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
@cross_origin()
def home():
    return open("static/index.html","r").read()

###### CONSULTA DE VENDAS #############################

@cross_origin()
@app.route('/api/consulta/<codfun>/<data_inicio>/<data_fim>')
# @jwt_required()
def api(codfun,data_inicio,data_fim):
    orm = Orm()
    dado = orm.importaDados(codfun,data_inicio,data_fim)
    dados = []

    for i in dado:
        dados.append({'codfun':str(i[1]),'nomefun':str(i[0]).strip(),'timestamp':str(i[2]) + " " + str(i[3])})
    
    json_data = json.dumps(dados)
    return Response(json_data,200,mimetype='application/json')

@cross_origin()
# @jwt_required()
@app.route('/api/consulta/horas/<codfun>/<data_inicio>/<data_fim>')
def horas(codfun,data_inicio,data_fim):
    orm = Orm()
    dado = orm.horaMaior(codfun,data_inicio,data_fim)
    dados = []
    
    for i in dado:
        dados.append(str(i[0]) + " " + str(i[1]))
    
    maior = dados[len(dados)-1]
    menor = dados[0]
    json_data = json.dumps({'horamaior':maior,'horamenor':menor})
    return Response(json_data,200,mimetype='application/json')

@cross_origin()
# @jwt_required()
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
# @jwt_required()
@app.route('/api/consulta/funcionario/<codfun>')
def funcionario(codfun):
    usuarios = Usuario()
    dado = usuarios.getFuncionario(codfun)
    json_data = json.dumps({'codfun':str(dado[0][0]),'nomefun':str(dado[0][1])})
    return Response(json_data,200,mimetype='application/json')

###################### ENDPOINTS PARA A GERENCIA DE USUARIOS #########################

@app.route('/api/user')
def user():
    return ""

@app.route('/api/user/cadastrar', methods=['POST'])
@cross_origin()
@jwt_required()
def cadastrar():
    json_data = json.loads(request.args['name'])
    login = json_data["login"]
    senha = json_data["senha"]
    nome = json_data["nome"]
    email = json_data["email"]
    usuario = Usuario()
    usuario.addUsuario(login, senha, nome, email)
    return Response("",200)

@app.route('/api/user/atualizar', methods=['POST'])
@cross_origin()
@jwt_required()
def atualizar():
    json_data = json.loads(request.args['name'])
    login = json_data["login"]
    senha = json_data["senha"]
    nome = json_data["nome"]
    email = json_data["email"]
    usuario = Usuario()
    usuario.editaUsuario(login, senha, nome, email)
    return Response("",200)

@app.route('/api/user/deletar', methods=['POST'])
@cross_origin()
@jwt_required()
def deletar():
    json_data = json.loads(request.args['name'])
    id_fun = json_data['id_fun']
    usuario = Usuario()
    usuario.remUsuario(id_fun)
    return Response("",200)

@app.route('/api/user/getUsuarios', methods=['GET'])
@cross_origin()
@jwt_required()
def getUser():
    usuario = Usuario()
    dado = usuario.getUsuarios()
    dados = []
    for i in dado:
        dados.append({'cod_user':str(i[0]),'usuario_login':str(i[1]),'email_usuario':str(i[3])})
    
    json_data = json.dumps(dados)
    return Response(json_data,200,mimetype="application/json")

################### ENDPOINTS PARA A GERENCIA DE RELATORIOS #####################################

if __name__ == '__main__':
    app.run()
