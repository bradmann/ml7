mlcp.sh import -host localhost -port 8004 -username admin -password admin \
               -input_file_path /home/scott/sandbox/us-code/data/rdf \
               -output_collections triples \
               -output_uri_replace "/home/scott/sandbox,''" \
               -input_file_type RDF \
               -mode local 
