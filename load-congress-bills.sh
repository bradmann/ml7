DEMO_HOME=~/sandbox/ml7
mlcp.sh import -host localhost -port 8041 -username admin -password admin \
               -input_file_path $DEMO_HOME/data/congress/113/bills/ \
               -input_file_type documents \
               -document_type xml \
               -output_collections bills \
               -output_uri_replace "$DEMO_HOME/data/congress,'',data.xml^,''" \
               -mode local \
               -namespace "http://thomas.loc.gov/bills" \
	       -streaming
