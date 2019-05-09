import fdb

class Orm:
    #Informacoes do banco alvo
    #nome_banco = '/opt/BD.ib' #linux
    nome_banco  = r'localhost:C:\Users\Aluno\Documents\TESTE.ib' #windows
    login_banco = 'SYSDBA'
    senha_banco = 'masterkey'

    #construtor da classe
    def __init__(self):
        pass
    
    def autenticacao(self):
        self._db_handle=None
        nome,login,senha = self.nome_banco,self.login_banco,self.senha_banco
        return fdb.connect(dsn=nome,user=login,password=senha,charset=None)

    def importaDados(self):
        sql = """SELECT NRRQU,CDFUNRE,DTCAD,HRCAD 
				 FROM FC12100 
				 where CDFUNRE = 150 
				 and (
				 DTCAD BETWEEN 
				 '01.12.2018' AND '31.12.2018'
				 ) 
				 """
        cur = self.autenticacao().cursor()
        cur.execute(sql)
        return cur


teste = Orm()
dado = teste.importaDados()
for i in dado:
    print(i)
