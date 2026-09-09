Prerequisites:
python -m pip install -r requirements.txt

To stop running at port :5000 run following:
1. sudo lsof -i:5000
2. kill -9 xxxx

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
