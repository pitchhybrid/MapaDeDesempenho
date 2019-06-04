import fdb

class Orm(object):
    #Informacoes do banco alvo
    nome_banco = '/opt/BD.ib' #LOCAL
    # nome_banco = r"fortaleza232.dlinkddns.com/3050:C:\TESTE\TESTE.ib" #SERVIDOR
    login_banco = 'SYSDBA'
    senha_banco = 'masterkey'
    #construtor da classe
    
    def __init__(self):
        pass
    
    def autenticacao(self):
        self._db_handle=None
        nome,login,senha = self.nome_banco,self.login_banco,self.senha_banco
        return fdb.connect(dsn=nome,user=login,password=senha,charset=None)

    def importaDados(self, cod_fun, data_inicio, data_fim):
        # sql = "SELECT funcionario.USERID ,ordens.CDFUNRE, ordens.DTCAD, ordens.HRCAD FROM FC12100 AS ordens JOIN FC08000 AS funcionario ON ordens.CDFUNRE = funcionario.CDFUN WHERE ordens.CDFUNRE =" + str(cod_fun) + "and (DTCAD BETWEEN '" + data_inicio + "' AND '" + data_fim +"') ORDER BY ordens.DTCAD"
        sql = "SELECT ordens.CDFUNRE, ordens.DTCAD, ordens.HRCAD FROM FC12100 AS ordens WHERE ordens.CDFUNRE IN (" + str(cod_fun).strip("[]") + " ) and (DTCAD BETWEEN '" + data_inicio + "' AND '" + data_fim +"') ORDER BY ordens.DTCAD"        
        cur = self.autenticacao().cursor()
        cur.execute(sql)
        return cur
