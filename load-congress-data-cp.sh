DEMO_HOME=$(dirname $0)
mlcp.sh import -host localhost -port 8041 -username admin -password admin \
               -input_file_path $DEMO_HOME/data/congress/ \
               -input_file_type documents \
               -document_type xml \
               -output_collections us-congress \
               -output_uri_replace "$DEMO_HOME/data,'',.xml,''" \
               -mode local \
               -aggregate_record_namespace "http://thomas.loc.gov" \
	       -streaming
