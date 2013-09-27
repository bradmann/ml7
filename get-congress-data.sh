#!/bin/sh

mkdir data/congress
./s3curl.pl --id personal -- https://marklogic7-uscode-demo.s3.amazonaws.com/data/113.tar.gz -vv -o data/congress/113.tar.gz
cd data/congress
tar -xf 113.tar.gz
rm 113.tar.gz
