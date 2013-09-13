curl -X GET --digest --user "admin:admin" -H "accept:application/sparql-results+json" "http://localhost:8050/v1/graphs/sparql?query=PREFIX%20house%3A%20%20%20%3Chttp%3A%2F%2Fxml.house.gov%2Fschemas%2Fuslm%2F1.0%2F%3E%0APREFIX%20dc%3A%20%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%3E%0A%0ASELECT%20%3Fsubj%20%3Ftitle%0AWHERE%20%7B%20%3Fsubj%20dc%3Atitle%20%3Ftitle%20%7D"

