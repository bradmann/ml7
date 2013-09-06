mlcp.sh import -host localhost -port 8004 -username admin -password admin \
               -input_file_path /home/scott/sandbox/us-code/data/xml/us/usc/ \
               -input_file_type documents \
               -document_type xml \
               -output_collections us-code \
               -output_uri_replace "/home/scott/sandbox/us-code/data,'',.xml,''" \
               -mode local \
               -streaming
                
