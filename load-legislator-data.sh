DEMO_HOME=~/sandbox/ml7
mlcp.sh import -host localhost -port 8041 -username admin -password admin \
               -input_file_path $DEMO_HOME/data/xml/legislators/legislators-current.xml \
               -input_file_type documents \
               -document_type xml \
               -output_collections legislators \
               -output_uri_replace "$DEMO_HOME/data/xml,''," \
               -mode local \
	       -streaming

curl --user admin:admin --digest http://localhost:8040/util/split-legislators.xqy
