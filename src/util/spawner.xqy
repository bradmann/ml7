xquery version "1.0-ml";

let $chunk-size := 1

for $i in (0 to 49)
return 
  ("Generating triples ", $i, 
  xdmp:spawn(
    "/util/generate-usc-title-triples.xqy", 
    (xs:QName("start")), 
    <options xmlns="xdmp:eval">
         <modules>{xdmp:modules-database()}</modules>
            <database>{xdmp:database("ml7-content")}</database>
          </options>
  ))