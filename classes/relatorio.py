import sqlite3 as sql
from os import path

class Relatorio(object):
    cod_req = ''
    cod_funcionario = ''
    data_registro = ''
    hora_registro = ''
    
    conn = sql.connect(path.abspath("handymobile.db"),check_same_thread=False)

    #Construtor
    def __init__(self):
        pass
    
    #calculos para o dia
    def soma_req_dia(self):
        pass

    def soma_tempo_dia(self):
        pass

    def desempenho_dia(self):
        pass
    
    #calculos para o mes
    def soma_req_mes(self):
        pass

    def soma_tempo_mes(self):
        pass

    def desempenho_mes(self):
        pass

