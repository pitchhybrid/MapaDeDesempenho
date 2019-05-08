# Generated by Django 2.2 on 2019-04-18 00:37

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Relatorio',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('cod_req', models.IntegerField()),
                ('cod_funcionario', models.IntegerField()),
                ('hora_registro', models.DateTimeField(auto_now=True)),
                ('data_registro', models.DateField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('login', models.CharField(max_length=20)),
                ('password', models.CharField(max_length=255)),
                ('nome', models.CharField(max_length=30)),
                ('email', models.CharField(max_length=100)),
            ],
        ),
    ]