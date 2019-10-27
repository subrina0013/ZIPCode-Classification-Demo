Following things need to be installed:
1. flask: the framework to to the backend
2. flask_cors: to handle the cross-origin-exception
Prerequisite
1. pip install flask
2. pip install flask-cors
3. pip install geopandas
4. pip install xlrd
5. pip install Rtree

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
