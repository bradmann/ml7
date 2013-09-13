curl --anyauth --user admin:admin -X \
  POST -d'{"rest-api":{"name":"ml7-sparql-rest","database":"m7-content","modules-database":"ml7-modules","port":"8050"}}' \
  -H "Content-type: application/json" \
  http://localhost:8002/v1/rest-apis
