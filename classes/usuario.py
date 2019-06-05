import sqlite3 as sql
from os import path
from hashlib import md5

class Usuario(object):
    conn = sql.connect(path.abspath("handymobile.db"),timeout=500,check_same_thread=False)
    
    #constutor
    def __init__(self):
        self.id = None

    def addUsuario(self,login,senha,nome,email):
        temp = md5(senha.encode()).hexdigest()
        with self.conn:
            c = self.conn.cursor()
            c.execute("INSERT INTO mapa_users (login,password,nome,email) VALUES (?,?,?,?)",(login,temp,nome,email))

    def remUsuario(self,usuario_id):
        with self.conn:
            c = self.conn.cursor()
            c.execute("DELETE FROM mapa_users where id=" + str(usuario_id))

    def editaUsuario(self,login,senha,nome,email,usuario_id):
        temp = md5(senha.encode()).hexdigest()
        with self.conn:
            c = self.conn.cursor()
            c.execute("UPDATE mapa_users SET login='"+ login +"', password='"+ temp +"',nome='" + nome + "',email='"+ email +"' WHERE id=" + str(usuario_id))
    
    def login(self,login,senha):
        temp = md5(senha.encode()).hexdigest()
        with self.conn:
            c = self.conn.cursor()
            c.execute("SELECT login,password FROM mapa_users WHERE login='"+ login + "' AND password='" + temp + "'")
            return c.fetchone()

    def getUsuarios(self):
        with self.conn:
            c = self.conn.cursor()
            c.execute("SELECT * FROM mapa_users")
            return c.fetchall()

    def getUsuario(self,user_id):
        with self.conn:
            c = self.conn.cursor()
            c.execute("SELECT * FROM mapa_users WHERE login='" + str(user_id) + "'")
            return c.fetchone()
    
    def getFuncionarios(self):
        with self.conn:
            c = self.conn.cursor()
            c.execute("SELECT * FROM mapa_funcionarios")
            return c.fetchall()

    def getFuncionario(self,codfun):
        with self.conn:
            c = self.conn.cursor()
            c.execute("SELECT * FROM mapa_funcionarios where cod="+ str(codfun) )
            return c.fetchall()
   
    def addFuncionario(self,codfun,nomefun):
        with self.conn:
            c = self.conn.cursor()
            c.execute("INSERT INTO mapa_funcionarios (cod,funcionario) VALUES (?,?)",(codfun,nomefun))

    def remFuncionario(self,codfun):
        with self.conn:
            c = self.conn.cursor()
            c.execute("DELETE FROM mapa_funcionarios where cod=?",(codfun))

    def editaFuncionario(self,codfun,nomefun):
        with self.conn:
            c = self.conn.cursor()
            c.execute("UPDATE mapa_funcionarios SET funcionario='"+ nomefun +"' WHERE cod=" + str(codfun))

# def definirTempoMin(self):
#     pass
# def vizualizarRelatorio(self):
#     pass
# def exportaRelatorio(self):
#     pass
# def finalizaMes(self):
#     pass
# def configuraRelatorio(self):
#     pass

# usuario = Usuario()
# usuario.addUsuario("messias","123456","messias","email@email")
# usuario.editaUsuario("teste","teste","teste","teste@teste",2)
# usuario.remUsuario(4)
# print(usuario.getUsuarios())
# if usuario.login("messias","123457"):
#     print("logado")
# else:
#     print("erro")