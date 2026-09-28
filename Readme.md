Prerequisites:
Your machine needs to have Python, git installed.
If not, install from here <https://www.python.org/downloads/>, <https://git-scm.com/install/>

The project is run by the following command:
FLASK_APP=starter.py flask run

The file path looks as follows:
1. starter.py
2. index.html
3. static/
	3.1 css/
		style.css
	3.2 js/
		mapscript.js
	3.3 libraries/
		leaflet/
		jquery.min.js

How to run in Bash or VS Code terminal:
1. git clone https://github.com/subrina0013/ZIPCode-Classification-Demo
2. cd ZIPCode-Classification-Demo
3. python3 -m venv venv
4. source venv/bin/activate (bash) / .\venv\Scripts\Activate.ps1 (VS Code terminal)
5. python -m pip install -r requirements.txt
6. FLASK_APP=starter.py flask run
