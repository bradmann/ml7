DEMO_HOME=$(dirname $0)
mlcp.sh import -host localhost -port 8081 -username admin -password ML1234 \
               -input_file_path $DEMO_HOME/data/xml/us/usc/ \
               -input_file_type documents \
               -document_type xml \
               -output_collections us-code \
               -output_uri_replace "$DEMO_HOME/data,'',.xml,''" \
               -mode local \
               -streaming
