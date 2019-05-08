from django.db import models
# Create your models here.

class Users(models.Model):
    id       		= models.AutoField(primary_key=True)
    login    		= models.CharField(max_length=20)
    password 		= models.CharField(max_length=255)
    nome     		= models.CharField(max_length=30)
    email    		= models.CharField(max_length=100)

class Relatorio(models.Model):
    id              = models.BigAutoField(primary_key=True)
    cod_req         = models.IntegerField()
    cod_funcionario = models.IntegerField()
    hora_registro   = models.DateTimeField(auto_now=True)
    data_registro   = models.DateField(auto_now=True)
