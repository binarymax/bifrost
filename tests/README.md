# Testing

Testing Bifrost depends on Mocha and Should.  You can install these by running
```
npm install
```

Then from the top level of the repo start a web server, for example with python:

```
bifrost/$ python -m SimpleHttpServer
```

Then you can load the tests in the browser by vistiting

```
http://localhost:8000/tests/tests.html
```