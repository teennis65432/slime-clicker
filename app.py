from flask import Flask, render_template, session, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, func, desc
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from sqlalchemy import Boolean, DateTime, Column, Integer, \
                       String, ForeignKey

# make the app for flask to run
app = Flask(__name__)
# app.config ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scores.sqlite3'

# Make the database for the high scores
# db = SQLAlchemy(app)

engine = create_engine('sqlite:///tmp/scores.db', \
                       convert_unicode=True)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()

class Scores(Base):
    __tablename__ = 'scores'
    id = Column('id', Integer(), primary_key=True)
    user = Column('user', String(25))
    score = Column('score', Integer())

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    Base.metadata.create_all(bind=engine)

init_db()

@app.route("/") # When the webpage first loads
def hello_world():
    return render_template('index.html') # run the html file

@app.route("/aboutme")
def aboutme():
    return render_template('aboutme.html')

@app.route("/scores")
def scores():
    rows = Scores.query.order_by(Scores.score.desc()).all();
    total = Scores.query.with_entities(func.sum(Scores.score).label('total')).first().total
    print(total)
    return render_template('scores.html', rows=rows, total=total)

@app.route("/add", methods = ["POST"])
def add():
    u = request.form['user']
    s = request.form['score']
    lastentry = Scores.query.order_by(Scores.id.desc()).first()
    lastid = lastentry.id
    i = lastid + 1;

    db_session.add(Scores(id=i, user=u, score=s))
    db_session.commit()

    return redirect(url_for(request.form['pressed']))