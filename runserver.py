#!/usr/bin/env python

import os
args = os.sys.argv.pop(-1)

windows = 'set '
linux = 'export '

#defaut
location = 'FLASK_APP=app.py;'
env = 'FLASK_ENV=production;'
cmd = 'python -m flask '

def command(plataform,location,env,cmd):
    os.system(plataform + env + plataform + location + cmd + args)

if args == 'run':
    if os.sys.platform == 'linux':
        command(linux,location,env,cmd)
    if os.sys.platform == 'win32':
        command(windows,location,env,cmd)
elif args == 'shell':
    if os.sys.platform == 'linux':
        command(linux,location,env,cmd)
    if os.sys.plataform == 'win32':
        command(windows,location,env,cmd)
else:
    
    print(""" 
    USE O COMANDO 'run' PARA INCIAR A APLICAÇAO
    OU
    USE O COMANDO 'shell' PARA INCIAR O MODO INTERATIVO
    
    ex:. python runserver.py run
    ex:. python runserver.py shell
    """)
