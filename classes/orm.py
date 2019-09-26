import fdb
from os import environ

class Orm(object):
    #Informacoes do banco alvo
    #construtor da classe
    
    def __init__(self):
        if 'nome_banco_local' in environ:
            self.nome_banco = environ['nome_banco_local']
        
        if 'nome_banco_externo' in environ:
            self.nome_banco = environ['nome_banco_externo']

        self.login_banco = environ['login_banco']
        self.senha_banco = environ['senha_banco']
        
    
    def autenticacao(self):
        self._db_handle=None
        nome,login,senha = self.nome_banco,self.login_banco,self.senha_banco
        return fdb.connect(dsn=nome,user=login,password=senha,charset=None)

    def importaDadosHora(self, cod_fun, data_inicio, data_fim,hora_inicio,hora_fim):
        # sql = "SELECT funcionario.USERID ,ordens.CDFUNRE, ordens.DTCAD, ordens.HRCAD FROM FC12100 AS ordens JOIN FC08000 AS funcionario ON ordens.CDFUNRE = funcionario.CDFUN WHERE ordens.CDFUNRE =" + str(cod_fun) + "and (DTCAD BETWEEN '" + data_inicio + "' AND '" + data_fim +"') ORDER BY ordens.DTCAD"
        sql = "SELECT ordens.CDFUNRE, ordens.DTCAD, ordens.HRCAD FROM FC12100 AS ordens WHERE ordens.CDFUNRE IN (" + str(cod_fun).strip("[]") + " ) and (DTCAD BETWEEN '" + data_inicio + "' AND '" + data_fim +"') AND (HRCAD BETWEEN '" + hora_inicio + "' AND '" + hora_fim + "')ORDER BY ordens.DTCAD"        
        cur = self.autenticacao().cursor()
        cur.execute(sql)
        return cur
    
    def importaDadosData(self, cod_fun, data_inicio, data_fim):
        # sql = "SELECT funcionario.USERID ,ordens.CDFUNRE, ordens.DTCAD, ordens.HRCAD FROM FC12100 AS ordens JOIN FC08000 AS funcionario ON ordens.CDFUNRE = funcionario.CDFUN WHERE ordens.CDFUNRE =" + str(cod_fun) + "and (DTCAD BETWEEN '" + data_inicio + "' AND '" + data_fim +"') ORDER BY ordens.DTCAD"
        sql = "SELECT ordens.CDFUNRE, ordens.DTCAD, ordens.HRCAD FROM FC12100 AS ordens WHERE ordens.CDFUNRE IN (" + str(cod_fun).strip("[]") + " ) and (DTCAD BETWEEN '" + data_inicio + "' AND '" + data_fim +"') ORDER BY ordens.DTCAD"        
        cur = self.autenticacao().cursor()
        cur.execute(sql)
        return cur
