#!flask/bin/python

import sys
import os
import uuid
import cloudstorage as gcs
from google.appengine.api import images, app_identity

from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
from geopy.geocoders import Nominatim
import random, json, requests, urllib3, urllib
import datetime
import requests_toolbelt.adapters.appengine
import warnings
import urllib3.contrib.appengine

JPEG = images.images_service_pb.OutputSettings.JPEG
PNG = images.images_service_pb.OutputSettings.PNG
bucket_name = os.environ.get('restaurantsreviewsjson.appspot.com', app_identity.get_default_gcs_bucket_name())

warnings.filterwarnings('ignore', r'urllib3 is using URLFetch', urllib3.contrib.appengine.AppEnginePlatformWarning)

app = Flask(__name__)


requests_toolbelt.adapters.appengine.monkeypatch()

app.config['UPLOAD_FOLDER'] = 'static/img'

fpath = 'static'
fileName = 'restaurants'

global filename

json_get = json.load(urllib.urlopen("https://jsonstorage.net/api/items/cd7ebd7a-50bf-41de-8998-89932d77e53f"))



@app.route('/')
def output():
	return render_template('index.html')

@app.route('/restaurant', methods=['GET', 'POST'])
def postRestaurant():
	if request.method == 'POST':
		name = request.form['name']
		now = datetime.datetime.now()
		date = now.strftime("%B %d, %Y")
		comments = request.form['comments']
		rate = int(request.form['rte'])
		data1 = {"name": name, "date": date, "rating": rate, "comments": comments}
		id = request.args.get("id")
		r = requests.put("https://jsonstorage.net/api/items/cd7ebd7a-50bf-41de-8998-89932d77e53f", json = writeReview(json_get, data1, id))
		rtg = ratingRestourant(json_get, id)
		return render_template('restaurant.html', rtg = rtg)
	else:
		id = request.args.get("id")
		rtg = ratingRestourant(json_get, id)
		return render_template('restaurant.html', rtg = rtg)

@app.route('/admin', methods=['GET', 'POST'])
def newRestourant():
	if request.method == 'POST':
		if "new_restaurant" in request.form:
			global filename
			restaurant_name = request.form['restaurant_name']
			address = request.form['adress']
			boro = request.form['boro']
#			geolocator = Nominatim(user_agent="restaurantsreviewsjson")
#			location = geolocator.geocode("260 3th Avenue NYC")
#			if location != None:
#				lat = location.latitude
#				lng = location.longitude
#			else:
			lat = 40.722216
			lng = -73.722216
			cuisine = request.form['cuisine']
			operating_hours = {"Monday": request.form['mon'], "Tuesday": request.form['tue'], "Wednesday": request.form['wed'], "Thursday": request.form['thu'], "Friday": request.form['fri'], "Saturday": request.form['sat'], "Sunday": request.form['sun']}
			id = len(json_get['restaurants'])+1
			newResObj = {
					'id': id,
					'name': restaurant_name,
					"neighborhood": boro,
					"photograph": filename,
					"address": address,
					"latlng": { "lat": lat, "lng": lng },
					"cuisine_type": cuisine,
					"operating_hours": operating_hours,
					"reviews": []
					}
			json_get['restaurants'].append(newResObj)
			r = requests.put("https://jsonstorage.net/api/items/cd7ebd7a-50bf-41de-8998-89932d77e53f", json = json_get)
			return redirect ('/?user=admin')
		elif "delete_restaurant" in request.form:
			delete_name = request.form['names']
			json_new = deleteRestaurant(json_get, delete_name)
			r = requests.put("https://jsonstorage.net/api/items/cd7ebd7a-50bf-41de-8998-89932d77e53f", json = json_new)
			return redirect ('/?user=admin')
	else:
		return render_template('admin.html')

def readFromJSONFile(fpath, fileName):
	filefpathNameRExt = './' + fpath + '/' + fileName + '.json'
	with open(filefpathNameRExt, 'r') as f:
		json_load = json.load(f)
		return json_load

@app.route('/img', methods=['POST'])
def newImage():
	original = request.files.get('image', None)
	if not original:
		return jsonify({'error': 'Missing image, can not upload'})
	try:
		global filename
		image = images.Image(original.read())
		image.resize( width=400, height=400, crop_to_fit=True, allow_stretch=False)
		result = image.execute_transforms(output_encoding=JPEG)
		filename = 'img-{}.jpg'.format(uuid.uuid4())
		filepath = '/{}/{}'.format(bucket_name, filename)
		f = gcs.open(filepath, 'w', content_type='image/jpg')
		f.write(result)
		f.close()
		return jsonify({'img_url': '/storage/{}'.format(filename)}), 200
	except Exception as e:
		return jsonify({'error': 'Could not create image data'}), 500

@app.route('/storage/<filename>')
def storage(filename):
  """Endpoint for files in Cloud Storage
       @filename - The name of the file only, not the entire path
  """
  try:
    # Reformat the filename using the bucket name fetched above
    fname = '/{}/{}'.format(bucket_name, filename)
    f = gcs.open(fname)
    data = f.read()
    return data
  except Exception as e:
    return jsonify({'error': 'Could not find file {}'.format(filename)})


def deleteRestaurant(json_del, delete_name):
	id_num = 1
	for i in json_del['restaurants']:
		if i['name'] == delete_name:
			json_del['restaurants'].remove(i)
			for j in json_del['restaurants']:
				j['id'] = id_num
				id_num = id_num + 1
			return json_del

def ratingRestourant(json_rate, id):
	average = 0
	for i in json_rate['restaurants']:
		if str(i['id']) == id and i['reviews']:
			for j in i['reviews']:
				average = average + j['rating']
			average = float(average)/len(i['reviews'])
			return round(average,1)
	return 0



def writeReview(json_rv, data, id):
	for i in json_rv['restaurants']:
		if str(i['id']) == id:
			i['reviews'].insert(0,dict(data))
			return json_rv


def writeToJSONFile(path, fileName, data):
	a = 5
