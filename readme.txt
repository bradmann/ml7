PREREQUISITES
+ Linux (cygwin on windows)
+ MarkLogic 7
+ Ruby (to execute Roxy scripts)
+ MarkLogic Content Pump
+ Enter designated access and private key into .s3curl and copy to $HOME

INSTALL
Roxy bootstrap: ./ml local bootstrap
Load modules database via roxy: ./ml local deploy modules

Enable the triple index setting in the ML Admin page for the target database
Ingest US CODE XML data using mlcp.  Modify load-us-code.sh for your environment and execute.  (this will load 51 title documents, some of these documents are > 20MB!)
(Optional) Ingest US CODE RDF metadata using mlcp.  Modify load-rdf-data.sh for your environment and execute

To generate the triples from the US Code XML execute the following xquery file: /src/util/generate-usc-title-triples.xqy (this query will take > 10 minutes to run and create > 1M triples)
Bring up the graph UI homepage: http://localhost:8040
