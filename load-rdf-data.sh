DEMO_HOME=$(dirname $0)
mlcp.sh import -host localhost -port 8081 -username admin -password ML1234 \
               -input_file_path $DEMO_HOME/data/rdf \
               -output_collections triples \
               -output_uri_replace "$DEMO_HOME,''" 
               -input_file_type RDF \
               -mode local 
