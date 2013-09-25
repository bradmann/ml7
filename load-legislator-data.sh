DEMO_HOME=$(dirname $0)
mlcp.sh import -host localhost -port 8041 -username admin -password admin \
               -input_file_path $DEMO_HOME/data/xml/legislators \
               -input_file_type documents \
               -document_type xml \
               -output_collections us-code,legislators \
               -output_uri_replace "$DEMO_HOME/data,'',.xml,''" \
               -mode local \
	       -streaming
