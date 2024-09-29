from flask import Flask, render_template, request, redirect, session, url_for
import pandas as pd
import json
import plotly
import plotly.express as px
import os
from werkzeug.utils import secure_filename
from load_data import load_data

# get the absolute path of the directory containing this file
basedir = os.path.abspath(os.path.dirname(__file__))


app = Flask(__name__, template_folder=os.path.join(basedir, 'templates'), static_folder="../../static")
app.secret_key = 'joost'

# configure upload folder
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# routes the app for the home page and the upload page
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']

        if file.filename == '':
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # process the uploaded file
            cleaned_data, question_stats, class_average = load_data(filepath)
            
            # create a bar chart for student scores
            fig_scores = px.bar(cleaned_data, x='student_name', y='percentage', title='Student Scores')
            graph_scores = json.dumps(fig_scores, cls=plotly.utils.PlotlyJSONEncoder)
            
            # create a bar chart for question difficulty
            fig_difficulty = px.bar(question_stats.reset_index(), x='index', y='difficulty', title='Question Difficulty')
            graph_difficulty = json.dumps(fig_difficulty, cls=plotly.utils.PlotlyJSONEncoder)
            
            # store the data in session for access in the /results route
            session['student_data'] = cleaned_data.to_dict(orient='records')
            session['question_data'] = question_stats.reset_index().to_dict(orient='records')
            session['class_average'] = class_average
            session['graph_scores'] = graph_scores
            session['graph_difficulty'] = graph_difficulty
            
            # redirect to the results page
            return redirect(url_for('results'))
    
    # ff it's a GET request or no file was uploaded, show the upload form
    return render_template("upload.html")

@app.route('/results')
def results():
    # redirect to the home page if the data is missing
    # user went directly to /results without uploading a file
    if not all(key in session for key in ('student_data', 'question_data', 'class_average', 'graph_scores', 'graph_difficulty')):
        return redirect(url_for('index'))  

    # retrieve the data from the session
    student_data = session.get('student_data')
    question_data = session.get('question_data')
    class_average = session.get('class_average')
    graph_scores = session.get('graph_scores')
    graph_difficulty = session.get('graph_difficulty')
    
    return render_template("results.html", 
                           student_data=student_data,
                           question_data=question_data,
                           class_average=class_average,
                           graph_scores=graph_scores,
                           graph_difficulty=graph_difficulty)

@app.route('/usage')
def usage():
    return render_template("usage.html")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
    