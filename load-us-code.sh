DEMO_HOME=/home/scott/sandbox/ml7
mlcp.sh import -host localhost -port 8041 -username admin -password admin \
               -input_file_path $DEMO_HOME/data/xml/us/usc/ \
               -input_file_type documents \
               -document_type xml \
               -output_collections us-code \
               -output_uri_replace "$DEMO_HOME/data,'',.xml,''" \
               -mode local \
               -streaming
