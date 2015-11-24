#!/bin/bash
# Create Index
# curl -XPUT 'http://localhost:9200/index/'
# Delete Index
# curl -XDELETE 'http://localhost:9200/index/'
# List Indexes
# curl 'http://localhost:9200/_cat/indices?v'

curl -XPOST 'http://localhost:9200/reports_mysql_es/_cache/clear'
curl -XDELETE 'http://localhost:9200/reports_mysql_es/'
curl -XPUT 'http://localhost:9200/reports_mysql_es/'
curl -XPUT 'http://localhost:9200/reports_mysql_es/_mapping/report' -d '
{
    "report": {
        "properties" : {
            "report_id": {"type" : "string"},
            "report_name": {"type" : "string"},
            "raw_tsv": {"type" : "binary"},
            "published_at": {"type" : "string"},
            "mysql_id": {"type" : "string"}
        }
    }
}
'